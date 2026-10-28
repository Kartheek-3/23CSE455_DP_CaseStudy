# 🎨 UI/UX Upgrade Plan — Smart Parking Reservation System

> Based on reference screenshots in the `uiux/` folder

---

## 📸 Screenshot Analysis Summary

| Screenshot | Shows | Key Design Elements |
|---|---|---|
| **Screenshot 1** (124756) | Home / Search → Booking Info → Slot Grid | Dark theme, yellow accents, purple CTAs, car icons in slots, floor tabs |
| **Screenshot 2** (124821) | Add Details → Payment → Parking Ticket (QR) | Light forms, yellow header card, purple buttons, QR ticket |
| **Screenshot 3** (124839) | Parking Timer (countdown) | Circular purple progress ring, clean card, "Expand Parking Time" CTA |
| **Screenshot 4** (124858) | My Parkings — Ongoing / Completed / Cancelled tabs | Yellow tab pills, status badges (Active/New/Completed), expandable detail cards, bottom nav bar |

---

## 🔄 Current State vs Target Design

### What We Have Now
- **Light theme only** — plain `bg-slate-50` / white cards
- **Color palette**: slate + green accents — functional but generic
- **Simple card layouts** — no visual depth, no animations
- **Basic reservation list** — flat cards, no tabs/filtering
- **Slot grid** — colored borders (green/red) with text labels
- **No parking timer** or countdown feature
- **No QR ticket** generation
- **Top navbar only** — no bottom navigation option
- **No vehicle type selection** in booking flow
- **No duration picker** — just start/end datetime inputs

### What The Screenshots Show
- **Dark theme (user pages)** — deep black/charcoal backgrounds
- **Color palette**: Black + Yellow (`#FFD700`) + Purple/Violet (`#7C3AED`) — premium feel
- **Rich slot visuals** — car illustrations inside each slot cell, "ENTRY" markers
- **Floor-based navigation** — G Floor / 1st Floor / 2nd Floor / 3rd Floor tabs
- **Circular duration picker** — visual hour selector (semicircle dial)
- **Vehicle type toggle** — Two Wheeler / Four Wheeler pill buttons
- **Time slider** — horizontal scrollable time picker
- **Reservation tabs** — Ongoing / Completed / Cancelled with yellow active pill
- **Status badges** — Active (green), New (green), Completed (green bordered)
- **Expandable reservation cards** — showing full details (Parking Area, Vehicle, Duration, Slot, Date, Time)
- **QR Code parking ticket** — scannable ticket with all reservation details
- **Parking timer** — large circular countdown with purple progress ring
- **Purple CTA buttons** — "Next", "Checkout", "Pay Now", "Start Navigation", "Cancel Now!"
- **Bottom navigation bar** — Home, Favorites, Bookings, Profile icons

---

## 🛠️ Upgrade Plan — Page by Page

---

### Phase 1: Design System & Global Theme

**Files to modify:**
- `src/app/globals.css`
- `src/app/layout.jsx`

**Changes:**
1. **New color palette CSS variables:**
   - `--bg-primary`: `#0D0D0D` (near-black)
   - `--bg-card`: `#1A1A2E` (dark card)
   - `--bg-card-light`: `#FFFFFF` (for light-mode forms)
   - `--accent-yellow`: `#FFD700` (golden yellow)
   - `--accent-purple`: `#7C3AED` (vivid violet)
   - `--accent-purple-hover`: `#6D28D9`
   - `--text-primary`: `#FFFFFF`
   - `--text-secondary`: `#9CA3AF`
   - `--status-active`: `#22C55E`
   - `--status-cancelled`: `#EF4444`
   - `--status-completed`: `#22C55E` (bordered style)

2. **Typography**: Keep Inter but increase font weights, use larger heading sizes

3. **Global button styles**: All primary CTAs → purple gradient with rounded-full shape

4. **Card styles**: Dark cards with subtle border (`border-slate-700/30`), slight `backdrop-blur`

