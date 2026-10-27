<!--
Raw LLM output.
Tool: ChatGPT (chatgpt.com, logged-out free tier; the interface shows only "ChatGPT", no model name). Date: 2026-10-11.
Prompt: prompts/M_Kumar_prompt_02.txt, pasted unchanged into a new chat.
Run by: Dilip Kumar Reddy's session - the browser was driven by Claude Code on the team's behalf because members
were unavailable. M Kumar is the owner of the analysed topic (Part 3 State), not the person who typed the prompt.
Capture: text of the rendered answer converted to Markdown; code-fence language labels re-attached; bold/italic
markers inside paragraphs may be missing. Content otherwise unchanged.
-->

# State Pattern — Trip Lifecycle in Java, Python, JavaScript, and C++

The four implementations will follow the same design and transition rules, so all eight fixtures produce identical results.

## 1. Design

The State pattern lets a `Trip` delegate each lifecycle event to its current state object. Each concrete state decides whether the event is valid and returns the next state.

Trip (Context)

Starts in Pending · Delegates events · Updates state on success

TripState (Interface / Protocol)

accept · complete · cancel · reject · expire

Pending

Initial state

Confirmed

Active trip

Terminal states

Completed, Cancelled, Rejected, Expired

### Transition rules

| Current state | Event | Next state |
| --- | --- | --- |
| PENDING | `accept` | CONFIRMED |
| PENDING | `cancel` | CANCELLED |
| PENDING | `reject` | REJECTED |
| PENDING | `expire` | EXPIRED |
| CONFIRMED | `complete` | COMPLETED |
| CONFIRMED | `cancel` | CANCELLED |
| CONFIRMED | `reject` | REJECTED |
| Any other combination | Any event | `INVALID_TRANSITION` |

Important behavior:

- Every `Trip` starts in `PENDING`.
- A valid event returns and installs the next state.
- An invalid event raises `INVALID_TRANSITION` without changing the current state.
- The fixture runner catches that error, increments the error count, and continues processing subsequent events.
- Terminal states reject every event, including events that would otherwise be valid in `Pending` or `Confirmed`.

## 2. Java implementation

Java uses a nominal `TripState` interface. Each state implements all five event methods, and the `Trip` context stores the current state as a `TripState` reference.

```java
import java.util.List;

interface TripState {
    TripState accept();
    TripState complete();
    TripState cancel();
    TripState reject();
    TripState expire();
    String name();
}

final class InvalidTransitionException extends RuntimeException {
    InvalidTransitionException(String state, String event) {
        super("INVALID_TRANSITION: " + state + "." + event);
    }
}

abstract class BaseState implements TripState {
    private TripState invalid(String event) {
        throw new InvalidTransitionException(name(), event);
    }

    public TripState accept()   { return invalid("accept"); }
    public TripState complete() { return invalid("complete"); }
    public TripState cancel()   { return invalid("cancel"); }
    public TripState reject()   { return invalid("reject"); }
    public TripState expire()   { return invalid("expire"); }
}

final class Pending extends BaseState {
    public String name() { return "PENDING"; }
    public TripState accept() { return new Confirmed(); }
    public TripState cancel() { return new Cancelled(); }
    public TripState reject() { return new Rejected(); }
    public TripState expire() { return new Expired(); }
}

final class Confirmed extends BaseState {
    public String name() { return "CONFIRMED"; }
    public TripState complete() { return new Completed(); }
    public TripState cancel() { return new Cancelled(); }
    public TripState reject() { return new Rejected(); }
}

final class Completed extends BaseState {
    public String name() { return "COMPLETED"; }
}

final class Cancelled extends BaseState {
    public String name() { return "CANCELLED"; }
}

final class Rejected extends BaseState {
    public String name() { return "REJECTED"; }
}

final class Expired extends BaseState {
    public String name() { return "EXPIRED"; }
}

final class Trip {
    private TripState state = new Pending();

    public String state() {
        return state.name();
    }

    public void apply(String event) {
        TripState next;
        switch (event) {
            case "accept":   next = state.accept(); break;
            case "complete": next = state.complete(); break;
            case "cancel":   next = state.cancel(); break;
            case "reject":   next = state.reject(); break;
            case "expire":   next = state.expire(); break;
            default:
                throw new IllegalArgumentException("Unknown event: " + event);
        }
        state = next; // Assignment happens only after a successful transition.
    }
}

public class Main {
    static final String[][] FIXTURES = {
        {"T1", "accept", "complete"},
        {"T2", "cancel"},
        {"T3", "accept", "cancel"},
        {"T4", "expire"},
        {"T5", "complete"},
        {"T6", "accept", "complete", "cancel"},
        {"T7", "accept", "reject"},
        {"T8", "expire", "accept", "cancel"}
    };

    public static void main(String[] args) {
        for (String[] fixture : FIXTURES) {
            Trip trip = new Trip();
            int errors = 0;

            for (int i = 1; i < fixture.length; i++) {
                try {
                    trip.apply(fixture[i]);
                } catch (InvalidTransitionException ex) {
                    errors++;
                }
            }

            System.out.printf("%s %s %d%n",
                fixture[0], trip.state(), errors);
        }
    }
}
```

