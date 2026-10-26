require "bigdecimal"

module CancellationPolicies
  # Fictional application policy; never an external provider's contract.
  class Moderate
    def fee_rate(seconds_until_start:)
      return BigDecimal("0") if seconds_until_start >= 72 * 60 * 60
      return BigDecimal("0.50") if seconds_until_start >= 24 * 60 * 60

      BigDecimal("1")
    end
  end
end
