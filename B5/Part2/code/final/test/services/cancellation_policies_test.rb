require "test_helper"

class CancellationPoliciesTest < ActiveSupport::TestCase
  START = Time.utc(2026, 11, 16, 10, 0, 0)
  HOUR = 3600

  setup do
    @owner, @trip = make_trip_fixture
    @inbox = @trip.inbox_items.create!(from_email: @owner.email, received_at: START - 5 * 24 * HOUR,
                                       sender_status: :approved, parse_status: :parsed, review_status: :confirmed)
    @item = @trip.trip_items.new(name: "Confirmed email booking", added_by: @owner, kind: :stay,
                                  status: :confirmed, inbox_item: @inbox, confirmation_ref: "CONFIRMED-123",
                                  starts_at: START, amount: BigDecimal("200.00"), currency: "EUR")
    @item.defer_geocoding = true
    @item.save!
    @evaluator = CancellationPolicies::QuoteEvaluator.new
  end

  def quote(code, seconds:)
    @evaluator.call(trip_item: @item, policy_code: code, evaluated_at: START - seconds)
  end

  test "all policies use the common fee rate contract with exact 72/24-hour boundaries" do
    cases = {
      "flexible" => { 96*HOUR => "0", 72*HOUR => "0", 72*HOUR-1 => "0", 24*HOUR => "0",
                      24*HOUR-1 => "0.10", 1 => "0.10", 0 => "1", -1 => "1" },
      "moderate" => { 96*HOUR => "0", 72*HOUR => "0", 72*HOUR-1 => "0.50", 24*HOUR => "0.50",
                      24*HOUR-1 => "1", 1 => "1", 0 => "1", -1 => "1" },
      "strict" => { 96*HOUR => "1", 72*HOUR => "1", 72*HOUR-1 => "1", 24*HOUR => "1",
                    24*HOUR-1 => "1", 1 => "1", 0 => "1", -1 => "1" }
    }
    cases.each do |code, inputs|
      inputs.each do |seconds, rate|
        expected = BigDecimal("200.00") * BigDecimal(rate)
        assert_equal expected, quote(code, seconds: seconds)[:fee_amount], "#{code} at #{seconds}s"
      end
    end
  end

  test "normalized result preserves decimal amounts and currency" do
    result = quote("moderate", seconds: 48*HOUR)
    assert_equal %i[policy_code policy_name original_amount fee_amount refund_amount currency refundable explanation], result.keys
    assert_equal "moderate", result[:policy_code]
    assert_equal "Moderate", result[:policy_name]
    assert_equal BigDecimal("200.00"), result[:original_amount]
    assert_equal BigDecimal("100.00"), result[:fee_amount]
    assert_equal BigDecimal("100.00"), result[:refund_amount]
    assert_equal "EUR", result[:currency]
    assert result[:refundable]
    assert_equal result[:original_amount], result[:fee_amount] + result[:refund_amount]
  end

  test "half-up money rounding uses database-stored amount and avoids float arithmetic" do
    @item.update_columns(amount: BigDecimal("0.05"))
    result = quote("moderate", seconds: 48*HOUR)
    assert_equal BigDecimal("0.03"), result[:fee_amount]
    assert_equal BigDecimal("0.02"), result[:refund_amount]
  end

  test "zero cost is valid and not positively refundable" do
    @item.update_columns(amount: BigDecimal("0.00"), currency: "USD")
    result = quote("flexible", seconds: 72*HOUR)
    assert_equal BigDecimal("0"), result[:fee_amount]
    assert_equal BigDecimal("0"), result[:refund_amount]
    refute result[:refundable]
    assert_equal "USD", result[:currency]
  end

  test "unknown policy and missing or invalid time are controlled errors" do
    assert_raises(CancellationPolicies::QuoteEvaluator::UnknownPolicy) { quote("unknown", seconds: HOUR) }
    assert_raises(CancellationPolicies::QuoteEvaluator::InvalidEvaluationTime) do
      @evaluator.call(trip_item: @item, policy_code: "flexible", evaluated_at: nil)
    end
    assert_raises(CancellationPolicies::QuoteEvaluator::InvalidEvaluationTime) do
      @evaluator.call(trip_item: @item, policy_code: "flexible", evaluated_at: "2026-11-16")
    end
  end

  test "missing amount or start time, negative amount and unsupported currency are rejected" do
    { amount: nil, starts_at: nil, currency: "JPY" }.each do |field, value|
      @item.update_columns(field => value)
      assert_raises(CancellationPolicies::QuoteEvaluator::InvalidBookingData) { quote("flexible", seconds: 3*HOUR) }
      @item.reload
      @item.update_columns(field => { amount: BigDecimal("200"), starts_at: START, currency: "EUR" }.fetch(field))
    end
    @item.update_columns(amount: BigDecimal("-1"))
    assert_raises(CancellationPolicies::QuoteEvaluator::InvalidBookingData) { quote("flexible", seconds: 3*HOUR) }
  end

  test "idea or manually confirmed item without linked confirmed email cannot receive quote" do
    @item.update_columns(status: "idea")
    assert_raises(CancellationPolicies::QuoteEvaluator::IneligibleItem) { quote("flexible", seconds: 3*HOUR) }
    @item.update_columns(status: "confirmed", inbox_item_id: nil)
    assert_raises(CancellationPolicies::QuoteEvaluator::IneligibleItem) { quote("flexible", seconds: 3*HOUR) }
  end

  test "item must have its own confirmation reference, not a sibling display fallback" do
    @item.update_columns(confirmation_ref: nil)
    assert_raises(CancellationPolicies::QuoteEvaluator::IneligibleItem) { quote("flexible", seconds: 3*HOUR) }
  end

  test "inbox email must exist and have confirmed review status" do
    @inbox.update!(review_status: :pending_review)
    assert_raises(CancellationPolicies::QuoteEvaluator::IneligibleItem) { quote("flexible", seconds: 3*HOUR) }
    @inbox.update!(review_status: :confirmed)
    assert @evaluator.eligible?(trip_item: @item)
  end

  test "quote evaluator never changes trip item, inbox item or expense" do
    before = [@item.attributes, @inbox.attributes, Expense.count]
    quote("flexible", seconds: 24*HOUR)
    quote("moderate", seconds: 24*HOUR)
    assert_equal before, [@item.reload.attributes, @inbox.reload.attributes, Expense.count]
  end
end
