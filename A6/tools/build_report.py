"""Writes A6_Report.tex from the dataset so the report and the CSVs cannot disagree.

Run from the A6 folder:  python tools/build_report.py
Compile:  docker run --rm -v "$PWD:/w" -w /w texlive/texlive:latest-medium latexmk -pdf A6_Report.tex
"""
import csv
import json
from collections import Counter, OrderedDict
from pathlib import Path

import pattern_data as P

ROOT = Path(__file__).resolve().parent.parent

TEAM = [  # roll number, name, batch  (edit here, then rebuild)
    ("AM.SC.U4CSE23137", "Dilip Kumar Reddy", "CSE B"),
    ("AM.SC.U4CSE23326", "Sai Sameer", "CSE D"),
    ("AM.SC.U4CSE23134", "M Kumar", "CSE B"),
    ("AM.SC.U4CSE23129", "K Harish", "CSE B"),
    ("AM.SC.U4CSE23154", "S Leela Shankar", "TO FILL"),
]


def esc(s):
    rep = {"\\": r"\textbackslash{}", "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#", "_": r"\_", "{": r"\{",
           "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}", "<": r"\textless{}", ">": r"\textgreater{}"}
    return "".join(rep.get(c, c) for c in str(s))


def path(s):
    return r"\texttt{" + esc(s).replace("/", r"/\allowbreak{}").replace(".", r".\allowbreak{}").replace(r"\_", r"\_\allowbreak{}") + "}"


