#include "strategy.hpp"
#include <iostream>
#include <string>
#include <vector>
static int passed = 0;
static void check(bool condition, const std::string& name) {
    if (!condition) throw std::runtime_error("FAIL " + name);
    ++passed;
    std::cout << "PASS " << name << '\n';
}
int main() {
    check(LlmContext::stream("claude", "hello") == std::vector<std::string>{"claude:", "hello"}, "S01 Claude chunks");
    check(LlmContext::stream("openai", "hello") == std::vector<std::string>{"openai:", "hello"}, "S02 OpenAI chunks");
    check(LlmContext::stream("gemini", "summary") == std::vector<std::string>{"gemini:", "summary"}, "S03 Gemini chunks");
    bool rejected = false;
    try { (void)LlmContext::stream("unknown", "hello"); }
    catch (const std::invalid_argument& e) { rejected = std::string(e.what()) == "unsupported provider: unknown"; }
    check(rejected, "S04 unsupported provider");
    std::cout << "RESULT " << passed << "/4\n";
    return 0;
}
