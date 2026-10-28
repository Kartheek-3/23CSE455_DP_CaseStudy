#include "main.hpp"
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

static std::vector<std::string> splitTabs(const std::string& line) {
    std::vector<std::string> fields;
    std::istringstream stream(line);
    std::string token;
    while (std::getline(stream, token, '\t')) fields.push_back(token);
    return fields;
}
static std::vector<std::string> readLines(const std::string& filename) {
    std::ifstream file(filename);
    if (!file) throw std::runtime_error("Cannot open shared fixture: " + filename);
    std::vector<std::string> lines;
    std::string line;
    while (std::getline(file, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        lines.push_back(line);
    }
    return lines;
}
int main() {
    try {
        const auto cases = readLines("../../common_specs/controller_cases.tsv");
        const auto expected = readLines("../../common_specs/controller_expected.tsv");
        if (cases.size() != 9 || expected.size() != 9) throw std::runtime_error("Expected 8 fixture cases");
        for (size_t i = 1; i < cases.size(); ++i) {
            const auto fields = splitTabs(cases[i]);
            if (fields.size() != 6) throw std::runtime_error("Invalid TSV input");
            Account account(fields[1], fields[2]);
            TripStore store;
            CoverTaskQueue queue;
            TripCreationController controller(account, store, queue);
            const std::string actual = controller.create(fields[0], fields[3], fields[4], fields[5]);
            const bool created = actual.find("\tCREATED\t") != std::string::npos;
            const bool stateOK = created
                ? store.trips.size() == 1 && account.memberships.size() == 1 && queue.tripIds.size() == 1
                    && account.memberships[0].tripId == store.trips[0].id
                    && account.memberships[0].travelerId == fields[2]
                    && account.memberships[0].role == "owner" && queue.tripIds[0] == store.trips[0].id
                : store.trips.empty() && account.memberships.empty() && queue.tripIds.empty();
            if (actual != expected[i] || !stateOK) {
                std::cerr << "FAIL " << fields[0] << " expected=" << expected[i] << " actual=" << actual << " stateOK=" << stateOK << '\n';
                return 1;
            }
            std::cout << actual << '\n';
        }
        std::cerr << "passed=8/8 failures=0 errors=0 skipped=0\n";
        return 0;
    } catch (const std::exception& ex) {
        std::cerr << "ERROR: " << ex.what() << '\n';
        return 1;
    }
}
