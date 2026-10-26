<!--
Raw LLM output.
Tool: ChatGPT (chatgpt.com, logged-out free tier; the interface shows only "ChatGPT", no model name). Date: 2026-10-11.
Prompt: prompts/K_Harish_prompt_02.txt, pasted unchanged into a new chat.
Run by: Dilip Kumar Reddy's session - the browser was driven by Claude Code on the team's behalf because members
were unavailable. K Harish is the owner of the analysed topic (Part 3 Strategy), not the person who typed the prompt.
Capture: text of the rendered answer converted to Markdown; code-fence language labels re-attached; bold/italic
markers inside paragraphs may be missing. Content otherwise unchanged.
-->

# Strategy Pattern: Ride Fare Calculation in Java, Python, JavaScript, and C++

The implementation below uses the same design and business rules in all four languages. Each concrete strategy owns its fare calculation and validation, while `FareCalculator` maintains a registry of strategies and delegates calculations to the appropriate one.

The key requirement is open for extension, closed for modification: adding a new ride type should require registering a new strategy, not editing the existing fare strategies or the calculator.

## 1. Design

FareStrategy

calculate(trip) → whole-rupee fare

Implemented by four concrete strategies

OneWayFare

max(450, km × 10)

RoundTripFare

days × 1000

HourlyFare

max(4, ceil(hours)) × 200

OutstationFare

km × 12 + days × 300

FareCalculator (Context)

Registry: ride type → strategy

register(type, strategy) · calculate(trip)

### Shared behavior and error contract

- `INVALID_INPUT`: a recognized ride type fails its validation.
- `UNKNOWN_RIDE_TYPE`: no strategy is registered for the requested ride type.
- Validation occurs inside each strategy, and the context delegates without embedding fare rules.
- The fare results are whole rupees. Hourly fares use ceiling before applying the minimum of four hours.
- The same eight fixtures are used in every implementation, including checks for the exact error codes.

## 2. Java implementation

Java uses a nominal interface, `FareStrategy`, so each strategy explicitly declares that it implements the required contract. A `Map` stores the registered strategies, and custom exceptions expose stable error codes.

