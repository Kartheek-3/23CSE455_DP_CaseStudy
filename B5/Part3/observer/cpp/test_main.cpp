#include "main.hpp"
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

static std::vector<std::string> readLines(const std::string& file) {
    std::ifstream input(file);
    if (!input) throw std::runtime_error("Cannot open fixture " + file);
    std::vector<std::string> lines;
    for (std::string line; std::getline(input, line);) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        lines.push_back(line);
    }
    return lines;
}

static std::vector<std::string> splitTabs(const std::string& row) {
    std::vector<std::string> fields;
    std::size_t begin = 0;
    while (true) {
        auto end = row.find('\t', begin);
        fields.push_back(row.substr(begin, end == std::string::npos ? end : end - begin));
        if (end == std::string::npos) break;
        begin = end + 1;
    }
    return fields;
}

static std::string processCase(const std::string& row) {
    auto f = splitTabs(row);
    if (f.size() != 6) throw std::runtime_error("Invalid fixture row: " + row);
    const std::string& id = f[0];
    if ((f[1] != "YES" && f[1] != "NO") || (f[2] != "YES" && f[2] != "NO")) {
        return id + "\tERROR\tINVALID_FLAG";
    }
    MailDeliveryPublisher publisher;
    MailLogger logger;
    if (f[1] == "YES") publisher.registerObserver(logger);
    // The frozen O07 scenario is register -> unregister -> deliver.
    if (id == "O07") publisher.unregisterObserver(logger);
    MailMessage message{f[3], f[4], f[5] == "~" ? "" : f[5]};
    try {
        publisher.deliver(message, f[2] == "YES");
    } catch (const std::invalid_argument& error) {
        return id + "\tERROR\t" + error.what();
    }
    if (logger.received().empty()) return id + "\tNO_NOTIFICATION";
    const auto& logged = logger.received().front();
    return id + "\tLOGGED\t" + logged.messageId + "\t" + logged.subject + "\t" + logged.recipient;
}

int main() {
    try {
        auto inputs = readLines("../../common_specs/observer_cases.tsv");
        auto expected = readLines("../../common_specs/observer_expected.tsv");
        if (inputs.size() != 8 || expected.size() != 8) {
            throw std::runtime_error("Expected seven cases and headers");
        }
        int failures = 0;
        for (std::size_t i = 1; i < inputs.size(); i++) {
            auto actual = processCase(inputs[i]);
            std::cout << actual << '\n';
            if (actual != expected[i]) {
                failures++;
                std::cerr << "FAIL " << i << " expected=" << expected[i] << " actual=" << actual << '\n';
            }
        }
        std::cerr << "passed=" << 7 - failures << "/7 failures=" << failures << " errors=0\n";
        return failures == 0 ? 0 : 1;
    } catch (const std::exception& error) {
        std::cerr << "Runner error: " << error.what() << '\n';
        return 2;
    }
}
