"""Build Part2/pattern_evolution.csv and Part2/Pattern_count.csv.

Original rows are copied from the Part 1 records (Part1/patterns.csv).
For later versions every line range is computed from the snapshot files with the
Python ast module (class/def line to last line) or by searching for the exact source
text of a call site, so no line number is typed by hand.

Run from the team folder:  python Part2/tools/build_evolution_csv.py
"""
import ast
import csv
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))  # team folder
PART1 = os.path.join(ROOT, 'Part1', 'patterns.csv')
OUT = os.path.join(ROOT, 'Part2', 'pattern_evolution.csv')
OUT_COUNTS = os.path.join(ROOT, 'Part2', 'Pattern_count.csv')

VERSIONS = [  # (source_version, change, code root relative to the team folder)
    ('Code after Change1', 'Change1', 'Part2/changes/Change1/code'),
    ('Code after Change2', 'Change2', 'Part2/changes/Change2/code'),
    ('Code after Change3', 'Change3', 'Part2/code'),
]
BB = 'mycodo/functions/bang_bang.py'
IS = 'mycodo/utils/irrigation_strategies.py'
SA = 'mycodo/utils/sensor_alerts.py'
HEADER = ['source_version', 'pattern_name', 'pattern_type', 'instance_name', 'participant_roles',
          'source_locations', 'intent_and_evidence', 'status_after_change', 'change_description']


def _tree(root, rel):
    with open(os.path.join(ROOT, root, rel), encoding='utf-8') as f:
        return ast.parse(f.read())


def span(root, rel, qualname):
    """(start, end) of a class, function, method or module-level assignment."""
    parts = qualname.split('.')
    body = _tree(root, rel).body
    node = None
    for part in parts:
        node = next(n for n in body if (
            isinstance(n, (ast.ClassDef, ast.FunctionDef)) and n.name == part) or (
            isinstance(n, ast.Assign) and any(getattr(t, 'id', None) == part for t in n.targets)))
        body = getattr(node, 'body', [])
    return node.lineno, node.end_lineno


def loc(root, rel, qualname):
    start, end = span(root, rel, qualname)
    return f"{root}/{rel}:{start}-{end}"


def rng(root, rel, qualname):
    start, end = span(root, rel, qualname)
    return f"{start}-{end}"


def line(root, rel, text, occurrence=1):
    """Line number of the n-th line containing `text`."""
    with open(os.path.join(ROOT, root, rel), encoding='utf-8') as f:
        hits = [i for i, l in enumerate(f, 1) if text in l]
    return hits[occurrence - 1]


def repoint(value, root):
    return value.replace('data/code/', f'{root}/')


def part1_rows():
    with open(PART1, encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))


def unchanged(row, version, root, change):
    out = dict(row)
    out['source_version'] = version
    out['source_locations'] = repoint(row['source_locations'], root)
    out['status_after_change'] = 'preserved'
    out['change_description'] = (f"No participant changed in {change}; locations re-pointed to the "
                                 f"{change} snapshot (files identical to the original).")
    return out


def init_retry(row, version, root, change, what):
    out = unchanged(row, version, root, change)
    out['source_locations'] = re.sub(r'bang_bang\.py:\d+-\d+', 'bang_bang.py:' + rng(root, BB, 'CustomModule'),
                                     out['source_locations'])
    tri = line(root, BB, 'self.try_initialize()')
    init = rng(root, BB, 'CustomModule.initialize')
    out['intent_and_evidence'] = row['intent_and_evidence'].replace('bang_bang.py:142', f'bang_bang.py:{tri}') + (
        f" In {change} the ConcreteClass bang_bang.CustomModule.initialize (bang_bang.py:{init}) {what}.")
    out['status_after_change'] = 'modified'
    out['change_description'] = (f"Same roles and try_initialize skeleton; code inside the concrete step "
                                 f"bang_bang.CustomModule.initialize changed: {what}.")
    return out


