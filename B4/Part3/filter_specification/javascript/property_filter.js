export class CitySpecification {
  constructor(city) { this.city = city; }
  isSatisfiedBy(property) { return property.city.toLowerCase() === this.city.toLowerCase(); }
}

export class RentRangeSpecification {
  constructor(minimum, maximum) {
    if (minimum < 0 || minimum > maximum) throw new Error("Invalid range");
    Object.assign(this, { minimum, maximum });
  }
  isSatisfiedBy(property) { return property.rent >= this.minimum && property.rent <= this.maximum; }
}

export class AmenitySpecification {
  constructor(amenity) { this.amenity = amenity; }
  isSatisfiedBy(property) { return property.amenities.includes(this.amenity); }
}

export class AvailableSpecification {
  isSatisfiedBy(property) { return property.available; }
}

export class FurnishedSpecification {
  isSatisfiedBy(property) { return property.furnished; }
}

export class AndSpecification {
  constructor(specifications) { this.specifications = specifications; }
  isSatisfiedBy(property) { return this.specifications.every((spec) => spec.isSatisfiedBy(property)); }
}

export const matching = (properties, specification) => properties.filter((item) => specification.isSatisfiedBy(item));

