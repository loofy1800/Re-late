/**
 * RELATE - Authentication & User Profile System
 * Supports:
 * 1. Mobile Phone Number (with simulated OTP verification step + countdown)
 * 2. Google Account (One-click simulated OAuth flow)
 * 3. Email & Password
 * Plus full profile onboarding: Name, Zip/Location, Target Budget, Preferred Car Brands, Readiness Status.
 */

import { store } from './store.js';
import { sound } from './audio.js';

export class AuthManager {
  constructor() {
    this.modalEl = null;
    this.otpTimer = null;
    this.otpCountdownSeconds = 45;
    this.simulatedOtpCode = "849201";
    this.init();
  }

  init() {
    this.renderModal();
    this.bindGlobalTriggers();
  }

  renderModal() {
    const modalHtml = `
      <div id="auth-modal" class="modal-backdrop" aria-hidden="true">
        <div class="modal-card modal-3d" role="dialog" aria-labelledby="auth-modal-title">
          <button type="button" class="modal-close-btn" id="auth-close-btn" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <!-- Header -->
          <div class="auth-header">
            <div class="auth-logo-badge">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#2B1810"/>
                <!-- Sleek Car Silhouette -->
                <path d="M8 24C9 20 12 17 17 16L24 16C28 17 31 20 33 24L34 26H6L8 24Z" fill="#A25F2A"/>
                <circle cx="12" cy="27" r="2.5" fill="#FFFFFF"/>
                <circle cx="28" cy="27" r="2.5" fill="#FFFFFF"/>
                <!-- Handshake 🤝 -->
                <path d="M15 14L18 17L21 14M22 14L25 17L27 15" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h2 id="auth-modal-title" class="auth-title">Join Relate Group Buying</h2>
            <p class="auth-subtitle">Unlock wholesale dealer bulk pricing with local co-buyers.</p>
          </div>

          <!-- Auth Methods Tabs -->
          <div class="auth-tabs" role="tablist">
            <button type="button" class="auth-tab-btn active" data-auth-tab="phone" role="tab" aria-selected="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Phone OTP
            </button>
            <button type="button" class="auth-tab-btn" data-auth-tab="google" role="tab" aria-selected="false">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Google
            </button>
            <button type="button" class="auth-tab-btn" data-auth-tab="email" role="tab" aria-selected="false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Email & Pass
            </button>
          </div>

          <!-- TAB 1: PHONE NUMBER & OTP -->
          <div id="auth-panel-phone" class="auth-panel active">
            <div id="phone-step-1">
              <div class="form-group">
                <label for="auth-phone-input" class="form-label">Mobile Phone Number</label>
                <div class="input-with-addon">
                  <span class="input-prefix">🇺🇸 +1</span>
                  <input type="tel" id="auth-phone-input" class="form-input" placeholder="(404) 555-0192" value="(404) 555-0192" required>
                </div>
                <span class="form-hint">Demo only: no SMS is sent. Use the displayed 6-digit code.</span>
              </div>
              <button type="button" id="btn-send-otp" class="btn btn-primary btn-3d w-100">
                Send Verification Code
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>

            <div id="phone-step-2" class="d-none">
              <div class="otp-banner">
                <div class="otp-banner-icon">💬</div>
                <div>
                  <strong>Simulated SMS Code Sent!</strong>
                  <div class="otp-hint-code">Demo code: <mark id="sim-code-display">849201</mark></div>
                </div>
              </div>
              <div class="form-group">
                <label for="otp-code-input" class="form-label">Enter 6-Digit Code</label>
                <input type="text" id="otp-code-input" class="form-input otp-large-input" maxlength="6" placeholder="849201" autocomplete="one-time-code">
                <div class="otp-countdown-row">
                  <span id="otp-countdown-text">Resend in 0:45</span>
                  <button type="button" id="btn-resend-otp" class="btn-link" disabled>Resend Code</button>
                </div>
              </div>
              <button type="button" id="btn-verify-otp" class="btn btn-primary btn-3d w-100">
                Verify & Continue
              </button>
              <button type="button" id="btn-back-to-phone" class="btn btn-secondary btn-3d w-100 mt-2">
                Use Different Phone Number
              </button>
            </div>
          </div>

          <!-- TAB 2: GOOGLE OAUTH -->
          <div id="auth-panel-google" class="auth-panel">
            <div class="google-auth-box">
              <div class="google-avatar-preview">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80" alt="Google Profile" class="avatar-lg">
                <div class="google-badge-overlay">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
              </div>
              <h4>Alex Morgan</h4>
              <p class="text-muted">alex.morgan@gmail.com</p>
              <div class="google-privacy-notice">
                Demo preview only. No Google account is connected and no profile data is sent.
              </div>
              <button type="button" id="btn-google-oauth-login" class="btn btn-dark btn-3d w-100">
                Continue with Sample Profile
              </button>
            </div>
          </div>

          <!-- TAB 3: EMAIL & PASSWORD -->
          <div id="auth-panel-email" class="auth-panel">
            <form id="email-auth-form">
              <div class="form-group">
                <label for="auth-email-input" class="form-label">Email Address</label>
                <input type="email" id="auth-email-input" class="form-input" placeholder="alex.morgan@relatecars.com" value="alex.morgan@relatecars.com" required>
              </div>
              <div class="form-group">
                <label for="auth-pass-input" class="form-label">Password</label>
                <input type="password" id="auth-pass-input" class="form-input" placeholder="Enter your password" required>
              </div>
              <p class="form-hint">Demo only. Credentials are not verified, stored, or sent anywhere.</p>
              <button type="submit" class="btn btn-primary btn-3d w-100">
                Sign In with Email
              </button>
            </form>
          </div>

          <!-- STEP 2: PROFILE ONBOARDING / CUSTOMIZATION FIELDS -->
          <div id="auth-panel-profile" class="auth-panel d-none">
            <div class="profile-onboarding-header">
              <span class="badge badge-orange">Demo Buyer Profile</span>
              <h3>Configure Your Purchasing Power</h3>
              <p class="text-muted">Saved locally for this demo only. No identity or financial checks are performed.</p>
            </div>

            <form id="profile-onboarding-form">
              <div class="form-group">
                <label class="form-label" for="prof-name">Profile Name</label>
                <input type="text" id="prof-name" class="form-input" required>
              </div>

              <div class="grid-2-col">
                <div class="form-group">
                  <label class="form-label" for="prof-zip">Preferred Zip Code</label>
                  <input type="text" id="prof-zip" class="form-input" maxlength="5" pattern="[0-9]{5}" placeholder="30309" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="prof-city">Metro Region</label>
                  <input type="text" id="prof-city" class="form-input" placeholder="Atlanta, GA" required>
                </div>
              </div>

              <div class="form-group">
                <div class="slider-header">
                  <label class="form-label" for="prof-budget">Target Vehicle Budget</label>
                  <span id="prof-budget-val" class="slider-val-badge">$45,000</span>
                </div>
                <input type="range" id="prof-budget" class="range-slider" min="20000" max="100000" step="1000" value="45000">
                <div class="slider-labels">
                  <span>$20k</span>
                  <span>$50k</span>
                  <span>$100k+</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Preferred Car Brands (Select 1 or more)</label>
                <div class="brand-pills-selector" id="brand-selector">
                  <button type="button" class="brand-pill active" data-brand="Toyota">Toyota</button>
                  <button type="button" class="brand-pill active" data-brand="Tesla">Tesla</button>
                  <button type="button" class="brand-pill active" data-brand="BMW">BMW</button>
                  <button type="button" class="brand-pill active" data-brand="Hyundai">Hyundai</button>
                  <button type="button" class="brand-pill" data-brand="Ford">Ford</button>
                  <button type="button" class="brand-pill" data-brand="Honda">Honda</button>
                  <button type="button" class="brand-pill" data-brand="Porsche">Porsche</button>
                  <button type="button" class="brand-pill" data-brand="Lexus">Lexus</button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-readiness">Purchase Readiness</label>
                <select id="prof-readiness" class="form-select">
                  <option value="Pre-Approved ($50k)">Pre-Approved Tier 1 Credit ($50k)</option>
                  <option value="Cash Verified">Cash / Liquid Funds Verified</option>
                  <option value="Trade-In Ready">Trade-In Ready + Financing</option>
                  <option value="Exploring Groups">Exploring / Ready Within 30 Days</option>
                </select>
              </div>

              <button type="submit" class="btn btn-primary btn-3d w-100">
                Save Profile & Start Group Buying
              </button>
            </form>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.modalEl = document.getElementById("auth-modal");
    this.bindEvents();
  }

  bindGlobalTriggers() {
    // Top bar login/profile button
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-trigger-auth]");
      if (trigger) {
        e.preventDefault();
        sound.playClick();
        const mode = trigger.getAttribute("data-trigger-auth") || "login";
        this.openModal(mode);
      }
    });
  }

  bindEvents() {
    // Close button & outside click
    document.getElementById("auth-close-btn").addEventListener("click", () => this.closeModal());
    this.modalEl.addEventListener("click", (e) => {
      if (e.target === this.modalEl) this.closeModal();
    });

    // Tab buttons
    const tabBtns = this.modalEl.querySelectorAll("[data-auth-tab]");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        sound.playClick();
        const tab = btn.getAttribute("data-auth-tab");
        tabBtns.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");

        this.modalEl.querySelectorAll(".auth-panel").forEach(p => p.classList.remove("active"));
        const panel = document.getElementById(`auth-panel-${tab}`);
        if (panel) panel.classList.add("active");
      });
    });

    // Phone Step 1 -> Step 2
    document.getElementById("btn-send-otp").addEventListener("click", () => {
      sound.playClick();
      const phone = document.getElementById("auth-phone-input").value;
      const digits = phone.replace(/\D/g, "");
      if (digits.length !== 10 && !(digits.length === 11 && digits.startsWith("1"))) {
        alert("Please enter a valid mobile number.");
        return;
      }
      document.getElementById("phone-step-1").classList.add("d-none");
      document.getElementById("phone-step-2").classList.remove("d-none");
      document.getElementById("otp-code-input").value = this.simulatedOtpCode;
      this.startOtpTimer();
    });

    // Resend OTP
    document.getElementById("btn-resend-otp").addEventListener("click", () => {
      sound.playClick();
      this.startOtpTimer();
      alert("New simulated code resent: 849201");
    });

    // Back to phone input
    document.getElementById("btn-back-to-phone").addEventListener("click", () => {
      sound.playClick();
      document.getElementById("phone-step-2").classList.add("d-none");
      document.getElementById("phone-step-1").classList.remove("d-none");
      if (this.otpTimer) clearInterval(this.otpTimer);
    });

    // Verify OTP
    document.getElementById("btn-verify-otp").addEventListener("click", () => {
      const code = document.getElementById("otp-code-input").value;
      if (code !== this.simulatedOtpCode) {
        alert("The verification code is incorrect. Please enter the 6-digit demo code.");
        return;
      }
      sound.playJoinSuccess();
      this.showProfileStep();
    });

    // Google OAuth simulation
    document.getElementById("btn-google-oauth-login").addEventListener("click", () => {
      sound.playJoinSuccess();
      const btn = document.getElementById("btn-google-oauth-login");
      btn.innerHTML = `<span class="spinner-sm"></span> Opening demo profile...`;
      setTimeout(() => {
        btn.innerHTML = `Continue with Sample Profile`;
        this.showProfileStep();
      }, 700);
    });

    // Email Form submit
    document.getElementById("email-auth-form").addEventListener("submit", (e) => {
      e.preventDefault();
      sound.playJoinSuccess();
      this.showProfileStep();
    });

    // Budget slider live update
    const budgetSlider = document.getElementById("prof-budget");
    const budgetVal = document.getElementById("prof-budget-val");
    budgetSlider.addEventListener("input", (e) => {
      budgetVal.textContent = `$${Number(e.target.value).toLocaleString()}`;
    });

    // Brand selector pills toggle
    const brandPills = document.querySelectorAll("#brand-selector .brand-pill");
    brandPills.forEach(pill => {
      pill.addEventListener("click", () => {
        sound.playClick();
        pill.classList.toggle("active");
      });
    });

    // Profile form submit
    document.getElementById("profile-onboarding-form").addEventListener("submit", (e) => {
      e.preventDefault();
      sound.playJoinSuccess();

      const selectedBrands = Array.from(document.querySelectorAll("#brand-selector .brand-pill.active"))
        .map(p => p.getAttribute("data-brand"));
      const name = document.getElementById("prof-name").value.trim();
      if (!name || selectedBrands.length === 0) {
        alert("Enter your name and select at least one preferred brand.");
        return;
      }

      const updatedUser = {
        name,
        zipCode: document.getElementById("prof-zip").value,
        city: document.getElementById("prof-city").value.trim(),
        budget: Number(document.getElementById("prof-budget").value),
        preferredBrands: selectedBrands,
        readinessStatus: document.getElementById("prof-readiness").value,
        isVerified: true
      };

      store.updateCurrentUser(updatedUser);
      this.closeModal();

      // Notify toast
      window.relateToast?.show(`Welcome, ${updatedUser.name}! Profile saved with $${updatedUser.budget.toLocaleString()} target budget.`);
    });
  }

  startOtpTimer() {
    if (this.otpTimer) clearInterval(this.otpTimer);
    this.otpCountdownSeconds = 45;
    const resendBtn = document.getElementById("btn-resend-otp");
    const countdownText = document.getElementById("otp-countdown-text");
    resendBtn.disabled = true;

    this.otpTimer = setInterval(() => {
      this.otpCountdownSeconds -= 1;
      countdownText.textContent = `Resend in 0:${this.otpCountdownSeconds.toString().padStart(2, '0')}`;
      if (this.otpCountdownSeconds <= 0) {
        clearInterval(this.otpTimer);
        resendBtn.disabled = false;
        countdownText.textContent = "Didn't receive code?";
      }
    }, 1000);
  }

  showProfileStep() {
    // Hide auth method tabs & panels, show profile onboarding
    this.modalEl.querySelector(".auth-tabs").classList.add("d-none");
    this.modalEl.querySelectorAll(".auth-panel").forEach(p => p.classList.add("d-none"));
    const profPanel = document.getElementById("auth-panel-profile");
    profPanel.classList.remove("d-none");
    profPanel.classList.add("active");

    // Populate with current user data
    const user = store.getState().currentUser;
    document.getElementById("prof-name").value = user.name;
    document.getElementById("prof-zip").value = user.zipCode;
    document.getElementById("prof-city").value = user.city;
    document.getElementById("prof-budget").value = user.budget;
    document.getElementById("prof-budget-val").textContent = `$${user.budget.toLocaleString()}`;
    document.getElementById("prof-readiness").value = user.readinessStatus || "Pre-Approved ($50k)";

    // Update brands
    const brandPills = document.querySelectorAll("#brand-selector .brand-pill");
    brandPills.forEach(pill => {
      const b = pill.getAttribute("data-brand");
      if (user.preferredBrands.includes(b)) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });
  }

  openModal(mode = "login") {
    if (mode === "profile") {
      this.showProfileStep();
    } else {
      // Show tabs
      this.modalEl.querySelector(".auth-tabs").classList.remove("d-none");
      this.modalEl.querySelectorAll(".auth-panel").forEach(p => p.classList.remove("active", "d-none"));
      this.modalEl.querySelectorAll("[data-auth-tab]").forEach((tab, index) => {
        tab.classList.toggle("active", index === 0);
        tab.setAttribute("aria-selected", index === 0 ? "true" : "false");
      });
      this.modalEl.querySelector("#auth-panel-phone").classList.add("active");
      document.getElementById("phone-step-1").classList.remove("d-none");
      document.getElementById("phone-step-2").classList.add("d-none");
      document.getElementById("auth-panel-profile").classList.add("d-none");
    }

    this.modalEl.classList.add("active");
    this.modalEl.setAttribute("aria-hidden", "false");
  }

  closeModal() {
    this.modalEl.classList.remove("active");
    this.modalEl.setAttribute("aria-hidden", "true");
    if (this.otpTimer) clearInterval(this.otpTimer);
  }
}
