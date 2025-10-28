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
  Percent,
  Globe,
  Leaf,
  Briefcase,
  ChevronDown,
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
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // Check if user is admin
  const isAdmin = userRole === "admin";

  const fetchMarketData = async () => {
    try {
      const response = await fetch(API_URL + "/api/market-share");
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

    // Market share by product line (using category)
    const marketShareByProductLine = marketData.map((item) => ({
      name: item.category.trim(),
      value: item.minet_market_share_q4_2023 * 100, // Convert to percentage
    }));

    // Growth/Decline by product line
    const growthByProductLine = marketData
      .map((item) => ({
        category: item.category.trim(),
        growth: item.percent_change_2024_2023 * 100,
        marketShare: item.minet_market_share_q4_2023 * 100,
      }))
      .sort((a, b) => b.growth - a.growth);

    // Top performing categories by market share
    const topCategories = [...marketData]
      .sort(
        (a, b) => b.minet_market_share_q4_2023 - a.minet_market_share_q4_2023
      )
      .slice(0, 5)
      .map((item) => ({
        category: item.category.trim(),
        share: item.minet_market_share_q4_2023 * 100,
      }));

    // Premiums data
    const premiumsData = marketData.map((item) => ({
      category: item.category.trim(),
      industry: item.industry_gross_premium_q4_2024,
      minet: item.minet_brokered_premiums_q4_2024,
    }));

    // Insights
    const insights = {
      overallMarketTrends:
        "Market is growing at 7.3% YoY with strongest growth in Medical (15.1%)",
      topPerforming: marketShareByProductLine.reduce(
        (max, item) => (item.value > max.value ? item : max),
        marketShareByProductLine[0]
      ).name,
      fastestGrowing: growthByProductLine[0].category,
      clientConcentration: 0.32, // Example value
      claimsRatioImpact:
        "Positive claims experience in Liability and Medical sectors",
    };

    return {
      marketShareByProductLine,
      growthByProductLine,
      topCategories,
      premiumsData,
      insights,
    };
  };

  const chartData = processData();

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
                Last updated: Q4 2024
              </span>
              <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50">
                <RefreshCw size={16} />
              </button>
            </div>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Avg. Market Share
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatPercentage(
                    marketData.reduce(
                      (sum, item) => sum + item.minet_market_share_q4_2023,
                      0
                    ) / marketData.length
                  )}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Globe size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+2.4%</span>
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
                  {formatCurrency(
                    marketData.reduce(
                      (sum, item) => sum + item.minet_brokered_premiums_q4_2024,
                      0
                    )
                  )}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Briefcase size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12.7%</span>
              <span className="text-gray-500 ml-1">vs Q4 2023</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Top Performing Category
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {chartData?.topCategories[0]?.category || "N/A"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <Award size={24} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-900">
                {formatPercentage(chartData?.topCategories[0]?.share || 0)}
              </span>
              <span className="text-sm text-gray-500 ml-1">market share</span>
            </div>
          </div>
        </div>

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
                Market Share by Product Line
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
                YoY Growth by Product Line
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
                Industry vs. Minet Premiums
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
                Comparison between total industry premiums and Minet's brokered
                premiums
              </p>
            </>
          )}

          {activeTab === "top" && (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Top 5 Categories by Market Share
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
                    <YAxis tickFormatter={(value) => `${value}%`} width={40} />
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

        {/* Insights Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">
              Strategic Insights
            </h2>
            <p className="text-gray-600 mt-1">
              Key findings and recommendations based on market data
            </p>
          </div>

          {chartData?.insights && (
            <div className="divide-y divide-gray-100">
              <div
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() =>
                  setExpandedInsight(
                    expandedInsight === "trends" ? null : "trends"
                  )
                }
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <TrendingUp className="text-green-500 mr-3" size={20} />
                    <h3 className="font-medium text-gray-900">Market Trends</h3>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${
                      expandedInsight === "trends" ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {expandedInsight === "trends" && (
                  <div className="mt-4 pl-9 text-gray-700">
                    <p>{chartData.insights?.overallMarketTrends}</p>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">
                          Fastest Growing
                        </p>
                        <p className="font-bold text-blue-900">
                          {chartData.insights.fastestGrowing}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-purple-800">
                          Top Performing
                        </p>
                        <p className="font-bold text-purple-900">
                          {chartData.insights.topPerforming}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() =>
                  setExpandedInsight(
                    expandedInsight === "opportunities" ? null : "opportunities"
                  )
                }
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Target className="text-red-500 mr-3" size={20} />
                    <h3 className="font-medium text-gray-900">
                      Growth Opportunities
                    </h3>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${
                      expandedInsight === "opportunities" ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {expandedInsight === "opportunities" && (
                  <div className="mt-4 pl-9 text-gray-700">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-medium">
                          High-growth categories:
                        </span>{" "}
                        Medical insurance shows the strongest industry growth at
                        15.1% YoY
                      </li>
                      <li>
                        <span className="font-medium">
                          Underpenetrated segments:
                        </span>{" "}
                        Aviation has low market penetration (1.8%) but growing
                        Minet premiums (+28%)
                      </li>
                      <li>
                        <span className="font-medium">Declining segments:</span>{" "}
                        Engineering shows declining premiums (-11.7%) despite
                        overall industry growth
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() =>
                  setExpandedInsight(
                    expandedInsight === "risks" ? null : "risks"
                  )
                }
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Percent className="text-yellow-500 mr-3" size={20} />
                    <h3 className="font-medium text-gray-900">Risk Factors</h3>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${
                      expandedInsight === "risks" ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {expandedInsight === "risks" && (
                  <div className="mt-4 pl-9 text-gray-700">
                    <div className="mb-4">
                      <p className="font-medium">Client Concentration:</p>
                      <p>
                        {formatPercentage(
                          chartData.insights.clientConcentration
                        )}{" "}
                        of premiums come from just 3 product categories,
                        creating potential vulnerability
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Claims Impact:</p>
                      <p>{chartData.insights.claimsRatioImpact}</p>
                    </div>
                  </div>
                )}
              </div>

              <div
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() =>
                  setExpandedInsight(
                    expandedInsight === "recommendations"
                      ? null
                      : "recommendations"
                  )
                }
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Leaf className="text-green-600 mr-3" size={20} />
                    <h3 className="font-medium text-gray-900">
                      Recommendations
                    </h3>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${
                      expandedInsight === "recommendations" ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {expandedInsight === "recommendations" && (
                  <div className="mt-4 pl-9 text-gray-700">
                    <ol className="list-decimal pl-5 space-y-3">
                      <li>
                        <span className="font-medium">
                          Focus on high-growth areas:
                        </span>{" "}
                        Allocate more resources to Medical and Aviation sectors
                        where industry growth is strongest
                      </li>
                      <li>
                        <span className="font-medium">
                          Stabilize declining segments:
                        </span>{" "}
                        Investigate reasons for Engineering premium decline and
                        develop recovery strategy
                      </li>
                      <li>
                        <span className="font-medium">
                          Diversify portfolio:
                        </span>{" "}
                        Reduce concentration risk by expanding in
                        underpenetrated categories like Fire Domestic
                      </li>
                      <li>
                        <span className="font-medium">Leverage strengths:</span>{" "}
                        Capitalize on our strong position in Liability (15.8%
                        share) through targeted marketing
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketSharePage;