```java
import java.util.HashMap;
import java.util.Map;

public class StrategyFareDemo {

    static class Trip {
        final String rideType;
        final double km;
        final int days;
        final double hours;

        Trip(String rideType, double km, int days, double hours) {
            this.rideType = rideType;
            this.km = km;
            this.days = days;
            this.hours = hours;
        }
    }

    static class FareException extends RuntimeException {
        final String code;

        FareException(String code) {
            super(code);
            this.code = code;
        }
    }

    interface FareStrategy {
        long calculate(Trip trip);
    }

    static void require(boolean valid) {
        if (!valid) {
            throw new FareException("INVALID_INPUT");
        }
    }

    static class OneWayFare implements FareStrategy {
        public long calculate(Trip trip) {
            require(trip.km > 0);
            return (long) Math.max(450, trip.km * 10);
        }
    }

    static class RoundTripFare implements FareStrategy {
        public long calculate(Trip trip) {
            require(trip.days >= 1);
            return (long) trip.days * 1000;
        }
    }

    static class HourlyFare implements FareStrategy {
        public long calculate(Trip trip) {
            require(trip.hours > 0);
            return (long) Math.max(4, Math.ceil(trip.hours)) * 200;
        }
    }

    static class OutstationFare implements FareStrategy {
        public long calculate(Trip trip) {
            require(trip.km > 0 && trip.days >= 1);
            return (long) (trip.km * 12 + trip.days * 300);
        }
    }

    static class FareCalculator {
        private final Map<String, FareStrategy> registry =
                new HashMap<>();

        public void register(String type, FareStrategy strategy) {
            registry.put(type, strategy);
        }

        public long calculate(Trip trip) {
            FareStrategy strategy = registry.get(trip.rideType);
            if (strategy == null) {
                throw new FareException("UNKNOWN_RIDE_TYPE");
            }
            return strategy.calculate(trip);
        }
    }

    static FareCalculator createCalculator() {
        FareCalculator calculator = new FareCalculator();
        calculator.register("ONE_WAY", new OneWayFare());
        calculator.register("ROUND_TRIP", new RoundTripFare());
        calculator.register("HOURLY", new HourlyFare());
        calculator.register("OUTSTATION", new OutstationFare());
        return calculator;
    }

    static void check(
            FareCalculator calculator,
            String id,
            Trip trip,
            Long expectedFare,
            String expectedError) {
        try {
            long actual = calculator.calculate(trip);
            if (expectedError != null || actual != expectedFare) {
                throw new AssertionError(id + " failed: " + actual);
            }
            System.out.println(id + ": " + actual);
        } catch (FareException e) {
            if (!e.code.equals(expectedError)) {
                throw new AssertionError(
                        id + " expected " + expectedError
                                + ", got " + e.code);
            }
            System.out.println(id + ": error " + e.code);
        }
    }

    public static void main(String[] args) {
        FareCalculator c = createCalculator();

        check(c, "S1", new Trip("ONE_WAY", 30, 0, 0), 450L, null);
        check(c, "S2", new Trip("ONE_WAY", 60, 0, 0), 600L, null);
        check(c, "S3", new Trip("ROUND_TRIP", 0, 3, 0), 3000L, null);
        check(c, "S4", new Trip("HOURLY", 0, 0, 3), 800L, null);
        check(c, "S5", new Trip("HOURLY", 0, 0, 5.5), 1200L, null);
        check(c, "S6", new Trip("OUTSTATION", 200, 2, 0), 3000L, null);
        check(c, "S7", new Trip("ONE_WAY", 0, 0, 0), null, "INVALID_INPUT");
        check(c, "S8", new Trip("SHUTTLE", 10, 0, 0), null, "UNKNOWN_RIDE_TYPE");
    }
}
```

Run with:

```bash
javac StrategyFareDemo.java
java StrategyFareDemo
```

## 3. Python implementation

Python uses duck typing: a strategy only needs a callable `calculate(trip)` method. The `FareStrategy` base class below makes the intended contract explicit, but the calculator does not need to check inheritance.

```python
import math

class FareError(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code

class Trip:
    def __init__(self, ride_type, km=0, days=0, hours=0):
        self.rideType = ride_type
        self.km = km
        self.days = days
        self.hours = hours

class FareStrategy:
    def calculate(self, trip):
        raise NotImplementedError

def require(valid):
    if not valid:
        raise FareError("INVALID_INPUT")

class OneWayFare(FareStrategy):
    def calculate(self, trip):
        require(trip.km > 0)
        return max(450, trip.km * 10)

class RoundTripFare(FareStrategy):
    def calculate(self, trip):
        require(trip.days >= 1)
        return trip.days * 1000

class HourlyFare(FareStrategy):
    def calculate(self, trip):
        require(trip.hours > 0)
        return max(4, math.ceil(trip.hours)) * 200

class OutstationFare(FareStrategy):
    def calculate(self, trip):
        require(trip.km > 0 and trip.days >= 1)
        return trip.km * 12 + trip.days * 300

class FareCalculator:
    def __init__(self):
        self.registry = {}

    def register(self, ride_type, strategy):
        self.registry[ride_type] = strategy

    def calculate(self, trip):
        strategy = self.registry.get(trip.rideType)
        if strategy is None:
            raise FareError("UNKNOWN_RIDE_TYPE")
        return strategy.calculate(trip)

def create_calculator():
    calculator = FareCalculator()
    calculator.register("ONE_WAY", OneWayFare())
    calculator.register("ROUND_TRIP", RoundTripFare())
    calculator.register("HOURLY", HourlyFare())
    calculator.register("OUTSTATION", OutstationFare())
    return calculator

def check(calculator, fixture_id, trip, expected_fare=None,
          expected_error=None):
    try:
        actual = calculator.calculate(trip)
        assert expected_error is None and actual == expected_fare, (
            f"{fixture_id} failed: got {actual}"
        )
        print(f"{fixture_id}: {actual}")
    except FareError as error:
        assert error.code == expected_error, (
            f"{fixture_id} expected {expected_error}, got {error.code}"
        )
        print(f"{fixture_id}: error {error.code}")

def main():
    c = create_calculator()

    check(c, "S1", Trip("ONE_WAY", 30), 450)
    check(c, "S2", Trip("ONE_WAY", 60), 600)
    check(c, "S3", Trip("ROUND_TRIP", days=3), 3000)
    check(c, "S4", Trip("HOURLY", hours=3), 800)
    check(c, "S5", Trip("HOURLY", hours=5.5), 1200)
    check(c, "S6", Trip("OUTSTATION", km=200, days=2), 3000)
    check(c, "S7", Trip("ONE_WAY"), expected_error="INVALID_INPUT")
    check(c, "S8", Trip("SHUTTLE", km=10),
          expected_error="UNKNOWN_RIDE_TYPE")

if __name__ == "__main__":
    main()
```

