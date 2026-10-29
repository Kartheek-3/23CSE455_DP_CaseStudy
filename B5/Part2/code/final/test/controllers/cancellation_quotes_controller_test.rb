require "test_helper"

class CancellationQuotesControllerTest < ActionController::TestCase
  tests CancellationQuotesController

  setup do
    @owner, @trip = make_trip_fixture
    @request.host = "whats.example.com"
    @request.session[:user_id] = @owner.id
    @email = @trip.inbox_items.create!(from_email: @owner.email, received_at: Time.utc(2026, 11, 1),
                                       review_status: :confirmed, sender_status: :approved, parse_status: :parsed)
    @item = @trip.trip_items.new(name: "Confirmed stay", kind: :stay, status: :confirmed,
                                  added_by: @owner, inbox_item: @email, confirmation_ref: "EMAIL-BOOKING-007",
                                  amount: BigDecimal("200.00"), currency: "EUR",
                                  starts_at: Time.current + 4.days)
    @item.defer_geocoding = true
    @item.save!
  end

  def route_params
    { trip_id: @trip.id, trip_item_id: @item.id }
  end

  def assert_read_only
    before = [ @item.reload.attributes, @email.reload.attributes, TripItem.count, InboxItem.count, Expense.count ]
    yield
    assert_equal before, [ @item.reload.attributes, @email.reload.attributes, TripItem.count, InboxItem.count, Expense.count ]
  end

  test "owner can open quote screen and read demo-only explanation" do
    assert_read_only do
      get :new, params: route_params
      assert_response :success
      assert_select "select[name='policy_code']"
      assert_select "a[href='#{trip_trip_item_path(@trip, @item)}']"
      assert_select "[role=note]", /No reservation has been cancelled/
    end
  end

  test "owner can quote each of three policies without mutating booking or expenses" do
    assert_read_only do
      %w[flexible moderate strict].each do |policy|
        post :create, params: route_params.merge(policy_code: policy)
        assert_response :success
        assert_select "section[aria-label='Hypothetical cancellation quote']", /hypothetical/i
        assert_select "[role=note]", /No reservation has been cancelled/
      end
    end
  end

  test "unknown policy returns a controlled user-visible error" do
    assert_read_only do
      post :create, params: route_params.merge(policy_code: "no_such_policy")
      assert_response :unprocessable_entity
      assert_select "[role=alert]", /Choose Flexible, Moderate or Strict/
    end
  end

  test "non-owner and unrelated users cannot view or create a quote" do
    viewer = User.create!(name: "Viewer", email: "viewer-#{SecureRandom.hex(4)}@example.test")
    traveler = Traveler.create!(account: @trip.account, name: viewer.name, user: viewer)
    TripMember.create!(trip: @trip, traveler: traveler, role: :viewer)
    @request.session[:user_id] = viewer.id
    assert_read_only do
      get :new, params: route_params
      assert_response :forbidden
      post :create, params: route_params.merge(policy_code: "flexible")
      assert_response :forbidden
    end

    stranger = User.create!(name: "Stranger", email: "other-#{SecureRandom.hex(4)}@example.test")
    @request.session[:user_id] = stranger.id
    assert_raises(ActiveRecord::RecordNotFound) { get :new, params: route_params }
    assert_raises(ActiveRecord::RecordNotFound) { post :create, params: route_params.merge(policy_code: "flexible") }
  end

  test "Scenario 1 generated idea cannot be quoted even if manually marked confirmed" do
    @item.update_columns(inbox_item_id: nil, confirmation_ref: nil, status: "confirmed")
    assert_read_only do
      get :new, params: route_params
      assert_response :unprocessable_entity
      post :create, params: route_params.merge(policy_code: "flexible")
      assert_response :unprocessable_entity
    end
  end

  test "Scenario 2 demo offer cannot be quoted even if manually marked confirmed" do
    @item.update_columns(inbox_item_id: nil, confirmation_ref: nil, status: "confirmed",
                         notes: "[demo_provider_offer:atlas_demo:atlas-rome-walk-01]")
    assert_read_only do
      post :create, params: route_params.merge(policy_code: "moderate")
      assert_response :unprocessable_entity
    end
  end

  test "sibling reference cannot substitute for item's own missing confirmation reference" do
    @item.update_columns(confirmation_ref: nil)
    sibling = @trip.trip_items.new(name: "Sibling", kind: :stay, status: :confirmed, added_by: @owner,
                                    inbox_item: @email, confirmation_ref: "SIBLING-REF")
    sibling.defer_geocoding = true
    sibling.save!
    assert_read_only do
      post :create, params: route_params.merge(policy_code: "flexible")
      assert_response :unprocessable_entity
    end
  end

  test "browser submitted amount, currency and booking state do not affect quote" do
    assert_read_only do
      post :create, params: route_params.merge(policy_code: "flexible", amount: "999999.99", currency: "USD",
                                                starts_at: Time.current - 5.days, confirmation_ref: "FAKE",
                                                status: "idea", fee_amount: "0", refund_amount: "999999.99")
      assert_response :success
      assert_select "section[aria-label='Hypothetical cancellation quote']", /200\.00/
      assert_select "section[aria-label='Hypothetical cancellation quote']", /EUR/
      assert_select "section[aria-label='Hypothetical cancellation quote']", text: /999999\.99/, count: 0
    end
  end

  test "no external request or geocoding job is invoked by viewing or quoting" do
    Geocoder.stub(:search, ->(*) { raise "Unexpected external geocoding" }) do
      GeocodeTripItemsJob.stub(:perform_later, ->(*) { raise "Unexpected job enqueue" }) do
        assert_read_only do
          get :new, params: route_params
          post :create, params: route_params.merge(policy_code: "strict")
          assert_response :success
        end
      end
    end
  end
end
