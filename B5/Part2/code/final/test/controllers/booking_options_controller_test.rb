require "test_helper"

class BookingOptionsControllerTest < ActionController::TestCase
  tests BookingOptionsController

  setup do
    @owner, @trip = make_trip_fixture
    @request.host = "whats.example.com"
    @request.session[:user_id] = @owner.id
  end

  test "owner can browse Atlas and Beacon without persistence" do
    assert_no_difference([ "TripItem.count", "Expense.count", "InboxItem.count" ]) do
      get :index, params: { trip_id: @trip.id, provider_code: "atlas_demo", destination_code: "rome" }
      assert_response :success
      assert_select "select[name='provider_code']"
      assert_select "select[name='destination_code']"
      assert_select "form[action='#{trip_booking_options_path(@trip)}']"
      get :index, params: { trip_id: @trip.id, provider_code: "beacon_demo", destination_code: "paris" }
      assert_response :success
    end
  end

  test "owner can save one locally normalized offer only as an idea" do
    queued = []
    assert_difference "TripItem.count", +1 do
      assert_no_difference([ "Expense.count", "InboxItem.count" ]) do
        GeocodeTripItemsJob.stub(:perform_later, ->(*args) { queued << args; Object.new }) do
          post :create, params: { trip_id: @trip.id, provider_code: "atlas_demo", destination_code: "rome", offer_id: "atlas-rome-walk-01" }
        end
      end
    end
    assert_response :redirect
    item = @trip.trip_items.order(created_at: :desc).first
    assert item.idea?
    assert_equal @owner.id, item.added_by_id
    assert_match(/Atlas Demo/, item.name)
    assert_includes item.notes, "[demo_provider_offer:atlas_demo:atlas-rome-walk-01]"
    assert_includes item.notes, "No reservation or payment was made"
    assert_equal "do", item.kind
    assert_nil item.confirmation_ref
    assert_nil item.inbox_item_id
    assert_nil item.starts_at
    assert_nil item.ends_at
    assert_equal BigDecimal("24.00"), item.amount
    assert_equal "EUR", item.currency
    assert_equal 1, queued.size
    assert_equal [ [ item.id ], @trip.id ], queued.first
  end

  test "beacon selection saves its own normalized fields and not a booking" do
    GeocodeTripItemsJob.stub(:perform_later, Object.new) do
      post :create, params: { trip_id: @trip.id, provider_code: "beacon_demo", destination_code: "paris", offer_id: "beacon-par-arts-01" }
    end
    assert_response :redirect
    item = @trip.trip_items.last
    assert item.idea?
    assert_match(/Beacon Demo/, item.name)
    assert_equal "Paris, France", item.address
    assert_nil item.confirmation_ref
    assert_nil item.expense
  end

  test "non-owner trip member cannot browse or create" do
    member = User.create!(name: "Viewer", email: "viewer-#{SecureRandom.hex(4)}@example.test")
    traveler = Traveler.create!(account: @trip.account, name: member.name, user: member)
    TripMember.create!(trip: @trip, traveler: traveler, role: :viewer)
    @request.session[:user_id] = member.id
    get :index, params: { trip_id: @trip.id }
    assert_response :forbidden
    assert_no_difference "TripItem.count" do
      post :create, params: { trip_id: @trip.id, provider_code: "atlas_demo", destination_code: "rome", offer_id: "atlas-rome-walk-01" }
    end
    assert_response :forbidden
  end

  test "unrelated user has no trip scope" do
    stranger = User.create!(name: "Other", email: "other-#{SecureRandom.hex(4)}@example.test")
    @request.session[:user_id] = stranger.id
    assert_raises(ActiveRecord::RecordNotFound) { get :index, params: { trip_id: @trip.id } }
    assert_raises(ActiveRecord::RecordNotFound) do
      post :create, params: { trip_id: @trip.id, provider_code: "atlas_demo", destination_code: "rome", offer_id: "atlas-rome-walk-01" }
    end
  end

  test "unknown provider or unsupported destination cannot create" do
    [ [ "not_real", "rome" ], [ "atlas_demo", "tokyo" ] ].each do |provider, destination|
      assert_no_difference "TripItem.count" do
        post :create, params: { trip_id: @trip.id, provider_code: provider, destination_code: destination, offer_id: "atlas-rome-walk-01" }
      end
      assert_response :redirect
    end
    get :index, params: { trip_id: @trip.id, provider_code: "not_real", destination_code: "rome" }
    assert_response :unprocessable_entity
    assert_select "[role=alert]"
  end

  test "unknown, mismatched and cross-provider offer IDs are rejected" do
    [ [ "atlas_demo", "rome", "unknown" ], [ "atlas_demo", "rome", "beacon-rm-museum-01" ],
      [ "beacon_demo", "rome", "atlas-rome-walk-01" ], [ "atlas_demo", "paris", "atlas-rome-walk-01" ] ].each do |provider, destination, offer_id|
      assert_no_difference "TripItem.count" do
        post :create, params: { trip_id: @trip.id, provider_code: provider, destination_code: destination, offer_id: offer_id }
      end
      assert_response :redirect
    end
  end

  test "tampered client attributes cannot create confirmed items, expenses or fake references" do
    assert_difference "TripItem.count", +1 do
      assert_no_difference([ "Expense.count", "InboxItem.count" ]) do
        GeocodeTripItemsJob.stub(:perform_later, Object.new) do
          post :create, params: { trip_id: @trip.id, provider_code: "atlas_demo", destination_code: "rome",
                                  offer_id: "atlas-rome-walk-01", name: "Injected", kind: "flight",
                                  amount: "0", currency: "USD", description: "Fake", address: "Somewhere",
                                  status: "confirmed", confirmation_ref: "FAKE123", inbox_item_id: SecureRandom.uuid }
        end
      end
    end
    item = @trip.trip_items.last
    assert item.idea?
    assert_match(/Atlas Demo/, item.name)
    refute_equal "Injected", item.name
    refute_equal "flight", item.kind
    refute_equal "USD", item.currency
    assert_nil item.confirmation_ref
    assert_nil item.inbox_item_id
  end

  test "duplicate provider offer is not added twice, including if names collide across providers" do
    GeocodeTripItemsJob.stub(:perform_later, Object.new) do
      post :create, params: { trip_id: @trip.id, provider_code: "atlas_demo", destination_code: "rome", offer_id: "atlas-rome-walk-01" }
      assert_response :redirect
      assert_no_difference "TripItem.count" do
        post :create, params: { trip_id: @trip.id, provider_code: "atlas_demo", destination_code: "rome", offer_id: "atlas-rome-walk-01" }
      end
      post :create, params: { trip_id: @trip.id, provider_code: "beacon_demo", destination_code: "rome", offer_id: "beacon-rm-museum-01" }
      assert_response :redirect
    end
    assert_equal 2, @trip.trip_items.count
  end

  test "provider errors are controlled, and no synchronous geocoding occurs" do
    fake = Object.new
    fake.define_singleton_method(:offers_for) { |destination_code:| raise BookingProviders::Registry::ProviderDataError, "Fixture unavailable" }
    BookingProviders::Registry.stub(:find, fake) do
      get :index, params: { trip_id: @trip.id, provider_code: "atlas_demo", destination_code: "rome" }
      assert_response :unprocessable_entity
      assert_select "[role=alert]", /Fixture unavailable/
      assert_no_difference "TripItem.count" do
        post :create, params: { trip_id: @trip.id, provider_code: "atlas_demo", destination_code: "rome", offer_id: "atlas-rome-walk-01" }
      end
    end
    Geocoder.stub(:search, ->(*) { raise "Unexpected synchronous geocoding" }) do
      GeocodeTripItemsJob.stub(:perform_later, Object.new) do
        post :create, params: { trip_id: @trip.id, provider_code: "beacon_demo", destination_code: "rome", offer_id: "beacon-rm-museum-01" }
      end
    end
    assert_response :redirect
    assert_equal 1, @trip.trip_items.count
  end
end
