const sampleData = {
  wonAccounts: 127,
  lostAccounts: 34,
  marketShare: 23.5,
  revenue: 2850000,
  winRate: 0.45,
  avgTimeToCloseDays: 45,
  monthlyPerformance: [
    { month: "Jan", won: 12, lost: 3 },
    { month: "Feb", won: 15, lost: 2 },
    { month: "Mar", won: 18, lost: 4 },
    { month: "Apr", won: 14, lost: 5 },
    { month: "May", won: 20, lost: 3 },
    { month: "Jun", won: 16, lost: 2 },
    { month: "Jul", won: 22, lost: 6 }, // Add more months for better YTD
    { month: "Aug", won: 19, lost: 3 },
    { month: "Sep", won: 25, lost: 4 }, // Example: September is the best month for won
    { month: "Oct", won: 17, lost: 5 },
    { month: "Nov", won: 21, lost: 2 },
    { month: "Dec", won: 23, lost: 1 },
  ],
  lostAccountsYoY: [
    { year: 2023, lost: 30 },
    { year: 2024, lost: 38 },
    { year: 2025, lost: 34 },
  ],
  projectedLosses: [
    { month: "Jan", actual: 3, projected: 4 },
    { month: "Feb", actual: 2, projected: 3 },
    { month: "Mar", actual: 4, projected: 4 },
    { month: "Apr", actual: 5, projected: 5 },
    { month: "May", actual: 3, projected: 4 },
    { month: "Jun", actual: 2, projected: 3 },
    { month: "Jul", actual: 6, projected: 5 }, // Example future projected data
    { month: "Aug", actual: null, projected: 4 },
    { month: "Sep", actual: null, projected: 3 },
    { month: "Oct", actual: null, projected: 4 },
    { month: "Nov", actual: null, projected: 2 },
    { month: "Dec", actual: null, projected: 3 },
  ],
  lossReasons: [
    { reason: "Price", count: 12, revenueImpact: 600000 },
    { reason: "Service Issues", count: 8, revenueImpact: 400000 },
    { reason: "Competitor Offer", count: 7, revenueImpact: 350000 },
    { reason: "Product Fit", count: 4, revenueImpact: 100000 },
    { reason: "Relationship", count: 3, revenueImpact: 50000 },
  ],
  lostAccountsDetail: [
    {
      id: "LA001",
      company: "Tech Innovators",
      industry: "Technology",
      value: 250000,
      durationMonths: 36,
      region: "Nairobi",
      reason: "Price",
      competitorWon: "Competitor X",
      recoveryPotential: "Low",
      agent: "Jane Doe",
      lostDate: "2025-05-15",
      stage: "Renewal",
    },
    {
      id: "LA002",
      company: "Global Logistics",
      industry: "Logistics",
      value: 180000,
      durationMonths: 60,
      region: "Mombasa",
      reason: "Service Issues",
      competitorWon: "Competitor Y",
      recoveryPotential: "Medium",
      agent: "John Smith",
      lostDate: "2025-04-20",
      stage: "Ongoing Service",
    },
    {
      id: "LA003",
      company: "Health Solutions",
      industry: "Healthcare",
      value: 120000,
      durationMonths: 12,
      region: "Kisumu",
      reason: "Competitor Offer",
      competitorWon: "Competitor A",
      recoveryPotential: "High",
      agent: "Alice Brown",
      lostDate: "2025-03-01",
      stage: "Initial Contract",
    },
    {
      id: "LA004",
      company: "Financial Corp",
      industry: "Finance",
      value: 300000,
      durationMonths: 48,
      region: "Nairobi",
      reason: "Price",
      competitorWon: "Competitor Z",
      recoveryPotential: "Medium",
      agent: "Jane Doe",
      lostDate: "2025-06-01",
      stage: "Renewal",
    },
    {
      id: "LA005",
      company: "Retail Nexus",
      industry: "Retail",
      value: 90000,
      durationMonths: 24,
      region: "Nakuru",
      reason: "Product Fit",
      competitorWon: "Competitor B",
      recoveryPotential: "Low",
      agent: "Bob White",
      lostDate: "2025-02-10",
      stage: "Ongoing Service",
    },
    {
      id: "LA006",
      company: "ManuFacto",
      industry: "Manufacturing",
      value: 200000,
      durationMonths: 18,
      region: "Mombasa",
      reason: "Service Issues",
      competitorWon: "Competitor X",
      recoveryPotential: "High",
      agent: "John Smith",
      lostDate: "2025-01-25",
      stage: "Implementation",
    },
    // Add more detailed lost accounts to populate tables/lists
  ],
  avgLifetimeValueLost: 45000,
  competitorsGainingBusiness: [
    // Which competitors are winning YOUR clients
    { name: "Competitor X", accountsWonFromYou: 6, totalRevenue: 800000 },
    { name: "Competitor Y", accountsWonFromYou: 4, totalRevenue: 300000 },
    { name: "Competitor Z", accountsWonFromYou: 2, totalRevenue: 400000 },
    { name: "Competitor A", accountsWonFromYou: 3, totalRevenue: 120000 },
  ],
  // --- Prevention & Recovery Tools ---
  recoveryPipeline: [
    // Tracking accounts currently in recovery efforts
    {
      id: "REC001",
      company: "Alpha Co",
      status: "Contacted",
      potentialRevenue: 150000,
      nextStep: "Meeting next week",
    },
    {
      id: "REC002",
      company: "Beta Inc",
      status: "Proposal Sent",
      potentialRevenue: 100000,
      nextStep: "Follow-up on Friday",
    },
  ],
  winBackCampaigns: [
    // Performance metrics for specific campaigns
    {
      name: "Q1 Re-engagement",
      accountsTargeted: 50,
      accountsRecovered: 5,
      successRate: 0.1,
      revenueRecovered: 200000,
    },
    {
      name: "Loyalty Offer 2025",
      accountsTargeted: 30,
      accountsRecovered: 2,
      successRate: 0.07,
      revenueRecovered: 80000,
    },
  ],
  contractRenewalLosses: [
    // Losses based on contract timing (example)
    { period: "Within 3 months of renewal", count: 8, revenue: 400000 },
    { period: "3-6 months before renewal", count: 4, revenue: 150000 },
    { period: "Over 6 months before renewal", count: 2, revenue: 50000 },
  ],
  industryBenchmarkLossRate: 0.05,
  // --- Operational Insights ---
  retentionPerformance: [
    // Agent/Team Performance in retention
    {
      name: "Jane Doe",
      accountsLost: 5,
      revenueLost: 550000,
      retentionRate: 0.92,
    },
    {
      name: "John Smith",
      accountsLost: 4,
      revenueLost: 380000,
      retentionRate: 0.95,
    },
    {
      name: "Alice Brown",
      accountsLost: 3,
      revenueLost: 200000,
      retentionRate: 0.96,
    },
    {
      name: "Bob White",
      accountsLost: 2,
      revenueLost: 150000,
      retentionRate: 0.98,
    },
  ],

  quarterlyWonAccounts: [
    { quarter: "Q1", won: 45 }, // Sum of Jan, Feb, Mar (12+15+18)
    { quarter: "Q2", won: 50 }, // Sum of Apr, May, Jun (14+20+16)
    { quarter: "Q3", won: 66 }, // Sum of Jul, Aug, Sep (22+19+25) - Example: Q3 is the best quarter
    { quarter: "Q4", won: 61 }, // Sum of Oct, Nov, Dec (17+21+23)
  ],
  wonAccountsByDivision: [
    { name: "Employee Benefits", accountsWon: 35, totalRevenue: 1200000 },
    { name: "Minet Risk Services", accountsWon: 28, totalRevenue: 850000 },
    { name: "MMC", accountsWon: 22, totalRevenue: 650000 },
    { name: "Retail & SMEs", accountsWon: 15, totalRevenue: 150000 },
    { name: "Consulting", accountsWon: 10, totalRevenue: 200000 },
    { name: "Reinsurance", accountsWon: 17, totalRevenue: 400000 },
  ],

  divisionPerformance: [
    { name: "Employee Benefits", won: 45, revenue: 1200000, marketShare: 25 },
    { name: "Minet Risk Services", won: 32, revenue: 850000, marketShare: 18 },
    { name: "MMC", won: 28, revenue: 650000, marketShare: 15 },
    { name: "Retail & SMEs", won: 12, revenue: 150000, marketShare: 8 },
    { name: "Consulting", won: 8, revenue: 200000, marketShare: 5 },
    { name: "Reinsurance", won: 15, revenue: 400000, marketShare: 10 },
  ],

  revenueByProduct: [
    { name: "Life Insurance", value: 900000 },
    { name: "Pensions", value: 650000 },
    { name: "HealthCare", value: 720000 },
    { name: "Risk Services", value: 430000 },
    { name: "Consulting", value: 250000 },
  ],

  competitors: [
    { name: "Competitor A", accountsWon: 23 },
    { name: "Competitor B", accountsWon: 18 },
    { name: "Competitor C", accountsWon: 15 },
    { name: "Competitor D", accountsWon: 12 },
    { name: "Competitor E", accountsWon: 10 },
  ],
  regions: [
    { name: "Nairobi", performance: 85, accounts: 45 },
    { name: "Mombasa", performance: 78, accounts: 32 },
    { name: "Kisumu", performance: 72, accounts: 28 },
    { name: "Nakuru", performance: 68, accounts: 20 },
  ],
  lostAccounts: 34, // Total lost accounts for current period
  totalRevenueLost: 1500000,
  underwritersPerformance: [
    { name: "Jane Doe", accountsWon: 25, revenueGenerated: 700000 },
    { name: "John Smith", accountsWon: 20, revenueGenerated: 600000 },
    { name: "Alice Brown", accountsWon: 18, revenueGenerated: 550000 },
    { name: "Bob White", accountsWon: 15, revenueGenerated: 400000 },
    { name: "Charlie Green", accountsWon: 12, revenueGenerated: 300000 },
  ],
  recentChurn: [
    {
      company: "ABC Corp",
      reason: "Switched to competitor",
      amount: 120000,
      duration: "2 months ago",
      contact: "John Doe",
      recoveryPotential: "Medium",
    },
    {
      company: "XYZ Ltd",
      reason: "Pricing concerns",
      amount: 85000,
      duration: "1 month ago",
      contact: "Jane Smith",
      recoveryPotential: "High",
    },
  ],
  quarterlyBreakdown: [
    { quarter: "Q1", moneyIn: 800000, moneyOut: 650000, ending: 150000 },
    { quarter: "Q2", moneyIn: 900000, moneyOut: 700000, ending: 200000 },
    { quarter: "Q3", moneyIn: 850000, moneyOut: 750000, ending: 100000 },
    { quarter: "Q4", moneyIn: 950000, moneyOut: 800000, ending: 150000 },
  ],

  revenueByMonth: [
    { month: "Jan", revenue: 800000 },
    { month: "Feb", revenue: 850000 },
    { month: "Mar", revenue: 780000 },
    { month: "Apr", revenue: 920000 },
    { month: "May", revenue: 950000 },
    { month: "Jun", revenue: 890000 },
    { month: "Jul", revenue: 1050000 }, // Example higher revenue month
    { month: "Aug", revenue: 980000 },
    { month: "Sep", revenue: 1100000 },
    { month: "Oct", revenue: 900000 },
    { month: "Nov", revenue: 930000 },
    { month: "Dec", revenue: 980000 },
  ],
  companyName: "Minet",
  budget: 3000000,
  expenses: 2700000,
  marketShareDistribution: [
    { name: "Minet", value: 23.5, color: "#10B981" }, // Your company
    { name: "Competitor A", value: 18.2, color: "#3B82F6" },
    { name: "Competitor B", value: 15.8, color: "#F59E0B" },
    { name: "Competitor C", value: 12.3, color: "#EF4444" },
    { name: "Competitor D", value: 10.0, color: "#8B5CF6" },
    { name: "Others", value: 20.2, color: "#06B6D4" },
  ],
  marketShareHistory: [
    {
      quarter: "2023 Q1",
      Minet: 22.0,
      "Competitor A": 17.5,
      "Competitor B": 16.0,
      "Competitor C": 13.0,
      "Competitor D": 9.5,
      Others: 22.0,
    },
    {
      quarter: "2023 Q2",
      Minet: 22.5,
      "Competitor A": 17.8,
      "Competitor B": 15.7,
      "Competitor C": 12.8,
      "Competitor D": 9.8,
      Others: 21.4,
    },
    {
      quarter: "2023 Q3",
      Minet: 23.0,
      "Competitor A": 18.0,
      "Competitor B": 15.9,
      "Competitor C": 12.5,
      "Competitor D": 9.9,
      Others: 20.7,
    },
    {
      quarter: "2023 Q4",
      Minet: 23.2,
      "Competitor A": 18.1,
      "Competitor B": 15.8,
      "Competitor C": 12.4,
      "Competitor D": 10.0,
      Others: 20.5,
    },
    {
      quarter: "2024 Q1",
      Minet: 23.5,
      "Competitor A": 18.2,
      "Competitor B": 15.8,
      "Competitor C": 12.3,
      "Competitor D": 10.0,
      Others: 20.2,
    },
    // Add more historical data for a longer view if desired
  ],
  marketShareProjections: [
    {
      month: "Jul 2025",
      Minet: 23.6,
      "Competitor A": 18.1,
      "Competitor B": 15.7,
      "Competitor C": 12.2,
    },
    {
      month: "Aug 2025",
      Minet: 23.7,
      "Competitor A": 18.0,
      "Competitor B": 15.6,
      "Competitor C": 12.1,
    },
    {
      month: "Sep 2025",
      Minet: 23.8,
      "Competitor A": 18.0,
      "Competitor B": 15.6,
      "Competitor C": 12.0,
    },
    {
      month: "Oct 2025",
      Minet: 23.9,
      "Competitor A": 17.9,
      "Competitor B": 15.5,
      "Competitor C": 11.9,
    },
    {
      month: "Nov 2025",
      Minet: 24.0,
      "Competitor A": 17.8,
      "Competitor B": 15.5,
      "Competitor C": 11.8,
    },
    {
      month: "Dec 2025",
      Minet: 24.1,
      "Competitor A": 17.7,
      "Competitor B": 15.4,
      "Competitor C": 11.7,
    },
  ],
  segmentGrowth: [
    {
      segment: "Employee Benefits",
      totalMarketSize: 1500,
      minetShare: 0.3,
      minetGrowth: 0.08,
      marketGrowth: 0.07,
    },
    {
      segment: "Minet Risk Services",
      totalMarketSize: 1200,
      minetShare: 0.25,
      minetGrowth: 0.05,
      marketGrowth: 0.06,
    },
    {
      segment: "MMC",
      totalMarketSize: 1000,
      minetShare: 0.2,
      minetGrowth: 0.1,
      marketGrowth: 0.08,
    },
    {
      segment: "Retail & SMEs",
      totalMarketSize: 800,
      minetShare: 0.15,
      minetGrowth: 0.12,
      marketGrowth: 0.1,
    },
    {
      segment: "Consulting",
      totalMarketSize: 500,
      minetShare: 0.18,
      minetGrowth: 0.07,
      marketGrowth: 0.09,
    },
    {
      segment: "Reinsurance",
      totalMarketSize: 700,
      minetShare: 0.28,
      minetGrowth: 0.06,
      marketGrowth: 0.05,
    },
  ],
  // Competitor Benchmarking (simplified, actual data would be more detailed)
  competitorKPIs: [
    {
      name: "Minet",
      marketShare: 23.5,
      growthRate: 0.07,
      clientRetention: 0.92,
      avgDealSize: 22000,
      claimsRatio: 0.65,
      pricingIndex: 1.0,
    },
    {
      name: "Competitor A",
      marketShare: 18.2,
      growthRate: 0.06,
      clientRetention: 0.9,
      avgDealSize: 20000,
      claimsRatio: 0.68,
      pricingIndex: 0.95,
    },
    {
      name: "Competitor B",
      marketShare: 15.8,
      growthRate: 0.05,
      clientRetention: 0.88,
      avgDealSize: 25000,
      claimsRatio: 0.6,
      pricingIndex: 1.05,
    },
    {
      name: "Competitor C",
      marketShare: 12.3,
      growthRate: 0.08,
      clientRetention: 0.93,
      avgDealSize: 18000,
      claimsRatio: 0.7,
      pricingIndex: 0.9,
    },
  ],
  winLossReasonsSummary: [
    { reason: "Price", won: 10, lost: 12 },
    { reason: "Service Quality", won: 15, lost: 8 },
    { reason: "Product Features", won: 8, lost: 4 },
    { reason: "Relationship", won: 5, lost: 3 },
  ],
  // --- Product/Service Performance ---
  marketShareByProductLine: [
    {
      product: "Employee Benefits",
      marketShare: 0.3,
      minetShare: 0.35,
      totalRevenue: 1200000,
    },
    {
      product: "Minet Risk Services",
      marketShare: 0.25,
      minetShare: 0.28,
      totalRevenue: 850000,
    },
    {
      product: "MMC",
      marketShare: 0.2,
      minetShare: 0.22,
      totalRevenue: 650000,
    },
    {
      product: "Retail & SMEs",
      marketShare: 0.15,
      minetShare: 0.1,
      totalRevenue: 150000,
    },
    {
      product: "Consulting",
      marketShare: 0.1,
      minetShare: 0.05,
      totalRevenue: 200000,
    },
    {
      product: "Reinsurance",
      marketShare: 0.05,
      minetShare: 0.0,
      totalRevenue: 400000,
    }, // Example where Minet might not have share
  ],
  subProductBreakdown: [
    {
      parent: "Employee Benefits",
      subProduct: "Health Insurance",
      minetShare: 0.4,
      marketShare: 0.35,
      revenue: 800000,
    },
    {
      parent: "Employee Benefits",
      subProduct: "Life Insurance",
      minetShare: 0.3,
      marketShare: 0.25,
      revenue: 400000,
    },
    {
      parent: "Minet Risk Services",
      subProduct: "Cyber Security",
      minetShare: 0.2,
      marketShare: 0.15,
      revenue: 300000,
    },
    // ... more sub-products
  ],
  newProductPenetration: [
    {
      product: "New Cyber Cover",
      launchDate: "2024-01-01",
      currentPenetration: 0.05,
      targetPenetration: 0.1,
    },
    {
      product: "Flexible Health Plan",
      launchDate: "2023-07-01",
      currentPenetration: 0.12,
      targetPenetration: 0.15,
    },
  ],
  // Regional Market Share (using simplified county data)
  regionalMarketShare: [
    { region: "Nairobi", minetShare: 0.28, totalMarket: 500, color: "#ef4444" },
    { region: "Mombasa", minetShare: 0.22, totalMarket: 200, color: "#f59e0b" },
    { region: "Kisumu", minetShare: 0.18, totalMarket: 100, color: "#10b981" },
    { region: "Nakuru", minetShare: 0.2, totalMarket: 150, color: "#3b82f6" },
    { region: "Eldoret", minetShare: 0.15, totalMarket: 80, color: "#6366f1" },
    // This data would be more complex for a true geospatial map
  ],
  marketSplit: [
    {
      segment: "Corporate",
      minetShare: 0.35,
      totalMarket: 8000000,
      type: "Client Size",
    },
    {
      segment: "SME",
      minetShare: 0.15,
      totalMarket: 4000000,
      type: "Client Size",
    },
    {
      segment: "Retail (Individual)",
      minetShare: 0.08,
      totalMarket: 2000000,
      type: "Client Size",
    },
    {
      segment: "Urban",
      minetShare: 0.28,
      totalMarket: 10000000,
      type: "Urban vs Rural",
    },
    {
      segment: "Rural",
      minetShare: 0.1,
      totalMarket: 4000000,
      type: "Urban vs Rural",
    },
  ],
  // --- Client Segmentation ---
  // Market Share by Client Size (derived from marketSplit)
  retentionVsAcquisition: {
    retentionRate: 0.92, // From other pages
    acquisitionRate: 0.03, // (New accounts / Total potential market) - example
    yoyRetentionChange: 0.01, // +1%
  },
  // Client Lifetime Value Analysis (refer to Lost Accounts page data)

  // --- Strategic Insights ---
  underpenetratedSegments: [
    {
      segment: "Agriculture SMEs",
      potentialRevenue: 500000,
      minetPresence: "Low",
    },
    {
      segment: "Specific Manufacturing Sub-sectors",
      potentialRevenue: 800000,
      minetPresence: "Medium",
    },
  ],
  brokerPerformance: [
    {
      broker: "Brokerage A",
      minetShareOfBusiness: 0.4,
      totalBusinessValue: 1000000,
      minetAccounts: 50,
    },
    {
      broker: "Brokerage B",
      minetShareOfBusiness: 0.25,
      totalBusinessValue: 1200000,
      minetAccounts: 30,
    },
  ],
  // --- Management KPIs ---
  marketRank: 2, // Example: Minet is #2
  industryAverageGrowth: 0.06, // Example
  clientConcentrationRisk: [
    { client: "Top Client 1", revenueContribution: 0.1 },
    { client: "Top Client 2", revenueContribution: 0.07 },
  ],
  crossSellUpsellPotential: 0.15, // As a percentage of current revenue, example

  // --- Minet-Specific Additions ---
  schemePerformance: [
    {
      type: "Corporate Schemes",
      totalPolicies: 5000,
      minetShare: 0.35,
      claimsRatio: 0.6,
    },
    {
      type: "Individual Policies",
      totalPolicies: 2000,
      minetShare: 0.1,
      claimsRatio: 0.7,
    },
  ],
  claimsRatioImpact: {
    minetClaimsRatio: 0.65,
    industryAverageClaimsRatio: 0.68,
    perceptionImpact: "Positive", // 'Positive', 'Neutral', 'Negative'
  },
  agentNetworkEffectiveness: {
    avgAccountsPerAgent: 15,
    avgRevenuePerAgent: 300000,
    networkGrowth: 0.05,
  },
  revenueWalk: {
    moneyIn: 3200000,
    moneyOut: 2850000,
    netDivision: 350000,
    newBusinessByDivision: [
      { division: "Employee Benefits", amount: 850000 },
      { division: "Minet Risk Services", amount: 620000 },
      { division: "MMC", amount: 480000 },
      { division: "Retail & SMEs", amount: 180000 },
      { division: "Consulting", amount: 220000 },
      { division: "Reinsurance", amount: 350000 },
    ],
  },
};

export default sampleData;
