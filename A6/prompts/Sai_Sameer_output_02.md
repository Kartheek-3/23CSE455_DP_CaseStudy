<!--
Raw LLM output.
Tool: ChatGPT (chatgpt.com, logged-out free tier; the interface shows only "ChatGPT", no model name). Date: 2026-10-11.
Prompt: prompts/Sai_Sameer_prompt_02.txt, pasted unchanged into a new chat.
Run by: Dilip Kumar Reddy's session - the browser was driven by Claude Code on the team's behalf because members
were unavailable. Sai Sameer is the owner of the analysed topic (Part 3 Observer), not the person who typed the prompt.
Capture: text of the rendered answer converted to Markdown; code-fence language labels re-attached; bold/italic
markers inside paragraphs may be missing. Content otherwise unchanged.
-->

# Observer Pattern: Ride Event Notification

The four implementations below use the same participant structure and behavior, so fixtures O1–O6 should pass identically in Java, Python, JavaScript, and C++.

The key design decision is that `NotificationHub` stores observers by ID in a map. Calling `subscribe(id, observer)` for an existing ID replaces the previous observer, which models a socket reconnect. Notifications are delivered only to currently subscribed observers.

## 1. Shared design

Client / Test Fixture

Subscribe · Unsubscribe · Notify · Broadcast

NotificationHub (Subject)

Map of observer ID → observer instance

Observer.update(event)

Delivery to each matching subscription

RecordingObserver (Concrete Observer)

Appends received events in order

### Contract shared by all four versions

- An event contains `type` and `bookingId`.
- Subscription IDs are unique keys; subscribing again replaces the existing observer.
- Unsubscribing an unknown ID is harmless.
- `notify` returns `true` only if a subscribed observer receives the event.
- `broadcast` counts successful deliveries, skips unknown IDs, and preserves the order of IDs and events.
- Each fixture creates a fresh hub and fresh observers.

## 2. Java

Java uses an explicit `Observer` interface and concrete classes. This version is runnable as a single file named `ObserverPatternDemo.java`.

```java
import java.util.*;

public class ObserverPatternDemo {
    static final class Event {
        final String type;
        final String bookingId;

        Event(String type, String bookingId) {
            this.type = type;
            this.bookingId = bookingId;
        }
    }

    interface Observer {
        void update(Event event);
    }

    static final class RecordingObserver implements Observer {
        final List<Event> events = new ArrayList<>();

        @Override
        public void update(Event event) {
            events.add(event);
        }
    }

    static final class NotificationHub {
        private final Map<String, Observer> observers =
                new HashMap<>();

        void subscribe(String id, Observer observer) {
            observers.put(id, observer);
        }

        void unsubscribe(String id) {
            observers.remove(id);
        }

        boolean notify(String id, Event event) {
            Observer observer = observers.get(id);
            if (observer == null) return false;
            observer.update(event);
            return true;
        }

        int broadcast(List<String> ids, Event event) {
            int delivered = 0;
            for (String id : ids) {
                if (notify(id, event)) delivered++;
            }
            return delivered;
        }
    }

    static Event event(String type, String bookingId) {
        return new Event(type, bookingId);
    }

    static void check(boolean condition, String fixture) {
        if (!condition) throw new AssertionError(fixture);
    }

    static void fixtures() {
        // O1
        {
            NotificationHub h = new NotificationHub();
            RecordingObserver d1 = new RecordingObserver();
            RecordingObserver d2 = new RecordingObserver();
            h.subscribe("d1", d1);
            h.subscribe("d2", d2);
            check(h.broadcast(Arrays.asList("d1", "d2", "d3"),
                    event("booking:new", "B1")) == 2, "O1 count");
            check(d1.events.size() == 1 && d2.events.size() == 1,
                    "O1 events");
        }

        // O2
        {
            NotificationHub h = new NotificationHub();
            RecordingObserver d1 = new RecordingObserver();
            RecordingObserver d2 = new RecordingObserver();
            h.subscribe("d1", d1);
            h.subscribe("d2", d2);
            h.unsubscribe("d1");
            check(h.broadcast(Arrays.asList("d1", "d2"),
                    event("booking:new", "B2")) == 1, "O2 count");
            check(d1.events.isEmpty(), "O2 d1");
        }

        // O3
        {
            NotificationHub h = new NotificationHub();
            check(!h.notify("r1",
                    event("booking:confirmation", "B3")), "O3");
        }

        // O4
        {
            NotificationHub h = new NotificationHub();
            RecordingObserver a = new RecordingObserver();
            RecordingObserver b = new RecordingObserver();
            h.subscribe("d1", a);
            h.subscribe("d1", b);
            check(h.notify("d1", event("cancel:booking", "B4")),
                    "O4 delivered");
            check(a.events.isEmpty() && b.events.size() == 1, "O4");
        }

        // O5
        {
            NotificationHub h = new NotificationHub();
            RecordingObserver d2 = new RecordingObserver();
            h.subscribe("d2", d2);
            h.notify("d2", event("booking:new", "B5"));
            h.notify("d2", event("cancel:booking", "B5"));
            check(d2.events.size() == 2
                    && d2.events.get(0).type.equals("booking:new")
                    && d2.events.get(1).type.equals("cancel:booking"),
                    "O5");
        }

        // O6
        {
            NotificationHub h = new NotificationHub();
            RecordingObserver r1 = new RecordingObserver();
            h.subscribe("r1", r1);
            check(h.notify("r1",
                    event("booking:confirmation", "B6")), "O6 notify");
            check(h.broadcast(Collections.emptyList(),
                    event("booking:new", "B7")) == 0, "O6 broadcast");
        }
    }

    public static void main(String[] args) {
        fixtures();
        System.out.println("All Observer fixtures passed.");
    }
}
```

