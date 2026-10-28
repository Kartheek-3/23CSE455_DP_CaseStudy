/** Strategy, modelled on JUnit's PostDiscoveryFilter (instance A3). */
import { readFileSync } from 'node:fs';

export class InputFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputFormatError';
  }
}

/** Splits a line into fields; returns null for blank lines and comments. */
function fields(line) {
  const trimmed = line.trim();
  return trimmed === '' || trimmed.startsWith('#') ? null : trimmed.split(/\s+/);
}

function readLines(path) {
  return readFileSync(path, 'utf8').split(/\r?\n/);
}

/** Strategy base: subclasses decide whether one test is selected. */
export class TestFilter {
  constructor() {
    if (new.target === TestFilter) throw new TypeError('TestFilter is abstract');
  }

  includes(test) {
    throw new Error(`${this.constructor.name} must implement includes()`);
  }

  describe() {
    throw new Error(`${this.constructor.name} must implement describe()`);
  }
}

export class IncludeTag extends TestFilter {
  #tag;

  constructor(tag) {
    super();
    this.#tag = tag;
  }

  includes(test) {
    return test.tags.includes(this.#tag);
  }

  describe() {
    return `include-tag ${this.#tag}`;
  }
}

export class ExcludeTag extends TestFilter {
  #tag;

  constructor(tag) {
    super();
    this.#tag = tag;
  }

  includes(test) {
    return !test.tags.includes(this.#tag);
  }

  describe() {
    return `exclude-tag ${this.#tag}`;
  }
}

export class NameContains extends TestFilter {
  #text;

  constructor(text) {
    super();
    this.#text = text;
  }

  includes(test) {
    return test.name.includes(this.#text);
  }

  describe() {
    return `name-contains ${this.#text}`;
  }
}

/** Context: holds one strategy and applies it to every test. */
export class TestSelector {
  #filter;

  constructor(filter) {
    this.#filter = filter;
  }

  select(tests) {
    return tests.filter((test) => this.#filter.includes(test));
  }
}

export function parse(lines) {
  const tests = [];
  lines.forEach((line, i) => {
    const f = fields(line);
    if (f === null) return;
    const parts = f[0].split('#');
    if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
      throw new InputFormatError(`line ${i + 1}: test name must look like Class#method, got '${f[0]}'`);
    }
    tests.push({ name: f[0], tags: f.slice(1) });
  });
  return tests;
}

export function report(path) {
  const tests = parse(readLines(path));
  const out = [];
  for (const strategy of [new IncludeTag('fast'), new ExcludeTag('flaky'), new NameContains('String')]) {
    const selected = new TestSelector(strategy).select(tests);
    out.push(`== ${strategy.describe()} ==`, ...selected.map((test) => test.name), `selected ${selected.length} of ${tests.length}`);
  }
  return out.join('\n') + '\n';
}
