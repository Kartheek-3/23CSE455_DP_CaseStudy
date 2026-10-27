<!--
Raw LLM output.
Tool: ChatGPT (chatgpt.com, logged-out free tier; the interface shows only "ChatGPT", no model name). Date: 2026-10-11.
Prompt: prompts/M_Kumar_prompt_01.txt, pasted unchanged into a new chat.
Run by: Dilip Kumar Reddy's session - the browser was driven by Claude Code on the team's behalf because members
were unavailable. M Kumar is the owner of the analysed topic (CH02), not the person who typed the prompt.
Capture: text of the rendered answer converted to Markdown; code-fence language labels re-attached; bold/italic
markers inside paragraphs may be missing; LaTeX formulas taken from the page's TeX annotations. Content otherwise unchanged.
-->

## 1. Code smells and defects that make CH02 risky

| File:line | Defect or code smell | Risk for CH02 |
| --- | --- | --- |
| `CancelBooking.ts:11-14` | Client-supplied `status` is part of the input. | Callers can potentially request arbitrary statuses unless validation restricts them. The use case should own the transition to `CANCELLED`. |
| `CancelBooking.ts:26-27` | No actor identity or role is included in the input. | Cannot enforce that only the booking's rider or assigned driver may cancel it. |
| `CancelBooking.ts:34-46` | Cancellation logic checks only `CONFIRMED`; it does not reject `COMPLETED`, `REJECTED`, `EXPIRED`, or `CANCELLED`. | Invalid state transitions are possible. `PENDING` is allowed, but eligibility is not explicitly defined. |
| `CancelBooking.ts:34-46` | The cutoff is implemented inline using manual IST offset arithmetic. | Time-zone conversion and boundary errors are likely. The code also rejects late cancellation rather than charging the required penalty. |
| `CancelBooking.ts:43-45` | The cutoff check applies to every confirmed booking without distinguishing rider from driver. | Driver cancellations may be incorrectly blocked, although they must be free. |
| `CancelBooking.ts:48-54` | Status update and notification are separate operations; notification targets only the driver. | A rider may not be notified when the driver cancels. Failures can leave the status changed without a notification, and concurrent requests can race. |
| `CancelBooking.ts:48-51` | The update does not atomically verify the booking's current status. | Two concurrent cancellation requests, or a cancellation racing with completion, can both pass stale checks. |
| `UpdateBookingstatus.ts:26-64` | A generic status-update use case can modify booking status and has separate notification logic. | Other code paths may bypass cancellation eligibility, authorization, or penalty rules. |
| `UpdateBookingstatus.ts:55-64` | Notification promises are not awaited. | Notification failures may go unnoticed, and execution ordering is not guaranteed. |
| `CronScheduler.ts:19-31` | Expiration uses direct model access and saves a fetched document after reading its status. | Expiration can race with cancellation and overwrite a newer state. |
| `BookingController.ts:193-201` | The controller forces `CANCELLED`, which is good, but forwards validated request data without showing authenticated actor identity. | Authentication middleware may exist elsewhere, but the shown flow does not demonstrate ownership enforcement. |

Important business-rule distinction: the 9:00 PM IST cutoff is the deadline for a free rider cancellation of a confirmed ride, not a deadline after which cancellation is forbidden. A late cancellation should succeed and incur the penalty.

The penalty should be calculated as:

$$\text{fee}=\min\text{?}$$

More precisely, the required rule is:

$$\text{fee}=\max(0.10\times\text{estimatedFare},\,50)$$

for a rider cancelling a `CONFIRMED` ride after the cutoff; otherwise the fee is zero. Driver cancellations are always free. The cutoff is 9:00 PM IST on the calendar day before the ride, evaluated against the current instant.

## 2. Design patterns to introduce

Use a Policy/Strategy pattern for cancellation rules, with a dedicated cancellation use case coordinating authorization, eligibility, fee calculation, persistence, and notification.

| Pattern / role | Proposed class or interface | Responsibility |
| --- | --- | --- |
| Application orchestrator | `CancelBookingUseCase` | Coordinates the cancellation workflow. |
| Strategy interface | `ICancellationPolicy` | Defines who may cancel and how the fee is calculated. |
| Concrete strategy | `RiderCancellationPolicy` | Enforces rider ownership and calculates the late-cancellation fee. |
| Concrete strategy | `DriverCancellationPolicy` | Enforces assigned-driver ownership and always returns a zero fee. |
| Policy selector | `CancellationPolicyFactory` | Selects the policy using the authenticated actor's role. |
| Domain service | `CancellationEligibilityPolicy` | Allows only `PENDING` and `CONFIRMED` bookings and calculates the IST cutoff. |
| Repository abstraction | `IBookingRepository` | Loads bookings and atomically persists valid cancellations. |
| Notification abstraction | `INotificationService` | Notifies the relevant rider and/or driver after cancellation. |
| Optional reliability component | `BookingEventPublisher` / transactional outbox | Ensures cancellation notifications can be retried if delivery fails. |

