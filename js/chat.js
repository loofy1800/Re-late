/**
 * RELATE - Buyer Coordination & Live Group Chat Engine
 * Real-time buyer messaging, live interactive polls, group leaderboard,
 * and peer message simulation.
 */

import { store } from './store.js';
import { sound } from './audio.js';

export class ChatEngine {
  constructor() {
    this.container = null;
    this.activeGroupId = null;
    this.peerSimulationTimer = null;
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

    this.container.innerHTML = `
      <div class="chat-workbench-layout">
        <!-- Main Chat Stream -->
        <div class="chat-stream-column">
          <div class="chat-stream-header">
            <div class="chat-title-group">
              <span class="live-pulse-dot"></span>
              <h4>Buyer Coordination Demo</h4>
              <span class="chat-online-badge">${group.buyerCount} sample buyers</span>
            </div>
            <div class="chat-stream-actions">
              <button type="button" class="btn btn-secondary btn-sm btn-3d" id="btn-open-poll-modal">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                + Create Poll
              </button>
            </div>
          </div>

          <!-- Messages List -->
          <div class="chat-messages-scroll" id="chat-messages-container">
            ${this.renderMessages(group.messages)}
          </div>

          <!-- Chat Input Bar -->
          <form id="chat-input-form" class="chat-input-bar">
            <input type="text" id="chat-text-input" class="form-input chat-input-field" placeholder="Message your co-buyers (e.g., 'What color trim are we targeting?')..." autocomplete="off" required>
            <button type="submit" class="btn btn-primary btn-3d chat-send-btn" aria-label="Send message">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>

        <!-- Sidebar: Active Polls & Leaderboard -->
        <div class="chat-sidebar-column">
          <!-- Active Polls Card -->
          <div class="sidebar-box polls-box card-3d">
            <div class="sidebar-box-header">
              <h5>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
                Group Consensus Polls (${group.polls.length})
              </h5>
            </div>
            <div class="polls-list" id="polls-list-container">
              ${this.renderPolls(group.polls, group.id)}
            </div>
          </div>

          <!-- Buyer Leaderboard & Verification Card -->
          <div class="sidebar-box leaderboard-box card-3d">
            <div class="sidebar-box-header">
              <h5>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Sample Buyer Roster (${group.members.length})
              </h5>
            </div>
            <div class="roster-list">
              ${this.renderRoster(group.members)}
            </div>
            <div class="roster-footer">
              <div class="verification-stat">
                <span class="text-muted">Sample profiles only</span>
                <span class="text-muted">No identity, escrow, or financing checks are performed.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(group.id);
    this.scrollToBottom();
  }

  renderMessages(messages) {
    if (!messages || messages.length === 0) {
      return `
        <div class="chat-empty-state">
          <p>No messages yet. Break the ice and coordinate with your co-buyers!</p>
        </div>
      `;
    }

    return messages.map(msg => {
      if (msg.isSystem) {
        return `
          <div class="chat-system-message">
            <div class="system-msg-pill">
              <span class="system-icon">⚡</span>
              <span class="system-text">${this.escapeHtml(msg.text)}</span>
              <span class="system-time">${this.escapeHtml(msg.timestamp)}</span>
            </div>
          </div>
        `;
      }

      const isCurrentUser = msg.senderId === store.getState().currentUser.id || msg.role.includes("You");

      return `
        <div class="chat-bubble-row ${isCurrentUser ? 'current-user-msg' : 'peer-msg'}">
          ${!isCurrentUser ? `<img src="${this.escapeHtml(msg.avatar)}" alt="${this.escapeHtml(msg.senderName)}" class="chat-avatar">` : ''}
          <div class="chat-bubble-content">
            <div class="chat-bubble-meta">
              <span class="chat-sender-name">${this.escapeHtml(msg.senderName)}</span>
              <span class="chat-role-badge ${msg.role === 'Captain' ? 'badge-orange' : 'badge-neutral'}">${this.escapeHtml(msg.role)}</span>
              <span class="chat-time">${this.escapeHtml(msg.timestamp)}</span>
            </div>
            <div class="chat-bubble-text">${this.escapeHtml(msg.text)}</div>
          </div>
          ${isCurrentUser ? `<img src="${this.escapeHtml(msg.avatar)}" alt="${this.escapeHtml(msg.senderName)}" class="chat-avatar">` : ''}
        </div>
      `;
    }).join("");
  }

  renderPolls(polls, groupId) {
    if (!polls || polls.length === 0) {
      return `
        <div class="poll-empty-hint">
          <p>No active polls yet. Click <strong>+ Create Poll</strong> to vote on target dealerships or delivery dates!</p>
        </div>
      `;
    }

    return polls.map(poll => {
      return `
        <div class="poll-card" data-poll-id="${this.escapeHtml(poll.id)}">
          <div class="poll-question-row">
            <h6>${this.escapeHtml(poll.question)}</h6>
            <span class="poll-votes-badge">${poll.totalVotes} votes</span>
          </div>
          <div class="poll-created-by">By ${this.escapeHtml(poll.createdBy)}</div>
          
          <div class="poll-options-list">
            ${poll.options.map(opt => {
              const pct = Math.round(((opt.votes || 0) / (poll.totalVotes > 0 ? poll.totalVotes : 1)) * 100);
              const isSelected = poll.userVoted === opt.id;

              return `
                <button type="button" class="poll-option-btn ${isSelected ? 'voted' : ''}" data-vote-opt="${this.escapeHtml(opt.id)}">
                  <div class="poll-progress-fill" style="width: ${pct}%"></div>
                  <div class="poll-option-content">
                    <span class="poll-check-icon">${isSelected ? '✓ ' : ''}</span>
                    <span class="poll-option-text">${this.escapeHtml(opt.text)}</span>
                    <span class="poll-option-pct">${pct}% (${opt.votes || 0})</span>
                  </div>
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");
  }

  renderRoster(members) {
    if (!members || members.length === 0) {
      return `<p class="text-muted p-2">No members yet.</p>`;
    }

    return members.map((m, index) => {
      const isCaptain = m.role.toLowerCase().includes("captain");
      return `
        <div class="roster-member-row">
          <div class="roster-rank">#${index + 1}</div>
          <img src="${this.escapeHtml(m.avatar)}" alt="${this.escapeHtml(m.name)}" class="avatar-sm">
          <div class="roster-details">
            <div class="roster-name-line">
              <span class="roster-name">${this.escapeHtml(m.name)}</span>
              ${isCaptain ? `<span class="badge badge-orange-sm">Captain</span>` : ''}
            </div>
            <div class="roster-subline">
              <span class="roster-zip">📍 ${this.escapeHtml(m.zip)}</span>
              <span class="roster-status ${m.status.includes('Pre-Approved') ? 'status-green' : 'status-blue'}">
                ● ${this.escapeHtml(m.status)}
              </span>
            </div>
          </div>
          <span class="text-muted small">${m.deposit ? "Sample deposit listed" : "No sample deposit listed"}</span>
        </div>
      `;
    }).join("");
  }

  bindEvents(groupId) {
    // Form submit
    const form = document.getElementById("chat-input-form");
    const input = document.getElementById("chat-text-input");

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        sound.playClick();
        store.sendChatMessage(groupId, text);
        input.value = "";
        this.render();

        // Simulate co-buyer reply after 1.8s
        this.triggerSimulatedPeerReply(groupId, text);
      });
    }

    // Voting on poll options
    const pollButtons = this.container.querySelectorAll("[data-vote-opt]");
    pollButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const pollCard = btn.closest("[data-poll-id]");
        if (!pollCard) return;
        const pollId = pollCard.getAttribute("data-poll-id");
        const optionId = btn.getAttribute("data-vote-opt");

        sound.playVoteDing();
        store.castVote(groupId, pollId, optionId);
        this.render();

        window.relateToast?.show("Your vote has been recorded and factored into the proposal!");
      });
    });

    // Open Poll Creation Modal
    const openPollBtn = document.getElementById("btn-open-poll-modal");
    if (openPollBtn) {
      openPollBtn.addEventListener("click", () => {
        sound.playClick();
        this.openCreatePollModal(groupId);
      });
    }
  }

  triggerSimulatedPeerReply(groupId, userText) {
    clearTimeout(this.peerSimulationTimer);
    this.peerSimulationTimer = setTimeout(() => {
      const group = store.getState().groups.find(g => g.id === groupId);
      if (!group) return;

      const peers = [
        { name: "Sarah Chen", role: "Group Captain", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80" },
        { name: "Marcus Vance", role: "Buyer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" },
        { name: "Elena Rostova", role: "Buyer", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" }
      ];
      const randomPeer = peers[Math.floor(Math.random() * peers.length)];

      let replyText = "Agreed! That helps our collective leverage when we dispatch the intent document.";
      const lower = userText.toLowerCase();
      if (lower.includes("price") || lower.includes("discount") || lower.includes("tier")) {
        replyText = "If we can recruit just 2 more buyers to the group, the tier jumps significantly!";
      } else if (lower.includes("dealer") || lower.includes("hendrick") || lower.includes("ellis")) {
        replyText = "A live buyer count could help explain the group's interest in a real dealership conversation.";
      } else if (lower.includes("when") || lower.includes("time") || lower.includes("saturday")) {
        replyText = "Saturday 11 AM works best for me too so we can sign everything as a fleet unit.";
      } else if (lower.includes("color") || lower.includes("trim")) {
        replyText = "Dealership confirmed they can pull colors from regional inventory as long as we confirm VIN reservations.";
      }

      group.messages.push({
        id: "msg_sim_" + Date.now(),
        senderId: "sim_" + Math.random(),
        senderName: randomPeer.name,
        role: randomPeer.role,
        avatar: randomPeer.avatar,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: false
      });

      sound.playMessagePop();
      this.render();
    }, 1800);
  }

  openCreatePollModal(groupId) {
    const modalHtml = `
      <div id="create-poll-modal" class="modal-backdrop active">
        <div class="modal-card modal-3d">
          <div class="modal-header">
            <h4>Launch a Group Decision Poll</h4>
            <button type="button" class="modal-close-btn" id="close-poll-modal">&times;</button>
          </div>
          <form id="create-poll-form" class="mt-3">
            <div class="form-group">
              <label class="form-label" for="poll-question-input">Question / Proposal for Group</label>
              <input type="text" id="poll-question-input" class="form-input" placeholder="e.g. Which dealership showroom should we sign at?" required>
            </div>
            <div class="form-group">
              <label class="form-label">Voting Options</label>
              <div id="poll-options-inputs">
                <input type="text" class="form-input mb-2 poll-opt-val" placeholder="Option 1 (e.g. Hendrick Toyota Sandy Springs)" required>
                <input type="text" class="form-input mb-2 poll-opt-val" placeholder="Option 2 (e.g. Jim Ellis Toyota)" required>
                <input type="text" class="form-input mb-2 poll-opt-val" placeholder="Option 3 (Optional)">
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-3d w-100">
              Publish Poll to Group
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById("create-poll-modal");

    const cleanup = () => {
      modalEl.remove();
    };

    document.getElementById("close-poll-modal").addEventListener("click", cleanup);
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) cleanup();
    });

    document.getElementById("create-poll-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const question = document.getElementById("poll-question-input").value;
      const optionEls = modalEl.querySelectorAll(".poll-opt-val");
      const optionTexts = Array.from(optionEls).map(el => el.value);

      sound.playJoinSuccess();
      store.createNewPoll(groupId, question, optionTexts);
      cleanup();
      this.render();
      window.relateToast?.show("Poll published to active buying group!");
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      const scrollEl = document.getElementById("chat-messages-container");
      if (scrollEl) {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      }
    }, 50);
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