Run with:

```bash
javac ObserverPatternDemo.java
java ObserverPatternDemo
```

## 3. Python

Python uses duck typing: `NotificationHub` calls `update(event)` without requiring the observer to inherit from a particular base class.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Event:
    type: str
    bookingId: str

class RecordingObserver:
    def __init__(self):
        self.events = []

    def update(self, event):
        self.events.append(event)

class NotificationHub:
    def __init__(self):
        self.observers = {}

    def subscribe(self, id, observer):
        self.observers[id] = observer

    def unsubscribe(self, id):
        self.observers.pop(id, None)

    def notify(self, id, event):
        observer = self.observers.get(id)
        if observer is None:
            return False
        observer.update(event)
        return True

    def broadcast(self, ids, event):
        return sum(self.notify(id, event) for id in ids)

def event(type, bookingId):
    return Event(type, bookingId)

def fixtures():
    # O1
    h = NotificationHub()
    d1, d2 = RecordingObserver(), RecordingObserver()
    h.subscribe("d1", d1)
    h.subscribe("d2", d2)
    assert h.broadcast(["d1", "d2", "d3"],
                       event("booking:new", "B1")) == 2
    assert len(d1.events) == len(d2.events) == 1

    # O2
    h = NotificationHub()
    d1, d2 = RecordingObserver(), RecordingObserver()
    h.subscribe("d1", d1)
    h.subscribe("d2", d2)
    h.unsubscribe("d1")
    assert h.broadcast(["d1", "d2"],
                       event("booking:new", "B2")) == 1
    assert len(d1.events) == 0

    # O3
    h = NotificationHub()
    assert h.notify("r1", event("booking:confirmation", "B3")) is False

    # O4
    h = NotificationHub()
    a, b = RecordingObserver(), RecordingObserver()
    h.subscribe("d1", a)
    h.subscribe("d1", b)
    assert h.notify("d1", event("cancel:booking", "B4")) is True
    assert len(a.events) == 0 and len(b.events) == 1

    # O5
    h = NotificationHub()
    d2 = RecordingObserver()
    h.subscribe("d2", d2)
    h.notify("d2", event("booking:new", "B5"))
    h.notify("d2", event("cancel:booking", "B5"))
    assert [e.type for e in d2.events] == [
        "booking:new", "cancel:booking"
    ]

    # O6
    h = NotificationHub()
    r1 = RecordingObserver()
    h.subscribe("r1", r1)
    assert h.notify("r1", event("booking:confirmation", "B6")) is True
    assert h.broadcast([], event("booking:new", "B7")) == 0

if __name__ == "__main__":
    fixtures()
    print("All Observer fixtures passed.")
```

Run with:

```bash
python observer_pattern.py
```

## 4. JavaScript

JavaScript uses a `Map` for subscriptions and a conventional `update` method. No inheritance is needed; any object with a compatible method can act as an observer.

```javascript
"use strict";

class RecordingObserver {
    constructor() {
        this.events = [];
    }

    update(event) {
        this.events.push(event);
    }
}

class NotificationHub {
    constructor() {
        this.observers = new Map();
    }

    subscribe(id, observer) {
        this.observers.set(id, observer);
    }

    unsubscribe(id) {
        this.observers.delete(id);
    }

    notify(id, event) {
        const observer = this.observers.get(id);
        if (observer === undefined) return false;
        observer.update(event);
        return true;
    }

    broadcast(ids, event) {
        let delivered = 0;
        for (const id of ids) {
            if (this.notify(id, event)) delivered++;
        }
        return delivered;
    }
}