def proxy(row, version, root, change, what):
    out = unchanged(row, version, root, change)
    out['source_locations'] = re.sub(r'bang_bang\.py:\d+-\d+', 'bang_bang.py:' + rng(root, BB, 'CustomModule.loop'),
                                     out['source_locations'])
    dc = line(root, BB, 'self.control = DaemonControl()')
    st = line(root, BB, 'self.control.output_state(')
    on = line(root, BB, 'self.control.output_on(')
    off = line(root, BB, 'output_off(self.output_device_id, output_channel=self.output_channel)')
    out['intent_and_evidence'] = row['intent_and_evidence'].replace(
        'bang_bang.py:118, 177, 195-197', f'bang_bang.py:{dc}, {st}, {on}, {off}')
    out['status_after_change'] = 'modified'
    out['change_description'] = (f"Same roles; the client bang_bang.CustomModule.loop changed in {change}: {what}. "
                                 f"Calls to the Proxy (output_state, output_on, output_off) are unchanged.")
    return out


def layer_supertype(row, version, root, change):
    out = unchanged(row, version, root, change)
    sco = line(root, BB, 'self.setup_custom_options(')
    glm = line(root, BB, 'self.get_last_measurement(')
    out['intent_and_evidence'] = row['intent_and_evidence'].replace(
        'bang_bang.py:138', f'bang_bang.py:{sco}').replace('bang_bang.py:172', f'bang_bang.py:{glm}')
    out['change_description'] = (f"No participant changed in {change}. New bang-bang options are parsed by the "
                                 f"inherited setup_custom_options; locations re-pointed to the {change} snapshot.")
    return out


def strategy_row(version, root, status, description):
    roles = ['Strategy=IrrigationStrategy', 'StrategyOperation=IrrigationStrategy.decide',
             'ConcreteStrategy=RaiseHysteresisStrategy', 'ConcreteStrategy=LowerHysteresisStrategy',
             'ConcreteStrategy=TimeWindowStrategy', 'ConcreteStrategy=RainSkipStrategy',
             'ParameterObject=IrrigationContext', 'StrategySelector=DIRECTION_STRATEGIES',
             'StrategySelector=build_irrigation_strategy', 'Context=bang_bang.CustomModule',
             'ContextOperation=bang_bang.CustomModule.loop', 'ContextOperation=bang_bang.CustomModule._apply_decision',
             'ContextOperation=bang_bang.CustomModule._build_irrigation_strategy']
    locs = [loc(root, IS, 'IrrigationStrategy'), loc(root, IS, 'IrrigationStrategy.decide'),
            loc(root, IS, 'RaiseHysteresisStrategy'), loc(root, IS, 'LowerHysteresisStrategy'),
            loc(root, IS, 'TimeWindowStrategy'), loc(root, IS, 'RainSkipStrategy'),
            loc(root, IS, 'IrrigationContext'), loc(root, IS, 'DIRECTION_STRATEGIES'),
            loc(root, IS, 'build_irrigation_strategy'), loc(root, BB, 'CustomModule'),
            loc(root, BB, 'CustomModule.loop'), loc(root, BB, 'CustomModule._apply_decision'),
            loc(root, BB, 'CustomModule._build_irrigation_strategy')]
    set_line = line(root, BB, 'self.strategy = self._build_irrigation_strategy()')
    decide_line = line(root, BB, 'self.strategy.decide(IrrigationContext(')
    evidence = (f"Interchangeable irrigation policies behind IrrigationStrategy.decide(context) returning on/off/None. "
                f"The Context bang_bang.CustomModule builds its strategy once in initialize() (bang_bang.py:{set_line}) "
                f"through build_irrigation_strategy ({rng(root, IS, 'build_irrigation_strategy')}), calls "
                f"self.strategy.decide(...) in loop() (bang_bang.py:{decide_line}) and turns the decision into "
                f"DaemonControl calls in _apply_decision ({rng(root, BB, 'CustomModule._apply_decision')}). "
                f"Replaces the former if/elif on self.direction.")
    return dict(source_version=version, pattern_name='Strategy', pattern_type='GoF Behavioral',
                instance_name='Irrigation Decision Strategy', participant_roles='; '.join(roles),
                source_locations='; '.join(locs), intent_and_evidence=evidence,
                status_after_change=status, change_description=description)


