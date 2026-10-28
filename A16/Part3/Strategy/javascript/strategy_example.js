class PriceCalculator {
  constructor(strategy) {
    this.strategy = strategy;
  }

  total(amountCents) {
    return this.strategy.apply(amountCents);
  }
}

const standardDiscount = {
  apply: (amountCents) => Math.floor(amountCents * 90 / 100),
};

const premiumDiscount = {
  apply: (amountCents) => Math.floor(amountCents * 80 / 100),
};

function results() {
  return [new PriceCalculator(standardDiscount).total(10000),
    new PriceCalculator(premiumDiscount).total(10000)];
}

if (require.main === module) {
  const [standard, premium] = results();
  console.log(`standard=${standard};premium=${premium}`);
}

module.exports = { PriceCalculator, standardDiscount, premiumDiscount, results };
