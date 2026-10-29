require "json"

module BookingProviders
  class AtlasAdapter
    PROVIDER_CODE = "atlas_demo"
    PROVIDER_NAME = "Atlas Demo"
    CATEGORY_KINDS = { "activity" => "do", "dining" => "eat", "accommodation" => "stay", "retail" => "shop", "other" => "other" }.freeze
    DEFAULT_FIXTURE = File.expand_path("../../../config/booking_provider_fixtures/atlas_demo.json", __dir__).freeze

    def initialize(fixture_path: DEFAULT_FIXTURE)
      @fixture_path = fixture_path
    end

    def offers_for(destination_code:)
      Registry.validate_destination!(destination_code)
      source = JSON.parse(File.read(@fixture_path))
      Registry.invalid_data! unless source.is_a?(Hash) && source["provider"] == PROVIDER_NAME && source["destinations"].is_a?(Hash)
      location = source["destinations"][destination_code]
      Registry.invalid_data! unless location.is_a?(Hash) && location["offers"].is_a?(Array)

      offers = location["offers"].map do |raw|
        Registry.invalid_data! unless raw.is_a?(Hash) && raw["price"].is_a?(Hash)
        mapped = {
          provider_code: PROVIDER_CODE, provider_name: PROVIDER_NAME,
          offer_id: raw["id"], name: raw["title"], kind: CATEGORY_KINDS[raw["category"]],
          address: raw["location"], description: raw["details"],
          sample_amount: raw["price"]["value"], currency: raw["price"]["currency"]
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
