/**
 * RELATE - Real-Time Dealership Negotiation & Pitch Engine
 * Handles:
 * 1. Joint Intent Proposal Dispatcher (Formal bulk purchase aggregation)
 * 2. Real-Time Dealership Counter-Offers Feed & Voting
 * 3. Interactive Formal Document Modal & Inspection
 */

import { store } from './store.js';
import { sound } from './audio.js';

export class NegotiationEngine {
  constructor() {
    this.container = null;
    this.activeGroupId = null;
  }

  mount(containerEl, groupId) {
    this.container = containerEl;
    this.activeGroupId = groupId;
    this.render();
  }

  render() {
    if (!this.container) return;
    const group = store.getState().groups.find(g => g.id === this.activeGroupId) || store.getSelectedGroup();
    if (!group) return;

    const proposal = group.proposal || {};
    const totalMsrp = group.buyerCount * group.msrp;
    const activeTier = group.tiers[group.currentTierIndex] || group.tiers[0];
    const totalDiscountTarget = group.buyerCount * activeTier.discount;
    const netTargetValue = totalMsrp - totalDiscountTarget;
    const isDispatched = proposal.status === "dispatched" || proposal.status === "counter_received" || proposal.status === "accepted";

    this.container.innerHTML = `
      <div class="negotiation-engine-layout">
        <!-- TOP BANNER: JOINT INTENT PROPOSAL AGGREGATION METRICS -->
        <div class="proposal-hero-card card-3d">
          <div class="hero-left">
            <div class="proposal-status-badge ${this.getStatusBadgeClass(proposal.status)}">
              <span class="status-indicator-dot"></span>
              ${this.getStatusLabel(proposal.status)}
            </div>
            <h3>Official Joint Intent Proposal #${group.id.toUpperCase().slice(-8)}</h3>
            <p class="text-muted">
              Aggregated collective buying power dispatched to certified dealership General Sales Managers in ${group.location}.
            </p>
          </div>

          <div class="hero-right-metrics">
            <div class="metric-pill">
              <span class="metric-label">Committed Buyers</span>
              <span class="metric-val">${group.buyerCount} Verified</span>
            </div>
            <div class="metric-pill">
              <span class="metric-label">Combined MSRP</span>
              <span class="metric-val">$${totalMsrp.toLocaleString()}</span>
            </div>
            <div class="metric-pill highlight">
              <span class="metric-label">Target Bulk Discount</span>
              <span class="metric-val text-orange">-$${totalDiscountTarget.toLocaleString()}</span>
            </div>
            <div class="metric-pill">
              <span class="metric-label">Target Fleet Total</span>
              <span class="metric-val">$${netTargetValue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- TWO COLUMN WORKBENCH -->
        <div class="negotiation-grid">
          <!-- LEFT: FORMAL PROPOSAL PREVIEW & DISPATCH -->
          <div class="proposal-document-panel card-3d">
            <div class="panel-header">
              <div class="header-icon-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <h4>Formal Joint Intent Proposal</h4>
              </div>
              <button type="button" class="btn btn-secondary btn-sm btn-3d" id="btn-view-document">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Full Intent Slip
              </button>
            </div>

            <div class="proposal-doc-preview">
              <div class="doc-watermark">RELATE VERIFIED FLEET</div>
              <div class="doc-row">
                <span class="doc-label">Group Vehicle:</span>
                <span class="doc-value"><strong>${group.year} ${group.brand} ${group.model}</strong></span>
              </div>
              <div class="doc-row">
                <span class="doc-label">Territory & Radius:</span>
                <span class="doc-value">${group.location} (within ${group.radiusMiles} miles)</span>
              </div>
              <div class="doc-row">
                <span class="doc-label">Participating Volume:</span>
                <span class="doc-value"><strong>${group.buyerCount} Units</strong></span>
              </div>
              <div class="doc-row">
                <span class="doc-label">Individual Target Discount:</span>
                <span class="doc-value text-orange"><strong>$${activeTier.discount.toLocaleString()} Off MSRP</strong> (${activeTier.label})</span>
              </div>
              <div class="doc-row">
                <span class="doc-label">Included Buyer Perks:</span>
                <span class="doc-value">${activeTier.perks}</span>
              </div>
              <div class="doc-row">
                <span class="doc-label">Buyer Verification Audit:</span>
                <span class="doc-value text-success">✔ 100% Pre-Approved & Ready</span>
              </div>
              <div class="doc-row">
                <span class="doc-label">Targeted Dealerships:</span>
                <span class="doc-value">${group.targetDealerships.join(" • ")}</span>
              </div>
              <div class="doc-row">
                <span class="doc-label">SLA Response Window:</span>
                <span class="doc-value">48 Hours from transmission</span>
              </div>
            </div>

            <div class="proposal-dispatch-action-box">
              ${!isDispatched ? `
                <div class="dispatch-callout">
                  <p><strong>Ready to Dispatch:</strong> When you trigger the proposal, all ${group.targetDealerships.length} dealership General Managers will receive instant notification to bid.</p>
                  <button type="button" id="btn-dispatch-proposal" class="btn btn-primary btn-3d w-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    Dispatch Proposal to Dealership Sales Managers
                  </button>
                </div>
              ` : `
                <div class="dispatch-active-banner">
                  <div class="dispatch-clock">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>Dealership Window Active • <strong>${group.expiresInHours}h Remaining</strong></span>
                  </div>
                  <button type="button" id="btn-re-dispatch" class="btn btn-secondary btn-sm btn-3d">
                    Re-ping Dealerships (${group.targetDealerships.length})
                  </button>
                </div>
              `}
            </div>
          </div>

          <!-- RIGHT: LIVE DEALERSHIP COUNTER-OFFERS -->
          <div class="counter-offers-panel card-3d">
            <div class="panel-header">
              <div class="header-icon-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <h4>Dealership Counter-Offers (${proposal.counterOffers?.length || 0})</h4>
              </div>
              <button type="button" class="btn btn-dark btn-sm btn-3d" id="btn-switch-to-dealer-mode">
                Dealer Portal Mode ↗
              </button>
            </div>

            <div class="counter-offers-list">
              ${this.renderCounterOffers(proposal.counterOffers, group)}
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(group.id);
  }

  renderCounterOffers(counters, group) {
    if (!counters || counters.length === 0) {
      return `
        <div class="counter-empty-state">
          <div class="counter-empty-icon">🤝</div>
          <h5>Awaiting Dealership Bids</h5>
          <p class="text-muted">Dealership sales managers are currently reviewing the ${group.buyerCount}-buyer intent packet. Incoming counter-offers appear here in real time!</p>
          <div class="counter-hint-box">
            <span>Tip: Switch to <strong>Dealer Portal Mode</strong> above to test publishing a verified dealer counter-offer yourself!</span>
          </div>
        </div>
      `;
    }

    return counters.map(counter => {
      const isAccepted = counter.status === "accepted";
      const totalVotes = (counter.votesAccept || 0) + (counter.votesReject || 0);
      const acceptPct = totalVotes > 0 ? Math.round((counter.votesAccept / totalVotes) * 100) : 0;

      return `
        <div class="counter-offer-card ${isAccepted ? 'accepted-card' : ''}" data-counter-id="${counter.id}">
          <div class="counter-card-header">
            <div class="dealer-title-wrap">
              <div class="dealer-name-line">
                <span class="dealer-name"><strong>${this.escapeHtml(counter.dealership)}</strong></span>
                <span class="verified-dealer-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#059669"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Verified Dealership
                </span>
              </div>
              <div class="dealer-manager-name">${this.escapeHtml(counter.salesManager)}</div>
            </div>

            <div class="counter-discount-tag">
              <span class="tag-sub">Per Vehicle Discount</span>
              <span class="tag-price text-orange">-$${counter.offeredDiscount.toLocaleString()} Off</span>
            </div>
          </div>

          <div class="counter-details-box">
            <div class="perks-row">
              <span class="perk-label">🎁 Included Perks:</span>
              <span class="perk-val">${this.escapeHtml(counter.perksIncluded)}</span>
            </div>
            <div class="terms-row">
              <span class="terms-label">📝 Terms & Delivery:</span>
              <span class="terms-val">${this.escapeHtml(counter.terms)}</span>
            </div>
          </div>

          <!-- GROUP CONSENSUS VOTING BAR -->
          <div class="counter-voting-section">
            <div class="voting-header">
              <span class="voting-title">Group Acceptance Threshold</span>
              <span class="voting-stat"><strong>${counter.votesAccept || 0} Accept</strong> vs <strong>${counter.votesReject || 0} Reject</strong> (${acceptPct}%)</span>
            </div>

            <div class="progress-bar-container">
              <div class="progress-fill fill-green" style="width: ${acceptPct}%"></div>
            </div>

            ${isAccepted ? `
              <div class="offer-finalized-badge">
                🎉 DEAL SECURED! This counter-offer was officially accepted by the group majority.
              </div>
            ` : `
              <div class="counter-actions-row">
                <button type="button" class="btn btn-success btn-sm btn-3d" data-action="accept-counter" data-counter-id="${counter.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Vote to Accept Offer
                </button>
                <button type="button" class="btn btn-secondary btn-sm btn-3d" data-action="reject-counter" data-counter-id="${counter.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Request Counter-Revision
                </button>
              </div>
            `}
          </div>
        </div>
      `;
    }).join("");
  }

  bindEvents(groupId) {
    // Dispatch Proposal Button
    const dispatchBtn = document.getElementById("btn-dispatch-proposal");
    if (dispatchBtn) {
      dispatchBtn.addEventListener("click", () => {
        sound.playClick();
        this.runDispatchAnimation(groupId);
      });
    }

    // Re-dispatch / Ping
    const redispatchBtn = document.getElementById("btn-re-dispatch");
    if (redispatchBtn) {
      redispatchBtn.addEventListener("click", () => {
        sound.playClick();
        window.relateToast?.show("Re-pinged 3 dealership sales managers with active count!");
      });
    }

    // Switch to dealer mode
    const dealerModeBtn = document.getElementById("btn-switch-to-dealer-mode");
    if (dealerModeBtn) {
      dealerModeBtn.addEventListener("click", () => {
        sound.playClick();
        store.toggleDealerMode(true);
      });
    }

    // View formal document
    const viewDocBtn = document.getElementById("btn-view-document");
    if (viewDocBtn) {
      viewDocBtn.addEventListener("click", () => {
        sound.playClick();
        this.openDocumentModal(groupId);
      });
    }

    // Voting on counter offers
    const acceptBtns = this.container.querySelectorAll('[data-action="accept-counter"]');
    acceptBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const counterId = btn.getAttribute("data-counter-id");
        sound.playJoinSuccess();
        store.voteOnCounterOffer(groupId, counterId, "accept");
        this.render();
        window.relateToast?.show("Your vote to ACCEPT this counter-offer was logged!");
      });
    });

    const rejectBtns = this.container.querySelectorAll('[data-action="reject-counter"]');
    rejectBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const counterId = btn.getAttribute("data-counter-id");
        sound.playClick();
        store.voteOnCounterOffer(groupId, counterId, "reject");
        this.render();
        window.relateToast?.show("Vote recorded. Requesting dealer revision.");
      });
    });
  }

  runDispatchAnimation(groupId) {
    const group = store.getState().groups.find(g => g.id === groupId);
    const activeTier = group.tiers[group.currentTierIndex] || group.tiers[0];

    const modalHtml = `
      <div id="dispatch-modal" class="modal-backdrop active">
        <div class="modal-card modal-3d dispatch-modal-box">
          <div class="dispatch-header">
            <div class="radar-ping-ring">
              <span class="ping-center">🤝</span>
            </div>
            <h4>Dispatching Joint Intent Proposal</h4>
            <p class="text-muted">Encrypting ${group.buyerCount} pre-approved commitments...</p>
          </div>

          <div class="dispatch-steps-list">
            <div class="step-item active" id="dstep-1">
              <span class="step-icon">✔</span>
              <span class="step-label">Aggregating $${(group.buyerCount * group.msrp).toLocaleString()} total fleet purchase value</span>
            </div>
            <div class="step-item" id="dstep-2">
              <span class="step-icon">○</span>
              <span class="step-label">Encrypting verified financing badges and buyer zip codes</span>
            </div>
            <div class="step-item" id="dstep-3">
              <span class="step-icon">○</span>
              <span class="step-label">Transmitting formal tender to ${group.targetDealerships.length} dealership General Managers</span>
            </div>
            <div class="step-item" id="dstep-4">
              <span class="step-icon">○</span>
              <span class="step-label">Activating 48-hour competitive counter-bidding SLA</span>
            </div>
          </div>

          <div class="dispatch-footer">
            <button type="button" class="btn btn-secondary btn-3d w-100" id="btn-cancel-dispatch" disabled>
              Dispatching Securely...
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById("dispatch-modal");

    // Sequence steps
    setTimeout(() => {
      document.getElementById("dstep-2").classList.add("active");
      document.getElementById("dstep-2").querySelector(".step-icon").textContent = "✔";
    }, 700);

    setTimeout(() => {
      document.getElementById("dstep-3").classList.add("active");
      document.getElementById("dstep-3").querySelector(".step-icon").textContent = "✔";
    }, 1400);

    setTimeout(() => {
      document.getElementById("dstep-4").classList.add("active");
      document.getElementById("dstep-4").querySelector(".step-icon").textContent = "✔";
      sound.playProposalFanfare();
    }, 2100);

    setTimeout(() => {
      store.dispatchProposal(groupId);
      modalEl.remove();
      this.render();
      window.relateToast?.show("🚀 Joint Intent Proposal Dispatched! Dealership response window active.");
    }, 2800);
  }

