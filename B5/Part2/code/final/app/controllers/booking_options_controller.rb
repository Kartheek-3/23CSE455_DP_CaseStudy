class BookingOptionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_trip
  before_action :require_owner!

  def index
    @providers = BookingProviders::Registry.available
    @destinations = BookingProviders::Registry.destinations
    @provider_code = params[:provider_code].presence || "atlas_demo"
    @destination_code = params[:destination_code].presence || "rome"
    @offers = BookingProviders::Registry.find(@provider_code).offers_for(destination_code: @destination_code)
  rescue BookingProviders::Registry::Error => e
    @offers = []
    @provider_error = e.message
    render :index, status: :unprocessable_entity
  end

  def create
    provider_code = params[:provider_code]
    destination_code = params[:destination_code]
    offer_id = params[:offer_id]

    # Never accept name, amount, status, kind or booking data from the browser.
    provider = BookingProviders::Registry.find(provider_code)
    offer = provider.offers_for(destination_code: destination_code).find { |result| result[:offer_id] == offer_id }
    raise BookingProviders::Registry::ProviderDataError, "Unknown offer for the selected provider and destination." unless offer

    # The marker is constructed only from validated server-owned fixture data.
    marker = offer_marker(offer)
    already_added = @trip.trip_items.idea.where("instr(notes, ?) > 0", marker).exists?
    if already_added
      return redirect_to trip_booking_options_path(@trip, provider_code: provider_code, destination_code: destination_code),
                         alert: "This demo offer is already in your itinerary."
    end

    item = @trip.trip_items.new(
      name: "[#{offer[:provider_name]}] #{offer[:name]}",
      kind: offer[:kind], status: :idea, added_by: current_user,
      address: offer[:address],
      notes: [ "Demo provider: #{offer[:provider_name]}", "Sample offer ID: #{offer[:offer_id]}",
               offer[:description], "Demonstration offer only. No reservation or payment was made.", marker ].join("\n"),
      amount: offer[:sample_amount], currency: offer[:currency],
      starts_at: nil, ends_at: nil, confirmation_ref: nil, inbox_item_id: nil
    )
    item.defer_geocoding = true
    item.save!

    # Existing job loads a fresh TripItem so its callback deferral is not retained.
    warning = nil
    begin
      queued = GeocodeTripItemsJob.perform_later([ item.id ], @trip.id)
      warning = "The sample idea was saved, but its map update could not be queued." unless queued
    rescue StandardError => e
      Rails.logger.warn "[BookingOptions#create] Geocoding enqueue failed for #{item.id}: #{e.class}"
      warning = "The sample idea was saved, but its map update could not be queued."
    end
    redirect_to trip_path(@trip, tab: "itinerary"), notice: warning || "Sample offer added as an itinerary idea. No booking was made."
  rescue BookingProviders::Registry::Error => e
    redirect_to trip_booking_options_path(@trip), alert: e.message
  rescue ActiveRecord::RecordInvalid => e
    redirect_to trip_booking_options_path(@trip), alert: "Unable to save the demo offer: #{e.record.errors.full_messages.to_sentence}"
  end

  private

  def set_trip
    @trip = current_user.trips.find(params[:trip_id])
  end

  def require_owner!
    head :forbidden unless current_member_for(@trip)&.owner?
  end

  def offer_marker(offer)
    "[demo_provider_offer:#{offer.fetch(:provider_code)}:#{offer.fetch(:offer_id)}]"
  end
end
