/**
 * RELATE - Group Savings & Finance Calculator
 * Computes solo car purchase vs. Relate bulk group purchase with dynamic loan terms,
 * APR, down payments, and total lifetime savings.
 */

import { sound } from './audio.js';

export class SavingsCalculator {
  constructor() {
    this.container = null;
  }

  mount(containerEl, group) {
    this.container = containerEl;
    this.render(group);
  }

  render(group) {
    if (!this.container || !group) return;

    const activeTier = group.tiers[group.currentTierIndex] || group.tiers[0];
    const msrp = group.msrp;
    const discount = activeTier.discount;
    const initialDown = Math.round(msrp * 0.15);

    this.container.innerHTML = `
      <div class="calculator-card card-3d">
        <div class="calc-header">
          <div class="calc-title-line">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A25F2A" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="4"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="12" y1="10" x2="12" y2="10.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="12" y1="14" x2="12" y2="14.01"></line><line x1="8" y1="18" x2="8" y2="18.01"></line><line x1="12" y1="18" x2="12" y2="18.01"></line></svg>
            <h4>Group Buying Savings Calculator</h4>
          </div>
          <span class="badge badge-orange">${group.brand} ${group.model}</span>
        </div>

        <div class="calc-grid">
          <!-- INPUTS -->
          <div class="calc-controls">
            <div class="form-group">
              <div class="slider-header">
                <label class="form-label" for="calc-down-payment">Down Payment</label>
                <span id="calc-down-val" class="slider-val-badge">$${initialDown.toLocaleString()}</span>
              </div>
              <input type="range" id="calc-down-payment" class="range-slider" min="0" max="${Math.round(msrp * 0.5)}" step="500" value="${initialDown}">
            </div>

            <div class="form-group">
              <div class="slider-header">
                <label class="form-label" for="calc-term">Loan Term</label>
                <span id="calc-term-val" class="slider-val-badge">60 Months</span>
              </div>
              <input type="range" id="calc-term" class="range-slider" min="36" max="72" step="12" value="60">
              <div class="slider-labels">
                <span>36 mo</span>
                <span>48 mo</span>
                <span>60 mo</span>
                <span>72 mo</span>
              </div>
            </div>

            <div class="form-group">
              <div class="slider-header">
                <label class="form-label" for="calc-apr">Interest Rate (APR)</label>
                <span id="calc-apr-val" class="slider-val-badge">5.9% APR</span>
              </div>
              <input type="range" id="calc-apr" class="range-slider" min="1.9" max="11.9" step="0.1" value="5.9">
            </div>
          </div>

          <!-- COMPARISON RESULTS DISPLAY -->
          <div class="calc-results-display">
            <div class="comparison-row">
              <!-- SOLO BUYING -->
              <div class="comp-box solo-box">
                <span class="comp-tag text-muted">Solo Individual Buyer</span>
                <div class="comp-price">$${msrp.toLocaleString()}</div>
                <div class="comp-monthly" id="calc-solo-monthly">$0 / mo</div>
                <div class="comp-breakdown text-muted small">
                  Full MSRP + $899 Dealer Doc Fee + standard interest
                </div>
              </div>

              <!-- RELATE GROUP -->
              <div class="comp-box relate-box">
                <span class="comp-tag badge-orange">Relate Group Buying</span>
                <div class="comp-price text-orange">$${(msrp - discount).toLocaleString()}</div>
                <div class="comp-monthly text-orange" id="calc-group-monthly">$0 / mo</div>
                <div class="comp-breakdown text-muted small">
                  <strong>-$${discount.toLocaleString()} Off MSRP</strong> + Zero Markups + Free Perks
                </div>
              </div>
            </div>

            <div class="total-savings-banner">
              <div class="savings-highlight">
                <span class="sav-label">Total Out-of-Pocket Savings</span>
                <span class="sav-amount" id="calc-total-savings">-$${(discount + 899).toLocaleString()}</span>
              </div>
              <div class="monthly-difference" id="calc-monthly-diff">
                Saving ~$68 every single month!
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(msrp, discount);
    this.updateCalculations(msrp, discount);
  }

  bindEvents(msrp, discount) {
    const downSlider = document.getElementById("calc-down-payment");
    const termSlider = document.getElementById("calc-term");
    const aprSlider = document.getElementById("calc-apr");

    const onInput = () => {
      document.getElementById("calc-down-val").textContent = `$${Number(downSlider.value).toLocaleString()}`;
      document.getElementById("calc-term-val").textContent = `${termSlider.value} Months`;
      document.getElementById("calc-apr-val").textContent = `${aprSlider.value}% APR`;
      this.updateCalculations(msrp, discount);
    };

    downSlider?.addEventListener("input", onInput);
    termSlider?.addEventListener("input", onInput);
    aprSlider?.addEventListener("input", onInput);
  }

  updateCalculations(msrp, discount) {
    const downPayment = Number(document.getElementById("calc-down-payment")?.value || 0);
    const months = Number(document.getElementById("calc-term")?.value || 60);
    const annualRate = Number(document.getElementById("calc-apr")?.value || 5.9) / 100;
    const monthlyRate = annualRate / 12;

    // Solo Loan: MSRP + $899 Doc Fee - Down Payment
    const soloPrincipal = Math.max(0, msrp + 899 - downPayment);
    // Group Loan: MSRP - discount - Down Payment
    const groupPrincipal = Math.max(0, msrp - discount - downPayment);

    const calcMonthly = (principal, rate, n) => {
      if (principal <= 0) return 0;
      if (rate === 0) return principal / n;
      return (principal * (rate * Math.pow(1 + rate, n))) / (Math.pow(1 + rate, n) - 1);
    };

    const soloMonthly = Math.round(calcMonthly(soloPrincipal, monthlyRate, months));
    const groupMonthly = Math.round(calcMonthly(groupPrincipal, monthlyRate, months));
    const diff = soloMonthly - groupMonthly;

    const totalSoloPaid = soloMonthly * months + downPayment;
    const totalGroupPaid = groupMonthly * months + downPayment;
    const totalSavings = Math.round(totalSoloPaid - totalGroupPaid);

    const soloEl = document.getElementById("calc-solo-monthly");
    const groupEl = document.getElementById("calc-group-monthly");
    const totalEl = document.getElementById("calc-total-savings");
    const diffEl = document.getElementById("calc-monthly-diff");

    if (soloEl) soloEl.textContent = `$${soloMonthly} / mo`;
    if (groupEl) groupEl.textContent = `$${groupMonthly} / mo`;
    if (totalEl) totalEl.textContent = `$${totalSavings.toLocaleString()}`;
    if (diffEl) diffEl.textContent = `Saving ~$${diff} every month for ${months} months!`;
  }
}