  openDocumentModal(groupId) {
    const group = store.getState().groups.find(g => g.id === groupId);
    const activeTier = group.tiers[group.currentTierIndex] || group.tiers[0];
    const totalMsrp = group.buyerCount * group.msrp;
    const totalDiscount = group.buyerCount * activeTier.discount;

    const modalHtml = `
      <div id="intent-doc-modal" class="modal-backdrop active">
        <div class="modal-card modal-3d doc-formal-modal">
          <div class="doc-modal-header">
            <div class="doc-official-seal">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#FF5500"><path d="M12 2L1 21h22L12 2zm0 4.12l8.28 14.38H3.72L12 6.12zm-1 5.88v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
            </div>
            <div>
              <h3>RELATE COLLECTIVE PURCHASE TENDER</h3>
              <p class="text-muted">Document ID: REL-TDR-${group.id.toUpperCase()}-2026</p>
            </div>
            <button type="button" class="modal-close-btn" id="close-doc-modal">&times;</button>
          </div>

          <div class="doc-formal-body">
            <div class="formal-section">
              <h5>1. EXECUTIVE SUMMARY & FLEET INTENT</h5>
              <p>This tender serves as formal notification that <strong>${group.buyerCount} pre-screened private buyers</strong> have combined intent to purchase the <strong>${group.year} ${group.brand} ${group.model}</strong> under fleet volume pricing terms.</p>
            </div>

            <div class="formal-table-wrap">
              <table class="formal-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Per Unit</th>
                    <th>Group Aggregate (${group.buyerCount} Units)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Manufacturer Base MSRP</td>
                    <td>$${group.msrp.toLocaleString()}</td>
                    <td><strong>$${totalMsrp.toLocaleString()}</strong></td>
                  </tr>
                  <tr>
                    <td>Tender Bulk Discount Request</td>
                    <td class="text-orange">-$${activeTier.discount.toLocaleString()}</td>
                    <td class="text-orange"><strong>-$${totalDiscount.toLocaleString()}</strong></td>
                  </tr>
                  <tr class="table-total-row">
                    <td>Net Purchase Commitment</td>
                    <td>$${(group.msrp - activeTier.discount).toLocaleString()}</td>
                    <td><strong>$${(totalMsrp - totalDiscount).toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="formal-section mt-3">
              <h5>2. VERIFIED BUYER REGISTRY AUDIT</h5>
              <div class="audit-chips-list">
                ${group.members.map((m, idx) => `
                  <div class="audit-chip">
                    <span class="chip-num">#${idx + 1}</span>
                    <span class="chip-name">${this.escapeHtml(m.name)}</span>
                    <span class="chip-zip">(${m.zip})</span>
                    <span class="chip-verified">✔ ${m.status}</span>
                  </div>
                `).join("")}
              </div>
            </div>

            <div class="formal-section mt-3">
              <h5>3. CONDITIONS & TARGET DEALERSHIPS</h5>
              <p class="text-muted small">
                Addressed to Sales General Managers of: <strong>${group.targetDealerships.join(", ")}</strong>.
                Pricing must include all factory destination charges, waive documentation fees exceeding statutory minimums, and incorporate ${activeTier.perks}.
              </p>
            </div>
          </div>

          <div class="doc-modal-footer">
            <button type="button" class="btn btn-secondary btn-3d" id="btn-print-doc">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print / Save PDF
            </button>
            <button type="button" class="btn btn-primary btn-3d" id="btn-doc-close">
              Close Document
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById("intent-doc-modal");

    const cleanup = () => modalEl.remove();
    document.getElementById("close-doc-modal").addEventListener("click", cleanup);
    document.getElementById("btn-doc-close").addEventListener("click", cleanup);
    document.getElementById("btn-print-doc").addEventListener("click", () => {
      window.print();
    });
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) cleanup();
    });
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case "accepted": return "badge-success";
      case "counter_received": return "badge-orange";
      case "dispatched": return "badge-blue";
      default: return "badge-neutral";
    }
  }

  getStatusLabel(status) {
    switch (status) {
      case "accepted": return "Deal Accepted & Finalized";
      case "counter_received": return "Dealership Counter Received";
      case "dispatched": return "Proposal Dispatched (48h Window)";
      default: return "Draft Proposal (Ready to Dispatch)";
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
