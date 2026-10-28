ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "minitest/mock"

class ActiveSupport::TestCase
  parallelize(workers: 1)

  def make_trip_fixture
    owner = User.create!(name: "Owner", email: "owner-#{SecureRandom.hex(5)}@example.test")
    account = Account.create!(name: "Test account", owner: owner)
    traveler = Traveler.create!(name: "Owner", email: owner.email, account: account, user: owner)
    trip = Trip.create!(title: "Rome", description: "Rome city break", start_date: Date.new(2026, 11, 15),
                        end_date: Date.new(2026, 11, 17), account: account, created_by: owner)
    TripMember.create!(trip: trip, traveler: traveler, role: :owner)
    [ owner, trip ]
  end

  def sample_suggestions
    [ { "name" => "Colosseum", "kind" => "do", "address" => "Rome, Italy",
        "notes" => "Ancient history", "starts_at" => "2026-11-16T10:00", "ends_at" => nil } ]
  end
end
