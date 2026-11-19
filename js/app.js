/**
 * RELATE - Main Application Orchestrator
 * Coordinates navigation, live filters, expiration countdowns,
 * views (Browse, Detail Workbench, Dealer Portal, My Groups, How It Works),
 * modals (Create Group, Share/Invite), and real-time state subscribers.
 */

import { store } from './store.js';
import { sound } from './audio.js';
import { AuthManager } from './auth.js';
import { ChatEngine } from './chat.js';
import { NegotiationEngine } from './negotiation.js';
import { DealerPortal } from './dealer-portal.js';
import { SavingsCalculator } from './calculator.js';

class RelateApp {
  constructor() {
    this.authManager = null;
    this.chatEngine = new ChatEngine();
    this.negotiationEngine = new NegotiationEngine();
    this.dealerPortal = new DealerPortal();
    this.savingsCalculator = new SavingsCalculator();
    this.countdownTimer = null;
    this.toastTimer = null;
  }

  init() {
    this.initToastSystem();
    this.authManager = new AuthManager();
    this.bindHeaderEvents();
    this.bindGlobalActions();
    const sharedGroupId = new URLSearchParams(window.location.search).get("group");
    if (sharedGroupId) {
      if (store.getState().groups.some(group => group.id === sharedGroupId)) {
        store.selectGroup(sharedGroupId, "workbench");
      } else {
        window.relateToast.show("This demo group is not stored in this browser. Group data is never uploaded.");
      }
    }
    this.startCountdownLoop();

    // Subscribe to store updates
    store.subscribe((state, event, payload) => {
      this.handleStateChange(state, event, payload);
    });

    // Initial render
    this.renderCurrentView();
    this.updateHeaderProfile();
  }