Run with `javac Main.java` followed by `java Main`.

## 3. Python implementation

Python uses duck typing: the context invokes methods on the current state without requiring a formal interface declaration. The abstract base class provides shared invalid-transition behavior.

```python
class InvalidTransition(Exception):
    pass

class TripState:
    name = None

    def _invalid(self, event):
        raise InvalidTransition(f"INVALID_TRANSITION: {self.name}.{event}")

    def accept(self):
        return self._invalid("accept")

    def complete(self):
        return self._invalid("complete")

    def cancel(self):
        return self._invalid("cancel")

    def reject(self):
        return self._invalid("reject")

    def expire(self):
        return self._invalid("expire")

class Pending(TripState):
    name = "PENDING"

    def accept(self):
        return Confirmed()

    def cancel(self):
        return Cancelled()

    def reject(self):
        return Rejected()

    def expire(self):
        return Expired()

class Confirmed(TripState):
    name = "CONFIRMED"

    def complete(self):
        return Completed()

    def cancel(self):
        return Cancelled()

    def reject(self):
        return Rejected()

class Completed(TripState):
    name = "COMPLETED"

class Cancelled(TripState):
    name = "CANCELLED"

class Rejected(TripState):
    name = "REJECTED"

class Expired(TripState):
    name = "EXPIRED"

class Trip:
    def __init__(self):
        self._state = Pending()

    @property
    def state(self):
        return self._state.name

    def apply(self, event):
        # Resolve and invoke the event on the current state.
        handler = getattr(self._state, event, None)
        if handler is None:
            raise ValueError(f"Unknown event: {event}")

        next_state = handler()
        self._state = next_state

FIXTURES = [
    ("T1", ["accept", "complete"]),
    ("T2", ["cancel"]),
    ("T3", ["accept", "cancel"]),
    ("T4", ["expire"]),
    ("T5", ["complete"]),
    ("T6", ["accept", "complete", "cancel"]),
    ("T7", ["accept", "reject"]),
    ("T8", ["expire", "accept", "cancel"]),
]

def run_fixtures():
    for fixture_id, events in FIXTURES:
        trip = Trip()
        errors = 0

        for event in events:
            try:
                trip.apply(event)
            except InvalidTransition:
                errors += 1

        print(f"{fixture_id} {trip.state} {errors}")

if __name__ == "__main__":
    run_fixtures()
```

Run with `python state_trip.py`.

## 4. JavaScript implementation

JavaScript uses classes and prototype-based method dispatch. Each concrete state inherits default rejection behavior from `TripState`, and the context replaces its state only after a handler returns successfully.

```javascript
class InvalidTransition extends Error {
    constructor(state, event) {
        super(`INVALID_TRANSITION: ${state}.${event}`);
        this.name = "InvalidTransition";
    }
}

class TripState {
    _invalid(event) {
        throw new InvalidTransition(this.name, event);
    }

    accept()   { return this._invalid("accept"); }
    complete() { return this._invalid("complete"); }
    cancel()   { return this._invalid("cancel"); }
    reject()   { return this._invalid("reject"); }
    expire()   { return this._invalid("expire"); }
}

class Pending extends TripState {
    name = "PENDING";

    accept() { return new Confirmed(); }
    cancel() { return new Cancelled(); }
    reject() { return new Rejected(); }
    expire() { return new Expired(); }
}

class Confirmed extends TripState {
    name = "CONFIRMED";

    complete() { return new Completed(); }
    cancel() { return new Cancelled(); }
    reject() { return new Rejected(); }
}

class Completed extends TripState {
    name = "COMPLETED";
}

class Cancelled extends TripState {
    name = "CANCELLED";
}

class Rejected extends TripState {
    name = "REJECTED";
}

class Expired extends TripState {
    name = "EXPIRED";
}

class Trip {
    constructor() {
        this._state = new Pending();
    }

    get state() {
        return this._state.name;
    }

    apply(event) {
        const handler = this._state[event];

        if (typeof handler !== "function") {
            throw new Error(`Unknown event: ${event}`);
        }

        const nextState = handler.call(this._state);
        this._state = nextState;
    }
}

const FIXTURES = [
    ["T1", ["accept", "complete"]],
    ["T2", ["cancel"]],
    ["T3", ["accept", "cancel"]],
    ["T4", ["expire"]],
    ["T5", ["complete"]],
    ["T6", ["accept", "complete", "cancel"]],
    ["T7", ["accept", "reject"]],
    ["T8", ["expire", "accept", "cancel"]]
];

for (const [id, events] of FIXTURES) {
    const trip = new Trip();
    let errors = 0;

    for (const event of events) {
        try {
            trip.apply(event);
        } catch (error) {
            if (error instanceof InvalidTransition) {
                errors++;
            } else {
                throw error;
            }
        }
    }

    console.log(`${id} ${trip.state} ${errors}`);
}
```