---

### Phase 2: Navigation Overhaul

**Files to modify:**
- `src/components/Navbar.jsx` (top bar redesign)
- `src/components/BottomNav.jsx` **[NEW]**

**Changes:**
1. **Top Navbar** → slimmer, dark glass-morphism style, location indicator on left, notification bell on right
2. **Bottom Navigation Bar** **[NEW]** → 4 icons:
   - 🏠 Home (dashboard)
   - ❤️ Favorites (saved parking areas — placeholder for now)
   - 📋 My Bookings (reservations)
   - 👤 Profile
   - Active icon highlighted with purple fill
   - Only shown for logged-in users on non-admin pages
   - Sticky at bottom on mobile, hidden on desktop (keep top nav for desktop)

---

### Phase 3: User Dashboard (Find Parking)

**File:** `src/app/dashboard/user/page.jsx`

**Changes:**
1. **Hero heading** → "Find Your Parking Space" in bold white on dark background
2. **Search bar** → rounded pill shape with yellow/purple search icon button
3. **Parking area cards** → dark cards with:
   - Thumbnail image (placeholder or generated)
   - Price badge (yellow pill: `$5/hours`)
   - Distance indicator (e.g., "1.4km, 5min away" — dummy for now)
   - Area name + address below
   - Navigation arrow icon
4. **Horizontal scrollable** card layout on mobile (carousel-style)

---

### Phase 4: Parking Area Detail & Booking Flow

**File:** `src/app/parking/[id]/page.jsx`

**Major Changes — split into a multi-step booking flow:**

#### Step 1: Select Further Information (new screen/view)
- **Vehicle Type selector**: "Two Wheeler" / "Four Wheeler" pill toggle (yellow active state)
- **Time Picker**: Replace `datetime-local` inputs with:
  - Horizontal scrollable time bubbles (12PM, 1PM, 2PM…) with purple active indicator
  - OR keep datetime inputs but styled with the new theme
- **Duration Picker**: Semicircular/circular dial showing hours (1h–6h), with:
  - Center display: "4 Hours" (large number)
  - Below: calculated time range "03:00PM to 07:00PM"
  - Total Amount display: "$20" (if pricing is available)
- **"Next" button** → purple, full-width, rounded

#### Step 2: Slot Selection Grid (current grid, redesigned)
- **Floor tabs** at top: "G Floor", "1st Floor", "2nd Floor", "3rd Floor" → yellow active pill
  - (Map to existing slot grouping or slot number prefix)
- **Section headers**: "A & B Slots" with left/right arrows for pagination
- **"ENTRY"** marker at top of grid
- **Slot cells**: Dark background with:
  - Car illustration (SVG icon) inside each cell
  - Slot label: "A 01", "B 03" etc.
  - Available → normal car icon, clickable
  - Occupied → dimmed/red tint, not clickable
  - Selected → yellow/purple highlight border + "Selected" label
- **"Next" button** → purple, full-width

#### Step 3: Add Details (new step — booking form)
- **Full Name** input (pre-filled from profile)
- **Vehicle Number** input (new field — text input)
- **Mobile Number** input (with country flag selector — visual only)
- **Summary sidebar/section**:
  - $/hour, Hours, Place Booked, Total Amount
  - EV Charging option (placeholder "+Add")
- **"Checkout" button** → purple, full-width

> **Note:** Payment Details screen and actual payment are out of scope (no payment gateway). We'll show a simplified confirmation instead of the full payment screen.

---

### Phase 5: Booking Confirmation / Parking Ticket

**File:** `src/app/reservations/[id]/page.jsx` **[NEW]** — or modal

**Changes:**
1. **Parking Ticket screen** with:
   - QR Code (generated from reservation data using `qrcode.react` or similar library)
   - "Scan this QR on the scanner machine" instruction text
   - Reservation details grid:
     - Name, Vehicle Number
     - Parking Area, Parking Slot
     - Duration, Time
     - Date, Phone Number
   - **"Start Navigation"** button → purple (links to Google Maps — placeholder)

