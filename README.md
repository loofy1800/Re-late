# Relate — Group Car-Buying & Negotiation Platform 🚗🤝

**Relate** is a browser-only prototype for exploring group car-buying flows. Its offers, verification, authentication, chat, and dealership interactions are simulated; it does not contact dealerships or process purchases.

> **Demo only:** State is stored in this browser's local storage. Invite links work only in a browser that already has the group saved. There is no backend, real account security, or cross-device real-time service. Do not enter real passwords or sensitive financial information.

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
- **Email & Password:** Simulated sign-in flow. No password is checked or sent anywhere.
- **Buyer Purchasing Profile:** Full legal name, preferred Zip code / metro region, interactive budget range slider ($20k–$100k), multi-select preferred car brand pills (Toyota, Tesla, BMW, Ford, Hyundai, Honda, Porsche, Lexus), and purchase readiness status (Pre-Approved, Cash Verified, Trade-in Ready).

### 2. Sample Dealership Offers Feed
- **Filterable Deal Catalog:** Filter by Brand, maximum group radius (25, 50, 100, 500 miles), metro, Body Type (SUV, Sedan, Electric, Truck), and Maximum MSRP.
- **Tiered Bulk Offers:** Tier 1 (3–5 buyers), Tier 2 (6–9 buyers), and Tier 3 (10+ buyers) with progressive discounts ($2,200 to $6,000+ off MSRP) plus complimentary perks (tint, floor mats, free maintenance).
- **Live Expiration & Tier Progress Bars:** Active countdown ticking down in real time (hours, minutes, seconds) and visual capacity progress bars showing remaining spots to unlock higher discounts.

### 3. Simulated Buyer Coordination & Dealership Hub
- **Group Coordination Chat:** Local demo text stream with sample buyer badges, captain tags, system announcements, and simulated peer replies.
- **Interactive Consensus Polls:** Poll cards with animated percentage fills. Vote on target dealerships, delivery dates, or trim preferences. Users can also launch new polls.
- **Sample Buyer Roster:** Demonstrates readiness labels and deposit indicators using example data.

### 4. Simulated Dealership Negotiation & Pitch Engine
- **Joint Intent Proposal Dispatcher:** Previews a tender document with group MSRP value, target discount, and a 48-hour response window. Dispatch is a local animation and state update, not a dealership transmission.
- **4-Step Dispatch Animation:** A local visual demonstration of proposal preparation and a 48-hour response window; no buyer data is transmitted.
- **Formal Intent Document Slip:** Full printable / PDF modal with official Relate verification seal, fleet tables, and buyer registry audit.
- **Sample Counter-Offers:** Review demo counter-offers and record local votes.
- **Dealership Fleet Portal Mode:** Review demo group demand and add a local counter-offer.

### 5. Group Savings & Loan Calculator
- Interactively compare buying solo vs. buying with a Relate group. Adjust down payment, loan term (36–72 months), and APR to calculate exact monthly payments and total lifetime savings.

---

## 📁 Architecture & File Structure

```
c:\Re-late\
├── index.html               # Main application shell with semantic sections & modal containers
├── server.py                # Loopback-only development HTTP server with clean MIME headers
├── css\
│   ├── style.css            # Consolidated layout, components, typography, and color tokens
│   ├── components.css       # Additional component styles (not currently loaded by index.html)
│   └── responsive.css       # Mobile-first and tablet adaptations
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
   http://127.0.0.1:8080
   ```
   If port 8080 is occupied, the server uses port 8081.
