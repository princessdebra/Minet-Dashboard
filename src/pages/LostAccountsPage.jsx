import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";
import {
  ArrowLeft,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Clock,
  BarChart2,
  Users,
  RefreshCw,
  Award,
  Info,
  ChevronRight,
  ChevronLeft,
  Upload,
  Download,
  Calendar,
  TrendingUp,
  PieChart as PieChartIcon,
  Building,
  Target,
} from "lucide-react";
import { API_URL } from "../constants";
// Helper functions
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

// Helper function to filter data by time frame
// Helper function to filter data by time frame - includes previous year for comparisons
const filterDataByTimeFrame = (data, timeFrame) => {
  if (!data || !Array.isArray(data)) return [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January)

  let startDate;

  switch (timeFrame) {
    case "3m":
      // Last 3 months - include previous year for complete comparison
      startDate = new Date(currentYear - 1, currentMonth - 2, 1); // Include previous year
      break;
    case "6m":
      // Last 6 months - include previous year for complete comparison
      startDate = new Date(currentYear - 1, currentMonth - 5, 1); // Include previous year
      break;
    case "ytd":
      // Year to date - include previous year for YoY comparison
      startDate = new Date(currentYear - 1, 0, 1); // January 1st of previous year
      break;
    case "12m":
    default:
      // Last 12 months - include previous year data
      startDate = new Date(currentYear - 1, currentMonth, 1); // 12 months back
      break;
  }

  return data.filter((item) => {
    const itemDate = new Date(`${item.month} 1, ${item.year}`);
    return itemDate >= startDate;
  });
};

const COLORS = [
  "#E30613",
  "#FF6B6B",
  "#FFA726",
  "#66BB6A",
  "#42A5F5",
  "#AB47BC",
  "#26C6DA",
  "#FFCA28",
  "#8D6E63",
  "#78909C",
];

// Month order for proper sorting
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

