const COLUMN_PREFIX = '___';
const RANGE_MAX = 1000;

class Chart {
  constructor() { this.rows = []; }

  tickMajor(group) { throw new Error('tickMajor is abstract'); }

  tickMinor(group) { throw new Error('tickMinor is abstract'); }

  tick(major, group = null) {
    const data = major ? this.tickMajor(group) : this.tickMinor(group);
    const columns = {};
    for (const [key, value] of Object.entries(data)) {
      columns[COLUMN_PREFIX + key.replaceAll('.', '_')] = Math.max(0, Math.min(RANGE_MAX, value));
    }
    if (Object.keys(columns).length > 0) this.rows.push(columns);
    return columns;
  }
}

class UsersChart extends Chart {
  tickMajor() { return { total: 1500, 'local.total': 40 }; }
  tickMinor() { return { 'local.total': 41 }; }
}

class NotesChart extends Chart {
  tickMajor() { return { total: -5 }; }
  tickMinor() { return {}; }
}

module.exports = { Chart, UsersChart, NotesChart };
