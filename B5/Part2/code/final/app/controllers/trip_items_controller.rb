class TripItemsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_trip
  before_action :set_item, only: [ :show, :edit, :update, :destroy, :confirm, :to_expense ]

  def show
    sorted_ids = @trip.trip_items
                      .order(Arel.sql("starts_at IS NULL, starts_at ASC, created_at ASC"))
                      .pluck(:id)
    idx              = sorted_ids.index(@item.id) || 0
    @item_index      = idx + 1
    @item_count      = sorted_ids.size
    @prev_item_id    = sorted_ids[idx - 1] if idx > 0
    @next_item_id    = sorted_ids[idx + 1] if idx < sorted_ids.size - 1

    # For items from the same email (e.g. return flight leg), fall back to
    # the booking ref and expense shared across sibling trip_items.
    if @item.inbox_item_id.present?
      siblings         = @trip.trip_items.where(inbox_item_id: @item.inbox_item_id)
      @display_ref     = @item.confirmation_ref.presence ||
                         siblings.where.not(confirmation_ref: [ nil, "" ]).pick(:confirmation_ref)
      @display_expense = @item.expense ||
                         Expense.joins(:trip_item)
                                .find_by(trip_items: { inbox_item_id: @item.inbox_item_id })
    else
      @display_ref     = @item.confirmation_ref.presence
      @display_expense = @item.expense
    end
  end

  def import
    if request.post? && params[:confirm] == "1"
      result = bulk_create_items(JSON.parse(params[:items_json]))
      msg    = "#{result[:created]} idea(s) added."
      msg   += " #{result[:skipped]} skipped (missing name)." if result[:skipped] > 0
      msg   += " #{result[:duplicates]} skipped (already in itinerary)." if result[:duplicates] > 0
      msg   += " Map pins will appear shortly." if result[:geocoding_queued] > 0
      redirect_to trip_path(@trip, tab: "itinerary"), notice: msg
    elsif request.post?
      raw = params[:items_json].presence || params[:json_file]&.read
      if raw.blank?
        @parse_error = "Please paste JSON or upload a .json file."
        return render :import
      end
      begin
        parsed = JSON.parse(raw)
        raise ArgumentError, "Expected a JSON array" unless parsed.is_a?(Array)
        @preview_items = parsed
        @raw_json      = raw
        @skipped_count = parsed.count { |i| i["name"].blank? }
      rescue JSON::ParserError, ArgumentError => e
        @parse_error = e.message.truncate(120)
        @raw_json    = raw
      end
      render :import
    end
    # GET — just render the form
  end

  # Owner-only, two-phase generation: preview first, then signed confirmation.
  def generate
    return head :forbidden unless current_member_for(@trip)&.owner?
    return if request.get?

    if params[:confirm] == "1"
      confirm_generated_ideas
    else
      generate_preview
    end
  end

  def new
    @item = TripItem.new(status: "idea", kind: "do")
  end

  def create
    @item = @trip.trip_items.new(item_params)
    @item.added_by = current_user

    if @item.save
      redirect_to trip_path(@trip, tab: "itinerary"), notice: "Item added."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit; end

  def update
    if @item.update(item_params)
      redirect_to trip_trip_item_path(@trip, @item), notice: "Saved."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @item.destroy!
    redirect_to trip_path(@trip, tab: "itinerary"), notice: "Item removed."
  end

  def confirm
    new_status = @item.confirmed? ? :idea : :confirmed
    @item.update!(status: new_status)
    redirect_back fallback_location: trip_trip_item_path(@trip, @item)
  end

  # Redirect to the expense new form, pre-filling from this item.
  # Guards against creating a second expense if one already exists.
  def to_expense
    if @item.expense
      return redirect_to trip_expense_path(@trip, @item.expense),
                         alert: "This item already has an expense."
    end

    prefill = {
      description: @item.name,
      category:    @item.expense_category,
      expense_date: (@item.starts_at&.to_date || Date.today).iso8601,
      currency:    @item.currency.presence || "EUR",
      trip_item_id: @item.id
    }
    prefill[:amount] = "%.2f" % @item.amount if @item.amount.present?

    redirect_to new_trip_expense_path(@trip, expense: prefill)
  end

  private

  def set_trip
    @trip = current_user.trips.find(params[:trip_id])
  end

  def set_item
    @item = @trip.trip_items.find(params[:id])
  end

  def generate_preview
    @preferences = {
      "interests" => params[:interests], "budget" => params[:budget],
      "pace" => params[:pace], "notes" => params[:notes]
    }
    generator = ItinerarySuggestionGenerator.new(trip: @trip, preferences: @preferences)
    @preview_items = generator.call
    @raw_json = JSON.generate(@preview_items)
    @preview_token = generated_ideas_verifier.generate(
      { "trip_id" => @trip.id, "user_id" => current_user.id, "items" => @preview_items },
      expires_in: 20.minutes
    )
    @generated_preview = true
    @skipped_count = 0
    render :import
  rescue ItinerarySuggestionGenerator::Error => e
    @generation_error = e.message
    render :generate, status: :unprocessable_entity
  end

  def confirm_generated_ideas
    verified = generated_ideas_verifier.verified(params[:preview_token].to_s)
    unless verified.is_a?(Hash) && verified["trip_id"] == @trip.id && verified["user_id"] == current_user.id
      raise ItinerarySuggestionGenerator::InvalidSuggestions, "Preview expired or was modified. Generate again."
    end
    items = JSON.parse(params[:items_json].to_s)
    validated = ItinerarySuggestionGenerator.validate_suggestions!(items, trip: @trip)
    unless validated == verified["items"]
      raise ItinerarySuggestionGenerator::InvalidSuggestions, "The proposed suggestions were changed. Generate again."
    end

    # Confirm all-or-nothing; unlike ordinary import, validation/DB errors roll back.
    result = nil
    @trip.trip_items.transaction do
      result = bulk_create_items(validated, strict: true, enqueue: false)
    end
    geocode_warning = false
    if result[:geocode_ids].any?
      begin
        geocode_warning = !GeocodeTripItemsJob.perform_later(result[:geocode_ids], @trip.id)
      rescue StandardError => e
        Rails.logger.warn "[TripItems#generate] Geocoding enqueue failed: #{e.class}"
        geocode_warning = true
      end
    end
    notice = "#{result[:created]} idea(s) added; #{result[:duplicates]} duplicate(s) skipped."
    notice += " Map pin updates could not be queued; the ideas were saved." if geocode_warning
    redirect_to trip_path(@trip, tab: "itinerary"), notice: notice
  rescue JSON::ParserError, ItinerarySuggestionGenerator::InvalidSuggestions => e
    @generation_error = "Invalid generated preview: #{e.message}"
    render :generate, status: :unprocessable_entity
  rescue ActiveRecord::ActiveRecordError => e
    Rails.logger.error "[TripItems#generate] Confirmation failed: #{e.class}"
    @generation_error = "Unable to save suggestions. No items were added."
    render :generate, status: :unprocessable_entity
  end

  def generated_ideas_verifier
    Rails.application.message_verifier("scenario1-itinerary-suggestions")
  end

  VALID_IMPORT_KINDS = TripItem.kinds.keys.to_set

  def bulk_create_items(items, strict: false, enqueue: true)
    created           = 0
    skipped           = 0
    duplicates        = 0
    needs_geocode_ids = []
    existing_names    = @trip.trip_items.pluck(:name).map(&:downcase).to_set
    items.each do |data|
      begin
        next skipped += 1 if data["name"].blank?
        if existing_names.include?(data["name"].downcase)
          existing = @trip.trip_items.find_by("lower(name) = ?", data["name"].downcase)
          if existing
            updates = {}
            updates[:latitude]  = data["lat"] if data["lat"].present? && !existing.geocoded?
            updates[:longitude] = data["lng"] if data["lng"].present? && !existing.geocoded?
            updates[:url]       = data["url"] if data["url"].present? && existing.url.blank?
            existing.update_columns(updates) if updates.any?
          end
          next duplicates += 1
        end
        item = @trip.trip_items.new(
          name:      data["name"],
          kind:      VALID_IMPORT_KINDS.include?(data["kind"].to_s) ? data["kind"].to_s : "other",
          status:    "idea",
          address:   data["address"].presence,
          latitude:  data["lat"].presence,
          longitude: data["lng"].presence,
          notes:     data["notes"].presence,
          url:       data["url"].presence,
          starts_at: parse_import_time(data["starts_at"]),
          ends_at:   parse_import_time(data["ends_at"]),
          amount:    data["amount"].presence,
          currency:  data["currency"].presence,
          added_by:  current_user
        )
        # Scope deferral to this record only; manual TripItem saves still geocode.
        item.defer_geocoding = true
        item.save!
        created += 1
        existing_names << item.name.downcase
        needs_geocode_ids << item.id unless item.geocoded?
      rescue => e
        raise if strict
        Rails.logger.error "[TripItems#import] skipped item: #{e.message}"
        skipped += 1
      end
    end
    if enqueue && needs_geocode_ids.any?
      GeocodeTripItemsJob.perform_later(needs_geocode_ids, @trip.id)
    end
    { created: created, skipped: skipped, duplicates: duplicates,
      geocoding_queued: needs_geocode_ids.size, geocode_ids: needs_geocode_ids }
  end

  def parse_import_time(val)
    Time.zone.parse(val.to_s) if val.present?
  rescue ArgumentError, TypeError
    nil
  end

  def item_params
    params.require(:trip_item).permit(
      :kind, :name, :status, :notes,
      :starts_at, :ends_at,
      :address, :latitude, :longitude,
      :amount, :currency, :confirmation_ref, :url
    )
  end
end
