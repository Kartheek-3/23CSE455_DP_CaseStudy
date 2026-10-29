// Composite pattern: a TestNode base class, a TestCase leaf and a TestContainer composite.

// Component, modelled on JUnit's TestDescriptor. JavaScript has no interfaces or
// abstract classes, so the base class throws if a subclass forgets a method.
export class TestNode {
  constructor(name) {
    if (new.target === TestNode) throw new TypeError('TestNode is abstract');
    this.name = name;
  }

  /** Number of tests in this subtree (a test counts itself). */
  countTests() { throw new Error(`${this.constructor.name} must implement countTests`); }

  /** True only for a test that carries the tag; containers have no tags. */
  hasTag(tag) { throw new Error(`${this.constructor.name} must implement hasTag`); }

  /** Removes every test below this node that has the tag, pushing its name onto `removed`. */
  removeTestsTagged(tag, removed) { throw new Error(`${this.constructor.name} must implement removeTestsTagged`); }

  /** Removes every container below this node that has no tests left, children first. */
  pruneEmpty(pruned) { throw new Error(`${this.constructor.name} must implement pruneEmpty`); }

  /** Returns this subtree as indented text. */
  render(depth = 0) { throw new Error(`${this.constructor.name} must implement render`); }
}

// Leaf: a single test method with optional tags.
export class TestCase extends TestNode {
  constructor(name, tags = []) {
    super(name);
    this.tags = Object.freeze([...tags]);
  }

  countTests() { return 1; }

  hasTag(tag) { return this.tags.includes(tag); }

  removeTestsTagged() {} // a leaf has nothing below it; its parent decides whether to remove it

  pruneEmpty() {}

  render(depth = 0) {
    return `${'  '.repeat(depth)}test ${this.name}${this.tags.map((tag) => ` @${tag}`).join('')}\n`;
  }
}

// Composite: an engine or a test class, holding child nodes of either kind.
export class TestContainer extends TestNode {
  #children = [];

  constructor(kind, name) {
    super(name);
    this.kind = kind;
  }

  addChild(child) {
    this.#children.push(child);
  }

  countTests() {
    return this.#children.reduce((sum, child) => sum + child.countTests(), 0);
  }

  hasTag() { return false; }

  removeTestsTagged(tag, removed) {
    this.#children = this.#children.filter((child) => {
      if (child.hasTag(tag)) {
        removed.push(child.name);
        return false;
      }
      child.removeTestsTagged(tag, removed);
      return true;
    });
  }

  pruneEmpty(pruned) {
    this.#children = this.#children.filter((child) => {
      child.pruneEmpty(pruned);
      if (child.countTests() > 0) return true;
      pruned.push(child.name);
      return false;
    });
  }

  render(depth = 0) {
    const tests = this.countTests();
    const header = `${'  '.repeat(depth)}${this.kind} ${this.name} (${tests} ${tests === 1 ? 'test' : 'tests'})\n`;
    return header + this.#children.map((child) => child.render(depth + 1)).join('');
  }
}
