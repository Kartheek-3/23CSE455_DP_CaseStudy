#include "main.hpp"
#include <fstream>
#include <functional>
#include <iostream>
#include <sstream>
#include <utility>
#include <vector>

static const std::string ROOT = "../../common_specs/";

static std::vector<std::string> split(const std::string& value, char sep) {
    std::vector<std::string> result;
    std::string field;
    std::istringstream in(value);
    while (std::getline(in, field, sep)) result.push_back(field);
    if (!value.empty() && value.back() == sep) result.push_back("");
    return result;
}
static std::vector<std::vector<std::string>> read(const std::string& source) {
    std::ifstream input(ROOT + source);
    if (!input) throw std::runtime_error("Fixture unavailable");
    std::vector<std::vector<std::string>> rows;
    std::string line;
    while (std::getline(input, line)) rows.push_back(split(line, '\t'));
    return rows;
}
static void assertTrue(bool value, const std::string& message) {
    if (!value) throw std::runtime_error(message);
}
static void expectError(const std::string& code, const std::function<void()>& action) {
    try { action(); } catch (const AdapterError& ex) { assertTrue(ex.code == code, "Wrong code"); return; }
    throw std::runtime_error("Expected error: " + code);
}
static void isolation() {
    auto a=ROOT+"atlas_raw.tsv", b=ROOT+"beacon_raw.tsv";
    auto badA=ROOT+"adapter_invalid_fixtures/atlas_invalid_price.tsv";
    auto badB=ROOT+"adapter_invalid_fixtures/beacon_invalid_type.tsv";
    auto incompleteB=ROOT+"adapter_invalid_fixtures/beacon_missing_structure.tsv";
    BookingOfferClient client;
    expectError("INVALID_OFFER", [&]{ client.getOffer("atlas_demo","rome","atlas-rome-bad-price-01",badA,b); });
    expectError("INVALID_OFFER", [&]{ client.getOffer("beacon_demo","rome","beacon-rome-invalid-01",a,badB); });
    expectError("INVALID_FIXTURE", [&]{ client.getOffer("beacon_demo","rome","beacon-rome-incomplete-01",a,incompleteB); });
    assertTrue(client.getOffer("beacon_demo","rome","beacon-rome-museum-01",badA,b).offerId == "beacon-rome-museum-01", "Beacon isolation");
    assertTrue(client.getOffer("atlas_demo","rome","atlas-rome-walk-01",a,badB).offerId == "atlas-rome-walk-01", "Atlas isolation");
    assertTrue(AtlasAdapter(a).offersFor("paris").size() == 1 && BeaconAdapter(b).offersFor("rome").size() == 1, "Destination filters");
    expectError("UNKNOWN_OFFER", [&]{ client.getOffer("atlas_demo","rome","beacon-rome-museum-01",a,b); });
    expectError("UNKNOWN_OFFER", [&]{ client.getOffer("beacon_demo","rome","atlas-rome-walk-01",a,b); });
}
int main() {
    try {
        auto cases = read("adapter_cases.tsv"), expected = read("adapter_expected.tsv");
        assertTrue(cases.size() == 11 && expected.size() == 11, "Incorrect fixture count");
        assertTrue(cases[0] == std::vector<std::string>({"case_id","provider_code","destination_code","offer_id","atlas_source","beacon_source"}), "Incorrect case header");
        for (size_t i=1; i<cases.size(); i++) {
            const auto& row=cases[i];
            std::vector<std::string> actual = {row[0]};
            try {
                NormalizedOffer offer = BookingOfferClient().getOffer(row[1],row[2],row[3],ROOT+row[4],ROOT+row[5]);
                actual.emplace_back("OK");
                auto cols=offer.fields();
                actual.insert(actual.end(), cols.begin(), cols.end());
            } catch (const AdapterError& error) { actual.push_back("ERROR"); actual.push_back(error.code); }
            assertTrue(actual == expected[i], "Fixture mismatch: "+row[0]);
            for (size_t j=0; j<actual.size(); j++) std::cout << (j ? "\t" : "") << actual[j];
            std::cout << '\n';
        }
        isolation();
        std::cerr << "passed=10/10 failures=0 errors=0 skipped=0; extra_isolation_checks=passed\n";
        return 0;
    } catch (const std::exception& error) {
        std::cerr << "Test error: " << error.what() << '\n';
        return 1;
    }
}
