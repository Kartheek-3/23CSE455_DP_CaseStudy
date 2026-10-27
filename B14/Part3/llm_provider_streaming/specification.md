# Strategy example: provider messages

Part 1 calls this pattern **LLM Provider Streaming Strategy**. In the original
app at commit `90ec6565877053ee0e93e9f09dcc7c7213aa4832`, `sendMessage`
chooses `streamClaude`, `streamOpenAI` or `streamGemini`. The code is in
`code/features/ai-assistant/llmService.ts:69-155`.

My example does the same kind of choice using saved sample events. It does not
connect to the real providers. All three provider functions take the same input
and return text pieces. `run` chooses the function named by `provider`.

## Input

Give the program one JSON object with:

- `provider`: `claude`, `openai` or `gemini`.
- `events`: a list of JSON objects in the order received.

The three providers put text in different places:

- Claude: `delta.text`, when `type` is `content_block_delta` and `delta.type`
  is `text_delta`.
- OpenAI: `choices[0].delta.content`.
- Gemini: `text`.

Only non-empty strings count as text. Skip other events, missing fields and
numbers. Keep the text pieces in order. Do not change the input.

## Output and errors

For valid input, print `{"chunks": [string, ...], "text": string}`. `text`
is all chunks joined without spaces added. An empty event list gives empty
chunks and empty text.

For invalid input, print one of these exact error objects:

| Problem | Error text |
|---|---|
| Input is not an object | `input must be an object` |
| Provider is missing or not a string | `provider must be a string` |
| Provider name is unknown | `Unsupported provider: <value>` |
| Events is not a list | `events must be an array` |
| An event is not an object | `each event must be an object` |

Check all input before reading events. `fixtures.json` has the inputs and
expected outputs, including normal and error cases.

## How to run it

Each language program takes one JSON file path and prints one JSON object.
It prints an error object and exits normally for the errors listed above.
Tests use the same `fixtures.json` file in every language. Use
`benchmark_input.json` for timing.
