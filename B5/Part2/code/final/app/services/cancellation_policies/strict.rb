require "bigdecimal"

module CancellationPolicies
  # Fictional application policy; never an external provider's contract.
  class Strict
    def fee_rate(seconds_until_start:)
      BigDecimal("1")
    end
  end
end
