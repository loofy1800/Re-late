/**
 * RELATE - Data Layer
 * Comprehensive mock dataset of vehicles, buying groups, members, polls, and dealership counter-offers.
 */

export const INITIAL_DATA = {
  currentUser: {
    id: "user_alex_01",
    name: "Alex Morgan",
    email: "alex.morgan@relatecars.com",
    phone: "+1 (404) 555-0192",
    zipCode: "30309",
    city: "Atlanta, GA",
    budget: 45000,
    preferredBrands: ["Toyota", "Tesla", "BMW", "Hyundai"],
    readinessStatus: "Pre-Approved ($50k)",
    isVerified: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
    joinedGroupIds: ["group_rav4_atl", "group_modely_austin"]
  },

  locations: [
    { id: "loc_atl", name: "Atlanta, GA", zip: "30309", count: 14 },
    { id: "loc_dfw", name: "Dallas-Fort Worth, TX", zip: "75201", count: 18 },
    { id: "loc_atx", name: "Austin, TX", zip: "78701", count: 11 },
    { id: "loc_lax", name: "Los Angeles, CA", zip: "90012", count: 22 },
    { id: "loc_chi", name: "Chicago, IL", zip: "60601", count: 9 },
    { id: "loc_clt", name: "Charlotte, NC", zip: "28202", count: 8 },
    { id: "loc_mia", name: "Miami, FL", zip: "33101", count: 12 },
    { id: "loc_sfo", name: "San Francisco, CA", zip: "94102", count: 15 }
  ],

  groups: [
    {
      id: "group_rav4_atl",
      title: "Metro Atlanta RAV4 Hybrid Syndicate",
      brand: "Toyota",
      model: "RAV4 Hybrid (XLE / Limited)",
      year: 2025,
      bodyType: "SUV",
      msrp: 34800,
      location: "Atlanta, GA",
      radiusMiles: 25,
      targetDealerships: ["Hendrick Toyota Sandy Springs", "Jim Ellis Toyota of McDonough", "Nalley Toyota Stonecrest"],
      image: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=900&q=80",
      expiresInHours: 38,
      expirationDate: "2026-11-05T18:00:00",
      description: "Combining 8-12 buyers in Metro Atlanta to demand fleet invoice pricing on 2025 RAV4 Hybrids with zero dealer markups and waived doc fees.",
      tiers: [
        { tier: 1, minBuyers: 3, maxBuyers: 5, discount: 2200, label: "$2,200 Off MSRP", perks: "Free All-Weather Floor Mats" },
        { tier: 2, minBuyers: 6, maxBuyers: 9, discount: 3800, label: "$3,800 Off MSRP", perks: "Free Floor Mats + Ceramic Tint" },
        { tier: 3, minBuyers: 10, maxBuyers: 15, discount: 5200, label: "$5,200 Off MSRP", perks: "3-Yr Free Maintenance + Zero Doc Fee" }
      ],
      currentTierIndex: 1, // Tier 2 active!
      buyerCount: 7,
      maxCapacity: 15,
      members: [
        { id: "m1", name: "Sarah Chen", role: "Group Captain", zip: "30305", status: "Pre-Approved", deposit: true, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80" },
        { id: "m2", name: "Marcus Vance", role: "Buyer", zip: "30309", status: "Cash Verified", deposit: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" },
        { id: "m3", name: "Elena Rostova", role: "Buyer", zip: "30327", status: "Trade-In Ready", deposit: true, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" },
        { id: "m4", name: "David Kim", role: "Buyer", zip: "30062", status: "Pre-Approved", deposit: true, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" },
        { id: "m5", name: "Priya Sharma", role: "Buyer", zip: "30318", status: "Pre-Approved", deposit: true, avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" },
        { id: "m6", name: "Jamal Jenkins", role: "Buyer", zip: "30342", status: "Cash Verified", deposit: false, avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80" },
        { id: "user_alex_01", name: "Alex Morgan", role: "Buyer (You)", zip: "30309", status: "Pre-Approved ($50k)", deposit: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80" }
      ],
      proposal: {
        id: "prop_rav4_01",
        status: "counter_received", // draft, dispatched, counter_received, accepted
        dispatchedAt: "2026-11-03T10:15:00",
        expiresAt: "2026-11-05T10:15:00",
        requestedDiscount: 3800,
        dealershipsContacted: 3,
        counterOffers: [
          {
            id: "counter_hndrk_01",
            dealership: "Hendrick Toyota Sandy Springs",
            salesManager: "Robert Kowalski, GM",
            verifiedBadge: true,
            offeredDiscount: 3950,
            perksIncluded: "Full Ceramic Tint + 2 Years Free Scheduled Maintenance + Express Delivery",
            terms: "Valid for delivery on or before this Sunday 5 PM. Minimum 6 buyers finalizing contracts.",
            status: "active",
            votesAccept: 5,
            votesReject: 1
          }
        ]
      },
      polls: [
        {
          id: "poll_dealer_rav4",
          question: "Which dealership is our top priority for dispatching the Joint Proposal?",
          createdBy: "Sarah Chen (Captain)",
          totalVotes: 18,
          options: [
            { id: "opt_1", text: "Hendrick Toyota Sandy Springs (Large Allocation)", votes: 11 },
            { id: "opt_2", text: "Jim Ellis Toyota of McDonough (Closest to South ATL)", votes: 4 },
            { id: "opt_3", text: "Nalley Toyota Stonecrest (Willing to beat any written offer)", votes: 3 }
          ],
          userVoted: "opt_1"
        },
        {
          id: "poll_signing_date",
          question: "Preferred group pickup / signing date window?",
          createdBy: "Alex Morgan (You)",
          totalVotes: 14,
          options: [
            { id: "opt_date_1", text: "This Saturday, Nov 8 (11:00 AM Collective Arrival)", votes: 9 },
            { id: "opt_date_2", text: "Next Tuesday Evening (Direct Home Delivery option)", votes: 5 }
          ],
          userVoted: "opt_date_1"
        }
      ],
      messages: [
        {
          id: "msg_1",
          senderId: "m1",
          senderName: "Sarah Chen",
          role: "Captain",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
          text: "Welcome everyone! We just crossed 7 committed buyers. Tier 2 ($3,800 off) is officially unlocked. If we get 3 more, we hit Tier 3 ($5,200 off)!",
          timestamp: "09:14 AM",
          isSystem: false
        },
        {
          id: "msg_2",
          senderId: "m2",
          senderName: "Marcus Vance",
          role: "Buyer",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
          text: "I called Hendrick's fleet manager yesterday. He said if we show up with 8+ signed pre-approvals, they will beat invoice price and throw in complimentary tint.",
          timestamp: "09:32 AM",
          isSystem: false
        },
        {
          id: "msg_3",
          senderId: "system",
          senderName: "Relate Pitch Engine",
          role: "Automated",
          avatar: "assets/relate-icon.svg",
          text: "⚡ Joint Intent Proposal #ATL-RAV4-99 dispatched to 3 certified dealerships. Response timer started (48h).",
          timestamp: "10:15 AM",
          isSystem: true
        },
        {
          id: "msg_4",
          senderId: "m4",
          senderName: "David Kim",
          role: "Buyer",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
          text: "Just cast my vote for Saturday morning pickup. Anyone else looking at the Blueprint or Magnetic Gray color?",
          timestamp: "10:48 AM",
          isSystem: false
        },
        {
          id: "msg_5",
          senderId: "system",
          senderName: "Dealership Counter-Offer Alert",
          role: "Verified Dealer",
          avatar: "assets/dealer-badge.svg",
          text: "🎉 Hendrick Toyota Sandy Springs submitted a verified counter-offer: $3,950 Off MSRP + Ceramic Tint! Check the Negotiation tab to vote.",
          timestamp: "11:20 AM",
          isSystem: true
        }
      ]
    },

    {
      id: "group_modely_austin",
      title: "Austin Tech Corridor Tesla Model Y Collective",
      brand: "Tesla",
      model: "Model Y Long Range AWD",
      year: 2025,
      bodyType: "Electric",
      msrp: 47990,
      location: "Austin, TX",
      radiusMiles: 50,
      targetDealerships: ["Tesla Austin Delivery Hub - Pond Springs", "Tesla Stassney Showroom"],
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80",
      expiresInHours: 19,
      expirationDate: "2026-11-04T12:00:00",
      description: "Aggregating 10+ Tesla buyers in Austin to negotiate bulk inventory adjustments, Supercharging credits ($1,000 credit value), and expedited end-of-quarter delivery.",
      tiers: [
        { tier: 1, minBuyers: 4, maxBuyers: 7, discount: 2500, label: "$2,500 Off / Credit", perks: "5,000 Free Supercharger Miles" },
        { tier: 2, minBuyers: 8, maxBuyers: 11, discount: 4200, label: "$4,200 Off / Credit", perks: "10,000 Supercharger Miles + Free Wall Connector" },
        { tier: 3, minBuyers: 12, maxBuyers: 20, discount: 6000, label: "$6,000 Off / Credit", perks: "Free FSD Trial + Wall Connector + Free Delivery" }
      ],
      currentTierIndex: 2, // Tier 3 UNLOCKED (12 buyers)
      buyerCount: 12,
      maxCapacity: 20,
      members: [
        { id: "tm1", name: "Travis Sterling", role: "Group Captain", zip: "78701", status: "Cash Ready", deposit: true, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" },
        { id: "tm2", name: "Nadia Lin", role: "Buyer", zip: "78759", status: "Pre-Approved", deposit: true, avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=120&q=80" },
        { id: "tm3", name: "Connor Walsh", role: "Buyer", zip: "78704", status: "Trade-In Ready", deposit: true, avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=120&q=80" },
        { id: "user_alex_01", name: "Alex Morgan", role: "Buyer (You)", zip: "78701", status: "Pre-Approved", deposit: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80" }
      ],
      proposal: {
        id: "prop_tesla_atx",
        status: "accepted",
        dispatchedAt: "2026-11-02T14:00:00",
        expiresAt: "2026-11-04T14:00:00",
        requestedDiscount: 6000,
        dealershipsContacted: 2,
        counterOffers: [
          {
            id: "counter_tsla_01",
            dealership: "Tesla Regional Delivery Hub Austin",
            salesManager: "Devon Reed, Fleet Operations",
            verifiedBadge: true,
            offeredDiscount: 6000,
            perksIncluded: "Wall Connector included in trunk + 10,000 Supercharging Miles + Priority Delivery Batch",
            terms: "Accepted group bulk purchase order for 12 VIN allocations.",
            status: "accepted",
            votesAccept: 12,
            votesReject: 0
          }
        ]
      },
      polls: [
        {
          id: "poll_tesla_charger",
          question: "Do you prefer the Mobile Connector or Hardwired Wall Connector included?",
          createdBy: "Travis Sterling (Captain)",
          totalVotes: 12,
          options: [
            { id: "topt_1", text: "Hardwired Wall Connector (Faster 48A home charging)", votes: 9 },
            { id: "topt_2", text: "Mobile Connector Kit with NEMA 14-50 adapter", votes: 3 }
          ],
          userVoted: "topt_1"
        }
      ],
      messages: [
        {
          id: "tmsg_1",
          senderId: "tm1",
          senderName: "Travis Sterling",
          role: "Captain",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
          text: "Boom! Tier 3 hit! Austin regional fleet accepted our aggregate proposal for 12 units. $6,000 off each vehicle!",
          timestamp: "Yesterday",
          isSystem: false
        }
      ]
    },

    {
      id: "group_bmw_m340i",
      title: "DFW Bimmer Performance M340i Squad",
      brand: "BMW",
      model: "BMW M340i xDrive Sedan",
      year: 2025,
      bodyType: "Sedan",
      msrp: 59600,
      location: "Dallas-Fort Worth, TX",
      radiusMiles: 35,
      targetDealerships: ["Classic BMW Plano", "BMW of Dallas (Lemmon Ave)", "Autobahn BMW Fort Worth"],
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
      expiresInHours: 52,
      expirationDate: "2026-11-06T15:00:00",
      description: "Aggregating 6-8 executive & enthusiast buyers seeking Portimao Blue, Brooklyn Grey or Tanzanite Blue M340i xDrive sedans with Shadowline package.",
      tiers: [
        { tier: 1, minBuyers: 3, maxBuyers: 4, discount: 3500, label: "$3,500 Off MSRP", perks: "Complimentary BMW M Performance Mats" },
        { tier: 2, minBuyers: 5, maxBuyers: 7, discount: 5800, label: "$5,800 Off MSRP", perks: "Free M Performance Exhaust Installation / Credit" },
        { tier: 3, minBuyers: 8, maxBuyers: 12, discount: 8200, label: "$8,200 Off MSRP", perks: "Free Ultimate Care+ Extension (3-Yr / 36k Mi)" }
      ],
      currentTierIndex: 1, // Tier 2 active (5 buyers)
      buyerCount: 5,
      maxCapacity: 12,
      members: [
        { id: "bm1", name: "David Rossi", role: "Group Captain", zip: "75201", status: "Cash Ready", deposit: true, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80" },
        { id: "bm2", name: "Zackary Taylor", role: "Buyer", zip: "75024", status: "Pre-Approved", deposit: true, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80" },
        { id: "bm3", name: "Jennifer Wu", role: "Buyer", zip: "75093", status: "Pre-Approved", deposit: true, avatar: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=120&q=80" },
        { id: "bm4", name: "Lucas Vance", role: "Buyer", zip: "76102", status: "Trade-In Ready", deposit: true, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80" },
        { id: "bm5", name: "Austin Holt", role: "Buyer", zip: "75205", status: "Cash Ready", deposit: false, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80" }
      ],
      proposal: {
        id: "prop_bmw_dfw",
        status: "dispatched",
        dispatchedAt: "2026-11-03T08:30:00",
        expiresAt: "2026-11-05T08:30:00",
        requestedDiscount: 5800,
        dealershipsContacted: 3,
        counterOffers: []
      },
      polls: [
        {
          id: "poll_bmw_dealer",
          question: "Prioritize dealership for allocation delivery?",
          createdBy: "David Rossi (Captain)",
          totalVotes: 5,
          options: [
            { id: "bopt_1", text: "Classic BMW Plano (Largest allocation in Texas)", votes: 3 },
            { id: "bopt_2", text: "BMW of Dallas (Direct GM contact willing to waive fees)", votes: 2 }
          ],
          userVoted: null
        }
      ],
      messages: [
        {
          id: "bmsg_1",
          senderId: "bm1",
          senderName: "David Rossi",
          role: "Captain",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
          text: "We just reached 5 buyers! We are at $5,800 off MSRP. Need 3 more enthusiasts to hit the insane $8,200 Tier 3!",
          timestamp: "08:35 AM",
          isSystem: false
        }
      ]
    },

    {
      id: "group_f150_clt",
      title: "Carolinas Truck Fleet Buying Collective",
      brand: "Ford",
      model: "F-150 PowerBoost Hybrid / Lightning",
      year: 2025,
      bodyType: "Truck",
      msrp: 55495,
      location: "Charlotte, NC",
      radiusMiles: 50,
      targetDealerships: ["Town and Country Ford", "Capital Ford of Charlotte"],
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80",
      expiresInHours: 44,
      expirationDate: "2026-11-06T00:00:00",
      description: "Aggregating small business contractors and private truck buyers across Charlotte and Piedmont for maximum X-Plan volume kickbacks.",
      tiers: [
        { tier: 1, minBuyers: 3, maxBuyers: 5, discount: 3000, label: "$3,000 Off MSRP", perks: "Spray-in Bedliner Included" },
        { tier: 2, minBuyers: 6, maxBuyers: 9, discount: 5500, label: "$5,500 Off MSRP", perks: "Bedliner + Heavy Duty Tow Hitch Pack" },
        { tier: 3, minBuyers: 10, maxBuyers: 16, discount: 7800, label: "$7,800 Off MSRP", perks: "Commercial Fleet Rebate + Free Tonneau Cover" }
      ],
      currentTierIndex: 1, // Tier 2 active (6 buyers)
      buyerCount: 6,
      maxCapacity: 16,
      members: [
        { id: "fm1", name: "Brent Holloway", role: "Group Captain", zip: "28202", status: "Pre-Approved", deposit: true, avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80" },
        { id: "fm2", name: "Clint Miller", role: "Buyer", zip: "28277", status: "Cash Ready", deposit: true, avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80" }
      ],
      proposal: {
        id: "prop_ford_clt",
        status: "counter_received",
        dispatchedAt: "2026-11-02T16:00:00",
        expiresAt: "2026-11-04T16:00:00",
        requestedDiscount: 5500,
        dealershipsContacted: 2,
        counterOffers: [
          {
            id: "counter_ford_01",
            dealership: "Capital Ford of Charlotte",
            salesManager: "Wayne Vance, Commercial Fleet Director",
            verifiedBadge: true,
            offeredDiscount: 5700,
            perksIncluded: "Spray-in Bedliner + WeatherTech Mat Set + First 3 Oil/Filter Changes Free",
            terms: "Requires taking delivery by Friday close of business.",
            status: "active",
            votesAccept: 4,
            votesReject: 0
          }
        ]
      },
      polls: [
        {
          id: "poll_ford_powertrain",
          question: "Which powertrain configuration is your target?",
          createdBy: "Brent Holloway",
          totalVotes: 6,
          options: [
            { id: "fopt_1", text: "3.5L PowerBoost Hybrid with 7.2kW Pro Power", votes: 4 },
            { id: "fopt_2", text: "All-Electric Lightning Extended Range", votes: 2 }
          ],
          userVoted: "fopt_1"
        }
      ],
      messages: [
        {
          id: "fmsg_1",
          senderId: "fm1",
          senderName: "Brent Holloway",
          role: "Captain",
          avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80",
          text: "Capital Ford just counter-offered $5,700 off + bedliner! Check the offer tab to lock it in.",
          timestamp: "09:50 AM",
          isSystem: false
        }
      ]
    },

    {
      id: "group_ioniq5_socal",
      title: "SoCal Electric Crossover Squad (Ioniq 5)",
      brand: "Hyundai",
      model: "Ioniq 5 (SEL / Limited)",
      year: 2025,
      bodyType: "Electric",
      msrp: 43500,
      location: "Los Angeles, CA",
      radiusMiles: 30,
      targetDealerships: ["Keyes Hyundai Van Nuys", "Glendale Hyundai", "Norm Reeves Hyundai"],
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80",
      expiresInHours: 29,
      expirationDate: "2026-11-05T09:00:00",
      description: "Combining buyers across LA & Orange County to unlock manufacturer volume incentives + dealer trunk money.",
      tiers: [
        { tier: 1, minBuyers: 3, maxBuyers: 5, discount: 2800, label: "$2,800 Off MSRP", perks: "Free Level 2 Home Charger Cable" },
        { tier: 2, minBuyers: 6, maxBuyers: 8, discount: 4600, label: "$4,600 Off MSRP", perks: "Free L2 Cable + 2 Years Free Electrify America" },
        { tier: 3, minBuyers: 9, maxBuyers: 15, discount: 6500, label: "$6,500 Off MSRP", perks: "Full Dealer Fee Waiver + Ceramic Coating" }
      ],
      currentTierIndex: 0, // Tier 1 active (4 buyers, 2 spots to Tier 2!)
      buyerCount: 4,
      maxCapacity: 15,
      members: [
        { id: "im1", name: "Elena Rostova", role: "Group Captain", zip: "90012", status: "Pre-Approved", deposit: true, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" }
      ],
      proposal: {
        id: "prop_ioniq_socal",
        status: "draft",
        dispatchedAt: null,
        expiresAt: null,
        requestedDiscount: 4600,
        dealershipsContacted: 0,
        counterOffers: []
      },
      polls: [],
      messages: []
    },

    {
      id: "group_crv_chi",
      title: "Midwest CR-V Hybrid Buyers Guild",
      brand: "Honda",
      model: "CR-V Hybrid Sport-L AWD",
      year: 2025,
      bodyType: "SUV",
      msrp: 37850,
      location: "Chicago, IL",
      radiusMiles: 40,
      targetDealerships: ["McGrath City Honda", "Fletcher Jones Honda", "Valley Honda Aurora"],
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=900&q=80",
      expiresInHours: 61,
      expirationDate: "2026-11-06T20:00:00",
      description: "Chicagoland buyers combining orders for AWD Sport-L trim with remote start and winter weather protection packs.",
      tiers: [
        { tier: 1, minBuyers: 3, maxBuyers: 5, discount: 2100, label: "$2,100 Off MSRP", perks: "All-Season Rubber High-Wall Mats" },
        { tier: 2, minBuyers: 6, maxBuyers: 9, discount: 3600, label: "$3,600 Off MSRP", perks: "All-Season Mats + Heated Steering Wheel Discount" },
        { tier: 3, minBuyers: 10, maxBuyers: 15, discount: 4900, label: "$4,900 Off MSRP", perks: "Free HondaCare Extended Warranty (2-Yr)" }
      ],
      currentTierIndex: 1, // Tier 2 active (8 buyers, 2 spots to Tier 3!)
      buyerCount: 8,
      maxCapacity: 15,
      members: [],
      proposal: {
        id: "prop_crv_chi",
        status: "dispatched",
        dispatchedAt: "2026-11-03T06:00:00",
        expiresAt: "2026-11-05T06:00:00",
        requestedDiscount: 3600,
        dealershipsContacted: 3,
        counterOffers: []
      },
      polls: [],
      messages: []
    }
  ],

  dealershipsList: [
    {
      id: "dealership_hendrick",
      name: "Hendrick Toyota Sandy Springs",
      city: "Atlanta, GA",
      address: "6475 Roswell Rd, Sandy Springs, GA 30328",
      brands: ["Toyota"],
      rating: 4.8,
      reviewCount: 1420,
      manager: "Robert Kowalski, General Sales Director",
      phone: "(404) 795-4000",
      verified: true
    },
    {
      id: "dealership_jimellis",
      name: "Jim Ellis Toyota of McDonough",
      city: "McDonough, GA",
      address: "1440 Jonesboro Rd, McDonough, GA 30253",
      brands: ["Toyota"],
      rating: 4.7,
      reviewCount: 980,
      manager: "Patricia Hayes, Commercial Fleet Manager",
      phone: "(770) 954-7777",
      verified: true
    },
    {
      id: "dealership_classic_bmw",
      name: "Classic BMW Plano",
      city: "Plano, TX",
      address: "6800 Dallas Pkwy, Plano, TX 75024",
      brands: ["BMW"],
      rating: 4.9,
      reviewCount: 2310,
      manager: "Alexander Wolfe, VP of Sales",
      phone: "(214) 778-2600",
      verified: true
    },
    {
      id: "dealership_capital_ford",
      name: "Capital Ford of Charlotte",
      city: "Charlotte, NC",
      address: "5411 N Tryon St, Charlotte, NC 28213",
      brands: ["Ford"],
      rating: 4.6,
      reviewCount: 1140,
      manager: "Wayne Vance, Commercial Fleet Director",
      phone: "(704) 598-4000",
      verified: true
    }
  ]
};
