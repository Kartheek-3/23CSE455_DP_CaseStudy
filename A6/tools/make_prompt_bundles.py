"""Builds the exact prompt files sent to the LLM (instruction text + verbatim source excerpts).

The saved prompt file is exactly what the model received. Run from the A6 folder:
    python tools/make_prompt_bundles.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CODE = ROOT / "Part1" / "code" / "src"


def excerpt(rel, start=None, end=None):
    lines = (CODE / rel).read_text(encoding="utf-8").splitlines()
    s, e = start or 1, end or len(lines)
    body = "\n".join(f"{i:4d} {lines[i - 1]}" for i in range(s, e + 1))
    return f"--- src/{rel} (lines {s}-{e}) ---\n{body}\n"


def whole(rel):
    return f"--- {rel} ---\n" + (ROOT / rel).read_text(encoding="utf-8").strip() + "\n"


def columns(rel, cols):
    """CSV restricted to the named columns (keeps the prompt short)."""
    import csv
    import io
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(cols)
    for row in csv.DictReader(open(ROOT / rel, encoding="utf-8")):
        w.writerow([row[c] for c in cols])
    return f"--- {rel} (columns: {', '.join(cols)}) ---\n" + buf.getvalue()


CONTEXT = ("Context: Sarathi is an open-source Node.js/Express/TypeScript ride-sharing backend "
           "(github.com/AkhilMM2000/sarathi-backend, commit c8766f4) using MongoDB/Mongoose, tsyringe DI, Socket.IO, "
           "Redis, Stripe and the Google Distance Matrix API. Source lines are numbered on the left.\n\n")

EVOLUTION_QUESTIONS = (
    "Answer in this order, concisely:\n"
    "1. Code smells or defects in the current code that make this change risky (cite file:line).\n"
    "2. The design pattern(s) you would introduce, with every participant role mapped to a class name.\n"
    "3. Effect on the patterns already in this code: preserved / modified / extended / replaced / removed, with a reason.\n"
    "4. The key TypeScript changes (only the new/changed parts).\n\n"
)

CROSS_QUESTIONS = (
    "Implement this problem with the {pattern} pattern in Java, Python, JavaScript and C++ with identical behaviour "
    "(all fixtures must pass). Then compare the four versions in a short table and 5-6 bullet points: participant "
    "structure, nominal interfaces vs duck typing, inheritance vs composition, memory/ownership, and expected "
    "differences in lines of code and complexity.\n\n"
)

# name -> (part, instruction, [(file, start, end) or (dataset_file,)])
PROMPTS = {
    "Dilip_Kumar_Reddy_prompt_01.txt": (
        "Pattern discovery",
        CONTEXT +
        "Task: identify the design patterns that are ACTUALLY implemented in the excerpts below (GoF, enterprise/PoEAA, "
        "architectural, framework idioms). They cover trip booking, driver matching, location, notification, payment "
        "and the HTTP pipeline.\n"
        "Give a table with: pattern | category | instance name | participants (role = class/function, file:lines) | "
        "evidence (which calls prove it). Then list patterns that someone might wrongly claim here and why they are "
        "not present. Do not invent classes that are not shown.\n\n",
        [("domain/repositories/IBaseRepository.ts",), ("infrastructure/database/BaseRepository.ts", 5, 23),
         ("domain/repositories/IBookingrepository.ts", 23, 45), ("infrastructure/database/MongoBookingRepository.ts", 12, 24),
         ("application/services/NotificationService.ts",), ("infrastructure/services/SocketNotification.ts", 1, 33),
         ("infrastructure/socket/socket.ts", 9, 16), ("infrastructure/socket/socket.ts", 181, 184),
         ("infrastructure/socket/SocketNotification.ts", 16, 20),
         ("infrastructure/services/FareCalculatorService.ts",), ("application/use_cases/User/BookDriver.ts", 27, 57),
         ("domain/services/IStripeService.ts", 9, 22), ("infrastructure/services/StripeService.ts", 8, 41),
         ("middleware/authMiddleware.ts", 15, 50), ("middleware/checkBlocked.ts", 17, 57),
         ("infrastructure/utils/catchAsync.ts",), ("presentation/routes/BookingRoute.ts", 10, 17),
         ("infrastructure/config/container.ts", 44, 48), ("infrastructure/config/container.ts", 68, 90)],
    ),
    "Sai_Sameer_prompt_01.txt": (
        "Evolution CH01 (new driver status)",
        CONTEXT +
        "Change request CH01 - new driver status: an admin must be able to SUSPEND an approved driver (reason required) "
        "and later REINSTATE them. A suspended driver must not receive ride requests or accept bookings. Today the status "
        "is only pending/approved/rejected and the admin can move a driver from any status to any status.\n\n"
        + EVOLUTION_QUESTIONS,
        [("domain/models/Driver.ts", 3, 37), ("domain/repositories/IDriverepository.ts", 4, 12),
         ("infrastructure/database/MongodriverRepository.ts", 89, 102),
         ("infrastructure/database/MongodriverRepository.ts", 255, 271),
         ("application/use_cases/Admin/AdminChangeDriverStatus.ts", 10, 37),
         ("application/use_cases/Driver/AcceptBooking.ts", 13, 54)],
    ),
    "M_Kumar_prompt_01.txt": (
        "Evolution CH02 (ride cancellation)",
        CONTEXT +
        "Change request CH02 - ride cancellation: the rider or the assigned driver can cancel a ride. Only PENDING or "
        "CONFIRMED rides can be cancelled. A rider cancelling a CONFIRMED ride after 9:00 PM IST on the day before the "
        "ride pays 10% of the estimated fare (minimum Rs 50); otherwise free. Driver cancellation is free and the rider "
        "is notified. Only the booking's own rider or driver may cancel it.\n\n"
        + EVOLUTION_QUESTIONS,
        [("domain/models/Booking.ts", 8, 15), ("application/use_cases/User/CancelBooking.ts", 11, 56),
         ("application/use_cases/Driver/UpdateBookingstatus.ts", 26, 67),
         ("infrastructure/services/CronScheduler.ts", 13, 43),
         ("presentation/controllers/BookingController.ts", 193, 204)],
    ),
    "K_Harish_prompt_01.txt": (
        "Evolution CH03 (ride types and dynamic pricing)",
        CONTEXT +
        "Change request CH03 - multiple ride types and dynamic pricing: keep ONE_WAY (Rs 10/km, min Rs 450) and "
        "ROUND_TRIP (Rs 1000/day); add HOURLY (Rs 200/hour, min 4 hours) and OUTSTATION (Rs 12/km + Rs 300 per day). "
        "Add +25% for rides starting 08:00-10:59 or 17:00-20:59 IST and +20% when fewer than 3 drivers are nearby. "
        "A new ride type or pricing rule must not require editing existing fare code.\n\n"
        + EVOLUTION_QUESTIONS,
        [("domain/models/Booking.ts", 16, 19), ("application/services/FareCalculatorService.ts", 4, 11),
         ("infrastructure/services/FareCalculatorService.ts", 6, 38),
         ("application/use_cases/User/BookDriver.ts", 52, 57), ("application/use_cases/User/BookDriver.ts", 61, 99),
         ("application/use_cases/Driver/UpdateBookingstatus.ts", 43, 54)],
    ),
    "Sai_Sameer_prompt_02.txt": ("Cross-language analysis (Observer)", CROSS_QUESTIONS.format(pattern="Observer"),
                                 [("Part3/test-cases/observer_spec.md",)]),
    "M_Kumar_prompt_02.txt": ("Cross-language analysis (State)", CROSS_QUESTIONS.format(pattern="State"),
                              [("Part3/test-cases/state_spec.md",)]),
    "K_Harish_prompt_02.txt": ("Cross-language analysis (Strategy)", CROSS_QUESTIONS.format(pattern="Strategy"),
                               [("Part3/test-cases/strategy_spec.md",)]),
    "S_Leela_Shankar_prompt_01.txt": (
        "Pattern discovery (dataset audit)",
        "Below are two CSV files from a design-pattern study of a Node.js/Express ride-sharing backend: patterns.csv "
        "(one row per pattern instance found in the original code; location/evidence columns left out) and "
        "pattern_counts.csv (summary).\n"
        "Audit them, concisely:\n"
        "1. Do the 'Original code' counts match the rows? List any mismatch.\n"
        "2. For each row: are the participant roles complete for that pattern (e.g. Adapter needs Target, Adapter, Adaptee)? "
        "Mark OK or name what is missing.\n"
        "3. Any row whose pattern name/category looks wrong, or two rows that should be one instance? Explain.\n"
        "Use only what is in the files.\n\n",
        [("data/patterns.csv", ["pattern_name", "pattern_type", "instance_name", "participant_roles"]),
         ("data/pattern_counts.csv",)],
    ),
    "S_Leela_Shankar_prompt_02.txt": (
        "Cross-language analysis (metrics)",
        "Below is cross_language.csv: the same Strategy, State and Observer problems implemented in Java, Python, "
        "JavaScript and C++ with identical fixtures. source_loc = non-blank non-comment lines of the production file; "
        "max_function_cc = highest cyclomatic complexity of any function; median_process_ms = median of 5 complete test "
        "runs after 1 warm-up (Java/Python/JS on Windows 11; C++ inside a Linux Docker container, start-up excluded).\n"
        "Answer concisely:\n"
        "1. The main LOC, complexity and time differences per pattern and their likely causes.\n"
        "2. Which differences come from the language (typing, dispatch, memory, runtime start-up) and which from coding choices?\n"
        "3. Threats to validity of these measurements.\n"
        "4. Can one language be called 'better' for these patterns? Justify in 2-3 sentences.\n\n",
        [("data/cross_language.csv",)],
    ),
}


def main():
    out = ROOT / "prompts"
    out.mkdir(exist_ok=True)
    for name, (part, text, files) in PROMPTS.items():
        parts = [columns(*f) if len(f) == 2 and isinstance(f[1], list) else
                 whole(f[0]) if f[0].startswith(("data/", "Part3/")) else excerpt(*f) for f in files]
        body = text + "\n".join(parts)
        (out / name).write_text(body, encoding="utf-8", newline="\n")
        print(f"{name:34s} {part:48s} {len(body):6d} chars")


if __name__ == "__main__":
    main()
