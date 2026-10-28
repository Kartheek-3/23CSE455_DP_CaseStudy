require "bigdecimal"

module CancellationPolicies
  # Fictional application policy; never an external provider's contract.
  class Flexible
    def fee_rate(seconds_until_start:)
      return BigDecimal("1") if seconds_until_start <= 0
      return BigDecimal("0.10") if seconds_until_start < 24 * 60 * 60

      BigDecimal("0")
    end
  end
end
