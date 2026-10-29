
#include <iostream>
#include <string>
#include <map>
#include <stdexcept>
using namespace std;

// Abstract Base Class
class MutationPipeline {
public:
    // Template Method: fixed sequence of processing steps
    map<string, string> execute(const map<string, string>& data) {
        auto validated = validate(data);
        auto result = perform_mutation(validated);
        return format_response(result);
    }

    // Validation step
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

    // Response formatting step
    map<string, string> format_response(
        const map<string, string>& result
    ) {
        map<string, string> response;
        response["success"] = "true";

        // Store result fields using a prefixed key to avoid collisions
        for (const auto& item : result) {
            response["data." + item.first] = item.second;
        }

        return response;
    }

    virtual ~MutationPipeline() = default;
};

// Concrete Class: Create Job
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

// Concrete Class: Create Company
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

// Helper function to display the response
void print_response(const map<string, string>& response) {
    cout << "{\"success\": "
         << (response.at("success") == "true" ? "true" : "false")
         << ", \"data\": {";

    cout << "\"name\": \"" << response.at("data.name") << "\", ";
    cout << "\"type\": \"" << response.at("data.type") << "\"";
    cout << "}}" << endl;
}

// Main Function
int main() {
    try {
        CreateJobMutation job;
        CreateCompanyMutation company;

        print_response(job.execute({{"name", "Python Developer"}}));
        print_response(company.execute({{"name", "Example Company"}}));
    }
    catch (const invalid_argument& error) {
        cerr << "Error: " << error.what() << endl;
        return 1;
    }

    return 0;
}
