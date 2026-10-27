require "test_helper"
require "tempfile"

class BookingProvidersTest < ActiveSupport::TestCase
  REGISTRY = BookingProviders::Registry
  EXPECTED_KEYS = %i[provider_code provider_name offer_id name kind address description sample_amount currency].sort.freeze

  test "both provider fixtures normalize into the same approved fields" do
    [ "atlas_demo", "beacon_demo" ].each do |code|
      offers = REGISTRY.find(code).offers_for(destination_code: "rome")
      assert_operator offers.length, :>=, 2
      offers.each do |offer|
        assert_equal EXPECTED_KEYS, offer.keys.sort
        assert_equal code, offer[:provider_code]
        assert_includes REGISTRY::KINDS, offer[:kind]
        assert_instance_of BigDecimal, offer[:sample_amount]
        assert_equal "EUR", offer[:currency]
      end
    end
  end

  test "providers actually read distinct raw field structures" do
    atlas = JSON.parse(File.read(BookingProviders::AtlasAdapter::DEFAULT_FIXTURE))
    beacon = JSON.parse(File.read(BookingProviders::BeaconAdapter::DEFAULT_FIXTURE))
    assert atlas.dig("destinations", "rome", "offers").first.key?("title")
    assert beacon.fetch("results").first.key?("label")
    refute beacon.key?("destinations")
    refute atlas.key?("results")
  end

  test "registry allows exactly the two explicit provider codes" do
    assert_equal %w[atlas_demo beacon_demo], REGISTRY.available.map { |p| p[:code] }
    assert_instance_of BookingProviders::AtlasAdapter, REGISTRY.find("atlas_demo")
    assert_instance_of BookingProviders::BeaconAdapter, REGISTRY.find("beacon_demo")
    assert_raises(REGISTRY::UnknownProvider) { REGISTRY.find("other") }
    assert_raises(REGISTRY::UnknownProvider) { REGISTRY.find("::Object") }
  end

  test "unsupported destination is rejected and destination offers are separated" do
    [ "atlas_demo", "beacon_demo" ].each do |code|
      provider = REGISTRY.find(code)
      assert_raises(REGISTRY::UnsupportedDestination) { provider.offers_for(destination_code: "london") }
      rome = provider.offers_for(destination_code: "rome")
      paris = provider.offers_for(destination_code: "paris")
      assert_empty rome.map { |o| o[:offer_id] } & paris.map { |o| o[:offer_id] }
    end
  end

  test "missing file and malformed JSON are controlled errors" do
    assert_raises(REGISTRY::ProviderDataError) do
      BookingProviders::AtlasAdapter.new(fixture_path: "/nonexistent/catalogue.json").offers_for(destination_code: "rome")
    end
    Tempfile.create([ "invalid-provider", ".json" ]) do |file|
      file.write("{ invalid")
      file.flush
      assert_raises(REGISTRY::ProviderDataError) do
        BookingProviders::BeaconAdapter.new(fixture_path: file.path).offers_for(destination_code: "paris")
      end
    end
  end

  test "invalid atlas kind or malformed price cannot become a valid offer" do
    base = JSON.parse(File.read(BookingProviders::AtlasAdapter::DEFAULT_FIXTURE))
    [ [ "category", "unsupported_kind" ], [ "price", { "value" => "-1", "currency" => "EUR" } ],
      [ "price", { "value" => "10.124", "currency" => "EUR" } ],
      [ "price", { "value" => "10.00", "currency" => "euros" } ] ].each do |key, value|
      raw = Marshal.load(Marshal.dump(base))
      raw["destinations"]["rome"]["offers"].first[key] = value
      with_fixture(raw) do |path|
        assert_raises(REGISTRY::ProviderDataError) do
          BookingProviders::AtlasAdapter.new(fixture_path: path).offers_for(destination_code: "rome")
        end
      end
    end
  end

  test "invalid beacon type and amount are rejected" do
    base = JSON.parse(File.read(BookingProviders::BeaconAdapter::DEFAULT_FIXTURE))
    [ [ "type", "unsupported_type" ], [ "amount", -4 ], [ "amount", "invalid" ], [ "currency", "eu" ] ].each do |key, value|
      raw = Marshal.load(Marshal.dump(base))
      raw["results"].first[key] = value
      with_fixture(raw) do |path|
        assert_raises(REGISTRY::ProviderDataError) do
          BookingProviders::BeaconAdapter.new(fixture_path: path).offers_for(destination_code: "rome")
        end
      end
    end
  end

  test "duplicate IDs and malformed rows fail rather than being silently dropped" do
    raw = JSON.parse(File.read(BookingProviders::AtlasAdapter::DEFAULT_FIXTURE))
    raw["destinations"]["rome"]["offers"] << raw["destinations"]["rome"]["offers"].first
    with_fixture(raw) do |path|
      assert_raises(REGISTRY::ProviderDataError) do
        BookingProviders::AtlasAdapter.new(fixture_path: path).offers_for(destination_code: "rome")
      end
    end
    malformed = JSON.parse(File.read(BookingProviders::BeaconAdapter::DEFAULT_FIXTURE))
    malformed["results"] << 1
    with_fixture(malformed) do |path|
      assert_raises(REGISTRY::ProviderDataError) do
        BookingProviders::BeaconAdapter.new(fixture_path: path).offers_for(destination_code: "rome")
      end
    end
  end

  test "providers and returned offers do not share mutable request state" do
    provider_a = REGISTRY.find("atlas_demo")
    provider_b = REGISTRY.find("beacon_demo")
    refute_same provider_a, REGISTRY.find("atlas_demo")
    atlas = provider_a.offers_for(destination_code: "rome")
    beacon = provider_b.offers_for(destination_code: "rome")
    assert atlas.all?(&:frozen?)
    assert beacon.all?(&:frozen?)
    assert atlas.all? { |offer| offer[:provider_code] == "atlas_demo" }
    assert beacon.all? { |offer| offer[:provider_code] == "beacon_demo" }
    assert_raises(FrozenError) { atlas.first[:name] = "Changed" }
    assert_equal atlas.first[:name], REGISTRY.find("atlas_demo").offers_for(destination_code: "rome").first[:name]
  end

  private

  def with_fixture(data)
    Tempfile.create([ "provider-test", ".json" ]) do |file|
      file.write(JSON.generate(data))
      file.flush
      yield file.path
    end
  end
end
