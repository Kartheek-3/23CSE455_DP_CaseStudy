# Design Pattern Analysis in a FastAPI-Based Logistics Management Application

## 1. Application

This case study analyzes the Warehouse & Transportation Management System (WTMS), a FastAPI-based logistics management application using PostgreSQL.

The application provides functionality for:

- Warehouse management
- Multi-warehouse inventory
- Storage zones and bins
- Stock movements
- Orders
- Vehicles and drivers
- Routes
- Shipments
- Shipment tracking
- Transportation management

The baseline application uses a repository-based data-access architecture.

## 2. Source and Environment

Application source:
https://github.com/aswathymohan-amrita/23CSE455_DP_CaseStudy

Local application:
`WareHouseManagement-main`

Backend:
FastAPI / Python

Database:
PostgreSQL

Verified database version:
PostgreSQL 18.6

Python:
Python 3.11.5

Java:
OpenJDK/Temurin 21.0.1 LTS

JavaScript runtime:
Node.js 22.15.1

C++:
MinGW.org GCC 6.3.0 with C++17 and -O2

## 3. Part 1 - Pattern Analysis

The primary confirmed design pattern is the Repository Pattern.

Confirmed repository instances:

1. WarehouseRepository
2. InventoryRepository
3. OrderRepository
4. TransportationRepository

The repository instances were identified from source-code evidence showing API dependency injection and database operations encapsulated by repository classes.

FastAPI dependency injection and the Database abstraction were treated as supporting mechanisms rather than separate design-pattern instances.

No additional pattern was counted without sufficient source-code evidence.

## 4. Part 2 - Design Evolution

### Baseline

The baseline application already supports multiple warehouses. The database was initialized and verified with four warehouse records.

Therefore, multiple-warehouse support was treated as an existing baseline capability rather than an artificially introduced change.

### Change 1 - Delivery Partner

A `delivery_partners` table was introduced and `shipments.delivery_partner_id` was added.

The application was extended with delivery-partner models, repository operations, and API endpoints.

Runtime verification successfully created and retrieved a delivery partner and created a shipment associated with the partner.

### Change 2 - Real-Time Tracking

A `shipment_tracking` table was introduced to store shipment latitude, longitude, location, status, and timestamp.

Tracking creation and tracking-history retrieval were implemented through the transportation repository and API.

Runtime verification successfully inserted tracking updates and retrieved shipment tracking history.

### Change 3 - Route Changes

A `shipment_route_history` table was introduced to preserve previous and new route assignments.

A transactional repository operation was implemented to:

1. Lock and read the current shipment route.
2. Update the shipment route.
3. Insert the previous and new route IDs into route history.

Runtime verification successfully changed shipment 4 from route 1 to route 2 and recorded the corresponding history row.

## 5. Part 3 - Cross-Language Repository Implementation

The Repository Pattern was implemented independently in:

- Java
- Python
- JavaScript
- C++

Each implementation performs equivalent operations:

- Save a shipment
- Find a shipment by ID
- Retrieve all shipments
- Verify the expected result

All four implementations were compiled/interpreted and executed successfully.

## 6. Timing Methodology

Timing is process-level execution timing rather than isolated method-level timing.

For every language:

1. The implementation was compiled where compilation was required.
2. One warm-up execution was performed.
3. Five measured executions were performed.
4. PowerShell `Measure-Command` was used.
5. The median of the five measured executions was recorded.
6. Execution times were not estimated.

The measurements therefore include process startup overhead and should not be interpreted as a pure language or algorithm benchmark.

Recorded median process times:

| Language | Median |
|---|---:|
| Python | 93.486 ms |
| Java | 81.214 ms |
| JavaScript | 46.009 ms |
| C++ | 14.209 ms |

The measurements are specific to the local environment and the small demonstration programs.

## 7. Complexity

Cyclomatic complexity was documented using the McCabe definition:

`CC = 1 + number of decision points`

The recorded values are based on the actual control-flow constructs in each implementation.

## 8. Evidence Rules

Pattern instances were counted only when source-code evidence supported the pattern.

Class names, annotations, README descriptions, and LLM suggestions were not treated as sufficient evidence by themselves.

Removed or changed pattern instances are retained in evolution records where applicable.

## 9. Repository Data Files

`data/patterns.csv`
- Confirmed pattern instances and source evidence.

`data/pattern_counts.csv`
- Counts of confirmed pattern instances by source version.

`data/patterns_evolution.csv`
- Baseline and change evolution of confirmed pattern instances.

`data/cross_language.csv`
- Cross-language Repository Pattern implementations, test results, complexity, and measured timings.

`data/llm.csv`
- Reserved for actual LLM prompts and outputs; no fabricated records are included.

## 10. Limitations

The cross-language programs are small representative implementations of the Repository Pattern and are not replacements for the complete WTMS backend.

Process-level timings include runtime startup overhead.

The timing values should therefore only be used as measurements of these specific implementations in the recorded environment, not as general performance rankings of programming languages.

The case study identifies patterns from source evidence available in the analyzed application and does not infer patterns solely from naming or documentation.
