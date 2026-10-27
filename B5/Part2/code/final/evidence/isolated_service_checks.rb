# Offline stdlib-only checks of the generator's validation boundary.
# These tiny Rails method substitutes are NOT Rails integration tests.
require "date"
require "time"
require "minitest/autorun"

class Object
  def blank? = respond_to?(:empty?) ? !!empty? : !self
  def present? = !blank?
  def presence = present? ? self : nil
end
class String
  def blank? = strip.empty?
end
class Hash
  def stringify_keys = transform_keys(&:to_s)
end
class TestTimeZone
  def parse(value) = Time.parse(value)
end
class Time
  def self.zone = TestTimeZone.new
end

require_relative "../app/services/itinerary_suggestion_generator"

class IsolatedServiceChecks < Minitest::Test
  def setup
    @trip = Struct.new(:title, :description, :start_date, :end_date).new(
      "Rome", "Rome museums", Date.new(2026, 11, 15), Date.new(2026, 11, 17)
    )
    @prefs = { interests: [ "culture" ], budget: "medium", pace: "balanced", notes: "" }
    @valid = { "name" => "Colosseum", "kind" => "do", "address" => "Rome, Italy",
               "notes" => "Historic", "starts_at" => "2026-11-16T10:00", "ends_at" => nil }
  end

  def test_valid_preferences
    assert_equal [ "culture" ], ItinerarySuggestionGenerator.validate_preferences!(@prefs)["interests"]
  end

  def test_invalid_preferences
    [ @prefs.merge(interests: []), @prefs.merge(budget: "invalid"),
      @prefs.merge(pace: "invalid"), @prefs.merge(notes: "x" * 301) ].each do |value|
      assert_raises(ItinerarySuggestionGenerator::InvalidPreferences) { ItinerarySuggestionGenerator.validate_preferences!(value) }
    end
  end

  def test_valid_suggestion
    assert_equal @valid, ItinerarySuggestionGenerator.validate_suggestions!([ @valid ], trip: @trip).first
  end

  def test_rejects_tampered_fields
    %w[status lat lng url amount currency confirmation_ref].each do |field|
      assert_raises(ItinerarySuggestionGenerator::InvalidSuggestions) do
        ItinerarySuggestionGenerator.validate_suggestions!([ @valid.merge(field => "forged") ], trip: @trip)
      end
    end
  end

  def test_rejects_empty_and_too_many
    assert_raises(ItinerarySuggestionGenerator::InvalidSuggestions) { ItinerarySuggestionGenerator.validate_suggestions!([], trip: @trip) }
    assert_raises(ItinerarySuggestionGenerator::InvalidSuggestions) do
      ItinerarySuggestionGenerator.validate_suggestions!(Array.new(7) { @valid }, trip: @trip)
    end
  end

  def test_rejects_bad_kind_missing_name_and_dates
    [ { "kind" => "flight" }, { "name" => "" },
      { "starts_at" => "2026-11-23T10:00" }, { "starts_at" => "not-a-date" },
      { "ends_at" => "2026-11-16T09:00" } ].each do |change|
      assert_raises(ItinerarySuggestionGenerator::InvalidSuggestions) do
        ItinerarySuggestionGenerator.validate_suggestions!([ @valid.merge(change) ], trip: @trip)
      end
    end
  end
end