def decorator_row(version, root, status, description):
    roles = ['Component=IrrigationStrategy', 'ConcreteComponent=RaiseHysteresisStrategy',
             'ConcreteComponent=LowerHysteresisStrategy', 'Decorator=IrrigationRestriction',
             'ConcreteDecorator=TimeWindowStrategy', 'ConcreteDecorator=RainSkipStrategy',
             'Assembler=build_irrigation_strategy']
    locs = [loc(root, IS, 'IrrigationStrategy'), loc(root, IS, 'RaiseHysteresisStrategy'),
            loc(root, IS, 'LowerHysteresisStrategy'), loc(root, IS, 'IrrigationRestriction'),
            loc(root, IS, 'TimeWindowStrategy'), loc(root, IS, 'RainSkipStrategy'),
            loc(root, IS, 'build_irrigation_strategy')]
    evidence = (f"IrrigationRestriction ({rng(root, IS, 'IrrigationRestriction')}) implements IrrigationStrategy, holds "
                f"an inner IrrigationStrategy and delegates decide/needs_rain_indicator to it. TimeWindowStrategy "
                f"({rng(root, IS, 'TimeWindowStrategy.decide')}) and RainSkipStrategy "
                f"({rng(root, IS, 'RainSkipStrategy.decide')}) add a restriction and then delegate to inner.decide, "
                f"so they wrap either hysteresis strategy and can be stacked; build_irrigation_strategy wraps the "
                f"direction strategy ({rng(root, IS, 'build_irrigation_strategy')}).")
    return dict(source_version=version, pattern_name='Decorator', pattern_type='GoF Structural',
                instance_name='Irrigation Restriction Decorators', participant_roles='; '.join(roles),
                source_locations='; '.join(locs), intent_and_evidence=evidence,
                status_after_change=status, change_description=description)


def observer_row(version, root, status, description):
    roles = ['Subject=SensorAlertNotifier', 'Attach=SensorAlertNotifier.attach', 'Detach=SensorAlertNotifier.detach',
             'Notify=SensorAlertNotifier._notify', 'StateChange=SensorAlertNotifier.raise_alert',
             'StateChange=SensorAlertNotifier.clear', 'Observer=AlertListener', 'Update=AlertListener.on_alert',
             'ConcreteObserver=LogAlertListener', 'ConcreteObserver=EmailAlertListener', 'Event=SensorAlert',
             'Client=bang_bang.CustomModule._setup_alert_listeners',
             'Client=bang_bang.CustomModule._handle_missing_measurement',
             'Client=bang_bang.CustomModule._check_critically_dry']
    locs = [loc(root, SA, 'SensorAlertNotifier'), loc(root, SA, 'SensorAlertNotifier.attach'),
            loc(root, SA, 'SensorAlertNotifier.detach'), loc(root, SA, 'SensorAlertNotifier._notify'),
            loc(root, SA, 'SensorAlertNotifier.raise_alert'), loc(root, SA, 'SensorAlertNotifier.clear'),
            loc(root, SA, 'AlertListener'), loc(root, SA, 'AlertListener.on_alert'),
            loc(root, SA, 'LogAlertListener'), loc(root, SA, 'EmailAlertListener'), loc(root, SA, 'SensorAlert'),
            loc(root, BB, 'CustomModule._setup_alert_listeners'),
            loc(root, BB, 'CustomModule._handle_missing_measurement'),
            loc(root, BB, 'CustomModule._check_critically_dry')]
    email = line(root, BB, 'self.alerts.attach(EmailAlertListener(')
    evidence = (f"SensorAlertNotifier keeps a list of AlertListener objects (attach/detach) and calls on_alert on each "
                f"in _notify ({rng(root, SA, 'SensorAlertNotifier._notify')}), isolating failures; raise_alert "
                f"({rng(root, SA, 'SensorAlertNotifier.raise_alert')}) notifies once per episode and clear re-arms. "
                f"bang_bang.CustomModule attaches LogAlertListener and, with recipients, EmailAlertListener using "
                f"DaemonControl.send_email (bang_bang.py:{email}) and raises missing_measurement / critically_dry "
                f"alerts from _handle_missing_measurement and _check_critically_dry.")
    return dict(source_version=version, pattern_name='Observer', pattern_type='GoF Behavioral',
                instance_name='Sensor Alert Notification', participant_roles='; '.join(roles),
                source_locations='; '.join(locs), intent_and_evidence=evidence,
                status_after_change=status, change_description=description)


