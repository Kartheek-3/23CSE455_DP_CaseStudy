export class ConditionStrategy {
  evaluate(conditionData, stateStore, context) {
    throw new Error('evaluate() must be implemented');
  }
}

export class StateStrategy extends ConditionStrategy {
  evaluate(conditionData, stateStore, context) {
    const { entity, expected } = conditionData;
    const actual = stateStore[entity];
    return actual !== undefined && actual !== null && String(actual) === String(expected);
  }
}

export class NumericStrategy extends ConditionStrategy {
  evaluate(conditionData, stateStore, context) {
    const { entity, op, threshold } = conditionData;
    const val = stateStore[entity];
    if (val === undefined || val === null) return false;
    const num = Number(val);
    if (Number.isNaN(num)) return false;

    switch (op) {
      case '>': return num > threshold;
      case '>=': return num >= threshold;
      case '<': return num < threshold;
      case '<=': return num <= threshold;
      case '==': return Math.abs(num - threshold) < 1e-9;
      default: return false;
    }
  }
}

export class ScreenStrategy extends ConditionStrategy {
  evaluate(conditionData, stateStore, context) {
    const width = Number(context.screenWidth || 0);
    const min = Number(conditionData.minWidth || 0);
    const max = Number(conditionData.maxWidth !== undefined ? conditionData.maxWidth : Infinity);
    return width >= min && width <= max;
  }
}

export class EvaluatorContext {
  constructor() {
    this.strategies = new Map();
    this.register('state', new StateStrategy());
    this.register('numeric', new NumericStrategy());
    this.register('screen', new ScreenStrategy());
  }

  register(type, strategy) {
    this.strategies.set(type, strategy);
  }

  evaluate(conditionData, stateStore, context = {}) {
    const strategy = this.strategies.get(conditionData.type);
    if (!strategy) return false;
    if (typeof strategy === 'function') {
      return strategy(conditionData, stateStore, context);
    }
    return strategy.evaluate(conditionData, stateStore, context);
  }
}
