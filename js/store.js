/**
 * RELATE - Central Reactive Store
 * Manages state persistence, subscriptions, and actions for groups, chat, proposals, and user profile.
 */

import { INITIAL_DATA } from './data.js';

class Store {
  constructor() {
    this.storageKey = "relate_platform_state_v1";
    this.listeners = new Set();
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure new groups or fields are merged gracefully
        return {
          currentUser: parsed.currentUser || INITIAL_DATA.currentUser,
          locations: parsed.locations || INITIAL_DATA.locations,
          groups: parsed.groups || INITIAL_DATA.groups,
          dealershipsList: parsed.dealershipsList || INITIAL_DATA.dealershipsList,
          selectedGroupId: parsed.selectedGroupId || "group_rav4_atl",
          activeView: parsed.activeView || "browse", // 'browse', 'workbench', 'my-groups', 'dealer-portal', 'how-it-works'
          activeWorkbenchTab: parsed.activeWorkbenchTab || "offer", // 'offer', 'chat', 'proposal', 'counters'
          dealerMode: parsed.dealerMode || false,
          currentDealer: parsed.currentDealer || INITIAL_DATA.dealershipsList[0],
          filters: {
            brand: "all",
            bodyType: "all",
            location: "all",
            radius: 50,
            maxPrice: 90000,
            searchQuery: ""
          }
        };
      }
    } catch (e) {
      console.warn("Could not load from localStorage, initializing fresh state.", e);
    }

    return {
      currentUser: INITIAL_DATA.currentUser,
      locations: INITIAL_DATA.locations,
      groups: INITIAL_DATA.groups,
      dealershipsList: INITIAL_DATA.dealershipsList,
      selectedGroupId: "group_rav4_atl",
      activeView: "browse",
      activeWorkbenchTab: "offer",
      dealerMode: false,
      currentDealer: INITIAL_DATA.dealershipsList[0],
      filters: {
        brand: "all",
        bodyType: "all",
        location: "all",
        radius: 50,
        maxPrice: 90000,
        searchQuery: ""
      }
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Failed to save state to localStorage", e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload) {
    this.saveState();
    this.listeners.forEach(fn => fn(this.state, event, payload));
  }

  getState() {
    return this.state;
  }

  // --- ACTIONS ---

  setView(viewName) {
    this.state.activeView = viewName;
    this.notify("VIEW_CHANGED", viewName);
  }

  setWorkbenchTab(tabName) {
    this.state.activeWorkbenchTab = tabName;
    this.notify("WORKBENCH_TAB_CHANGED", tabName);
  }

  selectGroup(groupId, viewOverride = "workbench") {
    this.state.selectedGroupId = groupId;
    if (viewOverride) {
      this.state.activeView = viewOverride;
    }
    this.notify("GROUP_SELECTED", groupId);
  }

  getSelectedGroup() {
    return this.state.groups.find(g => g.id === this.state.selectedGroupId) || this.state.groups[0];
  }

  setFilters(partialFilters) {
    this.state.filters = { ...this.state.filters, ...partialFilters };
    this.notify("FILTERS_CHANGED", this.state.filters);
  }

  resetFilters() {
    this.state.filters = {
      brand: "all",
      bodyType: "all",
      location: "all",
      radius: 50,
      maxPrice: 90000,
      searchQuery: ""
    };
    this.notify("FILTERS_CHANGED", this.state.filters);
  }

  toggleDealerMode(enable) {
    this.state.dealerMode = typeof enable === "boolean" ? enable : !this.state.dealerMode;
    if (this.state.dealerMode) {
      this.state.activeView = "dealer-portal";
    } else {
      this.state.activeView = "browse";
    }
    this.notify("DEALER_MODE_TOGGLED", this.state.dealerMode);
  }

  // --- BUYER GROUP JOIN / LEAVE ---

  toggleJoinGroup(groupId) {
    const group = this.state.groups.find(g => g.id === groupId);
    if (!group) return false;

    const user = this.state.currentUser;
    const isJoined = user.joinedGroupIds.includes(groupId);

    if (isJoined) {
      // Leave group
      user.joinedGroupIds = user.joinedGroupIds.filter(id => id !== groupId);
      group.members = group.members.filter(m => m.id !== user.id);
      group.buyerCount = Math.max(0, group.buyerCount - 1);
    } else {
      // Join group
      user.joinedGroupIds.push(groupId);
      if (!group.members.some(m => m.id === user.id)) {
        group.members.push({
          id: user.id,
          name: user.name + " (You)",
          role: "Buyer (You)",
          zip: user.zipCode,
          status: user.readinessStatus || "Pre-Approved",
          deposit: true,
          avatar: user.avatar
        });
      }
      group.buyerCount += 1;

      // Add system announcement in chat
      group.messages.push({
        id: "sys_" + Date.now(),
        senderId: "system",
        senderName: "Relate System",
        role: "Automated",
        avatar: "assets/relate-icon.svg",
        text: `🚀 ${user.name} joined the buying group! Buyer strength is now at ${group.buyerCount} units.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });
    }

    // Re-evaluate tier
    this.recalculateTier(group);

    this.notify("GROUP_MEMBERSHIP_TOGGLED", { groupId, isJoined: !isJoined, group });
    return !isJoined;
  }

  recalculateTier(group) {
    const count = group.buyerCount;
    let newTier = 0;
    if (count >= (group.tiers[2]?.minBuyers || 10)) {
      newTier = 2;
    } else if (count >= (group.tiers[1]?.minBuyers || 6)) {
      newTier = 1;
    } else {
      newTier = 0;
    }

    if (newTier > group.currentTierIndex) {
      // Upgraded tier announcement!
      const unlockedTier = group.tiers[newTier];
      group.messages.push({
        id: "sys_tier_" + Date.now(),
        senderId: "system",
        senderName: "Tier Milestone Engine",
        role: "Automated",
        avatar: "assets/relate-icon.svg",
        text: `🏆 CELEBRATION! Tier ${newTier + 1} UNLOCKED: ${unlockedTier.label}! Perks: ${unlockedTier.perks}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });
    }

    group.currentTierIndex = newTier;
  }

  // --- CHAT & POLLS ---

  sendChatMessage(groupId, text) {
    const group = this.state.groups.find(g => g.id === groupId);
    if (!group || !text.trim()) return null;

    const user = this.state.currentUser;
    const msg = {
      id: "msg_" + Date.now(),
      senderId: user.id,
      senderName: user.name,
      role: "Buyer (You)",
      avatar: user.avatar,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    };

    group.messages.push(msg);
    this.notify("MESSAGE_ADDED", { groupId, message: msg });
    return msg;
  }

  castVote(groupId, pollId, optionId) {
    const group = this.state.groups.find(g => g.id === groupId);
    if (!group) return;

    const poll = group.polls.find(p => p.id === pollId);
    if (!poll) return;

    // If user already voted for this option, do nothing
    if (poll.userVoted === optionId) return;

    // Decrement prior vote if exists
    if (poll.userVoted) {
      const prevOpt = poll.options.find(o => o.id === poll.userVoted);
      if (prevOpt && prevOpt.votes > 0) prevOpt.votes -= 1;
    } else {
      poll.totalVotes = (poll.totalVotes || 0) + 1;
    }

    // Increment new option
    const newOpt = poll.options.find(o => o.id === optionId);
    if (newOpt) {
      newOpt.votes = (newOpt.votes || 0) + 1;
      poll.userVoted = optionId;
    }

    this.notify("POLL_VOTED", { groupId, pollId, optionId, poll });
  }

  createNewPoll(groupId, question, optionTexts) {
    const group = this.state.groups.find(g => g.id === groupId);
    if (!group || !question.trim()) return null;

    const user = this.state.currentUser;
    const cleanOptions = optionTexts
      .filter(t => t.trim().length > 0)
      .map((t, idx) => ({
        id: "copt_" + Date.now() + "_" + idx,
        text: t.trim(),
        votes: 0
      }));

    if (cleanOptions.length < 2) return null;

    const poll = {
      id: "poll_" + Date.now(),
      question: question.trim(),
      createdBy: `${user.name} (You)`,
      totalVotes: 0,
      options: cleanOptions,
      userVoted: null
    };

    group.polls.unshift(poll);

    // Announce poll in chat
    group.messages.push({
      id: "sys_poll_" + Date.now(),
      senderId: "system",
      senderName: "Live Poll Launched",
      role: "Automated",
      avatar: "assets/relate-icon.svg",
      text: `📊 ${user.name} created a new group poll: "${poll.question}". Cast your vote now!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    this.notify("POLL_CREATED", { groupId, poll });
    return poll;
  }

  // --- PROPOSALS & NEGOTIATION ---

  dispatchProposal(groupId) {
    const group = this.state.groups.find(g => g.id === groupId);
    if (!group) return;

    const activeTier = group.tiers[group.currentTierIndex];
    group.proposal.status = "dispatched";
    group.proposal.dispatchedAt = new Date().toISOString();
    group.proposal.expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    group.proposal.requestedDiscount = activeTier.discount;
    group.proposal.dealershipsContacted = group.targetDealerships.length;

    // Chat system announcement
    group.messages.push({
      id: "sys_prop_" + Date.now(),
      senderId: "system",
      senderName: "Relate Pitch Engine",
      role: "Automated",
      avatar: "assets/relate-icon.svg",
      text: `🚀 Formal Joint Intent Proposal dispatched to ${group.targetDealerships.length} certified dealerships! Target discount: $${activeTier.discount.toLocaleString()} off each unit. Response window open.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    this.notify("PROPOSAL_DISPATCHED", { groupId, proposal: group.proposal });
  }

  voteOnCounterOffer(groupId, counterId, voteType) { // 'accept' or 'reject'
    const group = this.state.groups.find(g => g.id === groupId);
    if (!group || !group.proposal?.counterOffers) return;

    const counter = group.proposal.counterOffers.find(c => c.id === counterId);
    if (!counter) return;

    if (voteType === "accept") {
      counter.votesAccept = (counter.votesAccept || 0) + 1;
    } else {
      counter.votesReject = (counter.votesReject || 0) + 1;
    }

    if (counter.votesAccept >= Math.ceil(group.buyerCount * 0.6)) {
      counter.status = "accepted";
      group.proposal.status = "accepted";
      group.messages.push({
        id: "sys_cntr_win_" + Date.now(),
        senderId: "system",
        senderName: "Deal Finalized!",
        role: "Automated",
        avatar: "assets/dealer-badge.svg",
        text: `🎉 The group has officially ACCEPTED the counter-offer from ${counter.dealership}! Discount secured: $${counter.offeredDiscount.toLocaleString()} per vehicle. Contract finalization documents ready.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });
    }

    this.notify("COUNTER_OFFER_VOTED", { groupId, counterId, voteType, counter });
  }

  submitDealerCounterOffer(groupId, dealershipName, managerName, offeredDiscount, perks, terms) {
    const group = this.state.groups.find(g => g.id === groupId);
    if (!group) return null;

    const counter = {
      id: "counter_" + Date.now(),
      dealership: dealershipName,
      salesManager: managerName,
      verifiedBadge: true,
      offeredDiscount: Number(offeredDiscount),
      perksIncluded: perks || "Standard group complimentary bundle",
      terms: terms || "Delivery within 5 business days of contract issuance.",
      status: "active",
      votesAccept: 1,
      votesReject: 0
    };

    if (!group.proposal) {
      group.proposal = { status: "counter_received", counterOffers: [] };
    }
    if (!group.proposal.counterOffers) {
      group.proposal.counterOffers = [];
    }

    group.proposal.counterOffers.unshift(counter);
    group.proposal.status = "counter_received";

    group.messages.push({
      id: "sys_dealer_cntr_" + Date.now(),
      senderId: "system",
      senderName: "Dealership Counter-Offer Received",
      role: "Verified Dealer",
      avatar: "assets/dealer-badge.svg",
      text: `📢 ${dealershipName} (${managerName}) just published an official counter-offer: $${Number(offeredDiscount).toLocaleString()} off MSRP! Perks: ${counter.perksIncluded}. Review and cast your vote!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    this.notify("DEALER_COUNTER_SUBMITTED", { groupId, counter });
    return counter;
  }

  // --- USER PROFILE & AUTH ---

  updateCurrentUser(userData) {
    this.state.currentUser = { ...this.state.currentUser, ...userData };
    this.notify("USER_UPDATED", this.state.currentUser);
  }

  createNewBuyingGroup(groupPayload) {
    const user = this.state.currentUser;
    const newId = "group_" + Date.now();
    const newGroup = {
      id: newId,
      title: groupPayload.title || `${groupPayload.brand} ${groupPayload.model} Collective`,
      brand: groupPayload.brand,
      model: groupPayload.model,
      year: Number(groupPayload.year) || 2025,
      bodyType: groupPayload.bodyType || "SUV",
      msrp: Number(groupPayload.msrp) || 42000,
      location: groupPayload.location || user.city || "Atlanta, GA",
      radiusMiles: Number(groupPayload.radiusMiles) || 30,
      targetDealerships: groupPayload.targetDealerships || ["Certified Regional Volume Dealers"],
      image: groupPayload.image || "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80",
      expiresInHours: 72,
      expirationDate: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      description: groupPayload.description || `Group buyers combining orders for ${groupPayload.brand} ${groupPayload.model} with volume discounts.`,
      tiers: [
        { tier: 1, minBuyers: 3, maxBuyers: 5, discount: Math.round(groupPayload.msrp * 0.07), label: `$${Math.round(groupPayload.msrp * 0.07).toLocaleString()} Off MSRP`, perks: "All-Weather Mats + Dealer Fee Waiver" },
        { tier: 2, minBuyers: 6, maxBuyers: 9, discount: Math.round(groupPayload.msrp * 0.11), label: `$${Math.round(groupPayload.msrp * 0.11).toLocaleString()} Off MSRP`, perks: "Ceramic Tint + 2-Yr Scheduled Maintenance" },
        { tier: 3, minBuyers: 10, maxBuyers: 15, discount: Math.round(groupPayload.msrp * 0.15), label: `$${Math.round(groupPayload.msrp * 0.15).toLocaleString()} Off MSRP`, perks: "3-Yr Warranty Extension + Free Home Delivery" }
      ],
      currentTierIndex: 0,
      buyerCount: 1,
      maxCapacity: 15,
      members: [
        {
          id: user.id,
          name: user.name + " (Captain)",
          role: "Group Captain",
          zip: user.zipCode,
          status: user.readinessStatus || "Pre-Approved",
          deposit: true,
          avatar: user.avatar
        }
      ],
      proposal: {
        id: "prop_" + newId,
        status: "draft",
        dispatchedAt: null,
        expiresAt: null,
        requestedDiscount: Math.round(groupPayload.msrp * 0.07),
        dealershipsContacted: 0,
        counterOffers: []
      },
      polls: [
        {
          id: "poll_init_" + newId,
          question: "Preferred delivery timeline for this group order?",
          createdBy: `${user.name} (Captain)`,
          totalVotes: 1,
          options: [
            { id: "p1", text: "Within 2 Weeks (Immediate Lot Inventory)", votes: 1 },
            { id: "p2", text: "End of Month / Quarter (Maximum Factory Rebate)", votes: 0 }
          ],
          userVoted: "p1"
        }
      ],
      messages: [
        {
          id: "m_init_" + newId,
          senderId: user.id,
          senderName: user.name,
          role: "Captain",
          avatar: user.avatar,
          text: `Welcome to the ${groupPayload.brand} ${groupPayload.model} group! As group captain, I created this to get us fleet invoice pricing. Share the link with friends to hit Tier 1!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: false
        }
      ]
    };

    user.joinedGroupIds.push(newId);
    this.state.groups.unshift(newGroup);
    this.state.selectedGroupId = newId;
    this.state.activeView = "workbench";
    this.notify("GROUP_CREATED", newGroup);
    return newGroup;
  }
}

export const store = new Store();