---

### Phase 6: My Reservations (My Parkings)

**File:** `src/app/reservations/page.jsx`

**Changes:**
1. **Tab filter bar** at top:
   - "Ongoing" / "Completed" / "Cancelled" pill buttons
   - Active tab → yellow background
   - Filter reservations by status
2. **Reservation cards** redesigned:
   - Left: car thumbnail/icon
   - Center: Area name + address
   - Right: Price + "/X Hours"
   - **Status badge**: Active (green), Completed (green outlined), New (green), Cancelled (red)
   - Action links: "View Timer", "View Ticket", "Cancel Booking"
3. **Expandable detail view** (click on a card):
   - Full detail card slides up or expands:
     - Parking Area, Vehicle Number
     - Duration, Parking Slot
     - Date, Time
   - **"Cancel Now!"** button → purple, full-width (for ongoing)
4. **Bottom nav** active on "Bookings" icon

---

### Phase 7: Parking Timer

**File:** `src/app/reservations/[id]/timer/page.jsx` **[NEW]**

**Changes:**
1. **Circular countdown timer**:
   - Large purple circular progress ring (SVG-based)
   - Center: `HH : MM : SS` countdown in bold
   - Labels: "Hours", "Minutes", "Seconds" below digits
2. **Reservation info card** below timer:
   - Parking Area, Vehicle Number
   - Duration, Parking Slot
   - Date, Time
3. **"Expand Parking Time"** button → purple, full-width (extend reservation)

---

### Phase 8: Auth Pages Redesign

**Files:**
- `src/app/login/page.jsx`
- `src/app/register/page.jsx`
- `src/app/forgot-password/page.jsx`
- `src/app/reset-password/[token]/page.jsx`
- `src/app/change-password/page.jsx`

**Changes:**
1. **Dark background** with subtle gradient (purple-to-black or use a parking image)
2. **Card**: White/light card centered, with:
   - SmartPark logo at top
   - Purple accent border or gradient header strip
   - Input fields: rounded, with subtle shadows
   - CTA buttons: purple, full-width, rounded
3. **Consistent styling** across all auth pages

---

### Phase 9: Admin Dashboard Redesign

**Files:**
- `src/app/dashboard/admin/page.jsx`
- `src/app/dashboard/admin/locations/page.jsx`
- `src/app/dashboard/admin/slots/page.jsx`
- `src/app/dashboard/admin/reservations/page.jsx`

**Changes:**
1. **Dark theme** consistent with user pages
2. **Stat cards** at top with icons + numbers (total areas, total slots, active reservations)
3. **Management cards** → dark cards with purple accent icons
4. **Data tables** → dark themed with hover effects
5. **Action buttons** → purple primary, yellow secondary

---

### Phase 10: Profile Page Redesign

**File:** `src/app/profile/page.jsx`

**Changes:**
1. **Avatar circle** (initials or placeholder icon)
2. **Dark card** with form fields
3. **Purple save button**
4. **Vehicle number field** [NEW] — allow users to save their default vehicle number

---

## 🗄️ Backend Changes Required

The UI upgrade depends on data that the current backend does not store. These changes must be implemented **before or alongside** the frontend phases that consume them.

### B.1 — Add Fields to Reservation Entity

**Rationale:** Phase 4 (Step 3) collects `vehicleNumber` and `phoneNumber`; Phase 5 and Phase 6 display them on tickets and detail cards. These must be persisted.

| New Field | Type | DTO Impact | Frontend Phase |
|---|---|---|---|
| `vehicleNumber` | `string` (varchar) | Add to `CreateReservationDto` | Phase 4, 5, 6, 7 |
| `phoneNumber` | `string` (varchar) | Add to `CreateReservationDto` | Phase 4, 5, 6 |
| `vehicleType` | `enum('two_wheeler', 'four_wheeler')` | Add to `CreateReservationDto` | Phase 4, 5, 6 |

