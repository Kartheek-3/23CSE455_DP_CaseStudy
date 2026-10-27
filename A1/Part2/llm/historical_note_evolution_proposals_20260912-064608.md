## Part 2 — Evolution of the Existing Design

Using the same `HarshavardhanVemali/campus-food-ordering` project, the goal here is to show **how the existing design would evolve when the four new requirements are introduced**.

I am keeping the proposals conservative: patterns are suggested only where they solve an actual design problem.

---

# 1. Multiple Delivery Partners

### Existing design → New requirement → Problem → Pattern/refactoring → Improved design

### Existing design

The current system associates an order with a **single delivery person** through the `Order.delivery_person` relationship.

The main assignment logic is in:

- `canteenapp/models.py` → `Order` 
- `canteenapp/views.py` → `adminassignordertodelivery()` 

Conceptually:

```
```

```
Order
  |
  └── delivery_person
          |
          └── DeliveryPerson
```

The function `adminassignordertodelivery()` directly receives a delivery person's email, retrieves that delivery person, assigns them to the order, and updates the order. It also sends a Channels event to the delivery person's group.

---

### New requirement

The application should support **multiple delivery partners**.

For example, different delivery partners could have different:

-  availability 
-  delivery areas 
-  charges 
-  priorities 
-  selection criteria 

---

### Problem created

The current design directly couples the order assignment operation to **one** **`DeliveryPerson`**.

If more delivery partners are introduced, repeatedly adding conditions such as:

```
```

```
if partner == A:
    ...
elif partner == B:
    ...
elif partner == C:
    ...
```

would make the assignment logic difficult to maintain.

---

### Pattern/refactoring

### **Strategy Pattern — Proposed**

This is a good place to introduce Strategy **during the evolution**, even though Strategy was not confirmed in the original project.

Instead of embedding partner-selection rules inside `adminassignordertodelivery()`, the selection algorithm can be separated.

Conceptually:

```
```

```
DeliveryAssignmentStrategy
        |
        +── NearestPartnerStrategy
        +── AvailabilityStrategy
        +── AreaBasedStrategy
        +── PriorityStrategy
```

The order-assignment service can select the appropriate strategy without changing the rest of the order-processing code.

### Improved design

```
```

```
Order
  |
  v
Delivery Assignment
  |
  v
DeliveryAssignmentStrategy
  |
  +── Availability-based
  +── Area-based
  +── Distance-based
  +── Priority-based
```

### Refactoring required

The current:

```
```

```
adminassignordertodelivery()
```

should no longer contain all delivery-selection logic.

The delivery-selection responsibility should be extracted into a separate abstraction.

The existing `Order.delivery_person` relationship would also need to evolve if an order can have **multiple delivery partners**. Instead of assuming one person directly on `Order`, a separate assignment relationship would be more appropriate.

### Benefit

-  New delivery-selection rules can be added independently. 
-  Assignment logic becomes easier to test. 
- `Order` does not need to know how the delivery partner was selected. 
-  Different delivery partners can be supported without repeatedly modifying the core order logic. 

---

# 2. Order-Status Notifications

## Existing design

This is actually where the existing project already has a strong **Observer-style mechanism**.

The important files are:

- `canteenapp/views.py` 
- `canteenapp/consumers.py` 
- `canteenapp/firebase.py` 

When an order status changes, `adminupdateorderstatus()` sends events using the Django Channels `channel_layer.group_send()` mechanism.

Different consumers listen for these events:

```
```

```
AdminOrderConsumer
RestaurantOrderConsumer
DeliveryOrderConsumer
```

The project also has notification-related models and Firebase notification functionality.

---

## New requirement

Make order-status notifications more systematic.

For example:

```
```

```
Order status changed
        |
        +── Customer notification
        +── Restaurant notification
        +── Delivery notification
        +── Admin update
        +── Push notification
        +── WebSocket update
```

---

## Problem created

Currently, notification behaviour is closely connected to the order-status update logic.

As the number of notification types increases, putting all notification operations directly inside functions such as `adminupdateorderstatus()` can make that function increasingly large and tightly coupled.

For example:

```
```

```
adminupdateorderstatus()
        |
        +── update database
        +── create notification
        +── Firebase
        +── Channels
        +── determine recipient
        +── determine message
```

Changing the notification mechanism could therefore require modifying the order-status logic.

---

## Pattern/refactoring

### **Extend the existing Observer-style design**

This is the **most natural evolution** because the project already has event-based communication.

Instead of treating notification as something the order-update function directly performs, the order-status change can become the event:

```
```

```
Order status changed
        |
        v
   Event/Subject
        |
   ┌────┼────┬─────┐
   ↓    ↓    ↓     ↓
Push  WebSocket  Customer  Restaurant
```

The existing Django Channels mechanism can continue handling real-time updates, while notification handling can become more clearly separated.

---

## Improved design

```
```

```
             Order
               |
        Status changes
               |
               v
        Order Status Event
               |
      ┌────────┼─────────┐
      ↓        ↓         ↓
 WebSocket   Push      Notification
 Consumer   Service      Handler
```