The main pattern is Strategy, rather than replacing the existing application-layer use case with a large State-pattern hierarchy. Booking statuses are already represented by an enum, and the new business variation is primarily who cancels and what fee applies.

A separate eligibility policy is useful because state-transition rules and actor-specific fee rules are different concerns. The factory is only necessary if the application supports multiple cancellation policies; for two fixed roles, a simple injected policy registry is also sufficient.

### Proposed flow

`BookingController`

Gets authenticated actor identity and booking ID

`CancelBookingUseCase`

Load booking → authorize ownership → check status

`RiderCancellationPolicy`

Late confirmed cancellation: max(10% of estimated fare, ₹50)

`DriverCancellationPolicy`

Assigned driver only; fee ₹0

`IBookingRepository`

Atomically set `CANCELLED` and record the fee

`INotificationService`

Notify the other party; retry delivery where necessary

## 3. Effect on existing patterns

| Existing pattern / component | Effect | Reason |
| --- | --- | --- |
| Dependency Injection (`tsyringe`) | Preserved, extended | Register and inject the new policies and factory. |
| Repository pattern (`IBookingRepository`) | Preserved, extended | Add an atomic conditional cancellation operation and persist the cancellation fee. |
| Use-case / application-service pattern | Preserved, modified | Refactor `CancelBookingInputUseCase` into `CancelBookingUseCase`, moving rules out of the orchestrator. |
| Strategy pattern | Introduced | Encapsulate rider and driver cancellation behavior separately. |
| DTO validation (Zod) | Preserved, modified | Accept the booking ID and optional reason; derive actor identity and cancellation status server-side. |
| Notification service abstraction | Preserved, extended | Notify the rider when the driver cancels, and the driver when the rider cancels. |
| State machine / status enum | Preserved, extended | Keep `BookingStatus`; enforce legal cancellation transitions explicitly rather than introducing a class per status. |
| Existing generic driver status-update use case | Preserved, modified | Prevent it from becoming an alternative route around cancellation rules; route cancellation through the dedicated use case. |
| Cron scheduler | Preserved, modified | Use conditional state transitions for expiry so a concurrent cancellation is not overwritten. |
| Direct model access in infrastructure | Preserved where appropriate | The scheduler may use Mongoose, but application cancellation logic should remain repository-driven. |
| Inline cutoff calculation | Replaced | Use a timezone-aware date calculation instead of manual offset arithmetic. |

## 4. Key TypeScript changes

The following are the new or changed parts only. They illustrate the intended changes; adapt the repository and notification signatures to the existing project interfaces.

### A. Make the authenticated actor explicit

`CancelBooking.ts` — replace the input interface

```ts
export type CancellationActorRole = "RIDER" | "DRIVER";

interface CancelBookingInput {
  bookingId: string;
  actorId: string; // From authenticated request context
  actorRole: CancellationActorRole;
  reason?: string;
}
```

Do not accept `status` or `cancellationFee` from the client. The server determines both.

`BookingController.ts` — changed execution

```ts
await this._cancelBookingUseCase.execute({
  bookingId: req.params.bookingId,
  actorId: req.user.id,
  actorRole: req.user.role === "DRIVER" ? "DRIVER" : "RIDER",
  reason: validatedData.reason,
});
```

`req.user` is illustrative; use the project's actual authentication type and role mapping. Reject unsupported roles rather than treating every non-driver as a rider. Validate the booking ID and optional reason through Zod.

### B. Introduce cancellation policies

New: `domain/policies/ICancellationPolicy.ts`

```ts
export interface ICancellationPolicy {
  authorize(booking: Booking, actorId: string): void;

  calculateFee(booking: Booking, now: Date): number;
}
```

New: `domain/policies/RiderCancellationPolicy.ts`

```ts
import { DateTime } from "luxon";

export class RiderCancellationPolicy
  implements ICancellationPolicy
{
  authorize(booking: Booking, actorId: string): void {
    if (booking.userId.toString() !== actorId) {
      throw new AuthError(
        "Only the booking's rider may cancel it.",
        HTTP_STATUS_CODES.FORBIDDEN
      );
    }
  }

  calculateFee(booking: Booking, now: Date): number {
    if (booking.status !== BookingStatus.CONFIRMED) {
      return 0;
    }

    const rideDate = DateTime
      .fromJSDate(new Date(booking.startDate))
      .setZone("Asia/Kolkata");

    const cutoff = rideDate
      .minus({ days: 1 })
      .set({ hour: 21, minute: 0, second: 0, millisecond: 0 });

    if (!cutoff.isValid) {
      throw new Error("Invalid ride date");
    }

    if (DateTime.fromJSDate(now).toMillis() <=
        cutoff.toMillis()) {
      return 0;
    }

    return Math.max(booking.estimatedFare * 0.10, 50);
  }
}
```