Run with:

```bash
python strategy_fare.py
```

## 4. JavaScript implementation

JavaScript uses ordinary objects as strategies and a `Map` for the registry. Classes organize the implementation, but the context can also accept any object that provides a compatible `calculate(trip)` method.

```javascript
class FareError extends Error {
    constructor(code) {
        super(code);
        this.name = "FareError";
        this.code = code;
    }
}

class Trip {
    constructor(rideType, km = 0, days = 0, hours = 0) {
        this.rideType = rideType;
        this.km = km;
        this.days = days;
        this.hours = hours;
    }
}

function requireValid(valid) {
    if (!valid) {
        throw new FareError("INVALID_INPUT");
    }
}

class OneWayFare {
    calculate(trip) {
        requireValid(trip.km > 0);
        return Math.max(450, trip.km * 10);
    }
}

class RoundTripFare {
    calculate(trip) {
        requireValid(trip.days >= 1);
        return trip.days * 1000;
    }
}

class HourlyFare {
    calculate(trip) {
        requireValid(trip.hours > 0);
        return Math.max(4, Math.ceil(trip.hours)) * 200;
    }
}

class OutstationFare {
    calculate(trip) {
        requireValid(trip.km > 0 && trip.days >= 1);
        return trip.km * 12 + trip.days * 300;
    }
}

class FareCalculator {
    constructor() {
        this.registry = new Map();
    }

    register(type, strategy) {
        this.registry.set(type, strategy);
    }

    calculate(trip) {
        const strategy = this.registry.get(trip.rideType);
        if (strategy === undefined) {
            throw new FareError("UNKNOWN_RIDE_TYPE");
        }
        return strategy.calculate(trip);
    }
}

function createCalculator() {
    const calculator = new FareCalculator();
    calculator.register("ONE_WAY", new OneWayFare());
    calculator.register("ROUND_TRIP", new RoundTripFare());
    calculator.register("HOURLY", new HourlyFare());
    calculator.register("OUTSTATION", new OutstationFare());
    return calculator;
}

function check(calculator, id, trip, expectedFare, expectedError = null) {
    try {
        const actual = calculator.calculate(trip);
        if (expectedError !== null || actual !== expectedFare) {
            throw new Error(`${id} failed: got ${actual}`);
        }
        console.log(`${id}: ${actual}`);
    } catch (error) {
        if (!(error instanceof FareError) || error.code !== expectedError) {
            throw error;
        }
        console.log(`${id}: error ${error.code}`);
    }
}

function main() {
    const c = createCalculator();

    check(c, "S1", new Trip("ONE_WAY", 30), 450);
    check(c, "S2", new Trip("ONE_WAY", 60), 600);
    check(c, "S3", new Trip("ROUND_TRIP", 0, 3), 3000);
    check(c, "S4", new Trip("HOURLY", 0, 0, 3), 800);
    check(c, "S5", new Trip("HOURLY", 0, 0, 5.5), 1200);
    check(c, "S6", new Trip("OUTSTATION", 200, 2), 3000);
    check(c, "S7", new Trip("ONE_WAY"), undefined, "INVALID_INPUT");
    check(c, "S8", new Trip("SHUTTLE", 10), undefined,
        "UNKNOWN_RIDE_TYPE");
}

main();
```

