import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Building,
  Calendar,
  Target,
  MapPin,
  Award,
  AlertCircle,
  ChevronRight,
  Activity,
  Zap,
  Menu,
  Home,
  BarChart2,
  Mail,
  Settings,
  User,
  List,
  Search,
  ChevronDown,
  ArrowUpRight,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  Briefcase,
  Shield,
  HeartPulse,
  Globe,
  HandCoins,
  Scale,
  Banknote,
  Wallet,
  Landmark,
  ArrowRightCircle,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  LogOut,
} from "lucide-react";

// Helper functions (consistent with other pages)
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "Ksh N/A";

  // Handle both string and number inputs safely
  let numValue;
  if (typeof value === "string") {
    // Remove commas and convert to number
    numValue = parseFloat(value.replace(/,/g, ""));
  } else {
    numValue = Number(value);
  }

  if (isNaN(numValue)) return "Ksh N/A";

  const absValue = Math.abs(numValue);
  if (absValue >= 1_000_000) return `Ksh ${(numValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `Ksh ${(numValue / 1_000).toFixed(0)}K`;
  return `Ksh ${numValue.toFixed(0)}`;
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return `${(value * 100).toFixed(1)}%`;
};

const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  const numValue =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (numValue >= 1_000_000) return `${(numValue / 1_000_000).toFixed(1)}M`;
  if (numValue >= 1_000) return `${(numValue / 1_000).toFixed(0)}K`;
  return numValue.toFixed(0);
};

const DashboardLanding = ({
  onNavigate,
  dashboardData,
  isLoading,
  error,
  onLogout,
  currentUser,
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [timeRange, setTimeRange] = useState("monthly");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    wonAccounts: 0,
    wonAccountsRevenue: 0,
    lostAccounts: 0,
    lostAccountsRevenue: 0,
    winRate: 0,
    marketShare: 0,
  });

  // Process data from backend
  const processDashboardData = (data) => {
    if (!data) return null;

    // Calculate totals from wonAccounts
    const wonAccountsCount = data.wonAccounts?.length || 0;
    const wonAccountsRevenue = data.totalWonRevenue || 0;

    // Calculate totals from lostAccounts
    const lostAccountsCount =
      data.lostAccounts?.filter((acc) => acc.amount && acc.client).length || 0;
    const lostAccountsRevenue = data.totalLostRevenue || 0;

    // Calculate win rate
    const totalOpportunities = wonAccountsCount + lostAccountsCount;
    const winRate =
      totalOpportunities > 0 ? wonAccountsCount / totalOpportunities : 0;

    // Get market share data (latest quarter - Q2 2025)
    const latestMarketShareData = data.marketShare?.filter(
      (item) => item.year === 2025 && item.quarter === "Q2"
    );
    const marketShareValue =
      latestMarketShareData?.[0]?.minet_market_share_current_year || 0;

    return {
      wonAccounts: wonAccountsCount,
      wonAccountsRevenue,
      lostAccounts: lostAccountsCount,
      lostAccountsRevenue,
      winRate,
      marketShare: marketShareValue,
      wonAccountsData: data.wonAccounts,
      lostAccountsData: data.lostAccounts,
      marketShareData: latestMarketShareData || data.marketShare,
      revenueWalkData: data.revenueWalk,
      revenueWalkSummary: data.revenueWalkSummary,
    };
  };

  // Animation for KPIs
  useEffect(() => {
    console.log(dashboardData);
    if (dashboardData) {
      const processedData = processDashboardData(dashboardData);
      if (!processedData) return;

      const duration = 1000;
      const start = performance.now();

      const animate = (currentTime) => {
        const progress = Math.min((currentTime - start) / duration, 1);

        setAnimatedValues({
          wonAccounts: Math.floor(progress * (processedData.wonAccounts || 0)),
          wonAccountsRevenue: Math.floor(
            progress * (processedData.wonAccountsRevenue || 0)
          ),
          lostAccounts: Math.floor(
            progress * (processedData.lostAccounts || 0)
          ),
          lostAccountsRevenue: Math.floor(
            progress * (processedData.lostAccountsRevenue || 0)
          ),
          winRate: progress * (processedData.winRate || 0),
          marketShare: progress * (processedData.marketShare || 0),
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [dashboardData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-700">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-500">
        No dashboard data available.
      </div>
    );
  }

  const processedData = processDashboardData(dashboardData);
  if (!processedData) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-500">
        Dashboard data is not in the expected format. Please check the backend
        API.
      </div>
    );
  }

  // Prepare monthly performance data for charts
  const prepareMonthlyPerformanceData = () => {
    if (!dashboardData?.wonAccounts || !dashboardData?.lostAccounts) return [];

    const wonByMonth = dashboardData.wonAccounts.reduce((acc, account) => {
      const month = account.month;
      if (!month) return acc;

      if (!acc[month]) acc[month] = 0;

      // Safely parse amount whether it's string or number
      let amount = 0;
      if (typeof account.amount === "string") {
        amount = parseFloat(account.amount.replace(/,/g, "")) || 0;
      } else if (typeof account.amount === "number") {
        amount = account.amount;
      }

      acc[month] += amount;
      return acc;
    }, {});

    const lostByMonth = dashboardData.lostAccounts.reduce((acc, account) => {
      const month = account.month;
      if (!month || !account.client) return acc;

      if (!acc[month]) acc[month] = 0;

      // Safely handle amount for lost accounts too
      let amount = 0;
      if (typeof account.amount === "string") {
        amount = parseFloat(account.amount.replace(/,/g, "")) || 0;
      } else if (typeof account.amount === "number") {
        amount = account.amount;
      }

      acc[month] += amount;
      return acc;
    }, {});

    const allMonths = new Set([
      ...Object.keys(wonByMonth),
      ...Object.keys(lostByMonth),
    ]);

    return Array.from(allMonths).map((month) => ({
      month,
      won: wonByMonth[month] || 0,
      lost: lostByMonth[month] || 0,
    }));
  };

  const monthlyPerformanceData = prepareMonthlyPerformanceData();

  // Prepare revenue by division data
  // Prepare revenue by division data
  const prepareRevenueByDivision = () => {
    if (!dashboardData?.wonAccounts) return [];

    const revenueByDivision = dashboardData.wonAccounts.reduce(
      (acc, account) => {
        const division = account.division || "Other";
        if (!acc[division]) acc[division] = 0;

        // Safely parse amount whether it's string or number
        let amount = 0;
        if (typeof account.amount === "string") {
          amount = parseFloat(account.amount.replace(/,/g, "")) || 0;
        } else if (typeof account.amount === "number") {
          amount = account.amount;
        }

        acc[division] += amount;
        return acc;
      },
      {}
    );

    return Object.entries(revenueByDivision)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const revenueByDivisionData = prepareRevenueByDivision();

  const KPI_CARDS = [
    {
      title: "Won Accounts",
      value: animatedValues.wonAccounts,
      trend: "+15%", // Example, replace with actual trend calculation if available
      icon: <TrendingUp size={24} className="text-green-500" />,
      color: "bg-green-50",
      description: "Total accounts won this year.",
      suffix: "",
      navigateTo: "wonAccounts",
    },
    {
      title: "Lost Accounts",
      value: animatedValues.lostAccounts,
      trend: "-5%", // Example
      icon: <TrendingDown size={24} className="text-red-500" />,
      color: "bg-red-50",
      description: "Total accounts lost this year.",
      suffix: "",
      navigateTo: "lostAccounts",
    },
    {
      title: "Won Accounts Revenue",
      value: animatedValues.wonAccountsRevenue,
      trend: "+10%", // Example
      icon: <DollarSign size={24} className="text-blue-500" />,
      color: "bg-blue-50",
      description: "Total revenue from won accounts.",
      formatter: formatCurrency,
      navigateTo: "wonAccounts",
    },
    {
      title: "Lost Accounts Revenue",
      value: animatedValues.lostAccountsRevenue,
      trend: "+2%", // Example
      icon: <DollarSign size={24} className="text-orange-500" />,
      color: "bg-orange-50",
      description: "Total revenue lost from accounts.",
      formatter: formatCurrency,
      navigateTo: "lostAccounts",
    },
  ];

  // Prepare data for sales pipeline table
  const salesPipelineData =
    dashboardData.wonAccounts
      ?.slice(0, 5) // Show top 5 for the table
      ?.map((account) => ({
        company: account.client,
        status: "Won", // Since we're showing won accounts
        nextStep: "Policy Issuance", // Placeholder
        potentialRevenue: account.amount || 0,
        division: account.division,
      })) || [];

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Replace the entire header section */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Minet Logo */}
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center sm:mr-4">
                <span className="text-white font-bold text-sm">MINET</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                    Minet CIA{" "}
                    <span className="text-red-600">Analytics Dashboard</span>
                  </h1>
                </div>
                <p className="text-base sm:text-lg text-gray-600">
                  Overview of key performance indicators and trends
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {currentUser?.role === "admin" && (
                <button
                  onClick={() => onNavigate("admin-users")}
                  className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-gray-300 w-full sm:w-auto"
                >
                  <Shield size={20} className="mr-2" /> Manage Users
                </button>
              )}
              <button className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-gray-300 w-full sm:w-auto">
                <Download size={20} className="mr-2" /> Download Report
              </button>
              <button
                onClick={onLogout}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors w-full sm:w-auto"
              >
                <LogOut size={20} className="mr-2" /> Logout
              </button>
            </div>
          </div>

          {/* User Greeting */}
          {currentUser && (
            <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Welcome back,</p>
                    <p className="text-xl font-bold text-gray-900">
                      Hello{" "}
                      {currentUser.full_name || currentUser.name || "User"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Role</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      currentUser.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {currentUser.role === "admin" ? "Administrator" : "User"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </header>

        <main>
          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {KPI_CARDS.map((kpi, index) => (
              <div
                key={index}
                onClick={() => kpi.navigateTo && onNavigate(kpi.navigateTo)}
                className={`${kpi.color} p-6 rounded-2xl shadow-md border border-gray-200 transition-transform transform hover:scale-105 ${
                  kpi.navigateTo ? "cursor-pointer" : ""
                }`}
              >
                <div className="flex items-center mb-3">
                  <div
                    className={`p-2 rounded-full ${kpi.color.replace("50", "100")} mr-3`}
                  >
                    {kpi.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {kpi.title}
                  </h3>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {kpi.formatter
                    ? kpi.formatter(kpi.value)
                    : `${formatNumber(kpi.value)}${kpi.suffix || ""}`}
                </p>
                <div className="flex items-center text-sm font-medium">
                  {kpi.trend && (
                    <span
                      className={`flex items-center ${kpi.trend.includes("+") ? "text-green-600" : "text-red-600"} mr-2`}
                    >
                      {kpi.trend.includes("+") ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      {kpi.trend}
                    </span>
                  )}
                  <span className="text-gray-600">{kpi.description}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chart 1: Won vs. Lost Accounts (Composed Chart) */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Won vs. Lost Accounts
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTimeRange("monthly")}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${timeRange === "monthly" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                {monthlyPerformanceData.length > 0 ? (
                  <ComposedChart data={monthlyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#10b981"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#ef4444"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{ color: "#4a5568" }}
                      itemStyle={{ color: "#4a5568" }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: "16px", fontSize: "0.9rem" }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="won"
                      name="Won Accounts"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="lost"
                      name="Lost Accounts"
                      fill="#ef4444"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                    />
                  </ComposedChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No won vs. lost accounts data available.
                  </div>
                )}
              </ResponsiveContainer>
              <div className="mt-6 text-base text-gray-600 text-center">
                Visualizes the number of won and lost accounts over time.
              </div>
            </div>

            {/* Chart 2: Revenue by Division (Bar Chart) */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Revenue by Division
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                {revenueByDivisionData.length > 0 ? (
                  <BarChart
                    data={revenueByDivisionData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e0e0e0"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={formatCurrency}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{ color: "#4a5568" }}
                      itemStyle={{ color: "#4a5568" }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: "16px", fontSize: "0.9rem" }}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#6366f1"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No revenue by division data available.
                  </div>
                )}
              </ResponsiveContainer>
              <div className="mt-6 text-base text-gray-600 text-center">
                Shows revenue generated by different divisions.
              </div>
            </div>
          </section>

          {/* Other Sections */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Won Accounts (Table) */}
            <div
              onClick={() => onNavigate("wonAccounts")}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recent Won Accounts
              </h2>
              <div className="overflow-x-auto">
                {salesPipelineData.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Company
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Division
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesPipelineData.map((deal, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {deal.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {deal.division}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}
                            >
                              Won
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatCurrency(deal.potentialRevenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">
                    No recent won accounts data available.
                  </p>
                )}
              </div>
            </div>

            {/* Revenue Walk Summary */}
            <div
              onClick={() => onNavigate("revenue-walk")}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Revenue Walk Summary (2025)
              </h2>
              {dashboardData.revenueWalkSummary ? (
                <div className="space-y-4">
                  {/* Calculate totals from backend data */}
                  {(() => {
                    const totalInflows =
                      dashboardData.revenueWalkSummary.inflowsGrandTotal
                        ?.total_inflows || 0;
                    const totalOutflows = Math.abs(
                      dashboardData.revenueWalkSummary.outflowsGrandTotal
                        ?.total_outflows || 0
                    );
                    const netResult =
                      dashboardData.revenueWalkSummary.netResult || 0;

                    return (
                      <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4">
                          {/* Inflows */}
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-700">
                                Inflows
                              </span>
                              <TrendingUp
                                size={18}
                                className="text-green-600"
                              />
                            </div>
                            <div className="text-2xl font-bold text-green-800">
                              {formatCurrency(totalInflows)}
                            </div>
                          </div>

                          {/* Outflows */}
                          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-red-700">
                                Outflows
                              </span>
                              <TrendingDown
                                size={18}
                                className="text-red-600"
                              />
                            </div>
                            <div className="text-2xl font-bold text-red-800">
                              {formatCurrency(totalOutflows)}
                            </div>
                          </div>

                          {/* Net Result */}
                          <div
                            className={`${netResult >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"} p-4 rounded-xl border`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-sm font-medium ${netResult >= 0 ? "text-blue-700" : "text-orange-700"}`}
                              >
                                Net Result
                              </span>
                              <Banknote
                                size={18}
                                className={
                                  netResult >= 0
                                    ? "text-blue-600"
                                    : "text-orange-600"
                                }
                              />
                            </div>
                            <div
                              className={`text-2xl font-bold ${netResult >= 0 ? "text-blue-800" : "text-orange-800"}`}
                            >
                              {formatCurrency(netResult)}
                            </div>
                          </div>
                        </div>

                        {/* Bar Chart */}
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            data={[
                              {
                                name: "Inflows",
                                value: totalInflows,
                                fill: "#10b981",
                              },
                              {
                                name: "Outflows",
                                value: totalOutflows,
                                fill: "#ef4444",
                              },
                              {
                                name: "Net Result",
                                value: Math.abs(netResult),
                                fill: netResult >= 0 ? "#3b82f6" : "#f97316",
                              },
                            ]}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip
                              formatter={(value) => formatCurrency(value)}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No revenue walk data available.
                </div>
              )}
              <div className="mt-4 text-base text-gray-600 text-center">
                Track revenue inflows, outflows, and net financial results.
              </div>
            </div>
          </section>

          {/* Quick Links / Navigation */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Explore Other Insights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Won Accounts",
                  description: "Deep dive into successful acquisitions",
                  icon: <CheckCircle size={20} className="text-red-600" />,
                  color: "bg-red-50",
                  action: () => onNavigate("won-accounts"),
                },
                {
                  title: "Lost Accounts",
                  description: "Analyze reasons for client churn",
                  icon: <XCircle size={20} className="text-red-600" />,
                  color: "bg-red-50",
                  action: () => onNavigate("lost-accounts"),
                },
                {
                  title: "Market Share",
                  description: "Understand our position in the market",
                  icon: <PieChartIcon size={20} className="text-red-600" />,
                  color: "bg-red-50",
                  action: () => onNavigate("market-share"),
                },
                {
                  title: "Revenue Walk",
                  description: "Track revenue and financial metrics",
                  icon: <Banknote size={20} className="text-red-600" />,
                  color: "bg-red-50",
                  action: () => onNavigate("revenue-walk"),
                },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className={`${item.color} p-4 rounded-xl text-left hover:shadow-sm transition-all`}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`p-2 rounded-lg ${item.color.replace("50", "100")} mr-3`}
                    >
                      {item.icon}
                    </div>
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center text-red-600 text-sm font-medium">
                    <span>View Details</span>
                    <ArrowUpRight size={16} className="ml-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLanding;