Use Luxon as a timezone-aware date library if the project does not already have an equivalent. Its `Asia/Kolkata` zone avoids manual IST offset arithmetic.

New: `domain/policies/DriverCancellationPolicy.ts`

```ts
export class DriverCancellationPolicy
  implements ICancellationPolicy
{
  authorize(booking: Booking, actorId: string): void {
    if (
      !booking.driverId ||
      booking.driverId.toString() !== actorId
    ) {
      throw new AuthError(
        "Only the assigned driver may cancel this ride.",
        HTTP_STATUS_CODES.FORBIDDEN
      );
    }
  }

  calculateFee(): number {
    return 0;
  }
}
```

The factory selects one of these policies from the authenticated actor role.

### C. Enforce legal transitions and atomic persistence

`Booking.ts` — add a persisted fee field

```ts
// Add to the Booking model/interface and Mongoose schema.
cancellationFee: {
  type: Number,
  default: 0,
  min: 0,
},
```

If the application needs actual payment collection or refunds, a recorded fee alone is not a Stripe charge; payment processing should be handled separately and idempotently.

`IBookingRepository.ts` — add an atomic operation

```ts
cancelIfCancellable(
  bookingId: string,
  actorId: string,
  actorRole: CancellationActorRole,
  cancellationFee: number,
  reason?: string
): Promise<Booking | null>;
```

The Mongoose implementation should perform a single conditional update that verifies:

- The booking ID matches.
- The status is `PENDING` or `CONFIRMED`.
- `userId` matches `actorId` for a rider, or `driverId` matches `actorId` for a driver.

It should set `status: CANCELLED`, `cancellationFee`, and the optional reason in the same operation. Return `null` if the condition fails, and translate that result into an appropriate conflict or authorization error. Do not rely only on an earlier read to enforce ownership or eligibility.

### D. Refactor the use case

`CancelBooking.ts` — changed orchestration

```ts
async execute(input: CancelBookingInput): Promise<void> {
  const booking = await this._bookingRepo.findBookingById(
    input.bookingId
  );

  if (!booking) {
    throw new AuthError(
      ERROR_MESSAGES.BOOKING_NOT_FOUND,
      HTTP_STATUS_CODES.NOT_FOUND
    );
  }

  if (
    booking.status !== BookingStatus.PENDING &&
    booking.status !== BookingStatus.CONFIRMED
  ) {
    throw new AuthError(
      "Only pending or confirmed rides can be cancelled.",
      HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  const policy = this._policyFactory.get(input.actorRole);

  policy.authorize(booking, input.actorId);

  const cancellationFee = policy.calculateFee(booking, new Date());

  const cancelled = await this._bookingRepo.cancelIfCancellable(
    input.bookingId,
    input.actorId,
    input.actorRole,
    cancellationFee,
    input.reason
  );

  if (!cancelled) {
    throw new AuthError(
      "Booking changed or is no longer cancellable.",
      HTTP_STATUS_CODES.CONFLICT
    );
  }

  // Notify the other party using the existing notification abstraction.
  await this._notificationService.cancelBookingNotification(
    input.actorRole === "RIDER"
      ? cancelled.driverId!.toString()
      : cancelled.userId.toString(),
    {
      status: BookingStatus.CANCELLED,
      reason: input.reason ?? "",
      startDate: cancelled.startDate,
      bookingId: input.bookingId,
      cancellationFee,
    }
  );
}
```

The example assumes a policy factory, an atomic repository method, and a notification payload extended with `cancellationFee`. Handle a missing driver on rider cancellation without dereferencing `driverId!`, and notify the rider through the appropriate existing notification method when the driver cancels.

Final implementation checks:

- A pending ride can be cancelled for free by its owner.
- A confirmed ride cancelled by its rider at or before 9:00 PM IST on the previous day is free.
- A confirmed ride cancelled by its rider after that cutoff incurs `max(10% of estimated fare, ₹50)`.
- The assigned driver can cancel a pending or confirmed ride at any time, without a fee, and the rider is notified.
- Unrelated users cannot cancel the booking, and completed or otherwise ineligible rides cannot be cancelled.
- Concurrent cancellation, completion, and expiry operations cannot overwrite one another's valid state transitions.