Run with:

```bash
node strategy_fare.js
```

## 5. C++ implementation

C++ uses a pure virtual interface and `std::unique_ptr` to manage strategy ownership. The registry stores polymorphic strategies, while exceptions carry the same error codes as the other implementations.

```cpp
#include <cmath>
#include <iostream>
#include <memory>
#include <stdexcept>
#include <string>
#include <unordered_map>
using namespace std;

struct Trip {
    string rideType;
    double km = 0;
    int days = 0;
    double hours = 0;
};

class FareError : public runtime_error {
public:
    string code;

    explicit FareError(const string& code)
        : runtime_error(code), code(code) {}
};

class FareStrategy {
public:
    virtual long long calculate(const Trip& trip) const = 0;
    virtual ~FareStrategy() = default;
};

void requireValid(bool valid) {
    if (!valid) {
        throw FareError("INVALID_INPUT");
    }
}

class OneWayFare : public FareStrategy {
public:
    long long calculate(const Trip& trip) const override {
        requireValid(trip.km > 0);
        return static_cast<long long>(max(450.0, trip.km * 10));
    }
};

class RoundTripFare : public FareStrategy {
public:
    long long calculate(const Trip& trip) const override {
        requireValid(trip.days >= 1);
        return static_cast<long long>(trip.days) * 1000;
    }
};

class HourlyFare : public FareStrategy {
public:
    long long calculate(const Trip& trip) const override {
        requireValid(trip.hours > 0);
        return static_cast<long long>(
            max(4.0, ceil(trip.hours))) * 200;
    }
};

class OutstationFare : public FareStrategy {
public:
    long long calculate(const Trip& trip) const override {
        requireValid(trip.km > 0 && trip.days >= 1);
        return static_cast<long long>(
            trip.km * 12 + trip.days * 300);
    }
};

class FareCalculator {
    unordered_map<string, unique_ptr<FareStrategy>> registry;

public:
    void registerStrategy(
        const string& type,
        unique_ptr<FareStrategy> strategy) {
        registry[type] = move(strategy);
    }

    long long calculate(const Trip& trip) const {
        auto it = registry.find(trip.rideType);
        if (it == registry.end()) {
            throw FareError("UNKNOWN_RIDE_TYPE");
        }
        return it->second->calculate(trip);
    }
};

FareCalculator createCalculator() {
    FareCalculator c;
    c.registerStrategy("ONE_WAY", make_unique<OneWayFare>());
    c.registerStrategy("ROUND_TRIP", make_unique<RoundTripFare>());
    c.registerStrategy("HOURLY", make_unique<HourlyFare>());
    c.registerStrategy("OUTSTATION", make_unique<OutstationFare>());
    return c;
}

void check(
    const FareCalculator& c,
    const string& id,
    const Trip& trip,
    long long expectedFare,
    const string& expectedError = "") {
    try {
        long long actual = c.calculate(trip);
        if (!expectedError.empty() || actual != expectedFare) {
            throw runtime_error(id + " failed");
        }
        cout << id << ": " << actual << '\n';
    } catch (const FareError& e) {
        if (e.code != expectedError) {
            throw runtime_error(
                id + " expected " + expectedError + ", got " + e.code);
        }
        cout << id << ": error " << e.code << '\n';
    }
}

int main() {
    auto c = createCalculator();

    check(c, "S1", {"ONE_WAY", 30, 0, 0}, 450);
    check(c, "S2", {"ONE_WAY", 60, 0, 0}, 600);
    check(c, "S3", {"ROUND_TRIP", 0, 3, 0}, 3000);
    check(c, "S4", {"HOURLY", 0, 0, 3}, 800);
    check(c, "S5", {"HOURLY", 0, 0, 5.5}, 1200);
    check(c, "S6", {"OUTSTATION", 200, 2, 0}, 3000);
    check(c, "S7", {"ONE_WAY", 0, 0, 0}, 0, "INVALID_INPUT");
    check(c, "S8", {"SHUTTLE", 10, 0, 0}, 0, "UNKNOWN_RIDE_TYPE");
}
```

