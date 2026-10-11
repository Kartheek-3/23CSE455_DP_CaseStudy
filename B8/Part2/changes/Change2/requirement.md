# Change2: Trainer-assignment policies

## Requirement
Admins assign a personal trainer to each member, either manually or by a selectable policy,
while respecting each trainer's client capacity. Trainers only manage plans for their own clients.

## What was implemented
- **Backend**
  - Models: `Member.assigned_trainer_id`, `Trainer.max_clients` (default 10), and a
    `TrainerAssignment` history table (policy used, who assigned, start/end, active flag).
  - `services/trainer_assignment.py` (new): three policies (specialization match, least loaded,
    highest rated), a policy factory, and `assign_trainer`, which applies the shared rules
    (active trainer, free capacity, not the current trainer) before asking the policy to choose.
  - `/api/assignments` router (new): list policies, assign by policy or manually, unassign,
    auto-assign all unassigned members, assignment history, and `my-clients` for trainers.
    Member and trainer are emailed on assignment.
  - Plans: trainers can only create, update or request goal-based recommendations for members
    assigned to them (403 otherwise); admins are unrestricted.
  - Members and trainers responses include the assigned trainer, capacity and active clients;
    only admins can change `max_clients`.
  - `migrate.py` (new) adds missing columns and tables to an existing SQLite database;
    `run.py` runs it before starting the server.
- **Frontend**
  - Members page: trainer column, assign dialog (policy or manual trainer), unassign, auto-assign.
  - Trainers page: capacity badge and Max Clients field.
  - Dashboard: trainer "My Clients" table, member "Your Trainer" box.
  - Plans page: member dropdown limited to the trainer's own clients.
  - `AssignmentsService` (new) and assignment models.

## Design pattern
- **Strategy**: `TrainerAssignmentPolicy.select_trainer(member, candidates, loads)` with
  `SpecializationMatchPolicy`, `LeastLoadedPolicy` and `HighestRatedPolicy`. `assign_trainer`
  (context) delegates the choice without knowing which policy it is.
- **Simple Factory**: `TrainerAssignmentPolicyFactory.get_policy(name)` and `available_policies()`.
- **Singleton** (Angular `providedIn: 'root'`): the new `AssignmentsService` is shared by the
  Members, Dashboard and Plans components.
- Why: new assignment rules can be added as one class without touching the eligibility checks,
  routes or UI.

## Acceptance criteria
1. Each policy picks the expected trainer; specialization match falls back to least loaded.
2. Only admins can list policies and assign trainers.
3. A trainer at `max_clients`, or an unknown policy, is rejected with 400.
4. A trainer sees only their own clients and can only create plans for them (403 otherwise).
5. Unassigning and auto-assigning keep a correct assignment history.
6. Only admins can change a trainer's capacity.

## Files
- `change2.diff`: unified diff from the code after Change1.
- `test_result.txt`: test output.
