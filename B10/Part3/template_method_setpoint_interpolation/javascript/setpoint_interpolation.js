'use strict';
/**
 * Template Method: date/daily setpoint interpolation.
 * Derived from mycodo/utils/method.py (DateMethod.calculate_setpoint with the ignore_date hook,
 * DailyMethod overriding the hook). Method rows are plain objects instead of database rows.
 */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
const TIME_RE = /^(\d{2}):(\d{2}):(\d{2})$/;

/** Parse 'YYYY-MM-DD HH:MM:SS' (withDate) or 'HH:MM:SS' into seconds; throw on a bad format. */
function parseSeconds(text, withDate) {
  const match = (withDate ? DATE_RE : TIME_RE).exec(text);
  if (!match) throw new Error(`time data '${text}' does not match format`);
  const n = match.slice(1).map(Number);
  const [h, mi, s] = withDate ? n.slice(3) : n;
  if (h > 23 || mi > 59 || s > 59) throw new Error(`time data '${text}' out of range`);
  if (!withDate) return h * 3600 + mi * 60 + s;
  const [y, mo, d] = n;
  const daysInMonth = mo >= 1 && mo <= 12 ? new Date(Date.UTC(y, mo, 0)).getUTCDate() : 0;
  if (d < 1 || d > daysInMonth) throw new Error(`time data '${text}' out of range`);
  return Date.UTC(y, mo - 1, d, h, mi, s) / 1000;
}

class MethodRow {
  constructor(timeStart, timeEnd, setpointStart, setpointEnd = null) {
    this.timeStart = timeStart;
    this.timeEnd = timeEnd;
    this.setpointStart = setpointStart;
    this.setpointEnd = setpointEnd;
  }
}

/** A time/date span dictates the setpoint. Defines the template method and the default hook. */
class DateMethod {
  constructor(rows) {
    this.methodDataAll = rows;
  }

  /** Hook: false means the date part of the date-time is considered. */
  ignoreDate() {
    return false;
  }

  /** Template method: returns [setpoint or null, ended]. */
  calculateSetpoint(nowText) {
    let now = parseSeconds(nowText, true);
    if (this.ignoreDate()) now %= 86400;
    for (const row of this.methodDataAll) {
      const startTime = parseSeconds(row.timeStart, !this.ignoreDate());
      const endTime = parseSeconds(row.timeEnd, !this.ignoreDate());
      if (startTime < now && now < endTime) {
        const setpointStart = row.setpointStart;
        const setpointEnd = row.setpointEnd !== null ? row.setpointEnd : setpointStart;
        const setpointDiff = Math.abs(setpointEnd - setpointStart);
        const percentTotal = (now - startTime) / (endTime - startTime);
        if (setpointStart < setpointEnd) return [setpointStart + setpointDiff * percentTotal, false];
        return [setpointStart - setpointDiff * percentTotal, false];
      }
    }
    return [null, false];
  }
}

/** Repeats every day: only the time of day is compared. */
class DailyMethod extends DateMethod {
  ignoreDate() {
    return true;
  }
}

module.exports = { MethodRow, DateMethod, DailyMethod };
