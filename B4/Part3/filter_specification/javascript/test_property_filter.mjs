import * as f from "./property_filter.js";

let passed = 0;
const check = (condition, name) => { if (!condition) throw new Error(name); passed += 1; };
const items = [
  { id: 1, city: "Kochi", rent: 22000, available: true, amenities: ["parking", "gym"], furnished: true },
  { id: 2, city: "Kochi", rent: 15000, available: true, amenities: ["wifi"], furnished: false },
  { id: 3, city: "Bengaluru", rent: 32000, available: true, amenities: ["parking"], furnished: true },
  { id: 4, city: "Kochi", rent: 24000, available: false, amenities: ["parking"], furnished: true },
];
const composite = new f.AndSpecification([new f.AvailableSpecification(), new f.CitySpecification("Kochi"),
  new f.RentRangeSpecification(18000, 25000), new f.AmenitySpecification("parking"), new f.FurnishedSpecification()]);
const result = f.matching(items, composite);
check(result.length === 1, "one match");
check(result[0].id === 1, "correct match");
check(f.matching(items, new f.CitySpecification("Kochi")).length === 3, "reusable city spec");
check(f.matching(items, new f.AvailableSpecification()).length === 3, "availability spec");
let invalid = false;
try { new f.RentRangeSpecification(10, 5); } catch { invalid = true; }
check(invalid, "invalid range");
console.log(`Specification JavaScript: ${passed}/${passed} passed`);

