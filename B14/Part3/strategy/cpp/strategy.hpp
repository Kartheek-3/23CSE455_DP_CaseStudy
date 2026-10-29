#ifndef B14_STRATEGY_HPP
#define B14_STRATEGY_HPP
#include <stdexcept>
#include <string>
#include <vector>

class LlmStrategy {
public:
    virtual ~LlmStrategy() = default;
    virtual std::vector<std::string> stream(const std::string& prompt) const = 0;
};
class ClaudeStrategy final : public LlmStrategy {
public:
    std::vector<std::string> stream(const std::string& prompt) const override {
        return {"claude:", prompt};
    }
};
class OpenAIStrategy final : public LlmStrategy {
public:
    std::vector<std::string> stream(const std::string& prompt) const override {
        return {"openai:", prompt};
    }
};
class GeminiStrategy final : public LlmStrategy {
public:
    std::vector<std::string> stream(const std::string& prompt) const override {
        return {"gemini:", prompt};
    }
};
class LlmContext {
public:
    static std::vector<std::string> stream(const std::string& provider, const std::string& prompt) {
        if (provider == "claude") return ClaudeStrategy{}.stream(prompt);
        if (provider == "openai") return OpenAIStrategy{}.stream(prompt);
        if (provider == "gemini") return GeminiStrategy{}.stream(prompt);
        throw std::invalid_argument("unsupported provider: " + provider);
    }
};
#endif
