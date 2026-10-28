'use strict';
/**
 * Strategy: setpoint schedule calculation.
 * Derived from mycodo/utils/method.py (AbstractMethod, DailySineMethod, DurationMethod, CascadeMethod,
 * create_method_handler, sine_wave_y_out). Times are plain seconds; method data rows are number arrays
 * instead of database rows; CascadeMethod receives its linked strategies directly.
 */

/** Strategy interface; also the neutral fallback strategy for unknown method types. */
class AbstractMethod {
  calculateSetpoint(now, methodStartTime) { // eslint-disable-line no-unused-vars
    return [null, false];
  }
}

function sineWaveYOut(amplitude, frequency, shiftAngle, shiftY, angleIn) {
  return amplitude * Math.sin((frequency * (angleIn - shiftAngle) * Math.PI) / 180) + shiftY;
}

class DailySineMethod extends AbstractMethod {
  constructor(amplitude, frequency, shiftAngle, shiftY) {
    super();
    Object.assign(this, { amplitude, frequency, shiftAngle, shiftY });
  }

  calculateSetpoint(now) {
    const secondsOfDay = ((Math.floor(now) % 86400) + 86400) % 86400;
    const angle = (secondsOfDay / 86400) * 360;
    return [sineWaveYOut(this.amplitude, this.frequency, this.shiftAngle, this.shiftY, angle), false];
  }
}

/** Rows [duration_sec, setpoint_start, setpoint_end]; a row with duration 0 is the repeat row. */
class DurationMethod extends AbstractMethod {
  constructor(rows) {
    super();
    this.methodDataAll = rows;
  }

  cycleDuration() {
    return this.methodDataAll.reduce((sum, row) => sum + row[0], 0);
  }

  repeatDuration() {
    const repeatRow = this.methodDataAll.find((row) => row[0] === 0);
    return repeatRow === undefined ? null : repeatRow[2] || 0;
  }

  calculateSetpoint(now, methodStartTime) {
    const durationInSeconds = this.cycleDuration();
    let secondsFromStart = now - methodStartTime;
    if (secondsFromStart >= durationInSeconds) {
      const repeatDuration = this.repeatDuration();
      if (repeatDuration === null || (repeatDuration > 0 && repeatDuration <= secondsFromStart)) return [null, true];
      secondsFromStart %= durationInSeconds;
    }
    let totalSec = 0;
    let previousTotalSec = 0;
    for (const [durationSec, setpointStart, setpointEnd] of this.methodDataAll) {
      totalSec += durationSec;
      if (previousTotalSec <= secondsFromStart && secondsFromStart < totalSec) {
        const percentRow = (secondsFromStart - previousTotalSec) / durationSec;
        const setpointDiff = Math.abs(setpointEnd - setpointStart);
        if (setpointStart < setpointEnd) return [setpointStart + setpointDiff * percentRow, false];
        return [setpointStart - setpointDiff * percentRow, false];
      }
      previousTotalSec = totalSec;
    }
    return [previousTotalSec, false];
  }
}

/** Context: multiplies the setpoints of its linked strategies (each taken as a percentage). */
class CascadeMethod extends AbstractMethod {
  constructor(linkedMethods) {
    super();
    this.linkedMethods = linkedMethods;
  }

  calculateSetpoint(now, methodStartTime) {
    let setpoint = 1.0;
    for (const linkedMethod of this.linkedMethods) {
      const [linkedSetpoint, linkedEnded] = linkedMethod.calculateSetpoint(now, methodStartTime);
      if (linkedSetpoint !== null) setpoint *= linkedSetpoint / 100.0;
      if (linkedEnded) return [null, true];
    }
    return [setpoint * 100.0, false];
  }
}

/** Selects the strategy for a method type; unknown types fall back to AbstractMethod. */
function createMethodHandler(methodType, rows, linkedMethods = []) {
  if (methodType === 'DailySine') {
    if (rows.length !== 1 || rows[0].length !== 4) throw new Error('DailySine needs exactly one row of 4 numbers');
    return new DailySineMethod(...rows[0]);
  }
  if (methodType === 'Duration') {
    if (rows.some((row) => row.length !== 3)) throw new Error('Duration rows need exactly 3 numbers');
    return new DurationMethod(rows);
  }
  if (methodType === 'Cascade') return new CascadeMethod(linkedMethods);
  return new AbstractMethod();
}

module.exports = { AbstractMethod, DailySineMethod, DurationMethod, CascadeMethod, createMethodHandler };
