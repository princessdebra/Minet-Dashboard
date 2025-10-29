import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Globe,
  Briefcase,
  RefreshCw,
  Upload,
  Download,
} from "lucide-react";
import { API_URL } from "../constants";

// Helper functions
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "Ksh N/A";
  const numValue =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  const absValue = Math.abs(numValue);
  if (absValue >= 1_000_000_000)
    return `Ksh ${(numValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000) return `Ksh ${(numValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `Ksh ${(numValue / 1_000).toFixed(0)}K`;
  return `Ksh ${numValue.toFixed(0)}`;
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return `${(value * 100).toFixed(1)}%`;
};

const COLORS = [
  "#6366f1",
  "#a855f7",
  "#d946ef",
  "#06b6d4",
  "#10b981",
  "#fcd34d",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#be185d",
];

const MarketSharePage = ({ onBack, userRole }) => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("product");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("SHORT TERM INSURANCE"); // New filter state

  // Check if user is admin
  const isAdmin = userRole === "admin";

  const fetchMarketData = async () => {
    try {
      // Fetch only the current/latest quarter data
      const response = await fetch(API_URL + "/api/market-share/current");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMarketData(data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  // Function to handle CSV file download
  const handleDownloadCSV = () => {
    const columns = [
      "term",
      "category",
      "industry_gross_premium_current_year",
      "industry_gross_premium_previous_year",
      "percent_change_current_previous",
      "minet_brokered_premiums_current_year",
      "minet_brokered_premiums_previous_year",
      "percent_change_current_previous_premiums",
      "minet_market_share_current_year",
      "minet_market_share_previous_year",
      "percent_change_current_previous_market_share",
      "quarter",
      "year",
    ];
    const csvContent = "data:text/csv;charset=utf-8," + columns.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "market_share_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(API_URL + "/api/upload-market-share", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      setUploadStatus("Upload successful! Data will be refreshed shortly.");
      // Refresh data after a short delay
      setTimeout(() => {
        fetchMarketData();
        setUploadStatus("");
      }, 2000);
    } catch (e) {
      setUploadStatus(`Upload failed: ${e.message}`);
      console.error("Upload error:", e);
    } finally {
      setIsUploading(false);
    }
  };
  useEffect(() => {
    fetchMarketData();
  }, []);

  // Process data for charts
  const processData = () => {
    if (!marketData) return null;

    // Filter data by selected term
    const filteredData = marketData.filter(
      (item) => item.term === selectedTerm
    );

    if (filteredData.length === 0) {
      return {
        marketShareByProductLine: [],
        growthByProductLine: [],
        topCategories: [],
        premiumsData: [],
      };
    }

    // Market share by product line (using category)
    const marketShareByProductLine = filteredData.map((item) => ({
      name: item.category.trim(),
      value: item.minet_market_share_current_year * 100, // Convert to percentage
    }));

    // Growth/Decline by product line
    const growthByProductLine = filteredData
      .map((item) => ({
        category: item.category.trim(),
        growth: item.percent_change_current_previous_market_share * 100,
        marketShare: item.minet_market_share_current_year * 100,
      }))
      .sort((a, b) => b.growth - a.growth);

    // Top performing categories by market share
    const topCategories = [...filteredData]
      .sort(
        (a, b) =>
          b.minet_market_share_current_year - a.minet_market_share_current_year
      )
      .slice(0, 5)
      .map((item) => ({
        category: item.category.trim(),
        share: item.minet_market_share_current_year * 100,
      }));

    // Premiums data
    const premiumsData = filteredData.map((item) => ({
      category: item.category.trim(),
      industry: item.industry_gross_premium_current_year,
      minet: item.minet_brokered_premiums_current_year,
    }));

    return {
      marketShareByProductLine,
      growthByProductLine,
      topCategories,
      premiumsData,
    };
  };

  const chartData = processData();

  // Get filtered market data for metrics calculations
  const filteredMarketData = marketData
    ? marketData.filter((item) => item.term === selectedTerm)
    : [];

  // Format term name for display
  const getTermDisplayName = () => {
    switch (selectedTerm) {
      case "SHORT TERM INSURANCE":
        return "Short Term Insurance";
      case "LONG-TERM INSURANCE":
        return "Long-Term Insurance";
      case "REINSURANCE":
        return "Reinsurance";
      default:
        return selectedTerm;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <strong>Error:</strong> {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 text-blue-600 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md">
          No market share data available.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-red-600 hover:text-red-800 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Market Share Analytics
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Comprehensive view of our market position and competitive
                landscape
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Last updated: Q2 2025
              </span>
              <button
                onClick={fetchMarketData}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Term Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700 self-center mr-2">
              Filter by Term:
            </span>
            {["SHORT TERM INSURANCE", "LONG-TERM INSURANCE", "REINSURANCE"].map(
              (term) => (
                <button
                  key={term}
                  onClick={() => setSelectedTerm(term)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    selectedTerm === term
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {term === "SHORT TERM INSURANCE"
                    ? "Short Term"
                    : term === "LONG-TERM INSURANCE"
                      ? "Long Term"
                      : "Reinsurance"}
                </button>
              )
            )}
          </div>
          {/* CSV Upload Section - Only visible for admins */}
          {isAdmin && (
            <div className="flex items-center space-x-4 mt-6">
              <button
                onClick={handleDownloadCSV}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <Download size={16} className="mr-2" /> Download CSV Template
              </button>

              <label
                htmlFor="file-upload"
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm cursor-pointer hover:bg-red-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500 transition-colors"
              >
                <Upload size={16} className="mr-2" /> Upload CSV
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>

              {uploadStatus && (
                <p
                  className={`text-sm font-medium ${uploadStatus.includes("failed") ? "text-red-600" : "text-green-600"}`}
                >
                  {uploadStatus}
                </p>
              )}
            </div>
          )}
        </header>

        {/* Overall Key Metrics (All Terms - Q2 2025) */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Overall Performance - All Terms (Q2 2025)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Avg. Market Share
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {marketData && marketData.length > 0
                      ? formatPercentage(
                          marketData.reduce(
                            (sum, item) =>
                              sum + item.minet_market_share_current_year,
                            0
                          ) / marketData.length
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <Globe size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-green-600 font-medium">
                  {marketData && marketData.length > 0
                    ? formatPercentage(
                        marketData.reduce(
                          (sum, item) =>
                            sum +
                            item.percent_change_current_previous_market_share,
                          0
                        ) / marketData.length
                      )
                    : "N/A"}
                </span>
                <span className="text-gray-500 ml-1">vs last year</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Brokered Premiums
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {marketData && marketData.length > 0
                      ? formatCurrency(
                          marketData.reduce(
                            (sum, item) =>
                              sum + item.minet_brokered_premiums_current_year,
                            0
                          )
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                  <Briefcase size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-green-600 font-medium">
                  {marketData && marketData.length > 0
                    ? formatPercentage(
                        marketData.reduce(
                          (sum, item) =>
                            sum + item.percent_change_current_previous_premiums,
                          0
                        ) / marketData.length
                      )
                    : "N/A"}
                </span>
                <span className="text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Industry Premiums
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {marketData && marketData.length > 0
                      ? formatCurrency(
                          marketData.reduce(
                            (sum, item) =>
                              sum + item.industry_gross_premium_current_year,
                            0
                          )
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 text-green-600">
                  <Award size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-green-600 font-medium">
                  {marketData && marketData.length > 0
                    ? formatPercentage(
                        marketData.reduce(
                          (sum, item) =>
                            sum + item.percent_change_current_previous,
                          0
                        ) / marketData.length
                      )
                    : "N/A"}
                </span>
                <span className="text-gray-500 ml-1">industry growth</span>
              </div>
            </div>
          </div>
        </div>

        {/* Term-Specific Metrics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {getTermDisplayName()} Performance (Q2 2025)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Minet Premiums for Selected Term */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-900">
                  Minet Premiums
                </p>
                <Briefcase size={20} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900">
                {filteredMarketData.length > 0
                  ? formatCurrency(
                      filteredMarketData.reduce(
                        (sum, item) =>
                          sum + item.minet_brokered_premiums_current_year,
                        0
                      )
                    )
                  : "N/A"}
              </p>
              <div className="mt-3 flex items-center text-sm">
                {filteredMarketData.length > 0 &&
                filteredMarketData.reduce(
                  (sum, item) =>
                    sum + item.percent_change_current_previous_premiums,
                  0
                ) /
                  filteredMarketData.length >
                  0 ? (
                  <>
                    <TrendingUp size={16} className="text-green-600 mr-1" />
                    <span className="text-green-700 font-medium">
                      {formatPercentage(
                        filteredMarketData.reduce(
                          (sum, item) =>
                            sum + item.percent_change_current_previous_premiums,
                          0
                        ) / filteredMarketData.length
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown size={16} className="text-red-600 mr-1" />
                    <span className="text-red-700 font-medium">
                      {filteredMarketData.length > 0
                        ? formatPercentage(
                            filteredMarketData.reduce(
                              (sum, item) =>
                                sum +
                                item.percent_change_current_previous_premiums,
                              0
                            ) / filteredMarketData.length
                          )
                        : "N/A"}
                    </span>
                  </>
                )}
                <span className="text-red-800 ml-1">vs previous year</span>
              </div>
            </div>

            {/* Industry Premiums for Selected Term */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-900">
                  Industry Premiums
                </p>
                <Globe size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {filteredMarketData.length > 0
                  ? formatCurrency(
                      filteredMarketData.reduce(
                        (sum, item) =>
                          sum + item.industry_gross_premium_current_year,
                        0
                      )
                    )
                  : "N/A"}
              </p>
              <div className="mt-3 flex items-center text-sm">
                {filteredMarketData.length > 0 &&
                filteredMarketData.reduce(
                  (sum, item) => sum + item.percent_change_current_previous,
                  0
                ) /
                  filteredMarketData.length >
                  0 ? (
                  <>
                    <TrendingUp size={16} className="text-green-600 mr-1" />
                    <span className="text-green-700 font-medium">
                      {formatPercentage(
                        filteredMarketData.reduce(
                          (sum, item) =>
                            sum + item.percent_change_current_previous,
                          0
                        ) / filteredMarketData.length
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown size={16} className="text-red-600 mr-1" />
                    <span className="text-red-700 font-medium">
                      {filteredMarketData.length > 0
                        ? formatPercentage(
                            filteredMarketData.reduce(
                              (sum, item) =>
                                sum + item.percent_change_current_previous,
                              0
                            ) / filteredMarketData.length
                          )
                        : "N/A"}
                    </span>
                  </>
                )}
                <span className="text-blue-800 ml-1">industry growth</span>
              </div>
            </div>

            {/* Average Market Share for Selected Term */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-purple-900">
                  Avg. Market Share
                </p>
                <Target size={20} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {filteredMarketData.length > 0
                  ? formatPercentage(
                      filteredMarketData.reduce(
                        (sum, item) =>
                          sum + item.minet_market_share_current_year,
                        0
                      ) / filteredMarketData.length
                    )
                  : "N/A"}
              </p>
              <div className="mt-3 flex items-center text-sm">
                {filteredMarketData.length > 0 &&
                filteredMarketData.reduce(
                  (sum, item) =>
                    sum + item.percent_change_current_previous_market_share,
                  0
                ) /
                  filteredMarketData.length >
                  0 ? (
                  <>
                    <TrendingUp size={16} className="text-green-600 mr-1" />
                    <span className="text-green-700 font-medium">
                      {formatPercentage(
                        filteredMarketData.reduce(
                          (sum, item) =>
                            sum +
                            item.percent_change_current_previous_market_share,
                          0
                        ) / filteredMarketData.length
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown size={16} className="text-red-600 mr-1" />
                    <span className="text-red-700 font-medium">
                      {filteredMarketData.length > 0
                        ? formatPercentage(
                            filteredMarketData.reduce(
                              (sum, item) =>
                                sum +
                                item.percent_change_current_previous_market_share,
                              0
                            ) / filteredMarketData.length
                          )
                        : "N/A"}
                    </span>
                  </>
                )}
                <span className="text-purple-800 ml-1">vs previous year</span>
              </div>
            </div>

            {/* Number of Categories */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-900">
                  Active Categories
                </p>
                <Award size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">
                {filteredMarketData.length}
              </p>
              <div className="mt-3">
                <p className="text-sm text-green-800">
                  Top:{" "}
                  <span className="font-semibold">
                    {chartData?.topCategories[0]?.category || "N/A"}
                  </span>
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {chartData?.topCategories[0]?.share
                    ? `${formatPercentage(
                        chartData.topCategories[0].share
                      )} market share`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Rendering: Table for limited data, Charts for complete data */}
        {filteredMarketData.length <= 2 ? (
          // Data Table View for terms with limited data
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Detailed Data View - {getTermDisplayName()}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredMarketData.length === 0
                      ? "No data available for this term"
                      : `Showing ${filteredMarketData.length} ${
                          filteredMarketData.length === 1
                            ? "category"
                            : "categories"
                        } with available data`}
                  </p>
                </div>
                <div className="px-4 py-2 bg-blue-100 rounded-lg">
                  <p className="text-xs font-medium text-blue-800">
                    Limited Data
                  </p>
                  <p className="text-xs text-blue-600">Table View</p>
                </div>
              </div>
            </div>

            {filteredMarketData.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Award size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Data Available
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  There is no market share data available for{" "}
                  {getTermDisplayName()} in Q2 2025. Please check back later or
                  contact your administrator to upload data.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Market Share
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Market Share Change
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Minet Premiums
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Premium Change
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Industry Premiums
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Industry Growth
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMarketData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-3"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">
                              {item.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-bold text-gray-900">
                            {item.minet_market_share_current_year
                              ? formatPercentage(
                                  item.minet_market_share_current_year * 100
                                )
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {item.percent_change_current_previous_market_share ? (
                            <div className="flex items-center justify-end">
                              {item.percent_change_current_previous_market_share >
                              0 ? (
                                <>
                                  <TrendingUp
                                    size={16}
                                    className="text-green-500 mr-1"
                                  />
                                  <span className="text-sm font-medium text-green-600">
                                    {formatPercentage(
                                      item.percent_change_current_previous_market_share *
                                        100
                                    )}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown
                                    size={16}
                                    className="text-red-500 mr-1"
                                  />
                                  <span className="text-sm font-medium text-red-600">
                                    {formatPercentage(
                                      item.percent_change_current_previous_market_share *
                                        100
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {item.minet_brokered_premiums_current_year
                              ? formatCurrency(
                                  item.minet_brokered_premiums_current_year
                                )
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {item.percent_change_current_previous_premiums ? (
                            <div className="flex items-center justify-end">
                              {item.percent_change_current_previous_premiums >
                              0 ? (
                                <>
                                  <TrendingUp
                                    size={16}
                                    className="text-green-500 mr-1"
                                  />
                                  <span className="text-sm font-medium text-green-600">
                                    {formatPercentage(
                                      item.percent_change_current_previous_premiums *
                                        100
                                    )}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown
                                    size={16}
                                    className="text-red-500 mr-1"
                                  />
                                  <span className="text-sm font-medium text-red-600">
                                    {formatPercentage(
                                      item.percent_change_current_previous_premiums *
                                        100
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {item.industry_gross_premium_current_year
                              ? formatCurrency(
                                  item.industry_gross_premium_current_year
                                )
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {item.percent_change_current_previous ? (
                            <div className="flex items-center justify-end">
                              {item.percent_change_current_previous > 0 ? (
                                <>
                                  <TrendingUp
                                    size={16}
                                    className="text-green-500 mr-1"
                                  />
                                  <span className="text-sm font-medium text-green-600">
                                    {formatPercentage(
                                      item.percent_change_current_previous * 100
                                    )}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown
                                    size={16}
                                    className="text-red-500 mr-1"
                                  />
                                  <span className="text-sm font-medium text-red-600">
                                    {formatPercentage(
                                      item.percent_change_current_previous * 100
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // Chart View for terms with sufficient data (existing charts)
          <>
            {/* Chart Navigation */}
            <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("product")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "product"
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  By Product Line
                </button>
                <button
                  onClick={() => setActiveTab("growth")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "growth"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Growth Trends
                </button>
                <button
                  onClick={() => setActiveTab("premiums")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "premiums"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Premiums Analysis
                </button>
                <button
                  onClick={() => setActiveTab("top")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "top"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Top Categories
                </button>
              </div>
            </div>

            {/* Main Chart Area */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
              {activeTab === "product" && (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Market Share by Product Line - {getTermDisplayName()} (Q2
                    2025)
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData?.marketShareByProductLine}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(1)}%`
                          }
                        >
                          {chartData?.marketShareByProductLine?.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Market Share"]}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Distribution across different insurance product categories
                  </p>
                </>
              )}

              {activeTab === "growth" && (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    YoY Growth by Product Line - {getTermDisplayName()} (Q2
                    2025)
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData?.growthByProductLine}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          type="number"
                          tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis
                          dataKey="category"
                          type="category"
                          width={120}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Growth"]}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="growth"
                          name="YoY Growth"
                          fill="#10b981"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Year-over-year growth rates across product categories
                  </p>
                </>
              )}

              {activeTab === "premiums" && (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Industry vs. Minet Premiums - {getTermDisplayName()} (Q2
                    2025)
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData?.premiumsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="category"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={(value) => formatCurrency(value)}
                          width={100}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            formatCurrency(value),
                            name === "industry" ? "Industry" : "Minet",
                          ]}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="industry"
                          name="Industry Premiums"
                          fill="#6366f1"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="minet"
                          name="Minet Premiums"
                          fill="#06b6d4"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Comparison between total industry premiums and Minet's
                    brokered premiums
                  </p>
                </>
              )}

              {activeTab === "top" && (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Top 5 Categories by Market Share - {getTermDisplayName()}{" "}
                    (Q2 2025)
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData?.topCategories}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="category"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={(value) => `${value}%`}
                          width={40}
                        />
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Market Share"]}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="share"
                          name="Market Share"
                          fill="#a855f7"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Our strongest product categories by market penetration
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketSharePage;
