# Relate — Group Car-Buying & Negotiation Platform 🚗🤝

**Relate** is a production-ready group car-buying web platform where buyers combine their collective purchasing power to secure fleet invoice pricing and bulk discounts directly from certified local auto dealerships.

---

## 🎨 Branding & Visual Identity
- **Logo / Symbol:** A sleek aerodynamic car silhouette in the background with two people shaking hands (🤝) prominently positioned in front of it.
- **Color Palette (Coconut Luxury White & Brown):**
  - **Background:** Clean Coconut Milk & Cream Whites (`#FFFFFF`, `#FDFBF8`, `#FAF6F0`)
  - **Primary Accent:** Toasted Coconut Caramel & Amber Brown (`#9E5827`, `#86471C`, `#B86B35`)
  - **Text & Dark Accents:** Deep Roasted Coconut Shell Brown (`#2B1810`, `#382117`, `#24140D`)
  - **Secondary Neutral:** Warm Coconut Husk Neutral Borders (`#E8DFD5`, `#2B1810`)
  - **Lush Accents:** Palm Green Verification Accents (`#2E7D32`)
- **3D Tactile Motion Physics (Mandatory Specification):**
  - **Hover State:** `transform: translateY(-3px)` + soft drop shadow + highlight pop.
  - **Active / Press State:** `transform: translateY(1px)` + inset depth shadow.
  - **Timing:** `transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);`
  - **Synthesized 3D Audio:** Built-in Web Audio API sound synthesizer with tactile micro-clicks on button press, vote dings, message pops, and proposal dispatch fanfares (with instant mute toggle).

---

## 🚀 Core Features

### 1. Three-Method Authentication & Onboarding
- **Mobile Phone Number & Simulated OTP:** Enter mobile number, receive a simulated 6-digit confirmation code (`849201`), animated 45-second resend countdown, and instant verification.
- **Google Account (Simulated OAuth):** One-click OAuth preview with user avatar, name, and email confirmation.
- **Email & Password:** Standard credential sign-in with remember device and validation.
- **Buyer Purchasing Profile:** Full legal name, preferred Zip code / metro region, interactive budget range slider ($20k–$100k), multi-select preferred car brand pills (Toyota, Tesla, BMW, Ford, Hyundai, Honda, Porsche, Lexus), and purchase readiness status (Pre-Approved, Cash Verified, Trade-in Ready).

### 2. Live Real-Time Dealership Offers Feed
- **Filterable Deal Catalog:** Filter by Brand, Radius (25, 50, 100, 500 miles), Model Year, Body Type (SUV, Sedan, Electric, Truck), and Maximum MSRP.
- **Tiered Bulk Offers:** Tier 1 (3–5 buyers), Tier 2 (6–9 buyers), and Tier 3 (10+ buyers) with progressive discounts ($2,200 to $6,000+ off MSRP) plus complimentary perks (tint, floor mats, free maintenance).
- **Live Expiration & Tier Progress Bars:** Active countdown ticking down in real time (hours, minutes, seconds) and visual capacity progress bars showing remaining spots to unlock higher discounts.

### 3. Buyer Coordination & Local Dealership Hub
- **Group Coordination Chat:** Real-time text stream with verified buyer badges, captain tags, system announcements, and realistic simulated peer replies.
- **Interactive Consensus Polls:** Live poll cards with animated percentage fills. Vote on target dealerships, delivery dates, or trim preferences. Users can also launch new polls instantly.
- **Verified Buyer Leaderboard:** Roster displaying verification status (Pre-Approved financing, liquid cash, trade-in ready) and deposit audit.

### 4. Real-Time Dealership Negotiation & Pitch Engine
- **Joint Intent Proposal Dispatcher:** Aggregates group buyer commitments into a formal tender document showing combined MSRP value (e.g. $243,600+), requested collective discount, and strict 48-hour SLA deadline.
- **4-Step Dispatch Animation:** Multi-step visual pipeline (aggregating commitments -> encrypting financing badges -> transmitting to dealership GMs -> activating 48h SLA).
- **Formal Intent Document Slip:** Full printable / PDF modal with official Relate verification seal, fleet tables, and buyer registry audit.
- **Dealership Counter-Offers Feed:** Review incoming counter-offers from verified dealership General Sales Managers. Group majority votes to Accept or Request Revision.
- **Dealership Fleet Portal Mode:** Switch into Dealership Sales Manager mode to review active group demand in your territory and publish formal counter-offers back to groups.

### 5. Group Savings & Loan Calculator
- Interactively compare buying solo vs. buying with a Relate group. Adjust down payment, loan term (36–72 months), and APR to calculate exact monthly payments and total lifetime savings.

---

## 📁 Architecture & File Structure

```
c:\Re-late\
├── index.html               # Main application shell with semantic sections & modal containers
├── server.py                # Local development HTTP server with CORS and clean MIME headers
├── css\
│   ├── style.css            # 3D tactile buttons, typography, color tokens, layout, header/footer
│   ├── components.css       # Deal cards, countdown chips, chat workbench, polls, modals, toasts
│   └── responsive.css       # Mobile-first breakpoints and tablet adaptations
├── js\
│   ├── app.js               # Central coordinator, view router, countdown loop, modal handlers
│   ├── store.js             # Reactive store with localStorage persistence and event bus
│   ├── data.js              # Comprehensive dataset: vehicles, groups, members, polls, dealers
│   ├── auth.js              # 3-method auth system (Phone OTP, Google OAuth, Email) & Profile
│   ├── chat.js              # Real-time chat engine, interactive polls, peer reply simulation
│   ├── negotiation.js       # Joint Intent Proposal dispatcher & dealership counter-offer voting
│   ├── dealer-portal.js     # Dealership General Sales Manager dashboard & counter publishing
│   ├── calculator.js        # Group savings vs solo loan payment calculator
│   └── audio.js             # Web Audio API synthesizer for 3D tactile sound feedback
└── assets\
    ├── logo.svg             # Sleek car silhouette with foreground 🤝 handshake emblem
    ├── relate-icon.svg      # Relate orange app icon
    └── dealer-badge.svg     # Certified dealership verification badge
```

---

## 🛠️ How to Run Locally

1. Start the server:
   ```bash
   py server.py
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```