Compile and run:

```bash
g++ -std=c++17 -Wall -Wextra -pedantic strategy_fare.cpp -o strategy_fare
./strategy_fare
```

The C++ registry owns its strategies through `unique_ptr`. Since `FareCalculator` owns a non-copyable registry, returning it from `createCalculator()` relies on move semantics (supported by C++17).

## 6. Shared fixture results

All four versions should produce these results in the same order:

S1

450

S2

600

S3

3000

S4

800

S5

1200

S6

3000

S7

INVALID_INPUT

S8

UNKNOWN_RIDE_TYPE

The following behaviors are intentionally shared:

- All four implementations use the same four registered ride types and fare formulas.
- `S5` rounds 5.5 hours up to 6 hours, giving ₹1,200.
- `S7` raises `INVALID_INPUT` because the recognized `ONE_WAY` strategy receives zero kilometres.
- `S8` raises `UNKNOWN_RIDE_TYPE` because `SHUTTLE` has no registered strategy.

## 7. Comparison of the four implementations

| Dimension | Java | Python | JavaScript | C++ |
| --- | --- | --- | --- | --- |
| Participant structure | Interface + classes | Base class + subclasses | Classes with compatible methods | Abstract class + subclasses |
| Strategy contract | `FareStrategy` interface | Duck typing; optional base class | Duck typing | Pure virtual interface |
| Registry | `HashMap` | `dict` | `Map` | `unordered_map` |
| Inheritance vs. composition | Both | Both | Both | Both |
| Memory / ownership | Garbage collected | Garbage collected | Garbage collected | Explicit RAII ownership via `unique_ptr` |
| Typical code size | Moderate | Shortest | Short | Longest |
| Main trade-off | Strong compile-time typing | Concise and flexible | Flexible, dynamic dispatch | Strong typing and ownership control |

## 8. Key differences: 6 takeaways

- Participant structure: All four implementations contain the same five principal participants: `FareStrategy`, four concrete strategies, and `FareCalculator`. The language changes the syntax and contract enforcement, not the overall design.

- Nominal interfaces vs. duck typing: Java and C++ explicitly enforce the strategy contract through an interface or abstract base class. Python and JavaScript can accept any object that implements `calculate(trip)`, offering flexibility but potentially deferring errors until runtime.

- Inheritance vs. composition: Inheritance relates each concrete strategy to its common contract. Composition is the key Strategy pattern relationship: `FareCalculator` has a registry of strategies and delegates to one of them. It does not inherit fare-calculation behavior.

- Memory and ownership: Java, Python, and JavaScript rely on garbage collection. C++ uses `unique_ptr` for exclusive ownership, automatically releasing registered strategies when the calculator is destroyed. This makes ownership more explicit but adds implementation detail.

- Lines of code and complexity: Python is generally the most concise; JavaScript is similarly compact. Java requires explicit types and exception classes, while C++ adds ownership and polymorphism details. These differences affect boilerplate, not the core algorithmic complexity.

- Extensibility and runtime complexity: Adding a ride type means implementing one new strategy and registering it in all four languages. Registry lookup is expected $O(1)$, and each fare calculation is $O(1)$. The design keeps new pricing rules isolated, making them easier to test and maintain.

Implementation note: For portable C++ compilation, add `#include <algorithm>` to the includes for `std::max`.

One final detail: these fixtures use ordinary numeric inputs, so converting calculated fares to integer types produces the specified results. If future inputs can contain fractional kilometres or require a defined rounding policy for non-integral fares, establish that policy explicitly and apply it consistently in all four languages.