Run with `node state_trip.js`.

## 5. C++ implementation

C++ uses an abstract base class with pure virtual methods, concrete state classes, and `std::unique_ptr<TripState>` for exclusive ownership. State transitions return newly allocated state objects, which the `Trip` context takes ownership of.

```cpp
#include <iostream>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

class InvalidTransition : public std::runtime_error {
public:
    InvalidTransition(const std::string& state,
                      const std::string& event)
        : std::runtime_error(
              "INVALID_TRANSITION: " + state + "." + event) {}
};

class TripState {
protected:
    [[noreturn]] void invalid(const std::string& event) const {
        throw InvalidTransition(name(), event);
    }

public:
    virtual ~TripState() = default;

    virtual std::string name() const = 0;

    virtual std::unique_ptr<TripState> accept() {
        invalid("accept");
    }
    virtual std::unique_ptr<TripState> complete() {
        invalid("complete");
    }
    virtual std::unique_ptr<TripState> cancel() {
        invalid("cancel");
    }
    virtual std::unique_ptr<TripState> reject() {
        invalid("reject");
    }
    virtual std::unique_ptr<TripState> expire() {
        invalid("expire");
    }
};

class Confirmed;
class Cancelled;
class Rejected;
class Expired;
class Completed;

class Pending : public TripState {
public:
    std::string name() const override { return "PENDING"; }

    std::unique_ptr<TripState> accept() override;
    std::unique_ptr<TripState> cancel() override;
    std::unique_ptr<TripState> reject() override;
    std::unique_ptr<TripState> expire() override;
};

class Confirmed : public TripState {
public:
    std::string name() const override { return "CONFIRMED"; }

    std::unique_ptr<TripState> complete() override;
    std::unique_ptr<TripState> cancel() override;
    std::unique_ptr<TripState> reject() override;
};

class Completed : public TripState {
public:
    std::string name() const override { return "COMPLETED"; }
};

class Cancelled : public TripState {
public:
    std::string name() const override { return "CANCELLED"; }
};

class Rejected : public TripState {
public:
    std::string name() const override { return "REJECTED"; }
};

class Expired : public TripState {
public:
    std::string name() const override { return "EXPIRED"; }
};

std::unique_ptr<TripState> Pending::accept() {
    return std::make_unique<Confirmed>();
}
std::unique_ptr<TripState> Pending::cancel() {
    return std::make_unique<Cancelled>();
}
std::unique_ptr<TripState> Pending::reject() {
    return std::make_unique<Rejected>();
}
std::unique_ptr<TripState> Pending::expire() {
    return std::make_unique<Expired>();
}

std::unique_ptr<TripState> Confirmed::complete() {
    return std::make_unique<Completed>();
}
std::unique_ptr<TripState> Confirmed::cancel() {
    return std::make_unique<Cancelled>();
}
std::unique_ptr<TripState> Confirmed::reject() {
    return std::make_unique<Rejected>();
}

class Trip {
private:
    std::unique_ptr<TripState> state =
        std::make_unique<Pending>();

public:
    std::string currentState() const {
        return state->name();
    }

    void apply(const std::string& event) {
        // Construct the next state before replacing the current one.
        std::unique_ptr<TripState> next;

        if (event == "accept") {
            next = state->accept();
        } else if (event == "complete") {
            next = state->complete();
        } else if (event == "cancel") {
            next = state->cancel();
        } else if (event == "reject") {
            next = state->reject();
        } else if (event == "expire") {
            next = state->expire();
        } else {
            throw std::invalid_argument("Unknown event: " + event);
        }

        state = std::move(next);
    }
};

struct Fixture {
    std::string id;
    std::vector<std::string> events;
};

int main() {
    const std::vector<Fixture> fixtures = {
        {"T1", {"accept", "complete"}},
        {"T2", {"cancel"}},
        {"T3", {"accept", "cancel"}},
        {"T4", {"expire"}},
        {"T5", {"complete"}},
        {"T6", {"accept", "complete", "cancel"}},
        {"T7", {"accept", "reject"}},
        {"T8", {"expire", "accept", "cancel"}}
    };

    for (const auto& fixture : fixtures) {
        Trip trip;
        int errors = 0;

        for (const auto& event : fixture.events) {
            try {
                trip.apply(event);
            } catch (const InvalidTransition&) {
                ++errors;
            }
        }

        std::cout << fixture.id << " "
                  << trip.currentState() << " "
                  << errors << '\n';
    }

    return 0;
}
```

