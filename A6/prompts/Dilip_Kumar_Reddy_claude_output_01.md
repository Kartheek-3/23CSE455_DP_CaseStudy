<!-- Raw model reply, copied verbatim. Model: Claude Opus 5.5 in Claude Code desktop app, 2026-10-11. -->

I read both PDFs, your friend's B4 submission, and the sarathi-backend code. The repo is a good choice. Below is the plan, then a few questions I need answered before I start building.

## 1. What ma'am wants (from the two PDFs)

One team folder (for example `A1/`) containing:

| Item | What goes in it |
|---|---|
| `README.md` | Repo URL, baseline commit, versions, run/test commands, how LOC, complexity and timing are measured, limitations, and the student list (roll no, name, batch) |
| `A1_Report.tex` + `A1_Report.pdf` | The report, following her LaTeX template section by section |
| `data/` | 5 CSV files: `patterns.csv`, `pattern_counts.csv`, `patterns_evolution.csv`, `cross_language.csv`, `llm.csv` |
| `Part1/` | Original code, architecture and UML diagrams, evidence |
| `Part2/` | Changed code, plus `changes/CH01..CH03` (requirement, diff, test result for each), updated UML |
| `Part3/` | One folder per chosen pattern, with java / python / javascript / cpp versions, tests, timing logs |
| `prompts/` | The real LLM prompts, outputs and our check of each one |

Your friend's B4 folder follows exactly this layout, so we'll copy its structure.

## 2. What's in sarathi-backend

It's built with TypeScript, Express 4, MongoDB (Mongoose), tsyringe (a dependency-injection library), Socket.IO, Redis, Stripe and Google Maps. It has about 10k lines and 185 commits. Our baseline will be commit `c8766f4` from 2026-06-16. The code is cleanly split into domain, application, infrastructure and presentation layers, which makes pattern-hunting easier.

**The 7 areas the topic asks about, mapped to the code:**

| Area | Where it lives |
|---|---|
| Rider | `User` model, `MongoUserRepository`, `RegisterUser`, `UserController` |
| Driver | `Driver` model (`pending/approved/rejected`, `online/offline`), `AdminChangeDriverStatus` |
| Trip | `Booking` model (`PENDING`→`CONFIRMED`→`COMPLETED`…), `BookDriver`, `UpdateBookingStatus`, `CronScheduler` (expires unanswered bookings) |
| Payment | `PaymentService` (Stripe), Stripe Connect account service, `WalletService`, `WalletRidePayment` |
| Driver matching | `BookDriver`: drivers within 30 km straight-line, then filtered to ≤20 km by road, then broadcast. `AcceptBooking`: the first driver to accept gets the ride (an atomic database update) |
| Location | `GoogleDistanceService`, `GoogleMapService`, MongoDB geo queries |
| Notification | `INotificationService` → `SocketNotificationService`, with Redis storing each driver's socket ID; Email and Twilio SMS |

**Patterns I think are really there (I still need to check each one line by line):**

| Pattern | Code that shows it |
|---|---|
| Repository | `IBaseRepository` / `BaseRepository` / `Mongo*Repository` |
| Dependency Injection | tsyringe container wiring |
| Singleton | `registerSingleton` and the shared Socket.IO server returned by `getIO()` |
| Adapter | `SocketNotificationService` wraps Socket.IO; `PaymentService` wraps Stripe; Twilio and Cloudinary services wrap their SDKs |
| Observer / publish-subscribe | Socket.IO events such as `booking:new`, `cancel:booking`, `payment:status` |
| Chain of Responsibility | Express middleware chain: `protectRoute` → `CheckBlocked` → controller → `errorHandler` |
| Data Mapper / DTO | `DriverReviewMapper.toDomain` / `toPersistence` |
| Layered (Clean) Architecture | The four-layer folder structure |

**Patterns that are missing, which is what Part 2 needs:**
- There's no Strategy pattern. `FareCalculatorService` uses `if/else` on the booking type, and the ₹10/km rate is hard-coded twice (also in `UpdateBookingstatus.ts:51`).
- There's no State pattern. Trip and driver status are plain strings checked with scattered `if` statements. As far as I can see, nothing stops a COMPLETED or EXPIRED booking from being set to CANCELLED.
- `AcceptBooking` talks to the database model directly instead of going through the repository. That's a real code smell we can cite in the refactoring section.

## 3. Proposed plan

**Part 2.** The topic lists 4 requirements, but ma'am wants 3 changes, so one change covers two requirements:

| Change | Requirement | Pattern effect |
|---|---|---|
| CH01 | New driver status (e.g. `ON_TRIP`, `SUSPENDED`), so busy drivers aren't matched | **State** added; Observer notification extended |
| CH02 | Ride cancellation with proper rules: who cancelled, time window, fee, blocking invalid transitions | **State** for trip status + **Strategy** for the cancellation-fee policy |
| CH03 | Multiple ride types + dynamic pricing (surge or peak hours) | if/else replaced by **Strategy** + **Factory**, with a **Decorator** for surge pricing |

**Part 3:** compare 3 patterns (Strategy, State, Observer) in Java, Python, JS and C++, using the same test fixtures, with real timings. B4 did only 2 patterns.

**Tests:** the original repo has none, and running it needs MongoDB, Redis, Stripe and Google keys. I'll write unit tests with mock repositories, so they run without any external services. The README will say this honestly.

## 4. Problems I've already spotted

1. **No LICENSE file in the repo.** We should note this in the report. Has ma'am approved this repo?
2. **The repo commits its compiled `dist/` folder and has demo passwords in its README.** Her rules say no compiled binaries and no passwords, so I'll leave `dist/` out and remove the credentials.
3. **GitHub's "Upload files" accepts only 100 files at a time.** Our folder will have roughly 500 files, because the code is included twice. I can push to your fork with git instead.
4. **C++ compiler and LaTeX aren't installed on your PC.** Docker is installed, so I'll run g++ and LaTeX through Docker containers.

## 5. On splitting the work by name

That's fine. I'll assign each teammate an area (for example: architecture + Part 1, CH01, CH02, CH03 + dataset) in `contributions.csv` and the report. Each person should at least read their own section in case ma'am asks them about it.

The one thing I can't do is fake the **LLM records**. Her PDF says *"Do not submit invented LLM records."* So each record has to be a real run by the person it's listed under.

## Questions for you

1. **Team name** (A1, B3…?) and, for each member, **roll number, full name and batch**.
2. **Deadline.** The PDF says "09/10/2026", which has already passed. What's the real date?
3. **Has ma'am approved** sarathi-backend?
4. **LLM records.** Which option do you want?
   - (a) I write 2 prompt files per member, and each person pastes theirs into free ChatGPT or Gemini and sends you the output. About 10 minutes each; this is what B4 did.
   - (b) We record this Claude session as the LLM tool, honestly, under your name only.
5. Are you OK with the **CH01/CH02/CH03 plan** and **3 patterns for Part 3**?
6. **Work folder.** OK to build it at `D:\Doop\<TEAM>\`? And do you have a GitHub account I can push the fork to when we're done?

Once you answer, I'll start with Part 1.
