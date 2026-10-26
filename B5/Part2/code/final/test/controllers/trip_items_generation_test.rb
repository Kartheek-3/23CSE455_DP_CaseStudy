require "test_helper"

class TripItemsGenerationTest < ActionController::TestCase
  tests TripItemsController

  setup do
    @owner, @trip = make_trip_fixture
    @request.host = "whats.example.com"
    @request.session[:user_id] = @owner.id
    @prefs = { interests: [ "culture" ], budget: "medium", pace: "balanced", notes: "Museums" }
  end

  test "owner can view generation form" do
    get :generate, params: { trip_id: @trip.id }
    assert_response :success
    assert_select "form"
    assert_select "input[name='interests[]']"
  end

  test "unauthorized trip member cannot generate or confirm" do
    member = User.create!(name: "Member", email: "member-#{SecureRandom.hex(4)}@example.test")
    traveler = Traveler.create!(account: @trip.account, name: member.name, user: member)
    TripMember.create!(trip: @trip, traveler: traveler, role: :viewer)
    @request.session[:user_id] = member.id
    get :generate, params: { trip_id: @trip.id }
    assert_response :forbidden
    post :generate, params: { trip_id: @trip.id, **@prefs }
    assert_response :forbidden
    post :generate, params: { trip_id: @trip.id, confirm: "1", items_json: sample_suggestions.to_json }
    assert_response :forbidden
    assert_equal 0, @trip.trip_items.count
  end

  test "nonmember cannot access another trip" do
    stranger = User.create!(name: "Stranger", email: "stranger-#{SecureRandom.hex(4)}@example.test")
    @request.session[:user_id] = stranger.id
    assert_raises(ActiveRecord::RecordNotFound) do
      get :generate, params: { trip_id: @trip.id }
    end
  end

  test "preview calls generator but saves nothing; rejecting saves nothing" do
    fake = Object.new
    fake.define_singleton_method(:call) { [ { "name" => "Colosseum", "kind" => "do", "address" => "Rome, Italy",
                                              "notes" => "Historic", "starts_at" => nil, "ends_at" => nil } ] }
    ItinerarySuggestionGenerator.stub(:new, ->(*args, **kwargs) { fake }) do
      post :generate, params: { trip_id: @trip.id, **@prefs }
    end
    assert_response :success
    assert_select "input[name='preview_token']"
    assert_select "input[value='Accept ideas']"
    assert_equal 0, @trip.trip_items.count
  end

  test "invalid preferences do not create or call Anthropic" do
    post :generate, params: { trip_id: @trip.id, budget: "medium", pace: "balanced" }
    assert_response :unprocessable_entity
    assert_select "[role=alert]"
    assert_equal 0, @trip.trip_items.count
  end

  test "signed confirmed suggestions create ideas; duplicate names skipped" do
    items = [ sample_suggestions.first, sample_suggestions.first ]
    signature = signed_preview(items)
    queued = []
    GeocodeTripItemsJob.stub(:perform_later, ->(*args) { queued << args }) do
      post :generate, params: { trip_id: @trip.id, confirm: "1", preview_token: signature, items_json: items.to_json }
    end
    assert_response :redirect
    assert_equal 1, @trip.trip_items.count
    assert_equal "idea", @trip.trip_items.first.status
    assert_equal @owner.id, @trip.trip_items.first.added_by_id
    assert_equal 1, queued.size
    assert_equal [ @trip.trip_items.first.id ], queued.first.first
  end

  test "rejects malformed, tampered and excessive confirmation with no persistence" do
    original = sample_suggestions
    signature = signed_preview(original)
    [ "not JSON", JSON.generate(original.first.merge("status" => "confirmed")),
      JSON.generate(original.map { |i| i.merge("name" => "Changed") }),
      JSON.generate(Array.new(7) { original.first }) ].each do |raw|
      post :generate, params: { trip_id: @trip.id, confirm: "1", preview_token: signature, items_json: raw }
      assert_response :unprocessable_entity
      assert_equal 0, @trip.trip_items.count
    end
    post :generate, params: { trip_id: @trip.id, confirm: "1", preview_token: "forged", items_json: original.to_json }
    assert_response :unprocessable_entity
    assert_equal 0, @trip.trip_items.count
  end

  test "generator API errors are shown without persistence" do
    fake = Object.new
    fake.define_singleton_method(:call) { raise ItinerarySuggestionGenerator::ApiError, "API offline" }
    ItinerarySuggestionGenerator.stub(:new, ->(*args, **kwargs) { fake }) do
      post :generate, params: { trip_id: @trip.id, **@prefs }
    end
    assert_response :unprocessable_entity
    assert_select "[role=alert]", /API offline/
    assert_equal 0, @trip.trip_items.count
  end

  private

  def signed_preview(items)
    Rails.application.message_verifier("scenario1-itinerary-suggestions").generate(
      { "trip_id" => @trip.id, "user_id" => @owner.id, "items" => items }, expires_in: 20.minutes
    )
  end
end
