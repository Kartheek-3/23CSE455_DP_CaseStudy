import { BasePricing, DynamicPricing, PricingContext, PricingService } from "./pricing.js";

let passed = 0;
const check = (condition, name) => {
  if (!condition) throw new Error(name);
  passed += 1;
};

const property = { baseRent: 1000.0 };
const service = new PricingService(new BasePricing());
check(service.quote(property, new PricingContext(12, 0.85, 12)) === 1000.0, "base");
service.use(new DynamicPricing());
check(service.quote(property, new PricingContext(4, 0.50, 6)) === 1200.0, "peak");
check(service.quote(property, new PricingContext(1, 0.80, 6)) === 1100.0, "occupancy");
check(service.quote(property, new PricingContext(12, 0.85, 12)) === 1250.0, "combined");
check(service.quote(property, new PricingContext(1, 0.50, 12)) === 950.0, "long-stay");
let invalid = false;
try { new PricingContext(13, 0.5, 6); } catch { invalid = true; }
check(invalid, "invalid context");
console.log(`Strategy JavaScript: ${passed}/${passed} passed`);

