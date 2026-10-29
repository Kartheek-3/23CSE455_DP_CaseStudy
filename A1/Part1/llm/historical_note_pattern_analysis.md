I inspected the repository source rather than treating the README as evidence. The important conclusion is that **this project does contain genuine pattern-like structures, but it does not contain a clean textbook implementation of many GoF patterns**.

For your assignment, I would be conservative: **do not claim Factory, Strategy, Adapter, Singleton, Repository, Command, or Template Method as confirmed patterns.** The strongest defensible pattern is **Observer**, while **State** is a strong possible/debatable pattern rather than a textbook State implementation.

[HarshavardhanVemali/campus-food-ordering on GitHub](https://github.com/HarshavardhanVemali/campus-food-ordering?utm_source=chatgpt.com)

# Part 1(b) — Design Pattern Analysis

## 1. Confirmed Pattern: Observer

### Pattern

**Observer Pattern — Confirmed**

### Where it occurs

The strongest evidence is the combination of:

- `canteenapp/views.py` 
- `canteenapp/consumers.py` 
-  Django Channels channel groups 
-  WebSocket consumers 

The project has multiple consumers that subscribe to channel groups and react when an event is sent to those groups.

### Important files/classes

**`canteenapp/views.py`**

`adminupdateorderstatus()` sends events to:

- `admin_group` 
- `restaurant_group` 
- `delivery_group` 

For example, after changing an order status, the function calls `channel_layer.group_send()` with event types such as `admin_all_order`, `restaurant_all_order`, `delivery_new_order`, and `delivery_delivered_order`. 

**`canteenapp/consumers.py`**

Relevant consumers include:

- `AdminOrderConsumer` 
- `RestaurantOrderConsumer` 
- `DeliveryOrderConsumer` 

For example, `AdminOrderConsumer` joins `admin_group` and has handlers such as:

```
```

```
admin_all_order()
admin_new_order()
admin_cancelled_order()
admin_delivered_order()
```

The consumer receives the event and sends updated order information to connected clients. 

Similarly, `RestaurantOrderConsumer` joins `restaurant_group` and reacts to:

```
```

```
restaurant_all_order()
restaurant_new_order()
restaurant_cancelled_order()
restaurant_delivered_order()
```

`DeliveryOrderConsumer` joins `delivery_group` and reacts to:

```
```

```
delivery_new_order()
delivery_delivered_order()
```

### Why this is reasonably Observer

The basic relationship is:

```
```

```
                 Order/status changes
                         |
                         v
                channel_layer.group_send()
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
      Admin group    Restaurant group  Delivery group
          |              |              |
          v              v              v
     AdminConsumer   RestaurantConsumer DeliveryConsumer
```

The code that changes the order does not directly call every connected client.

Instead, it publishes an event to a group, and the consumers that are subscribed to that group react to it.

That is strongly consistent with the **Observer / publish-subscribe idea**.

### Purpose in this application

Without this mechanism, every order-status change would require manually updating every relevant user interface.

Instead:

1.  Order changes. 
2.  Event is published. 
3.  Interested consumers receive it. 
4.  Consumers send updated data to their connected clients. 

This supports the project's **real-time order management**.

### Viva explanation

> "The project uses an Observer-like mechanism through Django Channels. When an order changes, the view publishes an event to a channel group. The corresponding WebSocket consumers listen to those groups and automatically send updated information to connected users. This avoids directly coupling the order-update function to every user interface."

**Confidence: HIGH**

---

# 2. Possible Pattern: State

## Pattern

**State Pattern — Possible / Debatable**

This project has a very strong **state-machine-like order workflow**, but I would **not call it a textbook State pattern**.

### Where

**`canteenapp/models.py`**

The `Order` model defines different status sets:

```
```

```
DELIVERY_STATUS_CHOICES
PICKUP_STATUS_CHOICES
DINING_STATUS_CHOICES
PAY_ON_DELIVERY
```

For delivery, for example:

```
```

```
pending
confirmed
prepared
shipped
delivered
cancelled
```

### More important evidence

**`canteenapp/views.py`**

There is an explicit:

```
```

```
get_status_index(delivery_type, status)
```

function.

It defines different status sequences depending on delivery type. 

Then `adminupdateorderstatus()` compares the current status and new status:

```
```

```
current_status_index = get_status_index(...)
new_status_index = get_status_index(...)

if new_status_index <= current_status_index:
    reject transition
```

This prevents an order from moving backwards through its workflow. 

There are also specific transition checks elsewhere. For example, `deliveryupdatetoshipped()` only allows an order to become `shipped` if it is currently `prepared`. 

### Why it resembles State

The behaviour of an order depends heavily on its current state.

For example:

```
```

```
Pending
   ↓
Confirmed
   ↓
Prepared
   ↓
Shipped
   ↓
Delivered
```

The permitted next state depends on the current state.

### Why it is NOT a confirmed textbook State pattern

A textbook State pattern would normally look something like:

```
```

```
Order
 └── currentState
       ├── PendingState
       ├── ConfirmedState
       ├── PreparedState
       └── DeliveredState
```

with separate state objects containing state-specific behaviour.

**This repository does not do that.**

Instead, it uses:

-  strings 
-  choice lists 
- `if/elif` 
-  status-index comparisons 

Therefore:

> **The project implements a state-driven workflow, but not a formal State design pattern.**

### Assignment classification

**Possible Pattern — State**

### Viva explanation

> "The Order entity has a state-based workflow, because its allowed transitions depend on its current status. However, the project does not implement separate State classes, so I would describe it as a state-machine-like implementation rather than a textbook State pattern."

This distinction will actually make your answer look **more technically accurate**.

---

# 3. Possible Pattern: Strategy

## Pattern

**Strategy Pattern — Possible / Weak**

There is some code that chooses different behaviour based on `delivery_type`.

### Evidence

In `Order.get_status_display()`:

```
```

```
if self.delivery_type == 'delivery':
    status_choices = DELIVERY_STATUS_CHOICES
elif self.delivery_type == 'pickup':
    status_choices = PICKUP_STATUS_CHOICES
elif self.delivery_type == 'dining':
    status_choices = DINING_STATUS_CHOICES
```

There is also similar branching in `Order.add_additional_charges()`:

```
```

```
delivery → Delivery + Packaging + GST + ...
dining   → Service + GST + ...
pickup   → Packaging + GST + ...
```

### Why it resembles Strategy

The application has different algorithms/rules for different order types.

Conceptually:

```
```

```
Order type
   |
   +-- Delivery → delivery charges/status workflow
   |
   +-- Pickup → pickup charges/status workflow
   |
   +-- Dining → dining charges/status workflow
```

### Why it is NOT confirmed

The project does not create interchangeable strategy objects such as:

```
```

```
DeliveryStrategy
PickupStrategy
DiningStrategy
```

Instead, it uses conditional statements.

So I would **not submit this as a confirmed Strategy pattern**.

### Classification

**Possible Pattern — Strategy-like conditional behaviour**

This could become an excellent Strategy-pattern candidate during later refactoring, but that's outside Part 1(b).

---

# 4. Possible Pattern: Facade

## Pattern

**Facade — Possible / Weak**

There are several large view functions that coordinate multiple subsystems.

The best example is the payment/order flow.

### `initiate_payment()`

**`canteenapp/views.py`**

The PhonePe payment flow performs several operations:

-  reads request data 
-  validates delivery information 
-  obtains cart items 
-  checks stock 
-  calculates prices 
-  determines additional charges 
-  communicates with PhonePe 
-  verifies payment 
-  updates `Payment` 
-  creates `Order` 
-  creates notifications 
-  sends Channels events 

The payment callback eventually creates the order and notifications after successful verification. 

### Why it resembles Facade

From the application's perspective, a single view provides a relatively simple entry point into several underlying components:

```
```

```
Payment view
    |
    +-- Cart
    +-- Prices
    +-- Payment
    +-- Order
    +-- Notifications
    +-- Channels
    +-- External payment gateway
```

### Why not confirmed

There is no dedicated class such as:

```
```

```
CheckoutFacade
PaymentFacade
OrderFacade
```

The functionality is largely concentrated in a large view function.

Therefore:

**Possible Facade-like orchestration, not a confirmed Facade implementation.**

---

# 5. Possible Pattern: Singleton

## Pattern

**Singleton — Possible, but I would NOT claim it**

There is a module-level PhonePe client:

**`canteenapp/views.py`**

```
```

```
phonepe_client = PhonePePaymentClient(...)
```

It is initialized once at module level and subsequently used by payment functions. 

### Why it resembles Singleton

There is effectively one module-level instance of the payment client during the application's process.

### Why it isn't a proper Singleton

There is no:

-  Singleton class 
-  private constructor 
- `getInstance()` 
-  controlled instance creation 

It is simply a module-level object.

So:

> **Do not list Singleton as a confirmed pattern.**

At most:

**Possible implementation-level singleton-like object.**

---

# 6. Adapter Pattern — NOT FOUND

This one is important because the project uses external payment systems.

The repository uses:

-  PhonePe SDK 
-  PayU 
-  Firebase 

For example, the code directly constructs a `PhonePePaymentClient` and directly calls its methods. 

PayU is also called directly from the view logic. 

### Why this is NOT an Adapter

A proper Adapter would look conceptually like:

```
```

```
PaymentGateway
      ↑
      |
PaymentAdapter
   /        \
PayU       PhonePe
```

with a common application-facing interface.

That abstraction is not present.

Therefore:

**Adapter — Not found as a confirmed pattern.**

---

# 7. Factory Pattern — NOT FOUND

I did not find a dedicated factory responsible for creating different objects based on a type.

There are conditionals such as:

```
```

```
delivery
pickup
dining
```

but these select behaviour/data rather than instantiate interchangeable product objects.

Therefore:

**Factory — Not found.**

Do not call `Order()` or `Payment()` model creation a Factory pattern. Those are ordinary object/model creation operations.

---

# 8. Command Pattern — NOT FOUND

There are many Django view functions:

```
```

```
adminupdateorderstatus()
adminassignordertodelivery()
restaurantadditem()
initiate_payment()
...
```

But a Django view/function is **not automatically a Command pattern**.

There are no command objects encapsulating requests as objects, command interfaces, invokers, undo operations, etc.

Therefore:

**Command — Not found.**

---

# 9. Repository Pattern — NOT FOUND

The project uses Django ORM directly:

```
```

```
Order.objects.get(...)
Order.objects.filter(...)
Item.objects.filter(...)
```

This is normal Django ORM usage.

There is no abstraction such as:

```
```

```
OrderRepository
ItemRepository
PaymentRepository
```

Therefore:

**Repository — Not found.**

---

# 10. Template Method — NOT CONFIRMED

There are Django model `save()` overrides and WebSocket consumer subclasses.

For example:

```
```

```
class MenuConsumer(AsyncWebsocketConsumer)
class AdminOrderConsumer(AsyncWebsocketConsumer)
class RestaurantOrderConsumer(AsyncWebsocketConsumer)
```

However, merely inheriting from a Django/Channels framework class does **not** make the implementation a Template Method pattern.

Therefore:

**Template Method — Not found as an intentional application-level pattern.**

---

# 11. The five required food-delivery features

Now let's connect the Part 1(a) requirements directly to the source.

---

## A. Restaurant Management

### Important model

**`canteenapp/models.py`**

```
```

```
class Restaurant(CustomUser)
```

It contains:

- `restaurant_name` 
- `restaurant_image` 
- `restaurant_description` 

Food items are connected to restaurants through:

```
```

```
Item.resturant = ForeignKey(Restaurant)
```

### Important functions

**`canteenapp/views.py`**

- `restaurantadditem()` 
- `restaurantgetallitems()` 
- `restaurantdeleteitem()` 
- `restaurantupdateitem()` 
- `restaurantupdateitemimage()` 

For example, `restaurantadditem()` creates an `Item` associated with the logged-in restaurant. 

`restaurantupdateitem()` allows the restaurant to update item information and availability. 

### What to say in viva

> "Restaurant management is represented by the Restaurant model and restaurant-specific views. Restaurants can manage their menu items, prices, descriptions, images, preparation time and availability."

---

# B. Customer Orders

### Main model

**`canteenapp/models.py`**

```
```

```
Order
OrderItem
Cart
```

`Order` is connected to:

-  customer 
-  payment 
-  items 
-  restaurant 
-  delivery person 

`OrderItem` stores:

-  order 
-  item 
-  quantity 
-  price at purchase 
-  total price 

### Important function

`Order.create_order_from_cart()`

This method:

1.  obtains cart items 
2.  checks item availability 
3.  checks stock 
4.  reduces stock 
5.  creates `OrderItem` 
6.  calculates price 
7.  removes cart items 
8.  calculates additional charges 

This is one of the **most important functions to study**.

### Viva explanation

> "The customer order is represented by Order, while individual food items inside the order are represented by OrderItem. The create\_order\_from\_cart method converts the customer's cart into an actual order while checking stock and calculating the total."

---

# C. Delivery Assignment

### Main model relationship

**`Order.delivery_person`**

```
```

```
delivery_person = ForeignKey(
    DeliveryPerson,
    ...
)
```

### Main function

**`adminassignordertodelivery()`**

**`canteenapp/views.py`**

The function:

1.  receives order ID 
2.  receives delivery-person email 
3.  retrieves the delivery person 
4.  retrieves the order 
5.  assigns the delivery person 
6.  changes status to `shipped` 
7.  sends a Channels event specifically to that delivery person's group 

The relevant relationship is therefore:

```
```

```
Admin
  |
  | assigns
  v
Order ──────> DeliveryPerson
```

### Viva explanation

> "The admin assigns a delivery person to an order through adminassignordertodelivery(). The Order model stores the assigned DeliveryPerson using a foreign-key relationship."

---

# D. Payment

### Main model

**`Payment`**

The model stores:

-  payment method 
-  user 
-  amount 
-  transaction ID 
-  order ID 
-  status 
-  payment date 
-  response information 
-  PhonePe transaction ID 

Payment statuses include:

```
```

```
pending
success
failed
```

### Payment systems

The project directly integrates:

- **PhonePe** 
- **PayU** 

The PhonePe client is initialized in `views.py`, and `initiate_payment()` handles the PhonePe payment process. 

The callback verifies the response, updates the `Payment`, and then creates the `Order`. 

PayU payment initiation and verification are also present. 

### Viva explanation

> "The Payment model stores the transaction details and payment status. The project integrates external gateways such as PhonePe and PayU. After successful payment verification, the system associates the payment with the order and proceeds with order creation."

---

# E. Order Tracking

This is one of the strongest parts of the project.

### Status definitions

**`Order`** **in** **`models.py`**

For delivery:

```
```

```
pending
confirmed
prepared
shipped
delivered
cancelled
```

For pickup and dining there are separate workflows. 

### Transition control

`get_status_index()` defines the order of states. `adminupdateorderstatus()` prevents the order from moving backwards. 

### Real-time updates

When status changes, the application sends WebSocket events to relevant groups. 

Consumers then respond:

```
```

```
AdminOrderConsumer
RestaurantOrderConsumer
DeliveryOrderConsumer
```

### Push notification

`USER_NOTIFICATION_MESSAGES` maps statuses such as:

```
```

```
pending
confirmed
prepared
shipped
delivered
cancelled
```

to user notification messages. `adminupdateorderstatus()` creates a `UserNotification` and invokes `send_notification_helper()`. 

Firebase notification sending is implemented using Firebase Admin SDK and `messaging.send_multicast()`. 

### Viva explanation

> "Order tracking combines status-based order progression with real-time WebSocket updates. When an order status changes, the system publishes an event through Django Channels, and the relevant admin, restaurant or delivery consumer sends the updated order information to connected clients."

---

# 12. Pattern classification table

This is the table I would use for your actual assignment.

| PatternClassificationEvidence |                                      |                                                                      |
| ----------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| **Observer**                  | 🟢 **Confirmed**                     | Django Channels groups + consumers reacting to published events      |
| **State**                     | 🟡 **Possible / strong resemblance** | Order status workflow + `get_status_index()` + transition validation |
| **Strategy**                  | 🟡 **Possible / weak**               | Different behaviour selected using `delivery_type`                   |
| **Facade**                    | 🟡 **Possible / weak**               | Large payment/order orchestration functions                          |
| **Singleton**                 | 🟡 **Possible / not recommended**    | Module-level `phonepe_client`                                        |
| **Adapter**                   | 🔴 Not found                         | No common gateway adapter abstraction                                |
| **Factory**                   | 🔴 Not found                         | No object-creation factory                                           |
| **Command**                   | 🔴 Not found                         | No command objects                                                   |
| **Repository**                | 🔴 Not found                         | Direct Django ORM                                                    |
| **Template Method**           | 🔴 Not confirmed                     | Framework inheritance isn't enough                                   |

---

# 13. The strongest pattern for your B.Tech viva

## 🥇 Observer — easiest to defend

This is your safest pattern.

You can physically point to:

```
```

```
views.py
   ↓
channel_layer.group_send()
   ↓
consumers.py
   ↓
AdminOrderConsumer
RestaurantOrderConsumer
DeliveryOrderConsumer
```

And explain exactly what happens.

There is little room for an examiner to say:

> "You are forcing the pattern."

Because the event-driven publisher/subscriber relationship is genuinely present in the code. 

---

## 🥈 State — easiest conceptual pattern

The order workflow is extremely easy to demonstrate:

```
```

```
Pending
   ↓
Confirmed
   ↓
Prepared
   ↓
Shipped
   ↓
Delivered
```

and the code explicitly prevents backward transitions. 

But say **"state-based workflow"** or **"State-like implementation"**, not "formal State pattern."

That distinction is important.

---

# 14. Files you should study most carefully

If you're preparing for the assignment/viva, don't try to understand the entire 5,000-line `views.py`.

Focus on these.

### 1. `canteenapp/models.py` ⭐⭐⭐⭐⭐

Most important classes:

```
```

```
Restaurant
Item
Cart
Payment
Refund
Order
OrderItem
OrderAdditionalCharges
UserNotification
DeliveryPersonNotification
RestaurantNotification
```

Especially study:

```
```

```
Order.create_order_from_cart()
Order.cancel_order()
Order.get_status_display()
Order.add_additional_charges()
Order.save()
```

---

### 2. `canteenapp/views.py` ⭐⭐⭐⭐⭐

Focus on:

```
```

```
adminassignordertodelivery()
adminupdateorderstatus()
deliveryupdatetoshipped()
restaurantadditem()
restaurantupdateitem()
initiate_payment()
payment_success()
```

These cover almost your entire assignment domain. 

---

### 3. `canteenapp/consumers.py` ⭐⭐⭐⭐⭐

Focus on:

```
```

```
AdminOrderConsumer
RestaurantOrderConsumer
DeliveryOrderConsumer
```

and their event handlers:

```
```

```
admin_all_order()
admin_new_order()
restaurant_all_order()
restaurant_new_order()
delivery_new_order()
delivery_delivered_order()
```

This is the most important file for explaining **Observer**.

---

### 4. `canteenapp/firebase.py` ⭐⭐⭐

Understand:

```
```

```
send_notification()
```

and how it uses Firebase messaging to send notifications to device tokens. 

---

# Final Part 1(b) Summary

## 1. Confirmed design patterns

### **Observer — Confirmed**

Implemented through the project's Django Channels/WebSocket event mechanism.

```
```

```
Order update
     ↓
group_send()
     ↓
Channel group
     ↓
Consumer
     ↓
Connected users
```

This is the **strongest genuine pattern** in the repository.

---

## 2. Possible/debatable patterns

### **State — Strong possible**

The project has a genuine state-machine-like order workflow, but does not use separate State objects/classes.

### **Strategy — Possible**

Different order types select different status/charge behaviour, but this is implemented using conditionals rather than interchangeable strategy objects.

### **Facade — Possible**

Large payment/order functions coordinate multiple subsystems, but there is no dedicated Facade abstraction.

### **Singleton — Weak possibility**

The module-level PhonePe client behaves like a single shared instance, but there is no actual Singleton implementation.

---

## 3. Strongest pattern(s) for viva

**1. Observer — best and safest**

**2. State — easiest to understand, but call it a state-based workflow rather than a formal State pattern**

These two give you the strongest evidence.

---

## 4. Files/classes to study most carefully

```
```

```
canteenapp/models.py
    ├── Restaurant
    ├── Item
    ├── Payment
    ├── Refund
    ├── Order
    ├── OrderItem
    └── Notifications

canteenapp/views.py
    ├── adminassignordertodelivery()
    ├── adminupdateorderstatus()
    ├── deliveryupdatetoshipped()
    ├── restaurantadditem()
    ├── restaurantupdateitem()
    ├── initiate_payment()
    └── payment_success()

canteenapp/consumers.py
    ├── AdminOrderConsumer
    ├── RestaurantOrderConsumer
    └── DeliveryOrderConsumer

canteenapp/firebase.py
    └── send_notification()
```

---

## 5. Overall design-pattern structure

The project **does not appear to have been deliberately designed around a collection of formal GoF patterns**. Instead, it is a functional Django application where some naturally occurring structures resemble established patterns.

The clearest architecture is:

```
```

```
                 Django Food Delivery System
                           │
          ┌────────────────┼────────────────┐
          │                │                │
      Restaurant        Orders           Payment
          │                │                │
        Item              Order        PayU/PhonePe
                           │
                    Order Status
                           │
                           ▼
                 Channel Layer / Events
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
           Admin       Restaurant     Delivery
         Consumer       Consumer       Consumer
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    Real-time updates
```

So the **main genuine design-pattern story in Part 1(b)** is:

> **The application uses an Observer-style event mechanism for real-time communication, while its order-processing logic has a strong state-machine-like structure. Other patterns such as Strategy, Facade and Singleton can be argued as similarities, but the source code does not provide enough abstraction to confidently call them formal design-pattern implementations.**

That is the version I would recommend submitting because it is **specific to the actual repository, technically defensible, and much safer in a viva than artificially identifying 7–8 patterns that aren't really there.**