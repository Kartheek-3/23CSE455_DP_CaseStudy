#include "main.hpp"
#include <fstream>
#include <limits>
#include <regex>
#include <sstream>
#include <utility>

std::vector<std::string> NormalizedOffer::fields() const {
    return {providerCode, providerName, offerId, name, kind, address, description,
            std::to_string(amountCents), currency};
}

static std::vector<std::string> split(const std::string& text, char separator) {
    std::vector<std::string> out;
    std::string cell;
    std::istringstream input(text);
    while (std::getline(input, cell, separator)) out.push_back(cell);
    if (!text.empty() && text.back() == separator) out.emplace_back();
    return out;
}

static std::vector<std::vector<std::string>> readRaw(const std::string& source,
                                                      const std::vector<std::string>& header) {
    std::ifstream file(source);
    if (!file) throw AdapterError("INVALID_FIXTURE");
    std::string line;
    if (!std::getline(file, line) || split(line, '\t') != header) throw AdapterError("INVALID_FIXTURE");
    std::vector<std::vector<std::string>> result;
    while (std::getline(file, line)) {
        auto cells = split(line, '\t');
        if (cells.size() != header.size()) throw AdapterError("INVALID_FIXTURE");
        result.push_back(std::move(cells));
    }
    return result;
}

static long long cents(const std::string& value) {
    static const std::regex decimal("^[0-9]+\\.[0-9]{2}$");
    if (!std::regex_match(value, decimal)) throw AdapterError("INVALID_OFFER");
    try {
        auto parts = split(value, '.');
        long long major = std::stoll(parts.at(0));
        long long minor = std::stoll(parts.at(1));
        if (major > (std::numeric_limits<long long>::max() - minor) / 100)
            throw AdapterError("INVALID_OFFER");
        return major * 100 + minor;
    } catch (const std::invalid_argument&) { throw AdapterError("INVALID_OFFER"); }
      catch (const std::out_of_range&) { throw AdapterError("INVALID_OFFER"); }
}

static bool validCurrency(const std::string& v) { return v == "EUR" || v == "GBP" || v == "USD"; }
static bool present(const std::string& s) { return s.find_first_not_of(" \r\n\t") != std::string::npos; }

AtlasAdapter::AtlasAdapter(std::string source) : source_(std::move(source)) {}
std::vector<NormalizedOffer> AtlasAdapter::offersFor(const std::string& destination) const {
    std::vector<NormalizedOffer> result;
    const auto rows = readRaw(source_, {"destination","id","title","category","location","details","price"});
    for (const auto& r : rows) {
        if (r[0] != destination) continue;
        std::string kind;
        if (r[3] == "activity") kind = "do";
        else if (r[3] == "shopping") kind = "shop";
        else if (r[3] == "dining") kind = "eat";
        else throw AdapterError("INVALID_OFFER");
        auto price = split(r[6], ':');
        if (!present(r[1]) || !present(r[2]) || !present(r[4]) || !present(r[5]) ||
            price.size() != 2 || !validCurrency(price[0])) throw AdapterError("INVALID_OFFER");
        result.push_back({"atlas_demo", "Atlas Demo", r[1], r[2], kind, r[4], r[5], cents(price[1]), price[0]});
    }
    return result;
}

BeaconAdapter::BeaconAdapter(std::string source) : source_(std::move(source)) {}
std::vector<NormalizedOffer> BeaconAdapter::offersFor(const std::string& destination) const {
    std::vector<NormalizedOffer> result;
    const auto rows = readRaw(source_, {"code","label","type","address","summary","amount","currency","destination"});
    for (const auto& r : rows) {
        if (r[7] != destination) continue;
        std::string kind;
        if (r[2] == "experience") kind = "do";
        else if (r[2] == "retail") kind = "shop";
        else if (r[2] == "dining") kind = "eat";
        else throw AdapterError("INVALID_OFFER");
        if (!present(r[0]) || !present(r[1]) || !present(r[3]) || !present(r[4]) ||
            !validCurrency(r[6])) throw AdapterError("INVALID_OFFER");
        result.push_back({"beacon_demo", "Beacon Demo", r[0], r[1], kind, r[3], r[4], cents(r[5]), r[6]});
    }
    return result;
}

std::unique_ptr<OfferProvider> ProviderRegistry::find(const std::string& code,
                                                       const std::string& atlasSource,
                                                       const std::string& beaconSource) {
    if (code == "atlas_demo") return std::make_unique<AtlasAdapter>(atlasSource);
    if (code == "beacon_demo") return std::make_unique<BeaconAdapter>(beaconSource);
    throw AdapterError("UNKNOWN_PROVIDER");
}

NormalizedOffer BookingOfferClient::getOffer(const std::string& code, const std::string& destination,
                                             const std::string& offerId, const std::string& atlasSource,
                                             const std::string& beaconSource) const {
    if (code != "atlas_demo" && code != "beacon_demo") throw AdapterError("UNKNOWN_PROVIDER");
    if (destination != "rome" && destination != "paris") throw AdapterError("UNKNOWN_DESTINATION");
    auto provider = ProviderRegistry::find(code, atlasSource, beaconSource);
    for (const auto& offer : provider->offersFor(destination)) {
        if (offer.offerId == offerId) return offer;
    }
    throw AdapterError("UNKNOWN_OFFER");
}
