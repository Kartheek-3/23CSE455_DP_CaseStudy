#include "main.hpp"
#include <fstream>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

static std::vector<std::string> splitTabs(const std::string& line) {
    std::vector<std::string> fields;
    std::string token;
    std::istringstream stream(line);
    while (std::getline(stream, token, '\t')) fields.push_back(token);
    return fields;
}
static std::vector<std::string> readLines(const std::string& filename) {
    std::ifstream input(filename);
    if (!input) throw std::runtime_error("Unable to read fixture: " + filename);
    std::vector<std::string> lines;
    std::string line;
    while (std::getline(input, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        lines.push_back(line);
    }
    return lines;
}
static std::string snapshot(const std::vector<TripItem>& items) {
    std::string result;
    for (const auto& item : items) {
        result += item.id + "|" + item.tripId + "|" + item.name + "|" + item.confirmationRef
                + "|" + item.inboxId + "|" + item.status + ";";
    }
    return result;
}
int main() {
    try {
        auto cases = readLines("../../common_specs/information_expert_cases.tsv");
        auto expected = readLines("../../common_specs/information_expert_expected.tsv");
        if (cases.size() != 9 || expected.size() != 9) throw std::runtime_error("Expected 8 cases");
        for (size_t index = 1; index < cases.size(); ++index) {
            const auto f = splitTabs(cases[index]);
            if (f.size() != 10) throw std::runtime_error("Unexpected input fields");
            Trip trip{f[2], {}};
            if (f[5] != "~") trip.items.push_back({f[5], f[6], f[7], f[8], f[9], "idea"});
            const auto initialCount = trip.items.size();
            const std::string before = snapshot(trip.items);
            const InboxItem inbox(f[1], f[2], f[3], f[4]);
            const std::string actual = InboxReviewController{}.review(inbox, trip, f[0]);
            const auto parts = splitTabs(actual);
            bool stateOk = false;
            if (parts.size() >= 2 && parts[1] == "ERROR") {
                stateOk = snapshot(trip.items) == before;
            } else if (parts.size() >= 2 && parts[1] == "CREATED") {
                const auto& item = trip.items.back();
                std::vector<TripItem> prior(trip.items.begin(), trip.items.end() - 1);
                stateOk = trip.items.size() == initialCount + 1 && snapshot(prior) == before
                    && item.id == "item-" + f[0] && item.tripId == f[2]
                    && item.name == f[3] && item.status == "confirmed"
                    && item.confirmationRef == InboxItem::display(f[4]) && item.inboxId == f[1];
            } else if (parts.size() >= 2 && parts[1] == "LINKED") {
                const auto& item = trip.items.at(0);
                stateOk = trip.items.size() == 1 && initialCount == 1
                    && item.id == f[5] && item.tripId == f[6] && item.name == f[7]
                    && item.status == "idea"
                    && item.confirmationRef == (f[8] == "~" ? InboxItem::display(f[4]) : f[8])
                    && item.inboxId == (f[9] == "~" ? f[1] : f[9]);
            }
            if (actual != expected[index] || !stateOk) {
                std::cerr << "FAIL " << f[0] << " expected=" << expected[index]
                          << " actual=" << actual << " stateOk=" << stateOk << '\n';
                return 1;
            }
            std::cout << actual << '\n';
        }
        std::cerr << "passed=8/8 failures=0 errors=0 skipped=0\n";
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << '\n';
        return 1;
    }
}
