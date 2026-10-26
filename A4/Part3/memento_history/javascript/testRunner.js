import { performance } from 'perf_hooks';
import { DashboardConfig, HistoryManager } from './hearthHistoryMemento.js';

function runTests() {
  const start = performance.now();

  const manager = new HistoryManager(3);

  const s0 = new DashboardConfig('Home', 'dark', ['clock', 'weather']);
  const s1 = new DashboardConfig('Living Room', 'dark', ['clock', 'weather', 'light']);
  const s2 = new DashboardConfig('Master Suite', 'light', ['clock', 'light']);

  let passed = 0;
  const total = 6;

  let current = s0;
  manager.push(current);
  current = s1;
  manager.push(current);
  current = s2;

  // Check 1: canUndo is true, canRedo is false
  if (manager.canUndo && !manager.canRedo) passed++;

  // Check 2: Undo restores to s1
  current = manager.undo(current);
  if (s1.equals(current)) passed++;

  // Check 3: Redo restores to s2
  current = manager.redo(current);
  if (s2.equals(current)) passed++;

  // Check 4: Transaction edit mode & cancel rollback
  manager.enterEditMode(current);
  const corrupted = new DashboardConfig('Corrupted', 'neon', []);
  current = corrupted;
  current = manager.cancelEdit(current);
  if (s2.equals(current)) passed++;

  // Check 5: Bounded capacity enforcement (capacity=3)
  manager.push(s1);
  manager.push(s2);
  manager.push(s0);
  manager.push(s1);
  if (manager.undoCount === 3) passed++;

  // Check 6: Clear operation
  manager.clear();
  if (!manager.canUndo && !manager.canRedo && manager.undoCount === 0) passed++;

  const elapsedMs = performance.now() - start;

  console.log(`RESULT: ${passed}/${total} passed`);
  console.log(`TIME_MS: ${elapsedMs.toFixed(3)}`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
