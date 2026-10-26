import java.util.ArrayList;
import java.util.List;

interface LlmStrategy {
    List<String> stream(String prompt);
}

final class ClaudeStrategy implements LlmStrategy {
    public List<String> stream(String prompt) {
        return List.of("claude:", prompt);
    }
}
final class OpenAIStrategy implements LlmStrategy {
    public List<String> stream(String prompt) {
        return List.of("openai:", prompt);
    }
}
final class GeminiStrategy implements LlmStrategy {
    public List<String> stream(String prompt) {
        return List.of("gemini:", prompt);
    }
}

final class LlmContext {
    static LlmStrategy select(String provider) {
        switch (provider) {
            case "claude": return new ClaudeStrategy();
            case "openai": return new OpenAIStrategy();
            case "gemini": return new GeminiStrategy();
            default: throw new IllegalArgumentException("unsupported provider: " + provider);
        }
    }

    List<String> stream(String provider, String prompt) {
        return select(provider).stream(prompt);
    }
}