Compile and run:

```bash
g++ -std=c++17 -Wall -Wextra -pedantic state_trip.cpp -o state_trip
./state_trip
```

## 6. Expected output — all four languages

The output must be identical in Java, Python, JavaScript, and C++.

```text
T1 COMPLETED 0
T2 CANCELLED 0
T3 CANCELLED 0
T4 EXPIRED 0
T5 PENDING 1
T6 COMPLETED 1
T7 REJECTED 0
T8 EXPIRED 2
```

### Why the error cases matter

- T5: `complete` is invalid in `PENDING`. The trip remains pending, with one error.
- T6: After `accept` and `complete`, the trip reaches `COMPLETED`. The subsequent `cancel` is invalid, so the completed state is preserved.
- T8: `expire` takes the trip to `EXPIRED`. Both `accept` and `cancel` are then invalid, resulting in two errors without changing the terminal state.

These cases verify that state mutation occurs only after a successful transition and that the runner continues after errors.

## 7. Comparison of the four implementations

| Aspect | Java | Python | JavaScript | C++ |
| --- | --- | --- | --- | --- |
| Participant structure | Interface, abstract base, concrete states, context | Base class, concrete states, context | Base class, concrete states, context | Abstract base, concrete states, context |
| Interface enforcement | Explicit `TripState` interface | Convention / duck typing | Convention / duck typing | Pure virtual interface |
| Dispatch | Interface method calls | Dynamic method lookup | Prototype-based method lookup | Virtual method dispatch |
| State ownership | Garbage collected | Garbage collected | Garbage collected | Explicit via `unique_ptr` |
| Type safety | Strong compile-time checks | Primarily runtime checks | Primarily runtime checks | Strong compile-time checks |
| Typical code size | Medium | Small | Small–medium | Largest |

## 8. Key differences

- Participant structure: All versions use the same seven state/context roles: `Trip`, `Pending`, `Confirmed`, `Completed`, `Cancelled`, `Rejected`, and `Expired`, plus the shared state abstraction and error type. `Pending` and `Confirmed` implement the permitted transitions; terminal states inherit rejection behavior.
- Nominal interfaces vs. duck typing: Java declares `TripState` explicitly, while C++ uses an abstract class with pure virtual methods. Python and JavaScript rely on compatible method behavior at runtime. The four approaches provide the same observable transition behavior, but differ in how they detect an incomplete state implementation.
- Inheritance vs. composition: Inheritance shares default invalid-transition behavior between states. Composition is used by `Trip`, which holds a reference to the current state rather than implementing each state's rules itself. This separation is the core of the State pattern in all four languages.
- Memory and ownership: Java, Python, and JavaScript rely on garbage collection for state objects. C++ uses `std::unique_ptr`, which automatically destroys the old state when a successful transition replaces it. If a transition throws, the current state remains owned by `Trip` and is not replaced.
- Expected lines of code: Python is generally the most concise, with JavaScript close behind. Java adds explicit interface and type declarations, while C++ has additional ownership and return-type syntax. Exact line counts depend on formatting and whether the fixture runner is included.
- Complexity and extensibility: All four implementations have the same conceptual complexity: five events, six concrete states, and a fixed transition table. Adding a new state requires implementing its behavior in each version. The main difference is language-level ceremony, not runtime behavior. With $S$ states and $E$ event types, the straightforward implementation has up to $S \times E$ transition decisions; the State pattern distributes these decisions across the state classes.

Conclusion: The four implementations are behaviorally equivalent. Java and C++ offer stronger interface and compile-time guarantees; Python and JavaScript emphasize flexibility and less boilerplate. C++ makes ownership explicit, while the other three rely on garbage collection.