const event = (type, bookingId) => ({ type, bookingId });
const check = (condition, fixture) => {
    if (!condition) throw new Error(`Failed: ${fixture}`);
};

function fixtures() {
    // O1
    {
        const h = new NotificationHub();
        const d1 = new RecordingObserver();
        const d2 = new RecordingObserver();
        h.subscribe("d1", d1);
        h.subscribe("d2", d2);
        check(h.broadcast(["d1", "d2", "d3"],
            event("booking:new", "B1")) === 2, "O1 count");
        check(d1.events.length === 1 && d2.events.length === 1,
            "O1 events");
    }

    // O2
    {
        const h = new NotificationHub();
        const d1 = new RecordingObserver();
        const d2 = new RecordingObserver();
        h.subscribe("d1", d1);
        h.subscribe("d2", d2);
        h.unsubscribe("d1");
        check(h.broadcast(["d1", "d2"],
            event("booking:new", "B2")) === 1, "O2 count");
        check(d1.events.length === 0, "O2 d1");
    }

    // O3
    {
        const h = new NotificationHub();
        check(h.notify("r1",
            event("booking:confirmation", "B3")) === false, "O3");
    }

    // O4
    {
        const h = new NotificationHub();
        const a = new RecordingObserver();
        const b = new RecordingObserver();
        h.subscribe("d1", a);
        h.subscribe("d1", b);
        check(h.notify("d1", event("cancel:booking", "B4")) === true,
            "O4 delivered");
        check(a.events.length === 0 && b.events.length === 1, "O4");
    }

    // O5
    {
        const h = new NotificationHub();
        const d2 = new RecordingObserver();
        h.subscribe("d2", d2);
        h.notify("d2", event("booking:new", "B5"));
        h.notify("d2", event("cancel:booking", "B5"));
        check(JSON.stringify(d2.events.map(e => e.type)) ===
            JSON.stringify(["booking:new", "cancel:booking"]), "O5");
    }

    // O6
    {
        const h = new NotificationHub();
        const r1 = new RecordingObserver();
        h.subscribe("r1", r1);
        check(h.notify("r1",
            event("booking:confirmation", "B6")) === true, "O6 notify");
        check(h.broadcast([], event("booking:new", "B7")) === 0,
            "O6 broadcast");
    }
}

fixtures();
console.log("All Observer fixtures passed.");
```

Run with:

```bash
node observer_pattern.js
```

## 5. C++ (C++17)

C++ uses an abstract base class for `Observer` and `std::shared_ptr` to manage observer lifetimes. The hub owns shared references to its currently subscribed observers.

```cpp
#include <cassert>
#include <iostream>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

struct Event {
    std::string type;
    std::string bookingId;
};

class Observer {
public:
    virtual void update(const Event& event) = 0;
    virtual ~Observer() = default;
};

class RecordingObserver : public Observer {
public:
    std::vector<Event> events;

    void update(const Event& event) override {
        events.push_back(event);
    }
};

class NotificationHub {
private:
    std::unordered_map<std::string, std::shared_ptr<Observer>> observers;

public:
    void subscribe(const std::string& id,
                   std::shared_ptr<Observer> observer) {
        observers[id] = std::move(observer);
    }

    void unsubscribe(const std::string& id) {
        observers.erase(id);
    }

    bool notify(const std::string& id, const Event& event) {
        auto it = observers.find(id);
        if (it == observers.end()) return false;
        it->second->update(event);
        return true;
    }

    int broadcast(const std::vector<std::string>& ids,
                  const Event& event) {
        int delivered = 0;
        for (const auto& id : ids) {
            if (notify(id, event)) ++delivered;
        }
        return delivered;
    }
};

Event event(const std::string& type, const std::string& bookingId) {
    return {type, bookingId};
}

