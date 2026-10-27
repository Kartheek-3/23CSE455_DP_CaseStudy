// Strategy pattern - late-fee policy. Mirrors FineStrategy.java behaviour.
// Representative of PasswordEncoder strategy in SecurityConfiguration.java:57.

class RegularFine {                           // ConcreteStrategy A
  fine(daysLate) {
    return daysLate <= 0 ? 0.0 : daysLate * 5.0;
  }
}

class AdvocateFine {                          // ConcreteStrategy B
  fine(daysLate) {
    if (daysLate <= 0) return 0.0;
    if (daysLate <= 7) return daysLate * 2.0;
    return 14.0 + (daysLate - 7) * 3.0;
  }
}

class FineContext {                           // Context
  constructor(policy) { this.policy = policy; }
  setPolicy(policy) { this.policy = policy; }
  compute(daysLate) { return this.policy.fine(daysLate); }
}

function main() {
  const cases = [0, 3, 7, 10];
  const ctx = new FineContext(new RegularFine());
  for (const d of cases) console.log(`regular,${d},${ctx.compute(d).toFixed(2)}`);
  ctx.setPolicy(new AdvocateFine());
  for (const d of cases) console.log(`advocate,${d},${ctx.compute(d).toFixed(2)}`);
}

main();
