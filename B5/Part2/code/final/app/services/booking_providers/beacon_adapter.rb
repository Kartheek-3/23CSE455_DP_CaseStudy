require "json"

module BookingProviders
  class BeaconAdapter
    PROVIDER_CODE = "beacon_demo"
    PROVIDER_NAME = "Beacon Demo"
    TYPE_KINDS = { "experience" => "do", "meal" => "eat", "room" => "stay", "market" => "shop", "other" => "other" }.freeze
    DEFAULT_FIXTURE = File.expand_path("../../../config/booking_provider_fixtures/beacon_demo.json", __dir__).freeze

    def initialize(fixture_path: DEFAULT_FIXTURE)
      @fixture_path = fixture_path
    end

    def offers_for(destination_code:)
      Registry.validate_destination!(destination_code)
      source = JSON.parse(File.read(@fixture_path))
      Registry.invalid_data! unless source.is_a?(Hash) && source["agency"] == PROVIDER_NAME && source["results"].is_a?(Array)
      Registry.invalid_data! unless source["results"].all? { |entry| entry.is_a?(Hash) && Registry::DESTINATIONS.key?(entry["destination"]) }

      offers = source["results"].select { |entry| entry["destination"] == destination_code }.map do |raw|
        mapped = {
          provider_code: PROVIDER_CODE, provider_name: PROVIDER_NAME,
          offer_id: raw["code"], name: raw["label"], kind: TYPE_KINDS[raw["type"]],
          address: raw["address"], description: raw["summary"],
          sample_amount: raw["amount"], currency: raw["currency"]
        }
        Registry.validate_offer!(mapped, provider_code: PROVIDER_CODE, provider_name: PROVIDER_NAME)
      end
      Registry.invalid_data! if offers.map { |offer| offer[:offer_id] }.uniq.length != offers.length
      offers.freeze
    rescue JSON::ParserError, SystemCallError, IOError, EncodingError
      Registry.invalid_data!
    end
  end
end
