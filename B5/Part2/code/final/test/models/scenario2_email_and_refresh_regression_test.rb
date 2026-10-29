require "test_helper"

class Scenario2EmailAndRefreshRegressionTest < ActiveSupport::TestCase
  setup do
    @owner, @trip = make_trip_fixture
  end

  test "genuine confirmation email still creates a distinct confirmed item and expense" do
    demo_item = @trip.trip_items.new(name: "[Atlas Demo] Sample idea", kind: :do, status: :idea,
                                     added_by: @owner, notes: "[demo_provider_offer:atlas_demo:atlas-rome-walk-01]")
    demo_item.defer_geocoding = true
    demo_item.save!
    inbox = @trip.inbox_items.create!(
      from_email: @owner.email, subject: "Actual reservation confirmation",
      received_at: Time.current, sender_status: :approved, parse_status: :parsed,
      parsed_data_json: { "bookings" => [ {
        "booking_type" => "tour", "provider" => "Atlas Demo", "location" => "Rome, Italy",
        "datetime" => "2026-11-16T10:00", "confirmation_reference" => "REAL-EMAIL-ONLY-123",
        "total_price" => 75, "currency" => "EUR"
      } ] }.to_json
    )

    Geocoder.stub(:search, ->(*) { [] }) do
      inbox.confirm_and_create_items!(@owner)
    end

    demo = @trip.trip_items.find_by!(name: "[Atlas Demo] Sample idea")
    confirmation = @trip.trip_items.find_by!(name: "Atlas Demo")
    assert demo.idea?
    assert_nil demo.confirmation_ref
    assert confirmation.confirmed?
    assert_equal "REAL-EMAIL-ONLY-123", confirmation.confirmation_ref
    assert_equal inbox.id, confirmation.inbox_item_id
    assert_equal 2, @trip.trip_items.count
    assert_equal 1, @trip.expenses.where(inbox_item: inbox).count
  end

  test "original GeocodeTripItemsJob reloads item and broadcasts the trip refresh" do
    item = @trip.trip_items.new(name: "Unlocated idea", kind: :do, status: :idea,
                                address: "Rome, Italy", added_by: @owner)
    item.defer_geocoding = true
    item.save!
    assert_not item.geocoded?

    searches = 0
    broadcasts = []
    Geocoder.stub(:search, ->(*) { searches += 1; [] }) do
      Turbo::StreamsChannel.stub(:broadcast_refresh_to, ->(trip) { broadcasts << trip }) do
        job = GeocodeTripItemsJob.new
        job.stub(:sleep, nil) do
          # The job's own find_by obtains a fresh object without the transient defer flag.
          job.perform([ item.id ], @trip.id)
        end
      end
    end
    assert_operator searches, :>, 0
    assert_equal [ @trip.id ], broadcasts.map(&:id)
  end
end