INIT_WHAT = {
    'Change1': 'now also applies the selected crop profile via _apply_crop_profile()',
    'Change2': 'now also builds the irrigation strategy via _build_irrigation_strategy()',
    'Change3': 'now also attaches the alert listeners via _setup_alert_listeners()',
}
PROXY_WHAT = {
    'Change1': 'Extract Method replaced the four setpoint +/- hysteresis expressions by _lower_threshold()/_upper_threshold()',
    'Change2': 'the direction if/elif was replaced by a strategy call; output_on/output_off are now sent from _apply_decision()',
    'Change3': 'Extract Method (_period_elapsed, _read_measurement, _handle_missing_measurement); output_off for a '
               'missing value is sent from _handle_missing_measurement(), which also raises an alert',
}


def main():
    base = part1_rows()
    rows = []
    for r in base:
        rows.append(dict(r, status_after_change='baseline', change_description='Original collaboration.'))
    for version, change, root in VERSIONS:
        for r in base:
            name = r['instance_name']
            if name == 'Module Initialization with Retry':
                rows.append(init_retry(r, version, root, change, INIT_WHAT[change]))
            elif name == 'Daemon RPC Client':
                rows.append(proxy(r, version, root, change, PROXY_WHAT[change]))
            elif name == 'Daemon Module Base':
                rows.append(layer_supertype(r, version, root, change))
            else:
                rows.append(unchanged(r, version, root, change))
        if change == 'Change2':
            rows.append(strategy_row(version, root, 'newly_introduced',
                                     'New collaboration: Replace Conditional with Polymorphism (step b) introduced '
                                     'IrrigationStrategy with RaiseHysteresisStrategy/LowerHysteresisStrategy; the '
                                     'feature (step c) added TimeWindowStrategy, RainSkipStrategy and '
                                     'build_irrigation_strategy.'))
            rows.append(decorator_row(version, root, 'newly_introduced',
                                      'New collaboration: IrrigationRestriction wraps any IrrigationStrategy; '
                                      'TimeWindowStrategy and RainSkipStrategy add irrigation restrictions.'))
        if change == 'Change3':
            rows.append(strategy_row(version, root, 'modified',
                                     'Same roles; the Context code bang_bang.CustomModule.loop changed (Extract Method, '
                                     'safe measurement value) and moved. Strategy classes unchanged.'))
            rows.append(decorator_row(version, root, 'preserved',
                                      'No participant changed; irrigation_strategies.py identical to Change2.'))
            rows.append(observer_row(version, root, 'newly_introduced',
                                     'New collaboration: SensorAlertNotifier notifies LogAlertListener and '
                                     'EmailAlertListener of missing-measurement and critically-dry alerts.'))
    with open(OUT, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=HEADER, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(rows)

    # pattern counts per version (removed instances are not counted; there are none)
    order = ['Original code'] + [v for v, _c, _r in VERSIONS]
    with open(OUT_COUNTS, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['source_version', 'summary', 'pattern_name', 'count'])
        for version in order:
            alive = [r for r in rows if r['source_version'] == version and r['status_after_change'] != 'removed']
            per_pattern = {}
            for r in alive:
                per_pattern[r['pattern_name']] = per_pattern.get(r['pattern_name'], 0) + 1
            for pattern, count in per_pattern.items():
                writer.writerow([version, 'per_pattern', pattern, count])
            writer.writerow([version, 'total_pattern_types', '', len(per_pattern)])
            writer.writerow([version, 'total_pattern_instances', '', len(alive)])
    print(f"wrote {len(rows)} rows to {OUT}")


if __name__ == '__main__':
    main()
