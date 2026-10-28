# Observer example: sign-in events

Part 1 calls this pattern **Auth State Observer**. In the original app at commit
`90ec6565877053ee0e93e9f09dcc7c7213aa4832`, `AuthProvider` subscribes to
auth changes, updates the current user and unsubscribes when it is done. The
code is in `code/features/auth/context/AuthProvider.tsx:37-50`.

My example uses an in-memory subject instead of Supabase. The subject sends
events to a subscriber. The subscriber saves the user ID it sees. The returned
subscription can remove that subscriber.

## Input

Give the program one JSON object with:

- `events`: a list of event objects in order.
- Optional `unsubscribe_after`: a non-negative safe integer up to
  `9007199254740991`, or `null`. Missing or `null` means stay subscribed.
  `1.0` counts as the integer value 1. `true` does not count as an integer.

Each event must have `event` set to `SIGNED_IN`, `TOKEN_REFRESHED` or
`SIGNED_OUT`. Sign-in and token refresh need a non-empty string `user_id`.
Sign-out needs `user_id` missing or `null`. Extra fields do not matter.

The subject sends every event in order. The subscriber records the given user
ID for sign-in and refresh, and `null` for sign-out. If `unsubscribe_after` is
1, the subscriber gets the first event but not the second. If it is 0, it gets
none. A number greater than the event count leaves it subscribed. Before any
events, the current user is `null`. Do not change the input.

## Output and errors

For valid input, print:

`{"observed_users": [string|null, ...], "final_user_id": string|null, "notification_count": integer}`

For invalid input, print one of these exact error objects:

| Problem | Error text |
|---|---|
| Input is not an object | `input must be an object` |
| Events is missing or not a list | `events must be an array` |
| An event is not an object | `each event must be an object` |
| Event type is missing or unknown | `unsupported auth event` |
| Sign-in or refresh has no valid user ID | `user_id must be a non-empty string` |
| Sign-out has a non-null user ID | `SIGNED_OUT user_id must be null or absent` |
| `unsubscribe_after` is invalid | `unsubscribe_after must be a non-negative integer or null` |

Check all input before sending any events. `fixtures.json` has normal,
empty, unsubscribe and error cases with expected outputs.

## How to run it

Each language program takes one JSON file path and prints one JSON object.
It prints an error object and exits normally for the errors listed above.
Tests use the same `fixtures.json` file in every language. Use
`benchmark_input.json` for timing.