void fixtures() {
    // O1
    {
        NotificationHub h;
        auto d1 = std::make_shared<RecordingObserver>();
        auto d2 = std::make_shared<RecordingObserver>();
        h.subscribe("d1", d1);
        h.subscribe("d2", d2);
        assert(h.broadcast({"d1", "d2", "d3"},
            event("booking:new", "B1")) == 2);
        assert(d1->events.size() == 1 && d2->events.size() == 1);
    }

    // O2
    {
        NotificationHub h;
        auto d1 = std::make_shared<RecordingObserver>();
        auto d2 = std::make_shared<RecordingObserver>();
        h.subscribe("d1", d1);
        h.subscribe("d2", d2);
        h.unsubscribe("d1");
        assert(h.broadcast({"d1", "d2"},
            event("booking:new", "B2")) == 1);
        assert(d1->events.empty());
    }

    // O3
    {
        NotificationHub h;
        assert(!h.notify("r1",
            event("booking:confirmation", "B3")));
    }

    // O4
    {
        NotificationHub h;
        auto a = std::make_shared<RecordingObserver>();
        auto b = std::make_shared<RecordingObserver>();
        h.subscribe("d1", a);
        h.subscribe("d1", b);
        assert(h.notify("d1", event("cancel:booking", "B4")));
        assert(a->events.empty() && b->events.size() == 1);
    }

    // O5
    {
        NotificationHub h;
        auto d2 = std::make_shared<RecordingObserver>();
        h.subscribe("d2", d2);
        h.notify("d2", event("booking:new", "B5"));
        h.notify("d2", event("cancel:booking", "B5"));
        assert(d2->events.size() == 2);
        assert(d2->events[0].type == "booking:new");
        assert(d2->events[1].type == "cancel:booking");
    }

    // O6
    {
        NotificationHub h;
        auto r1 = std::make_shared<RecordingObserver>();
        h.subscribe("r1", r1);
        assert(h.notify("r1",
            event("booking:confirmation", "B6")));
        assert(h.broadcast({},
            event("booking:new", "B7")) == 0);
    }
}

int main() {
    fixtures();
    std::cout << "All Observer fixtures passed.\n";
}
```

Run with:

```bash
g++ -std=c++17 -Wall -Wextra -pedantic observer_pattern.cpp -o observer_pattern
./observer_pattern
```

Expected output in all four languages:

```text
All Observer fixtures passed.
```

Note: C++ assertions are disabled if compiled with `NDEBUG`; use a normal debug/test build when validating fixtures.

## 6. Comparison of the four implementations

| Aspect | Java | Python | JavaScript | C++ |
| --- | --- | --- | --- | --- |
| Participant structure | Interface + classes | Classes; protocol by convention | Classes; protocol by convention | Abstract base class + derived class |
| Type checking | Static | Dynamic | Dynamic | Static |
| Observer contract | Explicit `Observer` interface | Duck typing | Duck typing | Pure virtual `update` |
| Subscription storage | `HashMap` | `dict` | `Map` | `unordered_map` |
| Memory management | Garbage collection | Garbage collection | Garbage collection | `shared_ptr` reference counting |
| Replacement behavior | `put` | Assignment | `Map.set` | Map assignment |
| Typical verbosity | Moderate | Lowest | Low | Highest |
| Main trade-off | Strong nominal typing | Conciseness and flexibility | Flexible, web-friendly syntax | Control and explicit lifetime semantics |

## 7. Key differences

- Participant structure: All four versions use the same three core roles: `Observer`, `RecordingObserver`, and `NotificationHub`. The hub manages subscriptions and delegates event delivery to observers. Python and JavaScript omit a separate interface declaration without changing the runtime behavior.
- Nominal interfaces vs. duck typing: Java and C++ express the observer contract explicitly through an interface or abstract base class. Python and JavaScript accept any object that implements a compatible `update(event)` method. Nominal typing catches more contract errors during compilation; duck typing makes alternative observer implementations easier to plug in.
- Inheritance vs. composition: Java and C++ use inheritance to express the concrete observer's relationship to the observer contract. Python and JavaScript use composition of behavior and convention rather than requiring inheritance. In every version, the hub contains references to observers rather than inheriting from them.
- Memory and ownership: Java, Python, and JavaScript rely on garbage collection. C++ uses `shared_ptr`, so the hub holds a shared reference to each current subscription. Replacing or removing a subscription releases the hub's reference, but an observer remains alive if another shared reference still exists. This also means that shared ownership does not automatically prevent reference cycles.
- Lines of code: Python will usually be the shortest because dictionaries, method calls, and assertions require little boilerplate. JavaScript is similarly compact. Java adds explicit types and class declarations; C++ adds access control, virtual methods, smart pointers, and template types. Exact line counts depend on formatting and test coverage.
- Complexity and performance: The algorithmic complexity is effectively identical. With a hash-based map, `subscribe`, `unsubscribe`, and `notify` take expected $O(1)$ time; `broadcast` takes expected $O(n)$ time for $n$ IDs. Recording each event adds $O(1)$ amortized work per delivery. The biggest differences are type safety, runtime flexibility, and lifetime management—not the Observer pattern's core complexity.

Conclusion: These implementations preserve the same observable contract and all six fixtures. The best choice depends on the surrounding system: Java for explicit interface contracts, Python for concise implementations, JavaScript for event-driven applications, and C++ when explicit ownership and resource control matter.
