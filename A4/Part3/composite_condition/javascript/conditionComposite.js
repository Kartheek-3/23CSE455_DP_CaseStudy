export class ConditionComposite {
  evaluate(stateStore) {
    throw new Error('evaluate() must be implemented');
  }
}

export class StateCondition extends ConditionComposite {
  constructor(entityId, expectedState) {
    super();
    this.entityId = entityId;
    this.expectedState = expectedState;
  }

  evaluate(stateStore) {
    const actual = stateStore[this.entityId];
    return actual !== undefined && actual !== null && String(actual) === this.expectedState;
  }
}

export class NumericStateCondition extends ConditionComposite {
  constructor(entityId, operator, threshold) {
    super();
    this.entityId = entityId;
    this.operator = operator;
    this.threshold = threshold;
  }

  evaluate(stateStore) {
    const val = stateStore[this.entityId];
    if (val === undefined || val === null) return false;
    const num = Number(val);
    if (Number.isNaN(num)) return false;

    switch (this.operator) {
      case '>': return num > this.threshold;
      case '>=': return num >= this.threshold;
      case '<': return num < this.threshold;
      case '<=': return num <= this.threshold;
      case '==': return Math.abs(num - this.threshold) < 1e-9;
      default: return false;
    }
  }
}

export class AndCondition extends ConditionComposite {
  constructor(children = []) {
    super();
    this.children = [...children];
  }

  add(child) {
    this.children.push(child);
    return this;
  }

  evaluate(stateStore) {
    if (this.children.length === 0) return true;
    return this.children.every((child) => child.evaluate(stateStore));
  }
}

export class OrCondition extends ConditionComposite {
  constructor(children = []) {
    super();
    this.children = [...children];
  }

  add(child) {
    this.children.push(child);
    return this;
  }

  evaluate(stateStore) {
    if (this.children.length === 0) return false;
    return this.children.some((child) => child.evaluate(stateStore));
  }
}

export class NotCondition extends ConditionComposite {
  constructor(child = null) {
    super();
    this.child = child;
  }

  evaluate(stateStore) {
    if (!this.child) return true;
    return !this.child.evaluate(stateStore);
  }
}