### Refactoring required

The main affected areas are:

- `canteenapp/views.py` 
- `canteenapp/consumers.py` 
- `canteenapp/firebase.py` 
-  notification models in `canteenapp/models.py` 

The logic currently embedded in `adminupdateorderstatus()` can be separated so that the function primarily changes the order state and publishes an event.

Notification handlers can then respond to that event.

### Benefit

-  Adding email/SMS/push notifications becomes easier. 
-  Order logic is separated from notification delivery. 
-  Existing WebSocket functionality can be retained. 
-  Multiple observers can react independently to the same order-status event. 

### Strong assignment point

This requirement is particularly good for demonstrating **pattern evolution**:

```
```

```
Existing:
Order update → directly performs notifications/events

        ↓ refactoring

Improved:
Order update → publishes event → multiple observers react
```

---

# 3. Cancellation / Refund

## Existing design

The repository already contains cancellation/refund functionality.

Relevant areas include:

- `canteenapp/models.py` 
  - `Order` 
  - `Refund` 
- `canteenapp/views.py` 
  -  cancellation/refund-related order processing 

The existing order model also contains `cancelled` as one of its possible statuses.

The project therefore does **not** need cancellation to be invented from scratch.

---

## New requirement

The cancellation/refund process needs to become more flexible.

For example, different situations may require different refund rules:

```
```

```
Customer cancellation
        ↓
Check order state
        ↓
Determine refund
        ↓
Full refund / partial refund / no refund
```

The refund behaviour may depend on:

-  current order status 
-  payment status 
-  cancellation reason 
-  how far the order has progressed 

---

## Problem created

If cancellation rules are implemented using increasingly large conditional blocks:

```
```

```
if status == pending:
    ...
elif status == confirmed:
    ...
elif status == prepared:
    ...
elif status == shipped:
    ...
```

the cancellation logic becomes harder to extend.

There is also a risk of mixing:

-  order-state changes 
-  refund calculation 
-  payment processing 
-  notification 

inside one function.

---

## Pattern/refactoring

### **State-based refactoring — Proposed**

This requirement is a good reason to strengthen the existing state-driven order workflow.

The existing project already has order statuses and transition validation. Rather than creating unrelated cancellation logic, cancellation behaviour can be associated with the order's current state.

Conceptually:

```
```

```
Order State
   |
   +── Pending → full refund
   |
   +── Confirmed → refund according to rule
   |
   +── Prepared → different refund rule
   |
   +── Shipped → cancellation may be restricted
   |
   +── Delivered → cancellation unavailable
```

This could eventually evolve toward a formal State pattern if the assignment requires it.

### Important distinction

The **original project does not currently implement these separate State classes**.

Therefore, in Part 2 we are proposing a refactoring toward State rather than claiming that the original project already has the formal pattern.

---

## Improved design

```
```

```
                 Order
                   |
              Current State
                   |
        ┌──────────┼──────────┐
        ↓          ↓          ↓
     Pending    Prepared    Shipped
        |          |          |
        ↓          ↓          ↓
   Refund rule  Refund rule  Cancellation rule
```

The refund processing itself can remain separate from the state decision.

```
```

```
Order State
     ↓
Cancellation Decision
     ↓
Refund Service
     ↓
Payment/Refund processing
```

### Refactoring required

Affected areas:

- `Order` in `canteenapp/models.py` 
-  existing cancellation logic in `canteenapp/views.py` 
- `Refund` model 
-  payment-related functions 

The important improvement is to separate:

```
```

```
"Can this order be cancelled?"
```

from:

```
```

```
"How is the refund processed?"
```

### Benefit

-  Cancellation rules become easier to change. 
-  Refund processing isn't tightly coupled to order-status logic. 
-  Different cancellation policies can be introduced without rewriting the whole order system. 
-  The existing order-state workflow becomes more maintainable. 

---

# 4. Restaurant Availability Changes

## Existing design

The repository already has item availability functionality.

The `Item` model contains availability-related information, and restaurant functions such as:

- `restaurantadditem()` 
- `restaurantupdateitem()` 

allow restaurant-side item information and availability to be managed.

So the current design already supports a **basic availability concept**.

---

## New requirement

Availability needs to represent more realistic restaurant conditions.

For example:

```
```

```
Restaurant
   |
   +── Open
   +── Closed
   +── Temporarily unavailable
   +── Busy
```

A restaurant may become unavailable because:

-  restaurant is closed 
-  temporarily paused 
-  outside operating hours 
-  unable to accept new orders 

---

## Problem created

The existing item-level availability does not necessarily represent the **overall operational state of the restaurant**.

If availability logic is scattered throughout:

-  item handling 
-  order creation 
-  restaurant views 
-  checkout 

then every new availability condition requires changes in several places.

---

## Pattern/refactoring

### **State Pattern — Proposed**

This is another natural candidate for State.