  initToastSystem() {
    window.relateToast = {
      show: (message, duration = 3500) => {
        let toastEl = document.getElementById("relate-toast");
        if (!toastEl) {
          toastEl = document.createElement("div");
          toastEl.id = "relate-toast";
          toastEl.className = "relate-toast-container";
          document.body.appendChild(toastEl);
        }

        toastEl.innerHTML = `
          <div class="toast-card toast-3d">
            <span class="toast-icon">⚡</span>
            <span class="toast-msg">${this.escapeHtml(String(message))}</span>
          </div>
        `;
        toastEl.classList.add("visible");

        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
          toastEl.classList.remove("visible");
        }, duration);
      }
    };
  }

  handleStateChange(state, event, payload) {
    this.updateHeaderProfile();

    if (event === "VIEW_CHANGED" || event === "GROUP_SELECTED" || event === "FILTERS_CHANGED" || event === "GROUP_MEMBERSHIP_TOGGLED" || event === "GROUP_CREATED") {
      this.renderCurrentView();
    } else if (event === "WORKBENCH_TAB_CHANGED") {
      this.updateWorkbenchTabContent();
    } else if (event === "DEALER_MODE_TOGGLED") {
      this.renderCurrentView();
    }
  }

  bindHeaderEvents() {
    // Sound Toggle
    const soundBtn = document.getElementById("btn-toggle-sound");
    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        const isMuted = sound.toggleMute();
        this.updateSoundButtonUI(isMuted);
        if (!isMuted) sound.playClick();
      });
      this.updateSoundButtonUI(sound.isMuted);
    }

    // Nav Links
    const navLinks = document.querySelectorAll("[data-nav-view]");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        sound.playClick();
        const view = link.getAttribute("data-nav-view");
        if (view === "dealer-portal") {
          store.toggleDealerMode(true);
        } else {
          store.toggleDealerMode(false);
          store.setView(view);
        }
      });
    });

    // Location Selector
    const locSelect = document.getElementById("header-location-select");
    if (locSelect) {
      locSelect.addEventListener("change", (e) => {
        sound.playClick();
        store.setFilters({ location: e.target.value });
        window.relateToast?.show(`Switched territory to ${e.target.value}. Showing active local buyer pools.`);
      });
    }

    // Global Search Bar
    const searchInput = document.getElementById("header-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        store.setFilters({ searchQuery: e.target.value.toLowerCase().trim() });
      });
    }

  }

  updateSoundButtonUI(isMuted) {
    const soundBtn = document.getElementById("btn-toggle-sound");
    if (!soundBtn) return;
    if (isMuted) {
      soundBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
      `;
      soundBtn.title = "Tactile Audio Muted (Click to Unmute)";
    } else {
      soundBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
      `;
      soundBtn.title = "Tactile Audio Active (Click to Mute)";
    }
  }

  updateHeaderProfile() {
    const user = store.getState().currentUser;
    const nameEl = document.getElementById("header-user-name");
    const avatarEl = document.getElementById("header-user-avatar");
    const badgeEl = document.getElementById("header-user-badge");

    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl) avatarEl.src = user.avatar;
    if (badgeEl) badgeEl.textContent = user.readinessStatus.split(" ")[0]; // "Pre-Approved"
  }

  bindGlobalActions() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-action='open-create-group']")) {
        e.preventDefault();
        sound.playClick();
        this.openCreateGroupModal();
      } else if (e.target.closest("[data-action='browse-groups']")) {
        e.preventDefault();
        sound.playClick();
        store.toggleDealerMode(false);
        store.setView("browse");
      } else if (e.target.closest("#hero-btn-find-groups")) {
        sound.playClick();
        store.setView("browse");
        document.getElementById("deals-feed-section")?.scrollIntoView({ behavior: "smooth" });
      } else if (e.target.closest("#hero-btn-dealer")) {
        sound.playClick();
        store.toggleDealerMode(true);
      }
    });
  }

  renderCurrentView() {
    const state = store.getState();
    const activeView = state.activeView;

    // Update active nav styling
    document.querySelectorAll("[data-nav-view]").forEach(link => {
      const v = link.getAttribute("data-nav-view");
      if ((v === "dealer-portal" && state.dealerMode) || (!state.dealerMode && v === activeView)) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    const mainContainer = document.getElementById("main-content-area");
    if (!mainContainer) return;

    if (state.dealerMode) {
      this.dealerPortal.mount(mainContainer);
      return;
    }

    switch (activeView) {
      case "browse":
        this.renderBrowseView(mainContainer);
        break;
      case "workbench":
        this.renderWorkbenchView(mainContainer);
        break;
      case "my-groups":
        this.renderMyGroupsView(mainContainer);
        break;
      case "how-it-works":
        this.renderHowItWorksView(mainContainer);
        break;
      default:
        this.renderBrowseView(mainContainer);
    }
  }

  // --- VIEW 1: BROWSE DEALS FEED ---
  renderBrowseView(container) {
    const state = store.getState();
    const groups = this.filterGroups(state.groups, state.filters);

    container.innerHTML = `
      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-pill-badge">
            <span class="badge-dot-pulse"></span>
            Sample Group Car-Buying Experience
          </div>
          <h1 class="hero-headline">
            Combine Your Buying Power.<br>
            <span class="text-orange">Explore Sample Group Car Deals.</span>
          </h1>
          <p class="hero-subtext">
            Explore sample group offers and local coordination flows. All pricing, buyers, and dealership activity shown here are illustrative.
          </p>

          <div class="hero-cta-group">
            <button type="button" class="btn btn-primary btn-lg btn-3d" id="hero-btn-find-groups">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Browse Sample Groups
            </button>
            <button type="button" class="btn btn-secondary btn-lg btn-3d" data-action="open-create-group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Create Demo Group
            </button>
            <button type="button" class="btn btn-dark btn-lg btn-3d" id="hero-btn-dealer">
              Dealer Portal Demo ↗
            </button>
          </div>

          <!-- LIVE TICKER METRICS -->
          <div class="hero-ticker-metrics">
            <div class="ticker-box card-3d">
              <span class="ticker-num text-orange">$4,280,000+</span>
              <span class="ticker-lbl">Illustrative Group Savings</span>
            </div>
            <div class="ticker-box card-3d">
              <span class="ticker-num">${state.groups.length} Groups</span>
              <span class="ticker-lbl">Sample Groups In This Demo</span>
            </div>
            <div class="ticker-box card-3d">
              <span class="ticker-num text-success">$4,120 Avg</span>
              <span class="ticker-lbl">Illustrative MSRP Discount</span>
            </div>
            <div class="ticker-box card-3d">
              <span class="ticker-num">48h Demo</span>
              <span class="ticker-lbl">Local Demo Response Window</span>
            </div>
          </div>
        </div>
      </section>

      <!-- DEALS FEED & FILTER CATALOG -->
      <section class="deals-feed-section" id="deals-feed-section">
        <div class="feed-header-row">
          <div>
            <h2 class="section-title">Sample Group Buying Deals</h2>
            <p class="text-muted">Explore sample groups and illustrative discount tiers. No offers are sent to dealerships.</p>
          </div>
          <div class="feed-summary-count">
            Showing <strong>${groups.length}</strong> sample group deals
          </div>
        </div>

        <!-- FILTER CONTROLS BAR -->
        <div class="filters-bar card-3d">
          <div class="filter-pills-row">
            <span class="filter-label">Make / Brand:</span>
            ${['all', 'Toyota', 'Tesla', 'BMW', 'Ford', 'Hyundai', 'Honda'].map(brand => `
              <button type="button" class="filter-pill btn-3d ${state.filters.brand === brand ? 'active' : ''}" data-filter-brand="${brand}">
                ${brand === 'all' ? 'All Brands' : brand}
              </button>
            `).join("")}
          </div>

          <div class="filter-secondary-row">
            <div class="filter-select-group">
              <label for="filter-body-type">Body Type:</label>
              <select id="filter-body-type" class="filter-select">
                <option value="all" ${state.filters.bodyType === 'all' ? 'selected' : ''}>All Body Types</option>
                <option value="SUV" ${state.filters.bodyType === 'SUV' ? 'selected' : ''}>SUV / Crossover</option>
                <option value="Electric" ${state.filters.bodyType === 'Electric' ? 'selected' : ''}>Electric / EV</option>
                <option value="Sedan" ${state.filters.bodyType === 'Sedan' ? 'selected' : ''}>Performance Sedan</option>
                <option value="Truck" ${state.filters.bodyType === 'Truck' ? 'selected' : ''}>Truck & Hybrid</option>
              </select>
            </div>

            <div class="filter-select-group">
              <label for="filter-radius">Maximum Group Radius:</label>
              <select id="filter-radius" class="filter-select">
                <option value="25" ${state.filters.radius == 25 ? 'selected' : ''}>Groups up to 25 Miles</option>
                <option value="50" ${state.filters.radius == 50 ? 'selected' : ''}>Groups up to 50 Miles</option>
                <option value="100" ${state.filters.radius == 100 ? 'selected' : ''}>Groups up to 100 Miles</option>
                <option value="500" ${state.filters.radius == 500 ? 'selected' : ''}>Any Group Radius</option>
              </select>
            </div>

            <div class="filter-price-slider">
              <div class="slider-val-line">
                <span>Max MSRP:</span>
                <strong id="filter-price-val">$${state.filters.maxPrice.toLocaleString()}</strong>
              </div>
              <input type="range" id="filter-price-range" class="range-slider" min="30000" max="95000" step="5000" value="${state.filters.maxPrice}">
            </div>

            <button type="button" class="btn btn-secondary btn-sm btn-3d" id="btn-reset-filters">
              Reset Filters
            </button>
          </div>
        </div>

        <!-- CARDS GRID -->
        <div class="deals-grid" id="deals-cards-grid">
          ${groups.length > 0 ? groups.map(g => this.renderDealCard(g)).join("") : `
            <div class="no-results-box card-3d">
              <h4>No buying groups match your active filters</h4>
              <p class="text-muted">Try expanding your search radius, selecting all brands, or be the first to launch a group!</p>
              <button type="button" class="btn btn-primary btn-3d" data-action="open-create-group">
                + Launch a Buying Group for this Vehicle
              </button>
            </div>
          `}
        </div>
      </section>
    `;

    this.bindBrowseEvents();
  }

  filterGroups(groups, filters) {
    return groups.filter(g => {
      // Brand filter
      if (filters.brand !== "all" && g.brand.toLowerCase() !== filters.brand.toLowerCase()) {
        return false;
      }
      // Body type filter
      if (filters.bodyType !== "all" && g.bodyType.toLowerCase() !== filters.bodyType.toLowerCase()) {
        return false;
      }
      // Max price
      if (g.msrp > filters.maxPrice) {
        return false;
      }
      if (filters.radius < 500 && g.radiusMiles > filters.radius) {
        return false;
      }
      // Location search
      if (filters.location !== "all" && !g.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery;
        const text = `${g.brand} ${g.model} ${g.title} ${g.location} ${g.targetDealerships.join(" ")}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }

  renderDealCard(group) {
    const activeTier = group.tiers[group.currentTierIndex] || group.tiers[0];
    const nextTier = group.tiers[group.currentTierIndex + 1];
    const isJoined = store.getState().currentUser.joinedGroupIds.includes(group.id);
    const buyersToNext = nextTier ? Math.max(0, nextTier.minBuyers - group.buyerCount) : 0;
    const progressPct = group.maxCapacity > 0
      ? Math.max(0, Math.min(100, Math.round((group.buyerCount / group.maxCapacity) * 100)))
      : 0;

    return `
      <div class="deal-card card-3d" data-group-id="${this.escapeHtml(group.id)}">
        <!-- IMAGE & BADGES -->
        <div class="deal-card-media">
          <img src="${this.escapeHtml(group.image)}" alt="${this.escapeHtml(`${group.brand} ${group.model}`)}" class="deal-image" loading="lazy">
          <div class="media-badges-overlay">
            <span class="badge badge-dark-glass">📍 ${this.escapeHtml(group.location)} (${group.radiusMiles} mi)</span>
            <span class="badge badge-orange-glass">Tier ${group.currentTierIndex + 1} Active</span>
          </div>
          <div class="countdown-chip" data-countdown-date="${this.escapeHtml(group.expirationDate)}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span class="countdown-text">${group.expiresInHours}h remaining</span>
          </div>
        </div>

        <!-- CONTENT -->
        <div class="deal-card-body">
          <div class="card-brand-model">
            <span class="model-year-badge">${group.year}</span>
            <h3 class="card-title">${this.escapeHtml(group.title)}</h3>
          </div>
          <p class="card-desc">${this.escapeHtml(group.description)}</p>

          <!-- TIER DISCOUNT HIGHLIGHT -->
          <div class="card-discount-highlight">
            <div class="discount-pricing-line">
              <span class="msrp-struck">MSRP: $${group.msrp.toLocaleString()}</span>
              <span class="group-price">$${(group.msrp - activeTier.discount).toLocaleString()}</span>
            </div>
            <div class="discount-savings-badge">
              <strong>${this.escapeHtml(activeTier.label)}</strong>
              <span class="perk-note">+ ${this.escapeHtml(activeTier.perks)}</span>
            </div>
          </div>

          <!-- TIER PROGRESS BAR -->
          <div class="tier-progress-section">
            <div class="tier-progress-header">
              <span class="progress-lbl">
                <strong>${group.buyerCount}</strong> of ${group.maxCapacity} sample buyers
              </span>
              <span class="next-tier-hint ${buyersToNext === 0 ? 'text-success' : 'text-orange'}">
                ${buyersToNext === 0 ? '🏆 Max Tier Unlocked!' : `${buyersToNext} more to unlock ${nextTier?.label}!`}
              </span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-fill fill-orange" style="width: ${progressPct}%"></div>
            </div>
          </div>

          <!-- TIER STEPPER PADS -->
          <div class="tier-pills-row">
            ${group.tiers.map((t, idx) => `
              <div class="tier-mini-pad ${idx <= group.currentTierIndex ? 'unlocked' : ''}">
                <span class="t-name">T${t.tier} (${t.minBuyers}+)</span>
                <span class="t-disc">-$${t.discount.toLocaleString()}</span>
              </div>
            `).join("")}
          </div>

          <!-- AVATAR STACK & TARGET DEALER -->
          <div class="card-meta-footer">
            <div class="avatar-stack">
              ${group.members.slice(0, 4).map(m => `
                <img src="${this.escapeHtml(m.avatar)}" alt="${this.escapeHtml(m.name)}" class="avatar-stacked" title="${this.escapeHtml(`${m.name} (${m.status})`)}">
              `).join("")}
              ${group.members.length > 4 ? `
                <span class="avatar-stack-more">+${group.members.length - 4}</span>
              ` : ''}
            </div>
            <div class="target-dealer-hint" title="${this.escapeHtml(group.targetDealerships.join(', '))}">
              🏢 ${this.escapeHtml(group.targetDealerships[0].split(" ")[0])} Dealership Pool
            </div>
          </div>

          <!-- ACTION BUTTONS -->
          <div class="card-actions-grid">
            <button type="button" class="btn ${isJoined ? 'btn-secondary' : 'btn-primary'} btn-3d" data-action="toggle-join" data-group-id="${this.escapeHtml(group.id)}">
              ${isJoined ? '✓ Joined Group' : '+ Join Group Deal'}
            </button>
            <button type="button" class="btn btn-dark btn-3d" data-action="open-workbench" data-group-id="${this.escapeHtml(group.id)}">
              Workbench ↗
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindBrowseEvents() {
    // Brand filter buttons
    const brandPills = document.querySelectorAll("[data-filter-brand]");
    brandPills.forEach(pill => {
      pill.addEventListener("click", () => {
        sound.playClick();
        store.setFilters({ brand: pill.getAttribute("data-filter-brand") });
      });
    });

    // Body type filter
    const bodySelect = document.getElementById("filter-body-type");
    bodySelect?.addEventListener("change", (e) => {
      sound.playClick();
      store.setFilters({ bodyType: e.target.value });
    });

    // Radius filter
    const radiusSelect = document.getElementById("filter-radius");
    radiusSelect?.addEventListener("change", (e) => {
      sound.playClick();
      store.setFilters({ radius: Number(e.target.value) });
    });

    // Price range slider
    const priceSlider = document.getElementById("filter-price-range");
    const priceVal = document.getElementById("filter-price-val");
    priceSlider?.addEventListener("input", (e) => {
      priceVal.textContent = `$${Number(e.target.value).toLocaleString()}`;
    });
    priceSlider?.addEventListener("change", (e) => {
      store.setFilters({ maxPrice: Number(e.target.value) });
    });

    // Reset filters
    document.getElementById("btn-reset-filters")?.addEventListener("click", () => {
      sound.playClick();
      store.resetFilters();
    });

    // Join button clicks on cards
    document.querySelectorAll('[data-action="toggle-join"]').forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const gid = btn.getAttribute("data-group-id");
        sound.playClick();
        const joined = store.toggleJoinGroup(gid);
        if (joined === null) {
          window.relateToast?.show("This buying group has reached its buyer capacity.");
        } else if (joined) {
          sound.playJoinSuccess();
          window.relateToast?.show("🚀 You joined the buying group! You've increased the collective leverage.");
        } else {
          window.relateToast?.show("You have left the buying group.");
        }
      });
    });

    // Open workbench buttons
    document.querySelectorAll('[data-action="open-workbench"]').forEach(btn => {
      btn.addEventListener("click", () => {
        const gid = btn.getAttribute("data-group-id");
        sound.playClick();
        store.selectGroup(gid, "workbench");
      });
    });

    // Click whole card to open workbench
    document.querySelectorAll('.deal-card').forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest('button')) return;
        const gid = card.getAttribute("data-group-id");
        sound.playClick();
        store.selectGroup(gid, "workbench");
      });
    });
  }

  // --- VIEW 2: GROUP DETAIL & LIVE CHAT WORKBENCH ---
  renderWorkbenchView(container) {
    const group = store.getSelectedGroup();
    if (!group) return;

    const state = store.getState();
    const activeTier = group.tiers[group.currentTierIndex] || group.tiers[0];
    const isJoined = state.currentUser.joinedGroupIds.includes(group.id);
    const activeTab = state.activeWorkbenchTab;

    container.innerHTML = `
      <div class="workbench-view-container">
        <!-- TOP WORKBENCH HEADER -->
        <div class="workbench-header card-3d">
          <div class="workbench-header-left">
            <button type="button" class="btn btn-secondary btn-sm btn-3d" id="btn-back-to-browse">
              ← Back to All Deals
            </button>
            <div class="group-title-cluster">
              <div class="title-meta-line">
                <span class="badge badge-orange">${this.escapeHtml(group.brand)} Group Buying Hub</span>
                <span class="badge badge-dark">📍 ${this.escapeHtml(group.location)}</span>
                <span class="badge badge-success">Tier ${group.currentTierIndex + 1} ($${activeTier.discount.toLocaleString()} Off)</span>
              </div>
              <h2 class="workbench-title">${this.escapeHtml(group.title)}</h2>
            </div>
          </div>

          <div class="workbench-header-actions">
            <button type="button" class="btn ${isJoined ? 'btn-secondary' : 'btn-primary'} btn-3d" id="workbench-join-btn">
              ${isJoined ? '✓ Joined (Leave)' : '+ Join This Buying Group'}
            </button>
            <button type="button" class="btn btn-dark btn-3d" id="workbench-invite-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
              Invite Local Buyers
            </button>
          </div>
        </div>

        <!-- WORKBENCH TAB NAVIGATION -->
        <div class="workbench-tabs-nav card-3d" role="tablist">
          <button type="button" class="workbench-tab-btn ${activeTab === 'offer' ? 'active' : ''}" data-wtab="offer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Offer & Tier Breakdown
          </button>
          <button type="button" class="workbench-tab-btn ${activeTab === 'chat' ? 'active' : ''}" data-wtab="chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Group Chat & Live Polls (${group.messages.length})
          </button>
          <button type="button" class="workbench-tab-btn ${activeTab === 'proposal' ? 'active' : ''}" data-wtab="proposal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Joint Intent Proposal & Dispatch
          </button>
          <button type="button" class="workbench-tab-btn ${activeTab === 'counters' ? 'active' : ''}" data-wtab="counters">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline><path d="M4 12h16"></path></svg>
            Dealership Counter-Offers (${group.proposal?.counterOffers?.length || 0})
          </button>
          <button type="button" class="workbench-tab-btn ${activeTab === 'calculator' ? 'active' : ''}" data-wtab="calculator">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="4"></rect><line x1="8" y1="6" x2="16" y2="6"></line></svg>
            Savings & Loan Calculator
          </button>
        </div>

        <!-- TAB CONTENT CONTAINER -->
        <div id="workbench-tab-content-root" class="workbench-tab-content">
          <!-- Dynamically populated by updateWorkbenchTabContent -->
        </div>
      </div>
    `;

    this.bindWorkbenchEvents(group);
    this.updateWorkbenchTabContent();
  }

  updateWorkbenchTabContent() {
    const tabRoot = document.getElementById("workbench-tab-content-root");
    if (!tabRoot) return;

    const group = store.getSelectedGroup();
    const activeTab = store.getState().activeWorkbenchTab;

    // Update active tab buttons
    document.querySelectorAll("[data-wtab]").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-wtab") === activeTab);
    });

    switch (activeTab) {
      case "offer":
        this.renderOfferTab(tabRoot, group);
        break;
      case "chat":
        this.chatEngine.mount(tabRoot, group.id);
        break;
      case "proposal":
        this.negotiationEngine.mount(tabRoot, group.id);
        break;
      case "counters":
        this.negotiationEngine.mount(tabRoot, group.id);
        break;
      case "calculator":
        this.savingsCalculator.mount(tabRoot, group);
        break;
      default:
        this.renderOfferTab(tabRoot, group);
    }
  }

  renderOfferTab(container, group) {
    const activeTier = group.tiers[group.currentTierIndex] || group.tiers[0];
    const isJoined = store.getState().currentUser.joinedGroupIds.includes(group.id);

    container.innerHTML = `
      <div class="offer-breakdown-layout">
        <!-- VEHICLE SPOTLIGHT -->
        <div class="offer-spotlight-card card-3d">
          <div class="spotlight-media-grid">
            <img src="${this.escapeHtml(group.image)}" alt="${this.escapeHtml(`${group.brand} ${group.model}`)}" class="spotlight-img">
            <div class="spotlight-details">
              <div class="spotlight-header">
                <span class="badge badge-dark">${group.year} • ${this.escapeHtml(group.bodyType)}</span>
                <span class="badge badge-orange">Group Fleet Special</span>
              </div>
              <h3>${group.year} ${this.escapeHtml(group.brand)} ${this.escapeHtml(group.model)}</h3>
              <p class="text-muted">${this.escapeHtml(group.description)}</p>

              <div class="spotlight-pricing-matrix">
                <div class="matrix-box">
                  <span class="m-lbl">Base MSRP</span>
                  <span class="m-val struck">$${group.msrp.toLocaleString()}</span>
                </div>
                <div class="matrix-box highlight">
                  <span class="m-lbl">Group Price (Tier ${group.currentTierIndex + 1})</span>
                  <span class="m-val text-orange">$${(group.msrp - activeTier.discount).toLocaleString()}</span>
                </div>
                <div class="matrix-box">
                  <span class="m-lbl">Your Direct Savings</span>
                  <span class="m-val text-success">-$${activeTier.discount.toLocaleString()}</span>
                </div>
              </div>

              <div class="spotlight-actions">
                <button type="button" class="btn ${isJoined ? 'btn-secondary' : 'btn-primary'} btn-3d" id="btn-spotlight-join">
                  ${isJoined ? '✓ You Are in this Group' : 'Lock in Tier ' + (group.currentTierIndex + 1) + ' Discount'}
                </button>
                <button type="button" class="btn btn-secondary btn-3d" id="btn-switch-to-chat">
                  Open Group Chat (${group.messages.length}) →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TIER PROGRESSION CARDS -->
        <div class="tiers-progression-panel card-3d">
          <div class="panel-header">
            <h4>Tiered Bulk Discount Schedule</h4>
            <span class="text-muted small">Higher buyer volume triggers fleet allocation discounts</span>
          </div>

          <div class="tier-schedule-grid">
            ${group.tiers.map((t, idx) => {
              const isCurrent = idx === group.currentTierIndex;
              const isPast = idx < group.currentTierIndex;
              const isFuture = idx > group.currentTierIndex;

              return `
                <div class="tier-schedule-card ${isCurrent ? 'tier-active-card' : ''} ${isPast ? 'tier-completed-card' : ''}">
                  <div class="t-card-header">
                    <span class="t-badge">${isCurrent ? '● CURRENT TIER' : (isPast ? '✔ UNLOCKED' : 'LOCKED')}</span>
                    <h5>Tier ${t.tier} (${t.minBuyers}–${t.maxBuyers} Buyers)</h5>
                  </div>
                  <div class="t-card-discount text-orange">
                    -$${t.discount.toLocaleString()} Off MSRP
                  </div>
                  <div class="t-card-price">
                    Effective Price: <strong>$${(group.msrp - t.discount).toLocaleString()}</strong>
                  </div>
                  <div class="t-card-perks">
                    <strong>Included Fleet Perks:</strong><br>
                    ${this.escapeHtml(t.perks)}
                  </div>
                  <div class="t-card-status-footer">
                    ${isCurrent ? `
                      <span class="text-orange"><strong>${group.buyerCount}</strong> buyers currently at this tier</span>
                    ` : (isPast ? `
                      <span class="text-success">Met & surpassed</span>
                    ` : `
                      <span class="text-muted">${t.minBuyers - group.buyerCount} more buyers required</span>
                    `)}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- TARGET DEALERSHIPS INVENTORY ALLOCATION -->
        <div class="target-dealerships-panel card-3d">
          <div class="panel-header">
            <h4>Example Dealership Targets (${group.targetDealerships.length})</h4>
            <span class="text-muted small">Sample data only; no proposals are sent</span>
          </div>

          <div class="dealers-tender-list">
            ${group.targetDealerships.map(name => `
              <div class="dealer-tender-item">
                <div class="dealer-icon">🏢</div>
                <div class="dealer-info">
                  <strong>${this.escapeHtml(name)}</strong>
                  <div class="text-muted small">Example dealership profile • not a verified partner</div>
                </div>
                <span class="badge badge-success">Sample</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    // Bind local buttons
    document.getElementById("btn-spotlight-join")?.addEventListener("click", () => {
      sound.playClick();
      const joined = store.toggleJoinGroup(group.id);
      if (joined === null) {
        window.relateToast?.show("This buying group has reached its buyer capacity.");
      } else if (joined) {
        sound.playJoinSuccess();
      }
      this.updateWorkbenchTabContent();
    });

    document.getElementById("btn-switch-to-chat")?.addEventListener("click", () => {
      sound.playClick();
      store.setWorkbenchTab("chat");
    });
  }

  bindWorkbenchEvents(group) {
    // Back to browse
    document.getElementById("btn-back-to-browse")?.addEventListener("click", () => {
      sound.playClick();
      store.setView("browse");
    });

    // Join/Leave button
    document.getElementById("workbench-join-btn")?.addEventListener("click", () => {
      sound.playClick();
      const joined = store.toggleJoinGroup(group.id);
      if (joined === null) {
        window.relateToast?.show("This buying group has reached its buyer capacity.");
      } else if (joined) {
        sound.playJoinSuccess();
        window.relateToast?.show("🚀 You joined the buying group!");
      } else {
        window.relateToast?.show("You have left the buying group.");
      }
    });

    // Invite button
    document.getElementById("workbench-invite-btn")?.addEventListener("click", () => {
      sound.playClick();
      this.openInviteModal(group);
    });

    // Tab buttons
    document.querySelectorAll("[data-wtab]").forEach(btn => {
      btn.addEventListener("click", () => {
        sound.playClick();
        store.setWorkbenchTab(btn.getAttribute("data-wtab"));
      });
    });
  }

  // --- VIEW 3: MY BUYING GROUPS ---
  renderMyGroupsView(container) {
    const state = store.getState();
    const myGroupIds = state.currentUser.joinedGroupIds;
    const myGroups = state.groups.filter(g => myGroupIds.includes(g.id));

    container.innerHTML = `
      <div class="my-groups-container">
        <div class="page-title-row">
          <div>
            <h2>My Active Buying Groups (${myGroups.length})</h2>
            <p class="text-muted">Track the progress of vehicle groups you have joined and check counter-offers.</p>
          </div>
          <button type="button" class="btn btn-primary btn-3d" data-action="open-create-group">
            + Start Another Group
          </button>
        </div>

        <div class="deals-grid mt-4">
          ${myGroups.length > 0 ? myGroups.map(g => this.renderDealCard(g)).join("") : `
            <div class="no-results-box card-3d">
              <h4>You haven't joined any buying groups yet</h4>
              <p class="text-muted">Browse sample groups or create a demo group for a vehicle.</p>
              <button type="button" class="btn btn-primary btn-3d" data-action="browse-groups">
                Browse Sample Groups
              </button>
            </div>
          `}
        </div>
      </div>
    `;

    this.bindBrowseEvents();
  }

  // --- VIEW 4: HOW IT WORKS ---
  renderHowItWorksView(container) {
    container.innerHTML = `
      <div class="how-it-works-container">
        <div class="hiw-hero card-3d">
          <span class="badge badge-orange">Demo Walk-Through</span>
          <h2>Explore the Group-Buying Prototype</h2>
          <p class="text-muted">
            This browser-only demo uses sample groups, prices, buyers, and dealership activity. It does not contact dealerships, verify buyers, or create purchase commitments.
          </p>
        </div>

        <div class="hiw-steps-grid">
          <div class="hiw-step-card card-3d">
            <div class="step-badge-num">1</div>
            <h4>Browse or Create a Demo Group</h4>
            <p>Explore sample vehicles and create a local group with a target budget and vehicle preferences.</p>
          </div>

          <div class="hiw-step-card card-3d">
            <div class="step-badge-num">2</div>
            <h4>Explore Illustrative Tiers</h4>
            <p>Adjust sample buyer counts and see how the example discount tiers change.</p>
          </div>

          <div class="hiw-step-card card-3d">
            <div class="step-badge-num">3</div>
            <h4>Try Local Chat and Polls</h4>
            <p>Messages, sample replies, and poll votes are stored only in this browser.</p>
          </div>

          <div class="hiw-step-card card-3d">
            <div class="step-badge-num">4</div>
            <h4>Preview a Proposal</h4>
            <p>Run a local animation and inspect an illustrative proposal. Nothing is transmitted to dealerships.</p>
          </div>

          <div class="hiw-step-card card-3d">
            <div class="step-badge-num">5</div>
            <h4>Try the Dealer Portal Demo</h4>
            <p>Add sample counter-offers and record local votes; they are not real dealership bids.</p>
          </div>

          <div class="hiw-step-card card-3d">
            <div class="step-badge-num">6</div>
            <h4>Compare Example Payments</h4>
            <p>Use the calculator for illustrative payment estimates, not a quote or financing offer.</p>
          </div>
        </div>

        <div class="hiw-cta-box card-3d">
          <h3>Explore the Relate demo</h3>
          <p class="text-muted">Browse sample groups or create a local demo group.</p>
          <div class="d-flex gap-3 justify-center mt-3">
            <button type="button" class="btn btn-primary btn-lg btn-3d" data-action="browse-groups">
              Browse Sample Groups
            </button>
            <button type="button" class="btn btn-secondary btn-lg btn-3d" data-action="open-create-group">
              Create Demo Group
            </button>
          </div>
        </div>
      </div>
    `;

  }

  // --- MODAL: CREATE BUYING GROUP ---
  openCreateGroupModal() {
    const user = store.getState().currentUser;

    const modalHtml = `
      <div id="create-group-modal" class="modal-backdrop active">
        <div class="modal-card modal-3d create-group-box">
          <div class="modal-header">
            <div>
              <span class="badge badge-orange">Group Captain</span>
              <h4>Launch a New Buying Group</h4>
            </div>
            <button type="button" class="modal-close-btn" id="close-cg-modal">&times;</button>
          </div>

          <form id="create-group-form" class="mt-3">
            <div class="grid-2-col">
              <div class="form-group">
                <label class="form-label" for="cg-brand">Vehicle Make / Brand</label>
                <select id="cg-brand" class="form-select" required>
                  <option value="Toyota">Toyota</option>
                  <option value="Tesla">Tesla</option>
                  <option value="BMW">BMW</option>
                  <option value="Ford">Ford</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Honda">Honda</option>
                  <option value="Porsche">Porsche</option>
                  <option value="Lexus">Lexus</option>
                  <option value="Audi">Audi</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="cg-model">Model & Target Trim</label>
                <input type="text" id="cg-model" class="form-input" placeholder="e.g. Grand Highlander Hybrid" required>
              </div>
            </div>

            <div class="grid-2-col">
              <div class="form-group">
                <label class="form-label" for="cg-year">Model Year</label>
                <select id="cg-year" class="form-select">
                  <option value="2025" selected>2025</option>
                  <option value="2026">2026</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="cg-body">Body Type</label>
                <select id="cg-body" class="form-select">
                  <option value="SUV">SUV / Crossover</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Electric">Electric / EV</option>
                  <option value="Truck">Truck</option>
                </select>
              </div>
            </div>

            <div class="grid-2-col">
              <div class="form-group">
                <label class="form-label" for="cg-msrp">Base MSRP ($)</label>
                <input type="number" id="cg-msrp" class="form-input" placeholder="46000" value="46000" min="20000" max="150000" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="cg-location">Metro Location</label>
                <input type="text" id="cg-location" class="form-input" value="${this.escapeHtml(user.city || 'Atlanta, GA')}" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="cg-desc">Group Goal / Negotiation Pitch</label>
              <textarea id="cg-desc" class="form-input" rows="2" placeholder="e.g. Aggregating 8+ buyers to demand invoice pricing with waived dealer doc fees." required>Aggregating local buyers to demand fleet invoice pricing with zero markups and complimentary tint package.</textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-3d w-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Create Buying Group as Captain
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById("create-group-modal");

    const cleanup = () => modalEl.remove();
    document.getElementById("close-cg-modal").addEventListener("click", cleanup);
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) cleanup();
    });

    document.getElementById("create-group-form").addEventListener("submit", (e) => {
      e.preventDefault();
      sound.playProposalFanfare();

      const payload = {
        brand: document.getElementById("cg-brand").value,
        model: document.getElementById("cg-model").value,
        year: document.getElementById("cg-year").value,
        bodyType: document.getElementById("cg-body").value,
        msrp: document.getElementById("cg-msrp").value,
        location: document.getElementById("cg-location").value,
        description: document.getElementById("cg-desc").value
      };

      const newGroup = store.createNewBuyingGroup(payload);
      if (!newGroup) {
        window.relateToast?.show("Please enter a valid vehicle, model, location, and MSRP.");
        return;
      }
      cleanup();
      window.relateToast?.show(`🎉 Group "${newGroup.title}" created! You are the Group Captain.`);
    });
  }

  // --- MODAL: INVITE LOCAL BUYERS ---
  openInviteModal(group) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?group=${encodeURIComponent(group.id)}`;

    const modalHtml = `
      <div id="invite-modal" class="modal-backdrop active">
        <div class="modal-card modal-3d invite-modal-box">
          <div class="modal-header">
            <div>
              <span class="badge badge-orange">Recruit Local Buyers</span>
              <h4>              Share This Demo Group</h4>
            </div>
            <button type="button" class="modal-close-btn" id="close-inv-modal">&times;</button>
          </div>

          <div class="invite-modal-body mt-3">
            <p class="text-muted">
              This link opens the group only in a browser where its local demo data is already saved. No group data is uploaded or shared between devices.
            </p>

            <div class="invite-link-box">
              <input type="text" id="share-link-input" class="form-input" value="${this.escapeHtml(shareUrl)}" readonly>
              <button type="button" class="btn btn-primary btn-3d" id="btn-copy-link">
                Copy Link
              </button>
            </div>

            <div class="social-share-row mt-3">
              <button type="button" class="btn btn-secondary btn-sm btn-3d share-channel-btn" data-channel="sms">
                💬 Text / SMS
              </button>
              <button type="button" class="btn btn-secondary btn-sm btn-3d share-channel-btn" data-channel="whatsapp">
                📱 WhatsApp
              </button>
              <button type="button" class="btn btn-secondary btn-sm btn-3d share-channel-btn" data-channel="email">
                ✉ Email
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById("invite-modal");

    const cleanup = () => modalEl.remove();
    document.getElementById("close-inv-modal").addEventListener("click", cleanup);
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) cleanup();
    });

    document.getElementById("btn-copy-link").addEventListener("click", () => {
      sound.playClick();
      navigator.clipboard?.writeText(shareUrl).then(() => {
        window.relateToast?.show("📋 Group invite link copied to clipboard!");
      }).catch(() => {
        window.relateToast?.show("Link ready to copy: " + shareUrl);
      });
    });

    modalEl.querySelectorAll(".share-channel-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        sound.playClick();
        window.relateToast?.show("Simulated share link opened!");
      });
    });
  }

  // --- COUNTDOWN LOOP ---
  startCountdownLoop() {
    this.countdownTimer = setInterval(() => {
      const countdownChips = document.querySelectorAll("[data-countdown-date]");
      countdownChips.forEach(chip => {
        const dateStr = chip.getAttribute("data-countdown-date");
        if (!dateStr) return;
        const diff = new Date(dateStr) - new Date();
        const textEl = chip.querySelector(".countdown-text");
        if (!textEl) return;

        if (diff <= 0) {
          textEl.textContent = "Negotiation Window Closed";
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          textEl.textContent = `${hours}h ${mins}m ${secs}s remaining`;
        }
      });
    }, 1000);
  }

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Instantiate on window load
document.addEventListener("DOMContentLoaded", () => {
  window.relateApp = new RelateApp();
  window.relateApp.init();
});
