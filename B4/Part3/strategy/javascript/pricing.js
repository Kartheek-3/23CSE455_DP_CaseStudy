export class PricingContext {
  constructor(month, occupancyRate, leaseMonths) {
    if (month < 1 || month > 12 || occupancyRate < 0 || occupancyRate > 1 || leaseMonths < 1) {
      throw new Error("Invalid pricing context");
    }
    Object.assign(this, { month, occupancyRate, leaseMonths });
  }
}

export class BasePricing {
  price(property, context) {
    return Number(property.baseRent.toFixed(2));
  }
}

export class DynamicPricing {
  price(property, context) {
    let multiplier = 1.0;
    if ([4, 5, 12].includes(context.month)) multiplier += 0.20;
    if (context.occupancyRate >= 0.80) multiplier += 0.10;
    if (context.leaseMonths >= 12) multiplier -= 0.05;
    return Number((property.baseRent * multiplier).toFixed(2));
  }
}

export class PricingService {
  constructor(strategy) {
    this.strategy = strategy;
  }

  use(strategy) {
    this.strategy = strategy;
  }

  quote(property, context) {
    return this.strategy.price(property, context);
  }
}

