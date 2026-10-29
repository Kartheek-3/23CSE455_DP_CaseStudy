require "test_helper"

class TripItemsImportRegressionTest < ActionController::TestCase
  tests TripItemsController

  setup do
    @owner, @trip = make_trip_fixture
    @request.host = "whats.example.com"
    @request.session[:user_id] = @owner.id
  end

  test "original pasted JSON preview still creates nothing" do
    post :import, params: { trip_id: @trip.id, items_json: sample_suggestions.to_json }
    assert_response :success
    assert_select "input[value='Add to itinerary']"
    assert_equal 0, @trip.trip_items.count
  end

  test "original import confirmation creates ideas and skips duplicates" do
    queued = []
    GeocodeTripItemsJob.stub(:perform_later, ->(*args) { queued << args }) do
      post :import, params: { trip_id: @trip.id, confirm: "1", items_json: (sample_suggestions * 2).to_json }
    end
    assert_response :redirect
    assert_equal 1, @trip.trip_items.count
    assert_equal "idea", @trip.trip_items.first.status
    assert_equal 1, queued.length
  end

  test "batch record defers synchronous geocoding without changing global callbacks" do
    callbacks_before = TripItem._save_callbacks.select { |c| c.kind == :after && c.filter == :geocode_from_address }.size
    assert_equal 1, callbacks_before
    Geocoder.stub(:search, ->(*) { raise "Unexpected synchronous geocoding" }) do
      GeocodeTripItemsJob.stub(:perform_later, nil) do
        post :import, params: { trip_id: @trip.id, confirm: "1", items_json: sample_suggestions.to_json }
      end
    end
    assert_response :redirect
    assert_equal callbacks_before, TripItem._save_callbacks.count { |c| c.kind == :after && c.filter == :geocode_from_address }
    assert_equal 1, @trip.trip_items.count
  end

  test "manual TripItem save still invokes standard geocoding callback" do
    geocode_calls = 0
    Geocoder.stub(:search, ->(*) { geocode_calls += 1; [] }) do
      post :create, params: { trip_id: @trip.id, trip_item: { name: "Manual place", kind: "do", address: "Rome, Italy", status: "idea" } }
    end
    assert_response :redirect
    assert_equal 1, @trip.trip_items.count
    assert_operator geocode_calls, :>, 0
  end
end