**Files to modify:**
- `src/reservations/reservation.entity.ts`
- `src/reservations/dto/create-reservation.dto.ts`
- `src/reservations/reservation.service.ts` (pass fields through on create)
- `src/reservations/reservation.controller.ts` (no change needed if DTO is used)

### B.2 — Add Floor Field to Slot Entity

**Rationale:** Phase 4 (Step 2) requires floor tabs (G Floor, 1st Floor, 2nd Floor, 3rd Floor). The current `Slot` entity has no floor/level column.

| New Field | Type | DTO Impact | Frontend Phase |
|---|---|---|---|
| `floor` | `int` (nullable, default 0) | Add to `CreateSlotDto`; expose in `GET /slots` response | Phase 4 |

**Files to modify:**
- `src/slots/slot.entity.ts`
- `src/slots/dto/create-slot.dto.ts`
- `src/slots/slot.controller.ts` (return `floor` in responses — already returns entity, so automatic if entity has it)

### B.3 — Add Pricing to ParkingArea Entity

**Rationale:** Phase 3 shows price badges (`$5/hours`), Phase 4 displays totals. No pricing exists anywhere in the backend.

| New Field | Type | DTO Impact | Frontend Phase |
|---|---|---|---|
| `pricePerHour` | `decimal(10,2)` (default 0) | Add to `CreateParkingAreaDto` & `UpdateParkingAreaDto` | Phase 3, 4, 6 |

**Files to modify:**
- `src/parking/parking-area.entity.ts`
- `src/parking/dto/create-parking-area.dto.ts`
- `src/parking/dto/update-parking-area.dto.ts`

### B.4 — Add Profile Fields to User Entity

**Rationale:** Phase 10 lets users save a default `vehicleNumber`, and Phase 4 (Step 3) pre-fills name + phone from profile.

| New Field | Type | DTO Impact | Frontend Phase |
|---|---|---|---|
| `phoneNumber` | `string` (varchar, nullable) | Add to `UpdateProfileDto` | Phase 4, 10 |
| `defaultVehicleNumber` | `string` (varchar, nullable) | Add to `UpdateProfileDto` | Phase 4, 10 |

**Files to modify:**
- `src/users/user.entity.ts`
- `src/auth/dto/update-profile.dto.ts`
- `src/auth/auth.service.ts` (return new fields in `/auth/me`)

### B.5 — Add `completed` Status to Reservation

**Rationale:** Phase 6 shows "Ongoing / Completed / Cancelled" tabs. Backend only has `active`, `cancelled`, `expired`. Two options:

- **Option A (Recommended):** Add `COMPLETED = 'completed'` to `ReservationStatus` enum. When a reservation's `endTime` passes (or via admin endpoint), mark it `completed` instead of `expired`. The `expired` status can be used for reservations that were cancelled by the system due to no-show after `expiresAt`.
- **Option B (Frontend-only):** Map `active` → "Ongoing", `expired` → "Completed" on the frontend. Simpler but less accurate.

**If Option A:**
- `src/reservations/reservation.entity.ts` — add `COMPLETED` to enum
- `src/reservations/reservation.service.ts` — update `expireReservations()` to set `completed` when `endTime` has passed
- `src/reservations/reservation.controller.ts` — expose `?status=completed` filter (already supported via query param)

### B.6 — Update Email Templates (Optional)

**Rationale:** The templates currently use `name`, `slotNumber`, `location`, `startTime`, `endTime`. If vehicle info is displayed in emails, update:

- `src/mail/templates/reservation-created.hbs`
- `src/mail/templates/reservation-cancelled.hbs`

### B.7 — Seed Script Updates

**Rationale:** Existing seed creates a default admin and sample parking areas/slots. Update to include `floor`, `pricePerHour`, and `vehicleNumber`/`phoneNumber` on test data.

