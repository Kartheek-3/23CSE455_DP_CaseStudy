class HeaderBuilder {
  constructor() { this.headers = new Map(); }
  add(key, value) {
    if (!key) throw Error("key required");
    this.headers.set(key, value);
    return this;
  }
  remove(key) { this.headers.delete(key); return this; }
  build() { return new Map(this.headers); }
}
module.exports = {HeaderBuilder};