Instead of representing restaurant availability through unrelated boolean checks, the restaurant can have a clear availability state.

Conceptually:

```
```

```
Restaurant
    |
    v
Availability State
    |
    +── Open
    +── Closed
    +── TemporarilyUnavailable
    +── Busy
```

Each state determines whether new orders can be accepted.

---

## Improved design

```
```

```
Customer places order
        |
        v
Check Restaurant State
        |
    ┌───┴────┐
    ↓        ↓
   Open    Closed
    |        |
    ↓        ↓
Accept    Reject
```

This makes the restaurant's operational state explicit rather than spreading conditions throughout the application.

### Refactoring required

Affected areas would include:

-  restaurant-related model structure in `canteenapp/models.py` 
- `restaurantadditem()` 
- `restaurantupdateitem()` 
-  order creation, especially `Order.create_order_from_cart()` 
-  any restaurant/order validation that currently checks availability 

The existing `Item.is_available` concept can remain for **item-level availability**, while restaurant availability becomes a separate concern.

For example:

```
```

```
Restaurant availability
        +
Item availability
        ↓
Can customer order?
```

### Benefit

-  Restaurant availability rules are centralized. 
-  New states can be added without modifying every order-related function. 
-  Restaurant state becomes easier to understand and test. 
-  Item availability and restaurant availability are no longer confused. 

---

# 5. Overall Evolution

The four requirements can be viewed together:

```
```

```
CURRENT SYSTEM
────────────────────────────────────────

Order
 ├── one DeliveryPerson
 ├── status choices
 ├── cancellation/refund
 └── notifications/events

Restaurant
 └── item availability

Payment
 ├── PhonePe
 └── PayU

Django Channels
 └── WebSocket consumers


                    ↓
              NEW REQUIREMENTS
                    ↓


IMPROVED DESIGN
────────────────────────────────────────

Order
 ├── Delivery assignment strategy
 │       └── multiple partners
 │
 ├── State-based order behaviour
 │
 ├── Cancellation decision
 │       └── Refund processing
 │
 └── Order status events
         ├── WebSocket observer
         ├── Push notification
         └── other notification handlers

Restaurant
 └── Availability State
       ├── Open
       ├── Closed
       └── Temporarily unavailable
```

---

# 6. Requirement-by-requirement evolution

| **New RequirementPattern Used/ProposedMain RefactoringBenefit** |                                   |                                                                                                                                                                   |                                                                              |
| --------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Multiple delivery partners**                                  | **Strategy — Proposed**           | Extract delivery-partner selection from `adminassignordertodelivery()`; redesign single `Order.delivery_person` relationship if multiple assignments are required | New assignment rules/partners can be added without changing core order logic |
| **Order-status notifications**                                  | **Observer — Extend existing**    | Separate order-status event publication from notification handling; extend existing Channels/notification mechanism                                               | Loose coupling and easy addition of new notification channels                |
| **Cancellation/refund**                                         | **State-based design — Proposed** | Separate cancellation eligibility from refund processing and use order state to determine behaviour                                                               | Easier to introduce different cancellation/refund rules                      |
| **Restaurant availability changes**                             | **State — Proposed**              | Separate restaurant operational state from existing item availability                                                                                             | Centralized, flexible restaurant availability management                     |

---

# Final Part 2 Summary

The important point is that **Part 2 is not about pretending the original project already contains all these patterns**.

The evolution is:

### 1. Multiple delivery partners

**Existing:** one `Order.delivery_person` + `adminassignordertodelivery()`

→ **Problem:** delivery selection becomes tightly coupled

→ **Proposed:** **Strategy**

→ **Result:** different delivery-partner selection algorithms can be introduced independently.

### 2. Order-status notifications

**Existing:** `adminupdateorderstatus()` + Django Channels consumers + Firebase

→ **Problem:** increasing notification logic can make order-status handling tightly coupled

→ **Extend:** **Observer**

→ **Result:** order-status changes become events that multiple notification mechanisms can observe.

### 3. Cancellation/refund

**Existing:** `Order` has cancellation status and the project already contains `Refund`

→ **Problem:** increasingly complex cancellation/refund rules

→ **Proposed:** stronger **State-based design**, separating cancellation decisions from refund processing

→ **Result:** cancellation policies can evolve without making the order logic unmanageable.

### 4. Restaurant availability

**Existing:** item-level availability through the restaurant/item functionality

→ **Problem:** item availability is not sufficient to model the restaurant's overall operational state

→ **Proposed:** **State**

→ **Result:** `Open`, `Closed`, `TemporarilyUnavailable`, etc. can be represented cleanly and checked consistently.

**Overall evolution:**

> **The existing project already provides a useful foundation through its order-status workflow and Observer-style notification mechanism. The new requirements expose coupling in delivery assignment, cancellation/refund handling and restaurant availability. Strategy can be introduced for flexible delivery-partner selection, while the existing Observer mechanism can be extended for notifications and State-based designs can make order cancellation and restaurant availability easier to maintain.**