**File to modify:**
- `src/seed/seed.service.ts`

---

## 📦 New Dependencies Needed

| Package | Purpose |
|---|---|
| `qrcode.react` | Generate QR codes for parking tickets |
| `framer-motion` | Smooth page transitions & micro-animations |

---

## 🎨 New Assets / Components Needed

| Component | Purpose |
|---|---|
| `BottomNav.jsx` | Mobile bottom navigation bar |
| `StatusBadge.jsx` | Reusable status pill (Active/Completed/Cancelled/New) |
| `SlotCell.jsx` | Visual slot component with car icon |
| `ParkingTicket.jsx` | QR ticket card component |
| `CountdownTimer.jsx` | Circular countdown timer component |
| `TabFilter.jsx` | Pill-style tab filter (Ongoing/Completed/Cancelled) |
| `DurationPicker.jsx` | Circular/semicircular duration selector |
| `VehicleTypeToggle.jsx` | Two Wheeler / Four Wheeler toggle |
| Car SVG icon | Small car illustration for slot grid |

---

## ⚡ Priority Order

| Priority | Phase | Effort | Impact |
|---|---|---|---|
| 🔴 P0 | Phase 1 — Design System | Medium | Foundation for everything |
| 🔴 P0 | Phase 2 — Navigation | Medium | Core UX pattern |
| 🔴 P0 | **Backend B.1 + B.2 + B.3** | Medium | Prerequisite for Phases 3–7 |
| 🔴 P0 | Phase 3 — User Dashboard | High | First impression |
| 🔴 P0 | Phase 4 — Booking Flow | Very High | Core feature overhaul |
| 🟡 P1 | **Backend B.4 + B.5** | Low | Prerequisite for Phases 6, 10 |
| 🟡 P1 | Phase 6 — My Reservations | High | Key user page |
| 🟡 P1 | Phase 8 — Auth Pages | Medium | Consistency |
| 🟢 P2 | Phase 5 — Parking Ticket | Medium | New feature |
| 🟢 P2 | Phase 7 — Parking Timer | Medium | New feature |
| 🟢 P2 | Phase 9 — Admin Dashboard | Medium | Admin polish |
| 🟢 P2 | Phase 10 — Profile Page | Low | Minor polish |

> **Recommended order:** Backend B.1–B.3 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Backend B.4–B.5 → Phase 6 → Phase 8 → Phase 5 → Phase 7 → Phase 9 → Phase 10

---

## ⚠️ Important Notes

1. **This is a web app, not mobile** — The screenshots are mobile app mockups. We will adapt the design language (colors, layout, components) for our Next.js web app while keeping the same visual identity.

2. **No payment gateway** — The payment screen (Screenshot 2, middle) will be simplified to a booking confirmation without actual payment processing.

3. **Vehicle type** — See Backend section **B.1** above for required entity changes. The `vehicleType` field must be added to `Reservation` before Phase 4 Step 1 can persist the selection.

4. **Floor system** — See Backend section **B.2** above. Add `floor` column to `Slot` entity to enable floor-based tab filtering in Phase 4 Step 2.

5. **Pricing** — See Backend section **B.3** above. Add `pricePerHour` to `ParkingArea` to power price badges and total calculations in Phases 3, 4, and 6.

6. **Backward compatibility** — Adding columns with nullable defaults preserves all existing API integrations. The visual upgrade and backend changes are designed to be additive without breaking current behavior.

---

## 🏁 Expected Result

A **premium, dark-themed parking app** with:
- ✅ Purple + Yellow accent color scheme
- ✅ Visual slot grid with car illustrations
- ✅ Multi-step booking flow
- ✅ Tab-based reservation filtering
- ✅ QR code parking tickets
- ✅ Live countdown timer for active bookings
- ✅ Smooth animations and micro-interactions
- ✅ Bottom navigation for mobile users
- ✅ Consistent design across all pages
