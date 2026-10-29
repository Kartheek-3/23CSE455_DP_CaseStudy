class VendorFx:
    def quote(self, pair): return {"USDEUR": 0.92}[pair]
class RateProvider:
    def __init__(self, vendor): self.vendor = vendor
    def rate(self, source, target): return self.vendor.quote(source + target)
def demo(): return RateProvider(VendorFx()).rate("USD", "EUR") == 0.92