const LostAccountsPage = ({ onBack, userRole }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [timeFrame, setTimeFrame] = useState("12m");
  const [detailsYearFilter, setDetailsYearFilter] = useState("all");

  const itemsPerPage = 10;

  const buildGrowthMeta = (growthValue) => {
    if (typeof growthValue !== "number" || Number.isNaN(growthValue)) {
      return {
        valueLabel: "N/A",
        icon: "–",
        valueColor: "text-gray-500",
        trendColor: "text-gray-400",
        description: "No prior-year data",
        raw: null,
      };
    }

    if (Math.abs(growthValue) < 1e-6) {
      return {
        valueLabel: formatPercentage(0),
        icon: "–",
        valueColor: "text-gray-600",
        trendColor: "text-gray-500",
        description: "No change from last year",
        raw: 0,
      };
    }

    const isIncrease = growthValue >= 0;
    return {
      valueLabel: formatPercentage(Math.abs(growthValue)),
      icon: isIncrease ? "▲" : "▼",
      valueColor: isIncrease ? "text-red-600" : "text-green-600",
      trendColor: isIncrease ? "text-red-500" : "text-green-500",
      description: `${isIncrease ? "Increase" : "Decrease"} from last year`,
      raw: growthValue,
    };
  };

  // Check if user is admin
  const isAdmin = userRole === "admin";

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL + "/api/lost-accounts");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setData(result);
    } catch (e) {
      setError(e.message);
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };
  // Add this with your other state declarations
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Handle CSV download for lost_accounts_details
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(
        API_URL + `/api/download-lost-accounts-template?year=${selectedYear}`
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
        `lost_accounts_${selectedYear}_template.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Error downloading template: ${err.message}`);
    }
  };

  // Handle CSV upload for lost_accounts_details
  const handleUploadCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL + "/api/upload-lost-accounts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server error");
      }

      const result = await response.json();

      if (result.message) {
        alert("Lost Accounts data updated successfully!");
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

  // Handle CSV download for lost_various
  const handleDownloadVariousTemplate = async () => {
    try {
      const response = await fetch(
        API_URL + "/api/download-lost-various-template"
      );
      if (!response.ok) throw new Error("Failed to download template");
      const result = await response.json();

      const blob = new Blob([result.csv_content], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "lost_various_template.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Error downloading template: ${err.message}`);
    }
  };

  // Handle CSV upload for lost_various
  const handleUploadVariousCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("csv_file", file);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL + "/api/upload-lost-various", {
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
  }, []);

  // Enhanced data processing with proper year filtering
  const processEnhancedData = () => {
    if (!data || !data.rawData) return null;

    const allRawData = Array.isArray(data.rawData) ? data.rawData : [];

    // Apply time frame filter to raw data for timeframe-aware widgets
    const filteredRawData = filterDataByTimeFrame(allRawData, timeFrame);

    const now = new Date();
    const currentYear = String(now.getFullYear());
    const previousYear = String(now.getFullYear() - 1);

    const sumAmounts = (items) =>
      items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    // Filter data by years from the time-frame filtered data
    const currentYearData = filteredRawData.filter(
      (item) => item.year === currentYear
    );
    const previousYearData = filteredRawData.filter(
      (item) => item.year === previousYear
    );

    // Monthly Analysis - current year ONLY with properly sorted months
    const monthlyDataCurrentYear = {};

    // Initialize all months with zero values for current year
    MONTH_ORDER.forEach((month) => {
      monthlyDataCurrentYear[month] = {
        month: month,
        accounts: 0,
        revenue: 0,
        year: currentYear,
        accountsByDivision: {},
        accountsByReason: {},
      };
    });

    // Populate with actual current year data
    currentYearData.forEach((item) => {
      if (monthlyDataCurrentYear[item.month]) {
        monthlyDataCurrentYear[item.month].accounts += 1;
        monthlyDataCurrentYear[item.month].revenue +=
          parseFloat(item.amount) || 0;

        if (item.division) {
          monthlyDataCurrentYear[item.month].accountsByDivision[item.division] =
            (monthlyDataCurrentYear[item.month].accountsByDivision[
              item.division
            ] || 0) + 1;
        }
      }
    });

    const monthlyArrayCurrentYear = Object.values(monthlyDataCurrentYear);

    // Month-on-Month Growth: Compare previous year vs current year
    const momComparison = MONTH_ORDER.map((month) => {
      const currentYearMonthData = currentYearData.filter(
        (item) => item.month === month
      );
      const previousYearMonthData = previousYearData.filter(
        (item) => item.month === month
      );

      const currentAccounts = currentYearMonthData.length;
      const previousAccounts = previousYearMonthData.length;

      const currentRevenue = sumAmounts(currentYearMonthData);
      const previousRevenue = sumAmounts(previousYearMonthData);

      const accountGrowth =
        previousAccounts > 0
          ? (currentAccounts - previousAccounts) / previousAccounts
          : currentAccounts > 0
            ? 1
            : 0;

      const revenueGrowth =
        previousRevenue > 0
          ? (currentRevenue - previousRevenue) / previousRevenue
          : currentRevenue > 0
            ? 1
            : 0;

      return {
        month,
        currentAccounts,
        previousAccounts,
        currentRevenue,
        previousRevenue,
        accountGrowth,
        revenueGrowth,
      };
    });

    // Division Analysis - current year ONLY
    const divisionDataCurrentYear = {};
    currentYearData.forEach((item) => {
      if (item.division) {
        const divisionName = item.division;

        if (!divisionDataCurrentYear[divisionName]) {
          divisionDataCurrentYear[divisionName] = {
            name: divisionName,
            accounts: 0,
            revenue: 0,
          };
        }
        divisionDataCurrentYear[divisionName].accounts += 1;
        divisionDataCurrentYear[divisionName].revenue +=
          parseFloat(item.amount) || 0;
      }
    });

    const divisionArrayCurrentYear = Object.values(
      divisionDataCurrentYear
    ).sort((a, b) => b.accounts - a.accounts);

    // Year-over-Year Comparison uses the full dataset for accurate counts
    const yoyCurrentYearData = allRawData.filter(
      (item) => item.year === currentYear
    );
    const yoyPreviousYearData = allRawData.filter(
      (item) => item.year === previousYear
    );

    const yoyCurrentRevenue = sumAmounts(yoyCurrentYearData);
    const yoyPreviousRevenue = sumAmounts(yoyPreviousYearData);

    const calculateGrowth = (currentValue, previousValue) => {
      if (previousValue === 0) {
        return currentValue === 0 ? 0 : null;
      }
      return (currentValue - previousValue) / previousValue;
    };

    const currentAverage =
      yoyCurrentYearData.length > 0
        ? yoyCurrentRevenue / yoyCurrentYearData.length
        : null;
    const previousAverage =
      yoyPreviousYearData.length > 0
        ? yoyPreviousRevenue / yoyPreviousYearData.length
        : null;

    const yoyComparison = {
      currentYear: {
        label: currentYear,
        accounts: yoyCurrentYearData.length,
        revenue: yoyCurrentRevenue,
      },
      lastYear: {
        label: previousYear,
        accounts: yoyPreviousYearData.length,
        revenue: yoyPreviousRevenue,
      },
      accountsGrowth: calculateGrowth(
        yoyCurrentYearData.length,
        yoyPreviousYearData.length
      ),
      revenueGrowth: calculateGrowth(yoyCurrentRevenue, yoyPreviousRevenue),
      averageAccountValue: {
        current: currentAverage,
        last: previousAverage,
        growth:
          previousAverage && previousAverage !== 0 && currentAverage !== null
            ? (currentAverage - previousAverage) / previousAverage
            : null,
      },
    };

    return {
      monthlyAnalysis: monthlyArrayCurrentYear,
      momComparison,
      divisionAnalysis: divisionArrayCurrentYear,
      yoyComparison,
      // Update totals based on filtered data
      totalLostAccounts: currentYearData.length,
      totalLostRevenue: sumAmounts(currentYearData),
      retentionRate: data.retentionRate, // This might need adjustment based on your business logic
      lostByReason: data.lostByReason, // These might need filtering too
      lostByCompetitor: data.lostByCompetitor,
      rawData: filteredRawData, // Use filtered data
      currentYearData,
      previousYearData,
    };
  };

  const enhancedData = processEnhancedData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-12 bg-gray-200 rounded-md animate-pulse w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-gray-200 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="max-w-md text-center bg-white p-8 rounded-xl shadow-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="max-w-md text-center">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600">No lost accounts data could be found.</p>
        </div>
      </div>
    );
  }

  const {
    totalLostAccounts,
    totalLostRevenue,
    retentionRate,
    lostByReason,
    lostByCompetitor,
    rawData,
  } = data;

  const yoyComparisonData = enhancedData?.yoyComparison;
  const yoyAccountsMeta = buildGrowthMeta(yoyComparisonData?.accountsGrowth);
  const yoyRevenueMeta = buildGrowthMeta(yoyComparisonData?.revenueGrowth);
  const averageAccountValue = yoyComparisonData?.averageAccountValue;
  const averageValueMeta = buildGrowthMeta(averageAccountValue?.growth ?? null);
  const currentYoYLabel = yoyComparisonData?.currentYear?.label;
  const previousYoYLabel = yoyComparisonData?.lastYear?.label;
  const comparisonTitle =
    currentYoYLabel && previousYoYLabel
      ? `Year on Year Comparison (${previousYoYLabel} vs ${currentYoYLabel})`
      : "Year on Year Comparison";

  // Sort and filter data
  const sortedCompetitors = [...(lostByCompetitor || [])]
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const sortedReasons = [...(lostByReason || [])].sort(
    (a, b) => b.value - a.value
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = rawData?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((rawData?.length || 0) / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-[#E30613] hover:text-[#B2000D] transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Lost Accounts Analysis
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Comprehensive insights into client churn and retention
                opportunities
              </p>
            </div>

            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "overview"
                    ? "bg-white shadow-sm text-red-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "analytics"
                    ? "bg-white shadow-sm text-[#E30613]"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Advanced Analytics
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "details"
                    ? "bg-white shadow-sm text-[#E30613]"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Details
              </button>
            </div>
          </div>

          {/* Time Frame Selector */}
          <div className="flex items-center space-x-4 mb-6">
            <label className="text-sm font-medium text-gray-700">
              Time Frame:
            </label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
        </header>

        {activeTab === "overview" ? (
          <main className="space-y-8">
            {/* Key Metrics */}
            {/* First Row - 4 Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
              {/* Total Lost Accounts */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Total Lost Accounts
                  </h3>
                  <Users size={24} className="text-red-400" />
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {totalLostAccounts?.toLocaleString() || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-2">Last 12 months</p>
              </div>

              {/* Retention Rate */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Retention Rate
                  </h3>
                  <Clock size={24} className="text-green-400" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {formatPercentage(retentionRate)}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span
                    className={`mr-2 ${retentionRate >= 0.85 ? "text-green-500" : "text-red-500"}`}
                  >
                    {retentionRate >= 0.85 ? "▲" : "▼"}
                  </span>
                  <span className="text-gray-500">
                    {retentionRate >= 0.85 ? "Above target" : "Below target"}
                  </span>
                </div>
              </div>

              {/* YoY Change */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    YoY Change
                  </h3>
                  <TrendingUp size={24} className="text-blue-400" />
                </div>
                <p
                  className={`text-3xl font-bold ${yoyAccountsMeta.valueColor}`}
                >
                  {yoyAccountsMeta.valueLabel}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className={`mr-2 ${yoyAccountsMeta.trendColor}`}>
                    {yoyAccountsMeta.icon}
                  </span>
                  <span className="text-gray-500">
                    {yoyAccountsMeta.description}
                  </span>
                </div>
              </div>
              {/* Total MKIB */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-500">
                    Total MKIB
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(data?.totalMKIB)}
                  </p>
                  <p className="text-blue-600 mt-1 flex items-center gap-1 text-sm">
                    <Building size={16} /> Retail & SME + Reinsurance
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Building size={32} className="text-blue-600" />
                </div>
              </div>
            </section>

            {/* Second Row - 3 Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Total MKFS */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-500">
                    Total MKFS
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(data?.totalMKFS)}
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
                    {formatCurrency(data?.totalMKIC)}
                  </p>
                  <p className="text-orange-600 mt-1 flex items-center gap-1 text-sm">
                    <Target size={16} /> Corporate
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Target size={32} className="text-orange-600" />
                </div>
              </div>
              {/* Total Lost Revenue */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Total Lost Revenue
                  </h3>
                  <DollarSign size={24} className="text-red-400" />
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(totalLostRevenue)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Potential annual impact
                </p>
              </div>
            </section>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lost by Reason */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Lost Accounts by Reason
                  </h2>
                  <Info size={18} className="text-gray-400" />
                </div>

                {sortedReasons.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sortedReasons}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          animationDuration={500}
                        >
                          {sortedReasons.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} accounts`, "Count"]}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend
                          layout="horizontal"
                          align="center"
                          verticalAlign="bottom"
                          wrapperStyle={{ paddingTop: "16px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-gray-500">
                    <BarChart2 size={48} className="mb-4 text-gray-300" />
                    <p>No reason data available</p>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    Identifies the primary reasons for client churn with exact
                    numbers
                  </p>
                </div>
              </div>

              {/* Lost by Competitor */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Business Lost to Competitors
                  </h2>
                  <Info size={18} className="text-gray-400" />
                </div>

                {sortedCompetitors.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sortedCompetitors}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                          interval={0}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value) => [`${value} accounts`, "Count"]}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          name="Accounts Lost"
                          fill="#E30613"
                          radius={[4, 4, 0, 0]}
                          animationDuration={500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-gray-500">
                    <Award size={48} className="mb-4 text-gray-300" />
                    <p>No competitor data available</p>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    Shows which competitors are winning our clients with exact
                    values
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Insights */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Retention Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">
                    Top 5 Churn Reasons
                  </h3>
                  <ul className="space-y-3">
                    {sortedReasons.slice(0, 5).map((reason, index) => (
                      <li key={index} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium">{reason.name}</span>
                        <span className="ml-auto text-gray-600">
                          {reason.value} accounts (
                          {Math.round((reason.value / totalLostAccounts) * 100)}
                          %)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">
                    Recommendations
                  </h3>
                  <ul className="space-y-3 list-disc pl-5 text-gray-600">
                    {sortedReasons.slice(0, 2).map((reason, index) => (
                      <li key={index}>
                        {reason.name === "Competition" && (
                          <span>
                            Enhance competitive pricing strategies for at-risk
                            accounts
                          </span>
                        )}
                        {reason.name === "Financial Constraints" && (
                          <span>
                            Develop flexible payment options for financially
                            constrained clients
                          </span>
                        )}
                        {reason.name === "Bancassurance" && (
                          <span>
                            Strengthen relationships with bank partners to
                            retain bancassurance clients
                          </span>
                        )}
                        {![
                          "Competition",
                          "Financial Constraints",
                          "Bancassurance",
                        ].includes(reason.name) && (
                          <span>
                            Implement targeted retention programs for{" "}
                            {reason.name.toLowerCase()} cases
                          </span>
                        )}
                      </li>
                    ))}
                    <li>
                      Conduct exit interviews to better understand churn drivers
                    </li>
                    <li>Implement early warning system for at-risk accounts</li>
                  </ul>
                </div>
              </div>
            </div>
          </main>
        ) : activeTab === "analytics" ? (
          <main className="space-y-8">
            {/* Enhanced Analytics Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Year on Year Comparison (2024 vs 2025) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {comparisonTitle}
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
                          stroke="#E30613"
                          strokeWidth={2}
                          dot={{ fill: "#E30613", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-gray-500">
                    <TrendingUp size={48} className="mb-4 text-gray-300" />
                    <p>No year-on-year comparison data available</p>
                  </div>
                )}
              </div>

              {/* Monthly Revenue */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Monthly Revenue
                  </h2>
                  <DollarSign className="text-gray-400" />
                </div>
                {enhancedData?.monthlyAnalysis?.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sortDataByMonth(enhancedData?.monthlyAnalysis)}
                      >
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
                          dataKey="revenue"
                          name="Revenue"
                          fill="#E30613"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-gray-500">
                    <DollarSign size={48} className="mb-4 text-gray-300" />
                    <p>No monthly revenue data available for 2025</p>
                  </div>
                )}
              </div>
            </section>

            {/* Division Analysis - 2025 ONLY */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lost Accounts by Division - 2025 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Lost Accounts by Division (2025)
                  </h2>
                  <Building size={20} className="text-gray-400" />
                </div>
                {enhancedData?.divisionAnalysis?.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={enhancedData.divisionAnalysis}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "Accounts") return [value, "Accounts"];
                            if (name === "Revenue")
                              return [formatCurrency(value), "Revenue"];
                            return [value, name];
                          }}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="accounts"
                          name="Accounts"
                          fill="#E30613"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-gray-500">
                    <Building size={48} className="mb-4 text-gray-300" />
                    <p>No division data available for 2025</p>
                  </div>
                )}
              </div>

              {/* Lost Accounts Percentage by Division - 2025 ONLY */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Lost Accounts % by Division (2025)
                  </h2>
                  <PieChartIcon size={20} className="text-gray-400" />
                </div>
                {enhancedData?.divisionAnalysis?.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={enhancedData.divisionAnalysis}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, accounts }) =>
                            `${name}: ${((accounts / enhancedData.totalLostAccounts) * 100).toFixed(1)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="accounts"
                          nameKey="name"
                        >
                          {enhancedData.divisionAnalysis.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "accounts") {
                              const percentage = (
                                (value / enhancedData.totalLostAccounts) *
                                100
                              ).toFixed(1);
                              return [
                                `${value} accounts (${percentage}%)`,
                                "Accounts",
                              ];
                            }
                            return [value, name];
                          }}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-gray-500">
                    <PieChartIcon size={48} className="mb-4 text-gray-300" />
                    <p>No division percentage data available for 2025</p>
                  </div>
                )}
              </div>
            </section>

            {/* Year-over-Year Comparison */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Year-over-Year Comparison
                </h2>
                <Target size={20} className="text-gray-400" />
              </div>
              {enhancedData?.yoyComparison ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm text-gray-600 mb-2">
                        {currentYoYLabel
                          ? `${currentYoYLabel} Accounts`
                          : "Current Year Accounts"}
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {enhancedData.yoyComparison.currentYear.accounts.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatCurrency(
                          enhancedData.yoyComparison.currentYear.revenue
                        )}
                      </p>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 mb-2">
                        {previousYoYLabel
                          ? `${previousYoYLabel} Accounts`
                          : "Previous Year Accounts"}
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {enhancedData.yoyComparison.lastYear.accounts.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatCurrency(
                          enhancedData.yoyComparison.lastYear.revenue
                        )}
                      </p>
                    </div>
                    <div
                      className={`text-center p-6 rounded-lg border ${
                        typeof yoyAccountsMeta.raw === "number"
                          ? yoyAccountsMeta.raw > 0
                            ? "bg-red-50 border-red-100"
                            : yoyAccountsMeta.raw < 0
                              ? "bg-green-50 border-green-100"
                              : "bg-gray-50 border-gray-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <p className="text-sm text-gray-600 mb-2">YoY Change</p>
                      <p
                        className={`text-3xl font-bold ${yoyAccountsMeta.valueColor}`}
                      >
                        {yoyAccountsMeta.valueLabel}
                        {yoyAccountsMeta.raw !== null
                          ? ` ${yoyAccountsMeta.icon}`
                          : ""}
                      </p>
                      <p
                        className={`text-sm mt-2 ${yoyAccountsMeta.trendColor}`}
                      >
                        {yoyAccountsMeta.raw !== null
                          ? `${yoyAccountsMeta.raw >= 0 ? "Increase" : "Decrease"} from ${previousYoYLabel || "prior year"}`
                          : "No prior-year data"}
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
                        className={`text-xl font-bold ${yoyRevenueMeta.valueColor}`}
                      >
                        {yoyRevenueMeta.valueLabel}
                        {yoyRevenueMeta.raw !== null
                          ? ` ${yoyRevenueMeta.icon}`
                          : ""}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        Average Account Value Change
                      </p>
                      <p
                        className={`text-xl font-bold ${averageValueMeta.valueColor}`}
                      >
                        {averageValueMeta.valueLabel}
                        {averageValueMeta.raw !== null
                          ? ` ${averageValueMeta.icon}`
                          : ""}
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
          </main>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Lost Accounts Details
                  </h2>
                  <p className="text-gray-600">
                    Detailed view of all lost accounts
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
                      Reason
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
                        ? rawData
                        : rawData.filter(
                            (item) => item.year === detailsYearFilter
                          );

                    const indexOfLastItem = currentPage * itemsPerPage;
                    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                    const currentItems = filteredData.slice(
                      indexOfFirstItem,
                      indexOfLastItem
                    );

                    return currentItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.client}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.division}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.competitor || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.reason || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.year}
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
                    ? rawData
                    : rawData.filter((item) => item.year === detailsYearFilter);
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
                        {indexOfFirstItem + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredData.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">{filteredData.length}</span>{" "}
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
                        <ChevronLeft size={16} className="inline" /> Previous
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
          </div>
        )}

        {/* CSV Upload Sections - Only visible for admins */}
        {isAdmin && (
          <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Admin Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {/* Lost Accounts CSV Section */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Lost Accounts Data
                </h4>

                {/* Year Selection */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Select Year for Template
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white text-red-600 border border-red-600 rounded-lg shadow-sm hover:bg-red-50 transition text-xs"
                  >
                    <Download size={14} /> Download {selectedYear} Template
                  </button>
                  <label
                    htmlFor="csv-upload"
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition cursor-pointer text-xs"
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
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Various Divisions Data
                </h4>
                {/* Spacing to match Lost Accounts card height */}
                <div className="h-[18px]"></div>
                <div className="h-[34px]"></div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadVariousTemplate}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white text-red-600 border border-red-600 rounded-lg shadow-sm hover:bg-red-50 transition text-xs"
                  >
                    <Download size={14} /> Download Template
                  </button>
                  <label
                    htmlFor="various-csv-upload"
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition cursor-pointer text-xs"
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

export default LostAccountsPage;
