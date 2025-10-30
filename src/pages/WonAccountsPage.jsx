import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import {
  MapPin,
  ArrowLeft,
  DollarSign,
  Users,
  TrendingUp,
  Award,
  CalendarDays,
  BarChart3,
  Briefcase,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Building,
  PieChart as PieChartIcon,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_URL } from "../constants";

// Formatting helpers
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "Ksh N/A";
  const numValue =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  const absValue = Math.abs(numValue);
  if (absValue >= 1_000_000) return `Ksh ${(numValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `Ksh ${(numValue / 1_000).toFixed(0)}K`;
  return `Ksh ${numValue.toFixed(0)}`;
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return `${(value * 100).toFixed(1)}%`;
};

const COLORS_PIE = [
  "#dc2626",
  "#ef4444",
  "#f87171",
  "#fca5a5",
  "#fecaca",
  "#fee2e2",
];
const COLORS_BRAND = ["#dc2626", "#1e40af", "#7e22ce", "#0d9488", "#ea580c"];

const MONTH_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Ensure consistent month ordering for charts
const sortDataByMonth = (data) => {
  if (!data || !Array.isArray(data)) return [];

  return [...data].sort((a, b) => {
    return MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month);
  });
};

const WonAccountsPage = ({ onBack, userRole }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsYearFilter, setDetailsYearFilter] = useState("all");
  const [newBusinessData, setNewBusinessData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const itemsPerPage = 10;

  // Check if user is admin
  const isAdmin = userRole === "admin";

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL + "/api/won-accounts");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.error) throw new Error(result.error);
      console.log("Won Accounts Data:", result);
      console.log("YOY Comparison:", result.yoyComparison);
      console.log("Year Comparison:", result.yearComparison);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewBusinessData = async (month) => {
    try {
      const response = await fetch(
        API_URL + `/api/won-accounts/new-structure?month=${month}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.error) throw new Error(result.error);
      setNewBusinessData(result);
    } catch (err) {
      console.error("Error fetching new business data:", err.message);
    }
  };

  // Handle CSV download for won_accounts_details
  // Add this state variable at the top with your other state declarations
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Update the download handler
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(
        API_URL + `/api/download-won-accounts-template?year=${selectedYear}`
      );
      if (!response.ok) throw new Error("Failed to download template");
      const result = await response.json();

      const blob = new Blob([result.csv_content], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `won_accounts_${selectedYear}_template.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Error downloading template: ${err.message}`);
    }
  };

  // Handle CSV upload for won_accounts_details
  const handleUploadCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("csv_file", file);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL + "/api/upload-won-accounts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server error");
      }

      const result = await response.json();

      if (result.success) {
        alert("Won Accounts data updated successfully!");
        fetchData();
      } else {
        throw new Error(result.message || "Failed to upload file.");
      }
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle CSV download for won_various
  const handleDownloadVariousTemplate = async () => {
    try {
      const response = await fetch(
        API_URL + "/api/download-won-various-template"
      );
      if (!response.ok) throw new Error("Failed to download template");
      const result = await response.json();

      const blob = new Blob([result.csv_content], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "won_various_template.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Error downloading template: ${err.message}`);
    }
  };

  // Handle CSV upload for won_various
  const handleUploadVariousCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("csv_file", file);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL + "/api/upload-won-various", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server error");
      }

      const result = await response.json();

      if (result.success) {
        alert("Various data updated successfully!");
        fetchData();
      } else {
        throw new Error(result.message || "Failed to upload file.");
      }
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNewBusinessData(selectedMonth);
  }, [selectedMonth]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <XCircle className="text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Error Loading Data
        </h2>
        <p className="text-gray-600 text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-500">
        No data available
      </div>
    );

  // Process data for charts with safety checks
  const sortedWonAccountsByMonth =
    data.wonAccountsByMonth && Array.isArray(data.wonAccountsByMonth)
      ? [...data.wonAccountsByMonth].sort(
          (a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month)
        )
      : [];

  const sortedMonthlyAmounts =
    data.monthlyAmounts && Array.isArray(data.monthlyAmounts)
      ? [...data.monthlyAmounts].sort(
          (a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month)
        )
      : [];

  // Merge monthly amounts with accounts won for combo chart
  const mergedMonthlyData = sortedMonthlyAmounts.map((monthData) => {
    const accountsData = sortedWonAccountsByMonth.find(
      (acc) => acc.month === monthData.month
    );
    return {
      ...monthData,
      accountsWon: accountsData?.accountsWon || 0,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition border border-gray-300"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>

          <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              Won Accounts Analytics
              <Award className="text-red-600" size={32} />
            </h1>
            <p className="text-gray-600 mt-2">
              Insights into successful client acquisitions and revenue
              performance
            </p>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            {[
              "overview",
              "monthly",
              "competitors",
              "YOY comparison",
              "details",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[140px] py-2 px-4 text-sm font-medium rounded-md transition ${
                  activeTab === tab
                    ? "bg-red-600 text-white shadow"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <main className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Won Accounts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-500">
                  Total Won Accounts
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {(data?.totalWonAccounts || 0).toLocaleString()}
                </p>
                <p className="text-green-600 mt-1 flex items-center gap-1 text-sm">
                  <TrendingUp size={16} /> All time
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users size={32} className="text-green-600" />
              </div>
            </div>

            {/* Total MKIB */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-500">
                  Total MKIB
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(data?.totalMKIB || 0)}
                </p>
                <p className="text-blue-600 mt-1 flex items-center gap-1 text-sm">
                  <Building size={16} /> Retail & SME + Reinsurance
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Building size={32} className="text-blue-600" />
              </div>
            </div>

            {/* Total MKFS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-500">
                  Total MKFS
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(data?.totalMKFS || 0)}
                </p>
                <p className="text-purple-600 mt-1 flex items-center gap-1 text-sm">
                  <PieChartIcon size={16} /> Pensions
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <PieChartIcon size={32} className="text-purple-600" />
              </div>
            </div>

            {/* Total MKIC */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-500">
                  Total MKIC
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(data?.totalMKIC || 0)}
                </p>
                <p className="text-orange-600 mt-1 flex items-center gap-1 text-sm">
                  <Target size={16} /> Corporate
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Target size={32} className="text-orange-600" />
              </div>
            </div>
          </div>
          {/* Total Won Revenue */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-500">
                Total Won Revenue
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(
                  (data?.totalMKIB || 0) +
                    (data?.totalMKFS || 0) +
                    (data?.totalMKIC || 0)
                )}
              </p>
              <p className="text-green-600 mt-1 flex items-center gap-1 text-sm">
                <TrendingUp size={16} /> All Divisions 2025
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign size={32} className="text-green-600" />
            </div>
          </div>
          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Year on Year Comparison */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      Year on Year Comparison (2024 vs 2025)
                    </h2>
                    <TrendingUp className="text-gray-400" />
                  </div>
                  {data?.yearComparison && data.yearComparison.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sortDataByMonth(data.yearComparison)}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: "#6b7280" }}
                            tickMargin={10}
                          />
                          <YAxis
                            tick={{ fill: "#6b7280" }}
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip
                            formatter={(value) => [
                              formatCurrency(value),
                              "Revenue",
                            ]}
                            contentStyle={{
                              background: "rgba(255, 255, 255, 0.96)",
                              border: "1px solid #e5e7eb",
                              borderRadius: "0.5rem",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="2024"
                            name="2024"
                            stroke="#9ca3af"
                            strokeWidth={2}
                            dot={{ fill: "#9ca3af", strokeWidth: 2, r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="2025"
                            name="2025"
                            stroke="#dc2626"
                            strokeWidth={2}
                            dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <TrendingUp
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p>No year comparison data available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Won by Premium Band */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      Won by Income Band
                    </h2>
                    <BarChart3 className="text-gray-400" />
                  </div>
                  {data.wonByPremiumBand && data.wonByPremiumBand.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.wonByPremiumBand}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="band"
                            label={({ band, percent }) =>
                              `${band}: ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {data.wonByPremiumBand.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS_PIE[index % COLORS_PIE.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [
                              `${value} accounts`,
                              name,
                            ]}
                            contentStyle={{
                              background: "rgba(255, 255, 255, 0.96)",
                              border: "1px solid #e5e7eb",
                              borderRadius: "0.5rem",
                            }}
                          />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{
                              paddingLeft: "20px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p>No income band data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Underwriters and Segments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Underwriters */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Top Underwriters
                  </h2>
                  {data.underwriterPerformance &&
                  data.underwriterPerformance.length > 0 ? (
                    <div className="space-y-3">
                      {data.underwriterPerformance.map((uw, index) => (
                        <div
                          key={uw.name}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                    ? "bg-gray-400"
                                    : index === 2
                                      ? "bg-orange-600"
                                      : "bg-gray-300"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {uw.name || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {uw.accountsWon} accounts
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(uw.revenueGenerated)}
                            </p>
                            <p className="text-sm text-green-600">Revenue</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Users
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p>No underwriter data available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Market Segments */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Market Segments
                  </h2>
                  {data.marketSegmentAnalysis &&
                  data.marketSegmentAnalysis.length > 0 ? (
                    <div className="space-y-4">
                      {data.marketSegmentAnalysis.map((segment, index) => (
                        <div key={segment.segment} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">
                              {segment.segment}
                            </span>
                            <div className="text-right">
                              <span className="text-gray-900 font-semibold">
                                {segment.accountsWon} accounts
                              </span>
                              <span className="text-gray-600 text-xs ml-2">
                                ({formatCurrency(segment.revenueGenerated || 0)}
                                )
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${(segment.accountsWon / Math.max(...(data.marketSegmentAnalysis?.map((s) => s.accountsWon) || [1]))) * 100}%`,
                                backgroundColor:
                                  COLORS_BRAND[index % COLORS_BRAND.length],
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Briefcase
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p>No market segment data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "monthly" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      Monthly Revenue
                    </h2>
                    <DollarSign className="text-gray-400" />
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sortDataByMonth(data.monthlyAmounts)}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "#6b7280" }}
                          tickMargin={10}
                        />
                        <YAxis
                          tick={{ fill: "#6b7280" }}
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(value),
                            "Revenue",
                          ]}
                          contentStyle={{
                            background: "rgba(255, 255, 255, 0.96)",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Bar
                          dataKey="totalAmount"
                          name="Revenue"
                          fill="#dc2626"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Won Accounts per Division */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      Won Accounts per Division
                    </h2>
                    <Briefcase className="text-gray-400" />
                  </div>
                  {data.topClientSegments &&
                  data.topClientSegments.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.topClientSegments}
                          layout="vertical"
                          margin={{ left: 100 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            opacity={0.2}
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            tick={{ fill: "#6b7280" }}
                            tickFormatter={(value) => value.toLocaleString()}
                          />
                          <YAxis
                            type="category"
                            dataKey="segment"
                            tick={{ fill: "#6b7280" }}
                            width={90}
                          />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "wonAccounts"
                                ? `${value} accounts`
                                : formatCurrency(value),
                              name === "wonAccounts" ? "Accounts" : "Revenue",
                            ]}
                            contentStyle={{
                              background: "rgba(255, 255, 255, 0.96)",
                              border: "1px solid #e5e7eb",
                              borderRadius: "0.5rem",
                            }}
                          />
                          <Bar
                            dataKey="wonAccounts"
                            name="wonAccounts"
                            fill="#dc2626"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Briefcase
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p>No division data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* New Business Breakdown Section */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <TrendingUp className="mr-2 text-green-600" /> New Business
                    Breakdown
                  </h2>
                  {/* Month Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select Month:
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(parseInt(e.target.value))
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((month, index) => (
                        <option key={index} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">
                    Division Performance
                  </h3>

                  {/* Division Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: "#F8FAFC" }}>
                          <th className="text-left p-4 font-semibold text-gray-800">
                            Division
                          </th>
                          <th className="text-right p-4 font-semibold text-gray-800">
                            2025 Revenue
                          </th>
                          <th className="text-right p-4 font-semibold text-gray-800">
                            2024 Revenue
                          </th>
                          <th className="text-right p-4 font-semibold text-gray-800">
                            YoY Growth
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {newBusinessData?.divisions &&
                        newBusinessData.divisions.length > 0 ? (
                          newBusinessData.divisions.map((division, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100"
                            >
                              <td className="p-4 font-medium text-gray-800">
                                {division.name}
                              </td>
                              <td className="p-4 text-right font-bold text-green-600">
                                {formatCurrency(division.newBusiness2025)}
                              </td>
                              <td className="p-4 text-right text-gray-600">
                                {formatCurrency(division.newBusiness2024)}
                              </td>
                              <td className="p-4 text-right">
                                <span
                                  className={`font-bold ${
                                    division.newBusinessYoy >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {formatPercentage(division.newBusinessYoy)}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="p-4 text-center text-gray-500"
                            >
                              No division data available for selected month
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* New Business Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">
                    New Business Trend
                  </h3>
                  {newBusinessData?.divisions &&
                  newBusinessData.divisions.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={newBusinessData.divisions}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E2E8F0"
                          />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            tick={{ fill: "#6b7280" }}
                          />
                          <YAxis
                            tick={{ fill: "#6b7280" }}
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip
                            formatter={(value) => [
                              formatCurrency(value),
                              "Revenue",
                            ]}
                            contentStyle={{
                              background: "rgba(255, 255, 255, 0.96)",
                              border: "1px solid #e5e7eb",
                              borderRadius: "0.5rem",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="newBusiness2025"
                            name="2025 Revenue"
                            fill="#059669"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p>No new business data available for selected month</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "competitors" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Competitor Analysis
                  </h2>
                  <Target className="text-gray-400" />
                </div>
                {data.competitorAnalysis &&
                data.competitorAnalysis.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.competitorAnalysis}
                        layout="vertical"
                        margin={{ left: 150, right: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          opacity={0.2}
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fill: "#6b7280" }}
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <YAxis
                          type="category"
                          dataKey="competitor"
                          tick={{ fill: "#6b7280" }}
                          width={140}
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            // name is the display name from the Bar component
                            if (name === "Amount Won") {
                              return [formatCurrency(value), "Amount Won"];
                            } else {
                              return [`${value} accounts`, "Accounts Won"];
                            }
                          }}
                          contentStyle={{
                            background: "rgba(255, 255, 255, 0.96)",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="amountWon"
                          name="Amount Won"
                          fill="#dc2626"
                          radius={[0, 4, 4, 0]}
                        />
                        <Bar
                          dataKey="accountsWon"
                          name="Accounts Won"
                          fill="#f87171"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Target
                        size={48}
                        className="mx-auto mb-4 text-gray-300"
                      />
                      <p>No competitor data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "YOY comparison" && (
            <div className="space-y-6">
              {/* Year-over-Year Comparison Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Year-over-Year Comparison
                  </h2>
                  <Target size={20} className="text-gray-400" />
                </div>
                {data.yoyComparison &&
                data.yoyComparison.currentYear &&
                data.yoyComparison.lastYear ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm text-gray-600 mb-2">
                          2025 Accounts
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {data.yoyComparison.currentYear.accounts}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {formatCurrency(
                            data.yoyComparison.currentYear.revenue
                          )}
                        </p>
                      </div>
                      <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-gray-600 mb-2">
                          2024 Accounts
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          {data.yoyComparison.lastYear.accounts}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {formatCurrency(data.yoyComparison.lastYear.revenue)}
                        </p>
                      </div>
                      <div
                        className={`text-center p-6 rounded-lg border ${
                          data.yoyComparison.accountsGrowth >= 0
                            ? "bg-green-50 border-green-100"
                            : "bg-red-50 border-red-100"
                        }`}
                      >
                        <p className="text-sm text-gray-600 mb-2">YoY Change</p>
                        <p
                          className={`text-3xl font-bold ${
                            data.yoyComparison.accountsGrowth >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPercentage(
                            Math.abs(data.yoyComparison.accountsGrowth)
                          )}
                          {data.yoyComparison.accountsGrowth >= 0 ? " ▲" : " ▼"}
                        </p>
                        <p
                          className={`text-sm mt-2 ${
                            data.yoyComparison.accountsGrowth >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {data.yoyComparison.accountsGrowth >= 0
                            ? "Increase"
                            : "Decrease"}{" "}
                          from 2024
                        </p>
                      </div>
                    </div>

                    {/* Additional YoY metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          Revenue YoY Change
                        </p>
                        <p
                          className={`text-xl font-bold ${
                            data.yoyComparison.revenueGrowth >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPercentage(
                            Math.abs(data.yoyComparison.revenueGrowth)
                          )}
                          {data.yoyComparison.revenueGrowth >= 0 ? " ▲" : " ▼"}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          Average Account Value Change
                        </p>
                        <p
                          className={`text-xl font-bold ${
                            data.yoyComparison.currentYear.accounts > 0 &&
                            data.yoyComparison.lastYear.accounts > 0
                              ? data.yoyComparison.currentYear.revenue /
                                  data.yoyComparison.currentYear.accounts /
                                  (data.yoyComparison.lastYear.revenue /
                                    data.yoyComparison.lastYear.accounts) -
                                  1 >=
                                0
                                ? "text-green-600"
                                : "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {data.yoyComparison.currentYear.accounts > 0 &&
                          data.yoyComparison.lastYear.accounts > 0
                            ? `${formatPercentage(
                                Math.abs(
                                  data.yoyComparison.currentYear.revenue /
                                    data.yoyComparison.currentYear.accounts /
                                    (data.yoyComparison.lastYear.revenue /
                                      data.yoyComparison.lastYear.accounts) -
                                    1
                                )
                              )} ${
                                data.yoyComparison.currentYear.revenue /
                                  data.yoyComparison.currentYear.accounts /
                                  (data.yoyComparison.lastYear.revenue /
                                    data.yoyComparison.lastYear.accounts) -
                                  1 >=
                                0
                                  ? "▲"
                                  : "▼"
                              }`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center text-gray-500">
                    <Target size={48} className="mb-4 text-gray-300" />
                    <p>No year-over-year comparison data available</p>
                  </div>
                )}
              </div>

              {/* Year on Year Line Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Year on Year Comparison (2024 vs 2025)
                  </h2>
                  <TrendingUp className="text-gray-400" />
                </div>
                {data.yearComparison && data.yearComparison.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sortDataByMonth(data.yearComparison)}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "#6b7280" }}
                          tickMargin={10}
                        />
                        <YAxis
                          tick={{ fill: "#6b7280" }}
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(value),
                            "Revenue",
                          ]}
                          contentStyle={{
                            background: "rgba(255, 255, 255, 0.96)",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="2024"
                          name="2024"
                          stroke="#9ca3af"
                          strokeWidth={2}
                          dot={{ fill: "#9ca3af", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="2025"
                          name="2025"
                          stroke="#dc2626"
                          strokeWidth={2}
                          dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp
                        size={48}
                        className="mx-auto mb-4 text-gray-300"
                      />
                      <p>No year comparison data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Combo Chart: Amount Won (Left Axis) and Accounts Won (Right Axis) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Revenue & Accounts Won by Month (2025)
                  </h2>
                  <BarChart3 className="text-gray-400" />
                </div>
                {mergedMonthlyData && mergedMonthlyData.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={mergedMonthlyData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "#6b7280" }}
                          tickMargin={10}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fill: "#6b7280" }}
                          tickFormatter={(value) => formatCurrency(value)}
                          label={{
                            value: "Amount Won",
                            angle: -90,
                            position: "insideLeft",
                            style: { fill: "#6b7280" },
                          }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fill: "#6b7280" }}
                          label={{
                            value: "Accounts Won",
                            angle: 90,
                            position: "insideRight",
                            style: { fill: "#6b7280" },
                          }}
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "Amount Won") {
                              return [formatCurrency(value), name];
                            }
                            return [value, name];
                          }}
                          contentStyle={{
                            background: "rgba(255, 255, 255, 0.96)",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="totalAmount"
                          name="Amount Won"
                          fill="#dc2626"
                          radius={[4, 4, 0, 0]}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="accountsWon"
                          name="Accounts Won"
                          stroke="#059669"
                          strokeWidth={3}
                          dot={{ fill: "#059669", strokeWidth: 2, r: 5 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3
                        size={48}
                        className="mx-auto mb-4 text-gray-300"
                      />
                      <p>No monthly data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Won Accounts Details
                    </h2>
                    <p className="text-gray-600">
                      Detailed view of all won accounts
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Filter by Year:
                    </label>
                    <select
                      value={detailsYearFilter}
                      onChange={(e) => {
                        setDetailsYearFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="all">All Years</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                  </div>
                </div>
              </div>

              {data.rawData && data.rawData.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Division
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Competitor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Underwriter
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Year
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                          const filteredData =
                            detailsYearFilter === "all"
                              ? data.rawData
                              : data.rawData.filter(
                                  (item) => item.year === detailsYearFilter
                                );

                          const indexOfLastItem = currentPage * itemsPerPage;
                          const indexOfFirstItem =
                            indexOfLastItem - itemsPerPage;
                          const currentItems = filteredData.slice(
                            indexOfFirstItem,
                            indexOfLastItem
                          );

                          if (currentItems.length === 0) {
                            return (
                              <tr>
                                <td
                                  colSpan="7"
                                  className="px-6 py-8 text-center text-gray-500"
                                >
                                  No accounts found for the selected year.
                                </td>
                              </tr>
                            );
                          }

                          return currentItems.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.client || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.division || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.month || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(item.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.competitor || "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.underwriter || "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.year || "N/A"}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    {(() => {
                      const filteredData =
                        detailsYearFilter === "all"
                          ? data.rawData
                          : data.rawData.filter(
                              (item) => item.year === detailsYearFilter
                            );
                      const totalPages = Math.ceil(
                        filteredData.length / itemsPerPage
                      );
                      const indexOfLastItem = currentPage * itemsPerPage;
                      const indexOfFirstItem = indexOfLastItem - itemsPerPage;

                      return (
                        <>
                          <div className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-medium">
                              {Math.min(
                                indexOfFirstItem + 1,
                                filteredData.length
                              )}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(indexOfLastItem, filteredData.length)}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">
                              {filteredData.length}
                            </span>{" "}
                            results
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft size={16} className="inline" />{" "}
                              Previous
                            </button>
                            <button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages)
                                )
                              }
                              disabled={currentPage === totalPages}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next <ChevronRight size={16} className="inline" />
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">
                    No detailed data available
                  </p>
                  <p className="text-sm mt-2">
                    Upload data to see account details here.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* CSV Upload Sections - Only visible for admins */}
        {isAdmin && (
          <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Admin Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
              {/* Won Accounts CSV Section */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Won Accounts Data
                </h4>

                {/* Year Selection */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Select Year for Template
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    {Array.from({ length: 3 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white text-red-600 border border-red-600 rounded-md shadow-sm hover:bg-red-50 transition text-xs font-medium"
                  >
                    <Download size={14} /> Download {selectedYear} Template
                  </button>
                  <label
                    htmlFor="csv-upload"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 transition cursor-pointer text-xs font-medium"
                  >
                    <Upload size={14} /> Upload CSV
                  </label>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleUploadCSV}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Various Data CSV Section */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Various Divisions Data
                </h4>

                {/* Add spacing to match the height of the year dropdown */}
                <div className="mb-2">
                  <div className="h-[18px]"></div>
                  <div className="h-[34px]"></div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadVariousTemplate}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white text-red-600 border border-red-600 rounded-md shadow-sm hover:bg-red-50 transition text-xs font-medium"
                  >
                    <Download size={14} /> Download Template
                  </button>
                  <label
                    htmlFor="various-csv-upload"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 transition cursor-pointer text-xs font-medium"
                  >
                    <Upload size={14} /> Upload CSV
                  </label>
                  <input
                    id="various-csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleUploadVariousCSV}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WonAccountsPage;
