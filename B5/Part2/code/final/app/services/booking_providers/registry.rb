require "bigdecimal"

module BookingProviders
  # A fixed whitelist, not a dynamic class lookup on user-supplied input.
  class Registry
    class Error < StandardError; end
    class UnknownProvider < Error; end
    class UnsupportedDestination < Error; end
    class ProviderDataError < Error; end

    PROVIDERS = { "atlas_demo" => "Atlas Demo", "beacon_demo" => "Beacon Demo" }.freeze
    DESTINATIONS = { "rome" => "Rome, Italy", "paris" => "Paris, France" }.freeze
    KINDS = %w[stay eat do shop other].freeze
    OFFER_FIELDS = %i[provider_code provider_name offer_id name kind address description sample_amount currency].freeze

    def self.available
      PROVIDERS.map { |code, name| { code: code, name: name } }
    end

    def self.destinations
      DESTINATIONS.dup
    end

    def self.find(code)
      case code
      when "atlas_demo" then BookingProviders::AtlasAdapter.new
      when "beacon_demo" then BookingProviders::BeaconAdapter.new
      else raise UnknownProvider, "Unknown demo provider."
      end
    end

    def self.validate_destination!(code)
      raise UnsupportedDestination, "Unsupported demo destination." unless DESTINATIONS.key?(code)
      code
    end

    # The shared offer contract is checked after each source-specific mapping.
    def self.validate_offer!(offer, provider_code:, provider_name:)
      invalid_data! unless offer.is_a?(Hash) && offer.keys.sort == OFFER_FIELDS.sort
      invalid_data! unless offer[:provider_code] == provider_code && offer[:provider_name] == provider_name
      invalid_data! unless offer[:offer_id].is_a?(String) && offer[:offer_id].match?(/\A[a-z0-9][a-z0-9_-]{2,63}\z/)
      { name: 120, address: 200, description: 500 }.each do |field, max_length|
        value = offer[field]
        invalid_data! unless value.is_a?(String) && !value.strip.empty? && value.length <= max_length
      end
      invalid_data! unless KINDS.include?(offer[:kind])
      amount, currency = normalize_amount!(offer[:sample_amount], offer[:currency])
      offer.merge(sample_amount: amount, currency: currency).freeze
    end

    def self.normalize_amount!(amount, currency)
      return [ nil, nil ] if amount.nil? && currency.nil?
      invalid_data! if amount.nil? || currency.nil?
      invalid_data! unless currency.is_a?(String) && currency.match?(/\A[A-Z]{3}\z/)
      invalid_data! unless (amount.is_a?(Numeric) && !amount.is_a?(Complex)) ||
                           (amount.is_a?(String) && amount.match?(/\A\d+(?:\.\d{1,2})?\z/))
      value = BigDecimal(amount.to_s)
      invalid_data! unless value.finite? && value >= 0 && value <= 100_000 && (value * 100).frac.zero?
      [ value, currency ]
    rescue ArgumentError
      invalid_data!
    end

    def self.invalid_data!
      raise ProviderDataError, "The selected demo provider returned invalid sample data."
    end
  end
end
