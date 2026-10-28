
#include <iostream>
#include <string>
#include <map>
#include <stdexcept>
#include <cassert>
using namespace std;

// Abstract Base Class
class MutationPipeline {
public:
    // Template Method
    map<string, string> execute(const map<string, string>& data) {
        auto validated = validate(data);
        auto result = perform_mutation(validated);
        return format_response(result);
    }

    // Validation
    map<string, string> validate(const map<string, string>& data) {
        if (data.empty() || data.find("name") == data.end()) {
            throw invalid_argument("Missing required field: name");
        }
        return data;
    }

    // Abstract operation
    virtual map<string, string> perform_mutation(
        const map<string, string>& data
    ) = 0;

    // Response formatting (flattened representation)
    map<string, string> format_response(
        const map<string, string>& result
    ) {
        map<string, string> response;
        response["success"] = "true";

        for (const auto& item : result) {
            response["data." + item.first] = item.second;
        }

        return response;
    }

    virtual ~MutationPipeline() = default;
};

// Create Job Mutation
class CreateJobMutation : public MutationPipeline {
public:
    map<string, string> perform_mutation(
        const map<string, string>& data
    ) override {
        return {
            {"name", data.at("name")},
            {"type", "job"}
        };
    }
};

// Create Company Mutation
class CreateCompanyMutation : public MutationPipeline {
public:
    map<string, string> perform_mutation(
        const map<string, string>& data
    ) override {
        return {
            {"name", data.at("name")},
            {"type", "company"}
        };
    }
};

// Test Job Mutation
void test_job_mutation() {
    CreateJobMutation mutation;
    auto result = mutation.execute({{"name", "Python Developer"}});

    assert(result.at("success") == "true");
    assert(result.at("data.name") == "Python Developer");
    assert(result.at("data.type") == "job");

    cout << "PASS: Job mutation" << endl;
}

// Test Company Mutation
void test_company_mutation() {
    CreateCompanyMutation mutation;
    auto result = mutation.execute({{"name", "Example Company"}});

    assert(result.at("success") == "true");
    assert(result.at("data.name") == "Example Company");
    assert(result.at("data.type") == "company");

    cout << "PASS: Company mutation" << endl;
}

// Test Validation
void test_validation() {
    CreateJobMutation mutation;
    bool exception_caught = false;

    try {
        mutation.execute({});
    }
    catch (const invalid_argument&) {
        exception_caught = true;
    }

    assert(exception_caught);
    cout << "PASS: Validation rejects missing name" << endl;
}

// Main Function
int main() {
    test_job_mutation();
    test_company_mutation();
    test_validation();

    cout << "All Template Method tests passed." << endl;

    return 0;
}
