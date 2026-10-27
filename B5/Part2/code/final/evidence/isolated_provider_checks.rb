# Scenario 2 provider validation checks; standalone Ruby (not Rails integration).
require "minitest/autorun"
require "json"
require "tempfile"
require_relative "../app/services/booking_providers/registry"
require_relative "../app/services/booking_providers/atlas_adapter"
require_relative "../app/services/booking_providers/beacon_adapter"

class IsolatedProviderChecks < Minitest::Test
  R = BookingProviders::Registry

  def test_whitelist_and_instantiation
    assert_equal %w[atlas_demo beacon_demo], R.available.map { |x| x[:code] }
    assert_instance_of BookingProviders::AtlasAdapter, R.find("atlas_demo")
    assert_instance_of BookingProviders::BeaconAdapter, R.find("beacon_demo")
    assert_raises(R::UnknownProvider) { R.find("arbitrary") }
  end

  def test_both_destinations_have_offers_in_both_providers
    R.available.each do |p|
      %w[rome paris].each do |city|
        offers = R.find(p[:code]).offers_for(destination_code: city)
        refute_empty offers
        assert offers.all? { |o| o[:provider_code] == p[:code] }
      end
    end
  end

  def test_common_normalized_contract
    R.available.each do |p|
      R.find(p[:code]).offers_for(destination_code: "rome").each do |offer|
        assert_equal R::OFFER_FIELDS.sort, offer.keys.sort
        assert_includes R::KINDS, offer[:kind]
        assert offer[:sample_amount].is_a?(BigDecimal)
        assert_equal "EUR", offer[:currency]
      end
    end
  end

  def test_different_source_schema
    atlas = JSON.parse(File.read(BookingProviders::AtlasAdapter::DEFAULT_FIXTURE))
    beacon = JSON.parse(File.read(BookingProviders::BeaconAdapter::DEFAULT_FIXTURE))
    assert atlas.dig("destinations", "rome", "offers").first.key?("title")
    assert beacon["results"].first.key?("label")
    refute atlas.key?("results")
    refute beacon.key?("destinations")
  end

  def test_unsupported_destination
    R.available.each do |p|
      assert_raises(R::UnsupportedDestination) do
        R.find(p[:code]).offers_for(destination_code: "unlisted")
      end
    end
  end

  def test_provider_isolation_and_no_mutable_class_selection
    a = R.find("atlas_demo")
    b = R.find("beacon_demo")
    refute_same a, R.find("atlas_demo")
    atlas_ids = a.offers_for(destination_code: "rome").map { |o| o[:offer_id] }
    beacon_ids = b.offers_for(destination_code: "rome").map { |o| o[:offer_id] }
    assert_empty atlas_ids & beacon_ids
    assert_raises(FrozenError) { a.offers_for(destination_code: "rome").first[:kind] = "flight" }
  end

  def test_missing_fixture_and_invalid_json
    assert_raises(R::ProviderDataError) do
      BookingProviders::AtlasAdapter.new(fixture_path: "/tmp/nonexistent-s2-fixture").offers_for(destination_code: "rome")
    end
    with_json("not-json") do |path|
      assert_raises(R::ProviderDataError) do
        BookingProviders::BeaconAdapter.new(fixture_path: path).offers_for(destination_code: "rome")
      end
    end
  end

  def test_atlas_invalid_kind_amount_currency
    atlas = JSON.parse(File.read(BookingProviders::AtlasAdapter::DEFAULT_FIXTURE))
    [ ["category", "not_supported"], ["price", {"value"=>"-1.00", "currency"=>"EUR"}],
      ["price", {"value"=>"1.345", "currency"=>"EUR"}], ["price", {"value"=>"10", "currency"=>"euros"}] ].each do |field,value|
      data = Marshal.load(Marshal.dump(atlas))
      data["destinations"]["rome"]["offers"].first[field] = value
      with_json(JSON.generate(data)) do |path|
        assert_raises(R::ProviderDataError) do
          BookingProviders::AtlasAdapter.new(fixture_path: path).offers_for(destination_code: "rome")
        end
      end
    end
  end

  def test_beacon_invalid_type_amount_currency
    beacon = JSON.parse(File.read(BookingProviders::BeaconAdapter::DEFAULT_FIXTURE))
    [ ["type", "wrong"], ["amount", -5], ["amount", "oops"], ["currency", "usd-long"] ].each do |field,value|
      data = Marshal.load(Marshal.dump(beacon))
      data["results"].first[field] = value
      with_json(JSON.generate(data)) do |path|
        assert_raises(R::ProviderDataError) do
          BookingProviders::BeaconAdapter.new(fixture_path: path).offers_for(destination_code: "rome")
        end
      end
    end
  end

  def test_duplicate_fixture_ids_rejected
    atlas = JSON.parse(File.read(BookingProviders::AtlasAdapter::DEFAULT_FIXTURE))
    atlas["destinations"]["rome"]["offers"] << atlas["destinations"]["rome"]["offers"].first
    with_json(JSON.generate(atlas)) do |path|
      assert_raises(R::ProviderDataError) do
        BookingProviders::AtlasAdapter.new(fixture_path: path).offers_for(destination_code: "rome")
      end
    end
  end

  def with_json(payload)
    Tempfile.create(["scenario2", ".json"]) do |f|
      f.write(payload)
      f.flush
      yield f.path
    end
  end
end
