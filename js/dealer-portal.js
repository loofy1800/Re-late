/**
 * RELATE - Dealership Sales Manager Portal
 * Allows dealership general sales managers to review active group purchasing demand
 * in their territory and publish formal real-time counter-offers back to groups.
 */

import { store } from './store.js';
import { sound } from './audio.js';

export class DealerPortal {
  constructor() {
    this.container = null;
  }

  mount(containerEl) {
    this.container = containerEl;
    this.render();
  }

  render() {
    if (!this.container) return;
    const state = store.getState();
    const currentDealer = state.currentDealer || state.dealershipsList[0];
    const groups = state.groups;

    this.container.innerHTML = `
      <div class="dealer-portal-layout">
        <!-- DEALER HEADER BANNER -->
        <div class="dealer-portal-header card-3d">
          <div class="dealer-header-main">
            <div class="dealer-crest">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#111111"/>
                <path d="M12 28V12L20 8L28 12V28L20 32L12 28Z" stroke="#FF5500" stroke-width="2.5"/>
                <circle cx="20" cy="20" r="4" fill="#FF5500"/>
              </svg>
            </div>
            <div>
              <div class="dealer-badge-row">
                <span class="badge badge-dark">Certified Fleet Desk</span>
                <span class="badge badge-success">Verified Partner</span>
              </div>
              <h2>${this.escapeHtml(currentDealer.name)}</h2>
              <p class="text-muted">
                ${this.escapeHtml(currentDealer.address)} • Represented by <strong>${this.escapeHtml(currentDealer.manager)}</strong>
              </p>
            </div>
          </div>

          <div class="dealer-header-actions">
            <button type="button" class="btn btn-secondary btn-3d" id="btn-exit-dealer-mode">
              ← Return to Buyer View
            </button>
          </div>
        </div>

        <!-- PORTAL GRID: ACTIVE GROUP PROPOSALS IN TERRITORY -->
        <div class="dealer-dashboard-grid">
          <!-- LEFT: ACTIVE INCOMING GROUP REQUESTS -->
          <div class="dealer-requests-column">
            <div class="section-title-row">
              <h3>
                <span class="live-pulse-dot"></span>
                Active Group Purchase Proposals (${groups.length})
              </h3>
              <span class="text-muted small">Real-time aggregated demand in your region</span>
            </div>

            <div class="dealer-group-cards-list">
              ${groups.map(group => {
                const totalMsrp = group.buyerCount * group.msrp;
                const activeTier = group.tiers[group.currentTierIndex] || group.tiers[0];
                const hasCounter = group.proposal?.counterOffers?.some(c => c.dealership.includes(currentDealer.name) || c.dealership.includes("Hendrick"));

                return `
                  <div class="dealer-request-card card-3d ${hasCounter ? 'has-active-counter' : ''}">
                    <div class="d-card-header">
                      <div>
                        <span class="badge badge-orange-sm">${group.brand} Fleet Demand</span>
                        <h4>${this.escapeHtml(group.title)}</h4>
                        <div class="text-muted small">📍 ${group.location} • Target: ${group.model}</div>
                      </div>
                      <div class="d-card-badge-count">
                        <span class="count-num">${group.buyerCount}</span>
                        <span class="count-lbl">Committed Buyers</span>
                      </div>
                    </div>

                    <div class="d-card-metrics-grid">
                      <div class="d-metric">
                        <span class="d-m-label">Aggregated MSRP</span>
                        <span class="d-m-val">$${totalMsrp.toLocaleString()}</span>
                      </div>
                      <div class="d-metric">
                        <span class="d-m-label">Buyer Target Discount</span>
                        <span class="d-m-val text-orange">-$${activeTier.discount.toLocaleString()} / car</span>
                      </div>
                      <div class="d-metric">
                        <span class="d-m-label">Total Volume Revenue</span>
                        <span class="d-m-val text-success">$${(totalMsrp - (group.buyerCount * activeTier.discount)).toLocaleString()}</span>
                      </div>
                    </div>

                    <div class="d-card-footer">
                      <div class="d-footer-status">
                        ${hasCounter ? `
                          <span class="text-success">✔ Counter-Offer Published to Group</span>
                        ` : `
                          <span class="text-muted">Awaiting your dealership proposal</span>
                        `}
                      </div>
                      <div class="d-card-btns">
                        <button type="button" class="btn btn-secondary btn-sm btn-3d" data-dealer-inspect="${group.id}">
                          View Group Chat & Roster
                        </button>
                        <button type="button" class="btn btn-primary btn-sm btn-3d" data-dealer-counter="${group.id}">
                          ${hasCounter ? 'Submit Revised Counter' : 'Publish Counter-Offer'}
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- RIGHT: PUBLISH COUNTER-OFFER FORM PANEL -->
          <div class="dealer-counter-form-column">
            <div class="counter-form-panel card-3d">
              <div class="panel-header">
                <h4>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Draft Verified Counter-Offer
                </h4>
              </div>

              <form id="dealer-counter-form">
                <div class="form-group">
                  <label class="form-label" for="counter-target-group">Target Buying Group</label>
                  <select id="counter-target-group" class="form-select" required>
                    ${groups.map(g => `
                      <option value="${g.id}">
                        ${g.title} (${g.buyerCount} Buyers • Target: -$${g.tiers[g.currentTierIndex].discount})
                      </option>
                    `).join("")}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="counter-discount-input">Official Counter Discount ($ off MSRP per car)</label>
                  <div class="input-with-addon">
                    <span class="input-prefix">$</span>
                    <input type="number" id="counter-discount-input" class="form-input" placeholder="3950" value="3950" min="500" max="15000" step="50" required>
                  </div>
                  <span class="form-hint">Competitive bulk discounts maximize conversion of the full buyer group.</span>
                </div>

                <div class="form-group">
                  <label class="form-label" for="counter-perks-input">Included Complimentary Perks & Accessories</label>
                  <textarea id="counter-perks-input" class="form-input" rows="2" placeholder="e.g. Full Ceramic Window Tint + 2 Years Free Scheduled Maintenance + Express Delivery Batch" required>Full Ceramic Window Tint + 2 Years Free Scheduled Maintenance + Express VIP Group Delivery</textarea>
                </div>

                <div class="form-group">
                  <label class="form-label" for="counter-terms-input">Contract Terms & Delivery Expiration</label>
                  <textarea id="counter-terms-input" class="form-input" rows="2" placeholder="e.g. Valid for delivery on or before Sunday 5 PM. Minimum 6 buyers finalizing contracts." required>Valid for collective delivery on or before this Sunday 5 PM. Minimum 5 buyers finalizing purchase orders.</textarea>
                </div>

                <div class="dealer-signature-row">
                  <div class="sign-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5500" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div class="sign-details">
                    <span class="sign-name"><strong>${this.escapeHtml(currentDealer.manager)}</strong></span>
                    <span class="sign-status text-muted small">Authorized Signing Officer • ${this.escapeHtml(currentDealer.name)}</span>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary btn-3d w-100 mt-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Publish Counter-Offer Directly to Buying Group
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Exit dealer mode
    const exitBtn = document.getElementById("btn-exit-dealer-mode");
    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        sound.playClick();
        store.toggleDealerMode(false);
      });
    }

    // Inspect group
    const inspectBtns = this.container.querySelectorAll("[data-dealer-inspect]");
    inspectBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const gid = btn.getAttribute("data-dealer-inspect");
        sound.playClick();
        store.selectGroup(gid, "workbench");
      });
    });

    // Preset counter select
    const counterBtns = this.container.querySelectorAll("[data-dealer-counter]");
    counterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const gid = btn.getAttribute("data-dealer-counter");
        sound.playClick();
        const selectEl = document.getElementById("counter-target-group");
        if (selectEl) {
          selectEl.value = gid;
          selectEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });

    // Form submit
    const form = document.getElementById("dealer-counter-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        sound.playProposalFanfare();

        const groupId = document.getElementById("counter-target-group").value;
        const discount = document.getElementById("counter-discount-input").value;
        const perks = document.getElementById("counter-perks-input").value;
        const terms = document.getElementById("counter-terms-input").value;
        const currentDealer = store.getState().currentDealer || store.getState().dealershipsList[0];

        store.submitDealerCounterOffer(
          groupId,
          currentDealer.name,
          currentDealer.manager,
          discount,
          perks,
          terms
        );

        this.render();
        window.relateToast?.show(`🎉 Official Counter-Offer published to group! Buyers can now vote to accept.`);
      });
    }
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
