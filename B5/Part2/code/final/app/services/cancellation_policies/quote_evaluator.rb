require "bigdecimal"
require "date"

module CancellationPolicies
  # Read-only calculator for hypothetical refunds. Does not cancel bookings.
  class QuoteEvaluator
    class Error < StandardError; end
    class IneligibleItem < Error; end
    class UnknownPolicy < Error; end
    class InvalidBookingData < Error; end
    class InvalidEvaluationTime < Error; end

    POLICIES = {
      "flexible" => [ "Flexible", Flexible ],
      "moderate" => [ "Moderate", Moderate ],
      "strict" => [ "Strict", Strict ]
    }.freeze
    CURRENCIES = %w[EUR GBP USD].freeze
    ROUNDING = BigDecimal::ROUND_HALF_UP
    DISCLAIMER = "This is a hypothetical cancellation estimate based on a demonstration policy. " \
                 "No reservation has been cancelled and no actual refund is guaranteed. " \
                 "Check your booking provider's terms."

    # Used only to determine visibility of the UI link. call revalidates everything.
    def eligible?(trip_item:)
      validate_booking!(trip_item)
      true
    rescue Error
      false
    end

    def call(trip_item:, policy_code:, evaluated_at:)
      validate_booking!(trip_item)
      raise InvalidEvaluationTime, "A valid evaluation time is required." unless valid_time?(evaluated_at)

      chosen = POLICIES[policy_code.to_s]
      raise UnknownPolicy, "Choose Flexible, Moderate or Strict." unless chosen

      policy_name, policy_class = chosen
      original = BigDecimal(trip_item.amount.to_s)
      seconds = as_time(trip_item.starts_at) - as_time(evaluated_at)
      rate = policy_class.new.fee_rate(seconds_until_start: seconds)
      fee = (original * rate).round(2, ROUNDING)
      refund = original - fee

      {
        policy_code: policy_code.to_s,
        policy_name: policy_name,
        original_amount: original,
        fee_amount: fee,
        refund_amount: refund,
        currency: trip_item.currency,
        refundable: refund.positive?,
        explanation: "The #{policy_name} demonstration policy applies a #{(rate * 100).to_i}% cancellation fee."
      }
    end

    private

    def validate_booking!(item)
      raise IneligibleItem, "This item is not a confirmed email-linked booking." unless item&.confirmed?
      raise IneligibleItem, "A confirmed source email is required." if item.inbox_item_id.nil? || !item.inbox_item&.confirmed?
      raise IneligibleItem, "This item has no own confirmation reference." if item.confirmation_ref.to_s.strip.empty?
      raise InvalidBookingData, "A booking start time is required." unless valid_time?(item.starts_at)
      raise InvalidBookingData, "A booking amount is required." if item.amount.nil?

      amount = BigDecimal(item.amount.to_s)
      raise InvalidBookingData, "Booking amount must be nonnegative and finite." unless amount.finite? && amount >= 0
      raise InvalidBookingData, "Only EUR, GBP and USD are supported for demo quotes." unless CURRENCIES.include?(item.currency)
      true
    rescue ArgumentError, TypeError
      raise InvalidBookingData, "Booking amount is invalid."
    end

    def as_time(value)
      value.is_a?(Time) ? value : value.to_time
    end

    def valid_time?(value)
      value.is_a?(Time) || value.is_a?(DateTime) ||
        (defined?(ActiveSupport::TimeWithZone) && value.is_a?(ActiveSupport::TimeWithZone))
    end
  end
end
