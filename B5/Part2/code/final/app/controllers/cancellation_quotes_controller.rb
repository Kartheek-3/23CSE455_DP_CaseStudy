class CancellationQuotesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_trip_and_item
  before_action :require_owner!

  def new
    @policy_code = "flexible"
    ensure_eligible!
  rescue CancellationPolicies::QuoteEvaluator::Error => e
    @quote_error = e.message
    render :new, status: :unprocessable_entity
  end

  def create
    ensure_eligible!
    @policy_code = params[:policy_code].to_s
    @quote = evaluator.call(trip_item: @item, policy_code: @policy_code, evaluated_at: Time.current)
    render :new
  rescue CancellationPolicies::QuoteEvaluator::Error => e
    @quote_error = e.message
    render :new, status: :unprocessable_entity
  end

  private

  def set_trip_and_item
    @trip = current_user.trips.find(params[:trip_id])
    @item = @trip.trip_items.find(params[:trip_item_id])
  end

  def require_owner!
    head :forbidden unless current_member_for(@trip)&.owner?
  end

  def evaluator
    @evaluator ||= CancellationPolicies::QuoteEvaluator.new
  end

  def ensure_eligible!
    evaluator.eligible?(trip_item: @item) ||
      raise(CancellationPolicies::QuoteEvaluator::IneligibleItem, "This item is not eligible for a demo cancellation quote.")
  end
end
