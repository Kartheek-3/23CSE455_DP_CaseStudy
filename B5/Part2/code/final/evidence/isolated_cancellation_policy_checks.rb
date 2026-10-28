require "minitest/autorun"
require "ostruct"
require_relative "../app/services/cancellation_policies/flexible"
require_relative "../app/services/cancellation_policies/moderate"
require_relative "../app/services/cancellation_policies/strict"
require_relative "../app/services/cancellation_policies/quote_evaluator"

class IsolatedCancellationPolicyChecks < Minitest::Test
  START = Time.utc(2026, 11, 16, 10)
  HOUR = 3600
  Inbox = Struct.new(:confirmed?)
  Item = Struct.new(:confirmed?, :inbox_item_id, :inbox_item, :confirmation_ref, :starts_at, :amount, :currency, keyword_init: true)

  def setup
    @item = Item.new(confirmed?: true, inbox_item_id: "mail-1", inbox_item: Inbox.new(true),
                     confirmation_ref: "EMAIL-REF", starts_at: START, amount: BigDecimal("200"), currency: "EUR")
    @evaluator = CancellationPolicies::QuoteEvaluator.new
  end

  def result(code, seconds)
    @evaluator.call(trip_item: @item, policy_code: code, evaluated_at: START - seconds)
  end

  def test_all_policy_boundary_seconds
    expected = {
      "flexible" => [0, 0, 0, 0, 20, 20, 200, 200],
      "moderate" => [0, 0, 100, 100, 200, 200, 200, 200],
      "strict" => [200, 200, 200, 200, 200, 200, 200, 200]
    }
    seconds = [96*HOUR, 72*HOUR, 72*HOUR-1, 24*HOUR, 24*HOUR-1, 1, 0, -1]
    expected.each do |policy, fees|
      seconds.zip(fees).each do |s, expected_fee|
        assert_equal BigDecimal(expected_fee.to_s), result(policy, s)[:fee_amount], "#{policy} at #{s} seconds"
      end
    end
  end

  def test_normalized_shape_and_currency
    quote = result("moderate", 48*HOUR)
    assert_equal %i[policy_code policy_name original_amount fee_amount refund_amount currency refundable explanation], quote.keys
    assert_equal "EUR", quote[:currency]
    assert_equal BigDecimal("100"), quote[:fee_amount]
    assert_equal BigDecimal("100"), quote[:refund_amount]
    assert_equal quote[:original_amount], quote[:fee_amount] + quote[:refund_amount]
    assert quote[:refundable]
  end

  def test_decimal_rounding_half_up
    @item.amount = BigDecimal("0.05")
    quote = result("moderate", 48*HOUR)
    assert_equal BigDecimal("0.03"), quote[:fee_amount]
    assert_equal BigDecimal("0.02"), quote[:refund_amount]
  end

  def test_zero_amount_is_valid_but_not_refundable
    @item.amount = BigDecimal("0")
    quote = result("flexible", 48*HOUR)
    assert_equal BigDecimal("0"), quote[:fee_amount]
    assert_equal BigDecimal("0"), quote[:refund_amount]
    refute quote[:refundable]
  end

  def test_unknown_policy_rejected
    assert_raises(CancellationPolicies::QuoteEvaluator::UnknownPolicy) { result("surprise", 48*HOUR) }
  end

  def test_missing_and_negative_amount_rejected
    @item.amount = nil
    assert_raises(CancellationPolicies::QuoteEvaluator::InvalidBookingData) { result("flexible", HOUR) }
    @item.amount = -1
    assert_raises(CancellationPolicies::QuoteEvaluator::InvalidBookingData) { result("flexible", HOUR) }
  end

  def test_missing_time_and_invalid_evaluation_time_rejected
    @item.starts_at = nil
    assert_raises(CancellationPolicies::QuoteEvaluator::InvalidBookingData) { result("flexible", HOUR) }
    @item.starts_at = START
    assert_raises(CancellationPolicies::QuoteEvaluator::InvalidEvaluationTime) do
      @evaluator.call(trip_item: @item, policy_code: "flexible", evaluated_at: "not a Time")
    end
  end

  def test_unknown_currency_rejected
    @item.currency = "JPY"
    assert_raises(CancellationPolicies::QuoteEvaluator::InvalidBookingData) { result("flexible", HOUR) }
  end

  def test_idea_and_unlinked_demo_cannot_be_quoted
    @item.define_singleton_method(:confirmed?) { false }
    assert_raises(CancellationPolicies::QuoteEvaluator::IneligibleItem) { result("flexible", HOUR) }
    @item.define_singleton_method(:confirmed?) { true }
    @item.inbox_item_id = nil
    assert_raises(CancellationPolicies::QuoteEvaluator::IneligibleItem) { result("flexible", HOUR) }
  end

  def test_own_reference_and_confirmed_inbox_required
    @item.confirmation_ref = nil
    assert_raises(CancellationPolicies::QuoteEvaluator::IneligibleItem) { result("flexible", HOUR) }
    @item.confirmation_ref = "EMAIL-REF"
    @item.inbox_item = Inbox.new(false)
    assert_raises(CancellationPolicies::QuoteEvaluator::IneligibleItem) { result("flexible", HOUR) }
  end
end
