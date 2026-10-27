require "test_helper"

class ItinerarySuggestionGeneratorTest < ActiveSupport::TestCase
  setup do
    @owner, @trip = make_trip_fixture
    @prefs = { interests: [ "culture" ], budget: "medium", pace: "balanced", notes: "" }
  end

  test "rejects missing or invalid preferences before contacting Anthropic" do
    assert_raises(ItinerarySuggestionGenerator::InvalidPreferences) do
      ItinerarySuggestionGenerator.new(trip: @trip, preferences: @prefs.merge(interests: []))
    end
    assert_raises(ItinerarySuggestionGenerator::InvalidPreferences) do
      ItinerarySuggestionGenerator.new(trip: @trip, preferences: @prefs.merge(budget: "anything"))
    end
    assert_raises(ItinerarySuggestionGenerator::InvalidPreferences) do
      ItinerarySuggestionGenerator.new(trip: @trip, preferences: @prefs.merge(notes: "x" * 301))
    end
  end

  test "structured Anthropic tool response becomes safe normalized suggestions" do
    payload = sample_suggestions.first.merge("latitude" => 41.1)
    payload.delete("latitude") # service never accepts location coordinates
    block = Struct.new(:type, :name, :input).new(:tool_use, "propose_itinerary_ideas", { "suggestions" => [ payload ] })
    response = Struct.new(:content).new([ block ])
    messages = Minitest::Mock.new
    messages.expect(:create, response) { |kwargs| kwargs[:tools].present? && kwargs[:tool_choice].present? }
    client = Struct.new(:messages).new(messages)
    with_api_key do
      Anthropic::Client.stub(:new, client) do
        result = ItinerarySuggestionGenerator.new(trip: @trip, preferences: @prefs).call
        assert_equal 1, result.size
        assert_equal %w[name kind address notes starts_at ends_at], result.first.keys
        assert_equal "Colosseum", result.first.fetch("name")
      end
    end
    messages.verify
  end

  test "invalid Anthropic tool payloads fail safely" do
    [ { "suggestions" => [] }, { "suggestions" => Array.new(7) { sample_suggestions.first } },
      { "suggestions" => [ sample_suggestions.first.merge("status" => "confirmed") ] },
      { "unexpected" => true } ].each do |input|
      block = Struct.new(:type, :name, :input).new(:tool_use, "propose_itinerary_ideas", input)
      response = Struct.new(:content).new([ block ])
      messages = Object.new
      messages.define_singleton_method(:create) { |**_kwargs| response }
      client = Struct.new(:messages).new(messages)
      with_api_key do
        Anthropic::Client.stub(:new, client) do
          assert_raises(ItinerarySuggestionGenerator::InvalidSuggestions) do
            ItinerarySuggestionGenerator.new(trip: @trip, preferences: @prefs).call
          end
        end
      end
    end
  end

  test "missing API key fails without an API call" do
    old = ENV.delete("ANTHROPIC_API_KEY")
    assert_raises(ItinerarySuggestionGenerator::ApiError) do
      ItinerarySuggestionGenerator.new(trip: @trip, preferences: @prefs).call
    end
  ensure
    ENV["ANTHROPIC_API_KEY"] = old if old
  end

  test "network errors are controlled" do
    client = Object.new
    def client.messages = raise(IOError, "network offline")
    with_api_key do
      Anthropic::Client.stub(:new, client) do
        assert_raises(ItinerarySuggestionGenerator::ApiError) do
          ItinerarySuggestionGenerator.new(trip: @trip, preferences: @prefs).call
        end
      end
    end
  end

  test "rejects empty and excessive output" do
    assert_raises(ItinerarySuggestionGenerator::InvalidSuggestions) do
      ItinerarySuggestionGenerator.validate_suggestions!([], trip: @trip)
    end
    assert_raises(ItinerarySuggestionGenerator::InvalidSuggestions) do
      ItinerarySuggestionGenerator.validate_suggestions!(Array.new(7) { sample_suggestions.first }, trip: @trip)
    end
  end

  test "rejects unexpected fields, wrong kinds, missing names and dates outside trip" do
    [ { "status" => "confirmed" }, { "lat" => 10.0 }, { "amount" => 10 }, { "url" => "https://example.com" } ].each do |extra|
      assert_raises(ItinerarySuggestionGenerator::InvalidSuggestions) do
        ItinerarySuggestionGenerator.validate_suggestions!([ sample_suggestions.first.merge(extra) ], trip: @trip)
      end
    end
    [ { "kind" => "flight" }, { "name" => "" }, { "starts_at" => "2026-11-22T10:00" },
      { "starts_at" => "wrong" }, { "ends_at" => "2026-11-16T09:00" } ].each do |change|
      assert_raises(ItinerarySuggestionGenerator::InvalidSuggestions) do
        ItinerarySuggestionGenerator.validate_suggestions!([ sample_suggestions.first.merge(change) ], trip: @trip)
      end
    end
  end

  private

  def with_api_key
    previous = ENV["ANTHROPIC_API_KEY"]
    ENV["ANTHROPIC_API_KEY"] = "fake-test-key"
    yield
  ensure
    ENV["ANTHROPIC_API_KEY"] = previous
  end
end