def read_csv(name):
    with open(ROOT / "data" / name, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def roles_table(roles):
    rows = []
    for part in roles.split("; "):
        if "=" in part:
            role, sym = part.split("=", 1)
        else:
            role, sym = "-", part
        rows.append(f"{esc(role)} & {esc(sym)} \\\\")
    return "\n".join(rows)


def locations(locs):
    return r"\begin{itemize}\setlength\itemsep{0pt}" + "".join(r"\item " + path(l) for l in locs.split("; ")) + r"\end{itemize}"


def instance_record(r, verification):
    return rf"""
\subsubsection*{{{esc(r['instance_name'])}}}
\textbf{{Pattern type and category:}} {esc(r['pattern_name'])} -- {esc(r['pattern_type'])}.\\
\textbf{{Purpose and origin:}} {esc(r['intent_and_evidence'])}

\noindent\begin{{tabularx}}{{\linewidth}}{{@{{}}P{{0.27\linewidth}}Y@{{}}}}
\toprule Pattern role & Actual class, interface or function \\ \midrule
{roles_table(r['participant_roles'])}
\bottomrule
\end{{tabularx}}

\noindent\textbf{{File and line ranges:}}{locations(r['source_locations'])}
\noindent\textbf{{Verification:}} {verification}
"""


VERIFY = {
    "Ride Booking Request Flow": "Confirmed (Dilip). Imports checked layer by layer; one violation (AcceptBooking imports BookingModel) recorded and removed in CH01.",
    "Use-Case and Service Composition Root": "Confirmed. Every use case in scope is resolved from the container; tests construct the same classes with fakes, proving the constructor seams.",
    "Shared Socket.IO Server Instance": "Confirmed as a module-level Singleton; alternative 'registerSingleton = Singleton' was folded into DI (container lifetime, not a pattern collaboration).",
    "Trip Booking Repository": "Confirmed; characterization tests run BookDriver/CancelBooking against an in-memory implementation of the same interface.",
    "Driver Repository with Geospatial Matching Query": "Confirmed; the \\$geoNear filter (approved, unblocked, activePayment) is what lets CH01 exclude suspended drivers without a query change.",
    "Rider Repository": "Confirmed (clients in scope only; auth clients excluded by scope).",
    "Rider Wallet Ledger Repository": "Confirmed.",
    "Driver Review Repository": "Confirmed.",
    "Driver Review Persistence Mapping": "Confirmed; the only explicit domain/persistence mapper in scope.",
    "Socket.IO Ride Notification Adapter": "Confirmed; distinguished from the Observer instance: the adapter is the translation of a domain interface to Socket.IO, the Observer is the subscribe/notify collaboration.",
    "Stripe Ride Payment Adapter": "Confirmed.",
    "Stripe Connect Driver Payout Onboarding Adapter": "Confirmed.",
    "Google Distance Matrix Location Gateway": "Confirmed as Gateway. Rejected alternative: Adapter (no target interface). The interface-based GoogleMapService is uncertain because nothing injects it.",
    "Ride Event Notification": "Confirmed with roles combined: the subject is not a separate class and the concrete observers are client sockets outside the repository.",
    "Authenticated Ride Request Pipeline": "Confirmed; each handler can stop the request or call next().",
    "Async Controller Error Forwarding": "Confirmed in function-wrapper form; same call shape, one added responsibility.",
}

CONCRETE = {  # concrete classes filling variable roles, per instance (baseline)
    "Trip Booking Repository": ["MongoBookingRepository"],
    "Driver Repository with Geospatial Matching Query": ["MongoDriverRepository"],
    "Rider Repository": ["MongoUserRepository"],
    "Rider Wallet Ledger Repository": ["MongoWalletRepository"],
    "Driver Review Repository": ["MongoDriverReviewRepository"],
    "Socket.IO Ride Notification Adapter": ["SocketNotificationService"],
    "Stripe Ride Payment Adapter": ["PaymentService"],
    "Stripe Connect Driver Payout Onboarding Adapter": ["StripeService"],
    "Google Distance Matrix Location Gateway": ["GoogleDistanceService"],
    "Authenticated Ride Request Pipeline": ["CheckBlockedUserOrDriver"],
    "Async Controller Error Forwarding": ["BookingController"],
    "Driver Account Lifecycle": ["PendingDriverState", "ApprovedDriverState", "RejectedDriverState", "SuspendedDriverState"],
    "Trip Lifecycle and Cancellation": ["PendingTrip", "ConfirmedTrip", "FinishedTrip"],
    "Cancellation Fee Policy": ["RiderCancellationPolicy", "DriverCancellationPolicy"],
    "Ride Fare Pricing": ["OneWayFare", "RoundTripFare", "HourlyFare", "OutstationFare"],
    "Dynamic Fare Pricing": ["PeakHourSurcharge", "LowSupplySurcharge"],
}


def inventory(rows):
    by = OrderedDict()
    for r in rows:
        by.setdefault(r["pattern_name"], []).append(r["instance_name"])
    out = []
    for p, names in by.items():
        conc = sum(len(CONCRETE.get(n, [])) for n in names)
        out.append(f"{esc(p)} & {esc('; '.join(names))} & {len(names)} & {conc} \\\\")
    return "\n".join(out)


def main():
    base = read_csv("patterns.csv")
    evo = read_csv("patterns_evolution.csv")
    counts = read_csv("pattern_counts.csv")
    cross = read_csv("cross_language.csv")
    llm = read_csv("llm.csv")
    tests_ts = json.loads((ROOT / "Part2/evidence/changed_files_after.json").read_text(encoding="utf-8"))

    snap_rows = OrderedDict()
    for r in evo:
        snap_rows.setdefault(r["source_version"], []).append(r)

    def snap_summary(s):
        rows = [r for r in snap_rows[s] if r["status_after_change"] != "removed"]
        types = len({r["pattern_name"] for r in rows})
        conc = sum(len(CONCRETE.get(r["instance_name"], [])) for r in rows)
        return f"{esc(s)} & {types} & {len(rows)} & {conc} & 6 rejected, 2 uncertain \\\\"

    changed_rows = "\n".join(
        f"{esc(r['source_version'])} & {esc(r['instance_name'])} ({esc(r['pattern_name'])}) & {esc(r['status_after_change']).replace(chr(92) + '_', chr(92) + '_' + chr(92) + 'allowbreak{}')} & {esc(r['change_description'])} \\\\"
        for r in evo if r["status_after_change"] not in ("baseline", "preserved"))

    cross_rows = "\n".join(
        f"{esc(r['pattern_name'])} & {esc(r['language'])} & {r['source_loc']} & {r['max_function_cc']} & {esc(r['test_result'])} & {r['median_process_ms']} \\\\"
        for r in cross)
    notes_rows = "\n".join(f"{esc(r['pattern_name'])} / {esc(r['language'])} & {esc(r['language_notes'])} \\\\" for r in cross)
    def owner(f):
        n = f.split("/")[-1].split("_output_")[0].replace("_claude", "")
        return n.replace("_", " ")
    llm_rows = "\n".join(f"{esc(r['part'])} & {esc(owner(r['output_file']))} & "
                         f"{'ChatGPT free' if r['model_and_date'].startswith('ChatGPT') else 'Claude Opus 5.5'} & {esc(r['evaluation'])} \\\\"
                         for r in llm)
    rejected_rows = "\n".join(f"{esc(n)} & {esc(v)} & {esc(why)} \\\\" for n, v, why in P.REJECTED)
    students = "\n".join(f"{esc(a)} & {esc(b)} & {esc(c)} \\\\" for a, b, c in TEAM)
    records = "".join(instance_record(r, VERIFY[r["instance_name"]]) for r in base)
    new_records = "".join(instance_record(dict(n, source_version=s), "Confirmed by unit tests listed in the change README.")
                          for s, n in P.NEW_INSTANCES)
    metric_rows = "\n".join(f"{path(r['file'])} & {r['nloc']} & {r['max_cc']} \\\\" for r in tests_ts["rows"])

    tex = TEMPLATE
    for k, v in dict(STUDENTS=students, INVENTORY=inventory(base), RECORDS=records, REJECTED=rejected_rows,
                     SNAPSHOTS="\n".join(snap_summary(s) for s in snap_rows), CHANGED=changed_rows, NEWRECORDS=new_records,
                     CROSS=cross_rows, NOTES=notes_rows, LLM=llm_rows or r"\multicolumn{4}{l}{(none yet)} \\",
                     METRICS=metric_rows).items():
        tex = tex.replace(f"@@{k}@@", v)
    (ROOT / "A6_Report.tex").write_text(tex, encoding="utf-8")
    print("A6_Report.tex written", len(tex), "chars")


TEMPLATE = r"""\documentclass[11pt,a4paper]{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{lmodern}
\usepackage[margin=2cm]{geometry}
\usepackage{graphicx,booktabs,tabularx,longtable,array,xcolor,enumitem}
\usepackage[hidelinks]{hyperref}
\setlist{nosep,leftmargin=1.2em}
\renewcommand{\arraystretch}{1.12}
\newcolumntype{Y}{>{\raggedright\arraybackslash}X}
\newcolumntype{P}[1]{>{\raggedright\arraybackslash}p{#1}}
\setlength{\parindent}{0pt}\setlength{\parskip}{4pt}
\sloppy

\begin{document}
\begin{center}
{\Large\bfseries 23CSE455 Design Patterns}\\[2pt]
{\large Case Study Report}
\end{center}

\textbf{Team:} A6\\
\textbf{Case study:} Ride-Sharing Application using Node.js/Express -- \emph{Design Pattern Analysis in a Node.js/Express Ride-Sharing Application}\\
\textbf{Application:} Sarathi backend (TypeScript, Express 4) -- \url{https://github.com/AkhilMM2000/sarathi-backend}; faculty approval confirmed (reported by the team lead).\\
\textbf{Date:} 2026-10-11\\
\textbf{Submission repository:} 23CSE455\_DP\_CaseStudy

\textbf{Students}\\
\begin{tabular}{@{}lll@{}}\toprule Roll number & Student name & Batch\\\midrule
@@STUDENTS@@
\bottomrule\end{tabular}

%=====================================================================
\section{Application and architecture}
\textbf{Original source:} \url{https://github.com/AkhilMM2000/sarathi-backend}, default branch, baseline commit
\texttt{c8766f4c88b9f36235d5f4399ef9b4cf20df3c8a} (2026-06-16, 185 commits), accessed 2026-10-11.
\textbf{License:} the repository has no LICENSE file (\texttt{package.json} declares ISC); it is used here only for academic analysis.

\textbf{Environment:} TypeScript 5.9.3 on Node.js 22.18.0; Express 4.22; Mongoose 8.24 (MongoDB Atlas); tsyringe 4.10;
Socket.IO 4.8; Upstash Redis; Stripe 18.5; Google Distance Matrix API; Zod 4.6. Versions are those resolved by
\texttt{npm install} on 2026-10-11 because upstream ignores \texttt{package-lock.json}; with them \texttt{tsc --noEmit} reports 7
type errors, all in files we did not change (Stripe API-version literal, Express 5 typings, Upstash typings).

\textbf{Scope:} the seven areas of the case study -- rider, driver (incl.\ reviews), trip, payment (Stripe, Stripe Connect, wallet),
driver matching, location and notification -- plus the framework code they use (DI container, middleware, error handling).
Excluded as outside these areas: chat, vehicles, file upload, referral rewards, OTP/registration/OAuth/password reset, admin dashboards.
Excluded from the copied code: \texttt{dist/} (compiled output), screenshots, a compiler log; demo credentials in the README were redacted.

\textbf{Architecture:} the code follows a four-layer clean architecture (Figure~\ref{fig:arch}). A ride request enters
\texttt{index.ts}, passes the route's middleware chain (\texttt{protectRoute} $\rightarrow$ \texttt{CheckBlockedUserOrDriver}),
reaches \texttt{BookingController.bookDriver}, which validates the DTO with Zod and calls the \texttt{BookDriver} use case.
\texttt{BookDriver} computes the fare, asks \texttt{IDriverRepository} for approved drivers within 30\,km (MongoDB \texttt{\$geoNear}),
filters them to 20\,km road distance through \texttt{GoogleDistanceService}, saves a PENDING booking through \texttt{IBookingRepository}
and broadcasts \texttt{booking:new} through \texttt{INotificationService}, implemented by \texttt{SocketNotificationService}
(Redis maps driver id to socket id). The first driver to call \texttt{AcceptBooking} wins an atomic PENDING$\rightarrow$CONFIRMED update;
\texttt{CronScheduler} expires requests nobody accepts. All collaborators are wired by the tsyringe container.

\begin{figure}[h]\centering\includegraphics[width=\linewidth]{Part1/diagrams/architecture.png}
\caption{Layered architecture and ride-request flow (\texttt{Part1/diagrams/architecture.puml}).}\label{fig:arch}\end{figure}

\textbf{Run instructions:} \texttt{README.md}. Running the server needs MongoDB, Redis, Stripe and Google credentials, which we did not have,
so behaviour was verified through the real use-case classes with in-memory fakes: \texttt{cd Part2/code \&\& npm install \&\& npm test}.
Baseline characterization run (unchanged \texttt{src}, test files added): 14/14 passed (\texttt{Part1/evidence/test\_results.txt}).

%=====================================================================
\section{Part 1 Pattern discovery}
\textbf{Method:} (1) mapped the seven areas to files; (2) collected candidates from interfaces, DI registrations, naming and a first
LLM pass (Section~\ref{sec:llm}); (3) for every candidate traced implementers, injection points and call sites, and accepted it only
when the roles of the pattern are present and interact; (4) recorded rejected and uncertain candidates with a reason;
(5) wrote characterization tests for behaviour the changes would touch. A class name, decorator or LLM statement alone was never accepted.

\subsection{Totals at the baseline}
\textbf{Confirmed pattern types:} 10 -- Layered Architecture, Dependency Injection, Singleton, Repository, Data Mapper, Adapter,
Gateway, Observer, Chain of Responsibility, Decorator.\\
\textbf{Confirmed pattern instances:} 16.\\
\textbf{Concrete participant classes:} 11 (five Mongo repositories, \texttt{SocketNotificationService}, \texttt{PaymentService},
\texttt{StripeService}, \texttt{GoogleDistanceService}, \texttt{CheckBlockedUserOrDriver}, \texttt{BookingController}).\\
\textbf{Unique participant symbols:} 69 distinct classes, interfaces, functions and modules across all 16 records (shared symbols counted once; list in \texttt{Part1/evidence/participant\_symbols.txt}).\\
\textbf{Rejected and uncertain candidates:} 6 rejected, 2 uncertain (Table~\ref{tab:rej}); observation scope as above.

\subsection{Pattern inventory}
\begin{longtable}{@{}P{0.17\linewidth}P{0.5\linewidth}rr@{}}
\toprule Pattern type & Instance names & Instances & Concrete cl.\\\midrule\endhead
@@INVENTORY@@
\bottomrule
\end{longtable}

\begin{longtable}{@{}P{0.2\linewidth}P{0.1\linewidth}P{0.62\linewidth}@{}}
\caption{Rejected and uncertain candidates (baseline).}\label{tab:rej}\\
\toprule Candidate & Verdict & Reason\\\midrule\endfirsthead
\toprule Candidate & Verdict & Reason\\\midrule\endhead
@@REJECTED@@
\bottomrule
\end{longtable}

\begin{figure}[h]\centering\includegraphics[width=\linewidth]{Part1/diagrams/baseline_patterns.png}
\caption{Main baseline collaborations (\texttt{Part1/diagrams/baseline\_patterns.puml}).}\end{figure}

\subsection{One record for each pattern instance}
Diagram for all records: Figure~2 (editable source \texttt{Part1/diagrams/baseline\_patterns.puml}). Each row is also in \texttt{data/patterns.csv}.
@@RECORDS@@

%=====================================================================
\section{Part 2 Evolution and refactoring}
The four requirements were delivered as three changes on branch \texttt{a6-evolution}; each was implemented, tested and committed separately.
Details, patches and logs: \texttt{Part2/changes/CH0x/}.

\subsection*{CH01 -- New driver status (SUSPENDED)}
\textbf{Change and acceptance criteria:} an admin can suspend an approved driver with a reason and reinstate them later. Only
pending$\rightarrow$approved/rejected, approved$\rightarrow$suspended, suspended$\rightarrow$approved/rejected and rejected$\rightarrow$pending are legal
(409 otherwise, nothing saved or sent). A suspended driver is not matched, cannot accept or be requested directly, receives no
catch-up requests and cannot log in.\\
\textbf{Before and after:} \texttt{168ef00} $\rightarrow$ \texttt{f635355}; 15 source files (\texttt{Part2/changes/CH01/diffstat.txt}).\\
\textbf{Implementation and tests:} State pattern in \texttt{domain/driver/DriverAccountState.ts}; \texttt{AdminChangeDriverStatus},
\texttt{AcceptBooking}, \texttt{BookDriver} and the socket catch-up ask the state. \texttt{npm test}: 22/22 passed (\texttt{Part2/changes/CH01/test\_results.txt}).\\
\textbf{Pattern effects:} Driver Account Lifecycle newly introduced; driver repository modified; trip repository extended; Observer and
Layered Architecture modified; DI extended (Table~\ref{tab:evo}).\\
\textbf{Refactoring:} \emph{smell} -- the application-layer \texttt{AcceptBooking} ran a Mongoose query itself; \emph{technique} -- Move Method
into \texttt{IBookingRepository.acceptPendingBooking}; \emph{evidence} -- a test checks the same CONFIRMED result, notification order and
first-driver-wins behaviour.\\
\textbf{Before/after metrics:} \texttt{AdminChangeDriverStatus} max CC 5$\rightarrow$3; \texttt{AcceptBooking} NLOC 42$\rightarrow$58, CC 4$\rightarrow$6
(new state check); new state module 135 NLOC.

\begin{figure}[h]\centering\includegraphics[width=0.8\linewidth]{Part2/diagrams/ch01_driver_account_state.png}\caption{CH01 State.}\end{figure}

\subsection*{CH02 -- Ride cancellation}
\textbf{Change and acceptance criteria:} riders and assigned drivers can cancel only their own PENDING or CONFIRMED rides; finished rides
return 409. Rider fee is 0 while PENDING or before 21:00 IST the day before, otherwise max(Rs~50, 10\% of the fare); driver
cancellations are free and notify the rider; unaccepted broadcasts dismiss the drivers' popups.\\
\textbf{Before and after:} \texttt{f635355} $\rightarrow$ \texttt{28a83c8}; 13 source files.\\
\textbf{Implementation and tests:} State (\texttt{TripLifecycle}) used by cancel, status update and expiry; Strategy
(\texttt{CancellationPolicy}) for the fee. \texttt{npm test}: 33/33 passed.\\
\textbf{Pattern effects:} two new instances; notification adapter, Observer, middleware chain, \texttt{catchAsync} decorator and trip
repository extended.\\
\textbf{Refactoring:} \emph{smells} -- a forced \texttt{status} parameter, cutoff arithmetic inside the use case, no status guard (the baseline test
\emph{a COMPLETED trip can still be cancelled} passed), no ownership check; \emph{techniques} -- Replace Conditional with State, Extract Class;
\emph{evidence} -- the baseline cancellation tests keep their expectations.\\
\textbf{Before/after metrics:} \texttt{CancelBooking} NLOC 48$\rightarrow$48 but max CC 5$\rightarrow$9 (ownership and recipient branches);
new \texttt{TripState.ts} 114 NLOC (max CC 4) and \texttt{CancellationPolicy.ts} 37 NLOC.

\begin{figure}[h]\centering\includegraphics[width=0.8\linewidth]{Part2/diagrams/ch02_trip_state_cancellation.png}\caption{CH02 State + Strategy.}\end{figure}

\subsection*{CH03 -- Multiple ride types and dynamic pricing}
\textbf{Change and acceptance criteria:} new HOURLY (Rs~200 per started hour, min 4\,h) and OUTSTATION (Rs~12/km + Rs~300/day) ride types;
+25\% in peak hours (08:00--10:59, 17:00--20:59 IST) and +20\% when fewer than 3 drivers are in range; existing fares unchanged off-peak;
final fare uses each type's extra-km rate.\\
\textbf{Before and after:} \texttt{28a83c8} $\rightarrow$ \texttt{a12c878}; 7 source files.\\
\textbf{Implementation and tests:} Strategy per ride type in \texttt{domain/pricing/FareStrategy.ts}, Decorators in \texttt{DynamicPricing.ts},
\texttt{FareCalculatorService} as context; \texttt{BookDriver} prices after matching. \texttt{npm test}: 41/41 passed; the six baseline fare
tests pass unchanged.\\
\textbf{Pattern effects:} Ride Fare Pricing (Strategy) and Dynamic Fare Pricing (Decorator) newly introduced; DI extended.\\
\textbf{Refactoring:} \emph{smells} -- switch on \texttt{bookingType}, magic number \texttt{ratePerKm = 10} duplicated in \texttt{UpdateBookingStatus},
plain \texttt{Error} turning into HTTP 500; \emph{techniques} -- Replace Conditional with Polymorphism, Replace Magic Number;
\emph{evidence} -- unchanged characterization tests.\\
\textbf{Before/after metrics:} \texttt{FareCalculatorService} NLOC 32$\rightarrow$30, max CC 6$\rightarrow$2; \texttt{BookDriver} max CC 15$\rightarrow$18
(driver-state check and supply argument).

\begin{figure}[h]\centering\includegraphics[width=0.9\linewidth]{Part2/diagrams/ch03_fare_strategy_decorator.png}\caption{CH03 Strategy + Decorator.}\end{figure}

\subsection*{Records of the newly introduced instances}
@@NEWRECORDS@@

\subsection{Updated pattern counts}
\begin{tabular}{@{}lrrrl@{}}\toprule Snapshot & Types & Instances & Concrete classes & Rejected / uncertain (baseline scope)\\\midrule
@@SNAPSHOTS@@
\bottomrule\end{tabular}

No instance was removed or replaced; continuing collaborations keep their instance names. The Ride Fare Pricing Strategy replaces the
conditional that was the rejected Strategy candidate of the baseline, and the two State instances replace the status conditionals that
were the rejected State candidate.

\begin{longtable}{@{}P{0.09\linewidth}P{0.25\linewidth}P{0.16\linewidth}P{0.4\linewidth}@{}}
\caption{Instances whose status changed (all other rows: preserved; full table \texttt{data/patterns\_evolution.csv}).}\label{tab:evo}\\
\toprule Snapshot & Instance & Status & Change\\\midrule\endfirsthead
\toprule Snapshot & Instance & Status & Change\\\midrule\endhead
@@CHANGED@@
\bottomrule
\end{longtable}

\textbf{Same-scope metrics of the edited and new files after CH03} (\texttt{tools/ts\_metrics.js}; NLOC = non-blank, non-comment lines):
\begin{longtable}{@{}P{0.7\linewidth}rr@{}}\toprule File & NLOC & max CC\\\midrule\endhead
@@METRICS@@
\bottomrule\end{longtable}
Whole \texttt{src}: 8{,}232 NLOC / 399 functions before, 8{,}680 NLOC / 460 functions after; maximum function CC 17 $\rightarrow$ 18.

\textbf{Interpretation:} the new states and strategies made each requirement an additive change: SUSPENDED is one new class and one
method, a new ride type or pricing rule is one class plus a registration, and illegal transitions are refused in one place. The cost is
about 450 more NLOC and more, smaller functions; some use cases (\texttt{CancelBooking}, \texttt{BookDriver}) gained complexity because they
now enforce ownership and supply rules. More or fewer LOC alone does not prove a better design; the evidence for the improvement is
that two baseline defects are now caught by tests and that the old fare behaviour is preserved by unchanged tests. Remaining limitations:
\texttt{UpdateBookingStatus} still does not check that the caller is the booking's driver; the pre-booking estimate cannot include the
low-supply surcharge; cancellation is still read-then-update rather than one atomic conditional update, and acceptance does not re-check
\texttt{activePayment} -- the last two were pointed out by the ChatGPT reviews in Section~\ref{sec:llm} and are left as future work.

%=====================================================================
\section{Part 3 Cross-language comparison}
\textbf{Selected instances:} Ride Fare Pricing (Strategy, CH03), Trip Lifecycle and Cancellation (State, CH02), Ride Event Notification
(Observer, baseline). These are the patterns the requirements changed most; the infrastructure patterns (Repository, Adapter, Gateway,
Data Mapper, DI) depend on MongoDB, Stripe, Google or tsyringe and have no self-contained four-language equivalent with identical behaviour.

\textbf{Common specifications:} \texttt{Part3/test-cases/strategy\_spec.md} (S1--S8: fares for every ride type, invalid input, unknown type),
\texttt{state\_spec.md} (T1--T8: event sequences, final state and number of refused events), \texttt{observer\_spec.md} (O1--O6:
broadcast, unsubscribe, reconnect replacement, ordering). S1--S8 and T1--T8 are also asserted against the TypeScript code.

\textbf{Implementations:} \texttt{Part3/<pattern>/\{java,python,javascript,cpp\}/} -- Java 25, Python 3.13.7, Node.js 22.18.0, g++ 13.5.0
(\texttt{-std=c++20 -O2}, Docker \texttt{gcc:13}); commands in each folder's README and \texttt{tools/run\_part3.py}.

\textbf{Actual results and static/dynamic comparison} (\texttt{data/cross\_language.csv}; LOC = lizard NLOC of the production file;
CC = maximum function cyclomatic complexity; time = median of 5 complete test processes after 1 warm-up):

\begin{tabular}{@{}llrrlr@{}}\toprule Pattern & Language & LOC & max CC & Tests & Median ms\\\midrule
@@CROSS@@
\bottomrule\end{tabular}

All 12 implementations passed every fixture. Times include process start-up and are dominated by it (JVM about 100\,ms, Node about 47\,ms,
CPython 31--64\,ms, native C++ about 2\,ms measured inside the container); they are not throughput benchmarks.

\textbf{Comparison:}
\begin{longtable}{@{}P{0.2\linewidth}P{0.76\linewidth}@{}}\toprule Snippet & Observed language-specific structure\\\midrule\endhead
@@NOTES@@
\bottomrule\end{longtable}

\textbf{Technology discussion:} Java and C++ express the pattern roles as nominal types checked by the compiler (interfaces, abstract
classes, \texttt{override}); Python \texttt{Protocol}s and JavaScript duck typing make the same roles conventions, so the code is shorter
but a missing method is found only when it runs. Dynamic dispatch by name (\texttt{getattr}, \texttt{state[event]()}) removed the event
switch in Python/JS (CC 2 versus 6 in Java/C++), which matches the GoF observation that State replaces conditionals with polymorphism but
the context still needs a way to map events to methods. C++ is the only version that must state ownership: the Strategy context owns
strategies through \texttt{unique\_ptr}, the State context replaces its state object, and the Observer hub keeps \texttt{weak\_ptr}s so a
subscription never keeps a disconnected observer alive -- a concern garbage-collected runtimes hide. (Sources: Gamma et al.\ 1994; Python
\texttt{typing.Protocol} PEP 544; ISO C++ smart-pointer guidelines.)

%=====================================================================
\section{LLM records and human verification}\label{sec:llm}
\textbf{Run and model:} 10 real runs on 2026-10-11. (a) Dilip Kumar Reddy's prompt to Claude Opus 5.5 in the Claude Code desktop app (paid tier,
not a free tool) for the application study and first pattern list (\texttt{prompts/Dilip\_Kumar\_Reddy\_claude\_*}). (b) Nine prompts on
\textbf{ChatGPT, free tier, logged out} (the interface shows no model name). Members were unavailable, so with the team lead's approval each
prompt file was pasted unchanged into a new chat from his computer, with the browser driven by Claude Code; the member named on a file is the
owner of that topic, not the person who typed it. Prompts embed the exact source excerpts, specifications or CSVs the model received.

\textbf{Inputs and outputs:} prompt, input, raw output and verification paths are in \texttt{data/llm.csv}; inputs come from the baseline
commit c8766f4 (\texttt{Part1/code}) or from our own specifications and datasets. Outputs were captured from the rendered page and converted
to Markdown without editing the content.

\textbf{Claims and evaluation:}
\begin{longtable}{@{}P{0.17\linewidth}P{0.14\linewidth}P{0.12\linewidth}P{0.5\linewidth}@{}}\toprule Part & Topic owner & Model & Evaluation (details in the verification file)\\\midrule\endhead
@@LLM@@
\bottomrule\end{longtable}

\textbf{What the evaluation showed:} 3 runs correct, 7 partially correct, none fully incorrect. All 12 programs that ChatGPT generated for the
cross-language prompts compiled and passed every fixture (\texttt{prompts/*\_coderun\_02.txt}), but its explanations made factual slips about its
own code (a JavaScript ``inheritance'' entry, size rankings). In pattern discovery it agreed with our Repository, DI, Layered, Adapter and
middleware-chain findings and with all six rejected candidates, but disputed three of our classifications (Observer with remote observers,
the function-wrapper Decorator \texttt{catchAsync}, the module-level Singleton); we keep them with their caveats stated in the records. For the
change requests it proposed the same Strategy designs, preferred a transition table or a single eligibility check where we used State, and
found two weaknesses that remain in our implementation (non-atomic cancellation, no \texttt{activePayment} check on acceptance). A model
statement was never accepted without code or test evidence.

\textbf{Generated code in our deliverables:} the TypeScript changes and the Part 3 snippets were written with AI assistance in the Claude Code session
and are accepted only through the evidence in this report: 41 application tests, 22 fixtures per language set, \texttt{tsc} with no new errors and
\texttt{-Wall -Wextra -Wpedantic} with no warnings. Each topic owner reviews their part and signs \texttt{HUMAN\_VERIFICATION.md}.

%=====================================================================
\section{Findings, contributions and references}
\textbf{Findings:} (1) The baseline already uses a clean, interface-first architecture: 16 collaborations of 10 pattern types, dominated by
Repository (5) and Adapter (3) instances made possible by tsyringe DI. (2) Its variability points were conditionals: ride-type pricing and
both status lifecycles had no behavioural pattern, and two defects followed from that (a completed trip could be cancelled; an admin could
jump a rejected driver to approved). (3) The four requirements introduced two State, two Strategy and one Decorator instance and extended
the notification Adapter/Observer, ending at 12 types and 21 instances with no removals. (4) Across languages the pattern structure stays the
same; what changes is how roles are declared (nominal vs structural), how events are dispatched, and whether ownership must be explicit.
(5) The LLM was useful as a reviewer -- it confirmed most findings and exposed two remaining weaknesses -- but 7 of 10 answers needed correction,
so its statements served as hypotheses to verify, not as evidence.
Limitations: no live end-to-end run against external services; dependency drift; no upstream license; client-side observers out of scope.

\textbf{Contributions} (\texttt{data/contributions.csv}):\\
\begin{tabular}{@{}P{0.2\linewidth}P{0.74\linewidth}@{}}\toprule Member & Contribution and evidence\\\midrule
Dilip Kumar Reddy & Lead: application study, architecture, Part 1 discovery, integration, report, submission; \texttt{Part1/}, \texttt{data/patterns.csv}, \texttt{README.md}\\
Sai Sameer & CH01 new driver status (State) and Part 3 Observer; \texttt{Part2/changes/CH01}, \texttt{Part3/observer\_ride\_notification}\\
M Kumar & CH02 ride cancellation (State, Strategy) and Part 3 State; \texttt{Part2/changes/CH02}, \texttt{Part3/state\_trip\_lifecycle}\\
K Harish & CH03 ride types and dynamic pricing (Strategy, Decorator) and Part 3 Strategy; \texttt{Part2/changes/CH03}, \texttt{Part3/strategy\_ride\_fare}\\
S Leela Shankar & UML diagrams, Part 3 measurement harness and cross-language metrics, dataset audit, slides; \texttt{Part1/diagrams}, \texttt{Part2/diagrams}, \texttt{Part3/evidence}, \texttt{tools/run\_part3.py}\\
\bottomrule\end{tabular}

\textbf{References:}
\begin{enumerate}
\item AkhilMM2000, \emph{sarathi-backend}, \url{https://github.com/AkhilMM2000/sarathi-backend}, commit c8766f4.
\item E.~Gamma, R.~Helm, R.~Johnson, J.~Vlissides, \emph{Design Patterns: Elements of Reusable Object-Oriented Software}, Addison-Wesley, 1994.
\item M.~Fowler, \emph{Patterns of Enterprise Application Architecture}, Addison-Wesley, 2002 (Repository, Data Mapper, Gateway).
\item M.~Fowler, \emph{Refactoring}, 2nd ed., Addison-Wesley, 2018.
\item Express 4 middleware guide, \url{https://expressjs.com/en/guide/using-middleware.html}; tsyringe, \url{https://github.com/microsoft/tsyringe};
Socket.IO v4 documentation, \url{https://socket.io/docs/v4/}.
\item PEP 544 -- Protocols: structural subtyping, \url{https://peps.python.org/pep-0544/}.
\item Tools: lizard 1.17.13, PlantUML 1.2024.7, Node test runner, Docker \texttt{gcc:13}.
\end{enumerate}

%=====================================================================
\section{Team folder and datasets}
\begin{verbatim}
A6/
  README.md  HUMAN_VERIFICATION.md  A6_Report.tex  A6_Report.pdf
  data/    patterns.csv, pattern_counts.csv, patterns_evolution.csv,
           cross_language.csv, llm.csv, contributions.csv
  Part1/   code/, diagrams/, evidence/, llm/
  Part2/   code/, changes/CH01..CH03/, diagrams/, evidence/, llm/
  Part3/   strategy_ride_fare/, state_trip_lifecycle/, observer_ride_notification/,
           test-cases/, evidence/, llm/, A6_slide.pdf
  prompts/ tools/
\end{verbatim}
Screenshot of the team folder in the GitHub fork: to be added after upload.

\end{document}
"""

if __name__ == "__main__":
    main()
