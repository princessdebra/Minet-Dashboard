// RevenueWalkPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell,
} from "recharts";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Building,
  Target,
  Shield,
  PieChart,
  Users,
  Calendar,
} from "lucide-react";
import { API_URL } from "../constants";

// Minet brand colors with creative extensions
const COLORS = {
  primary: "#C41230", // Minet Red
  primaryDark: "#A00E28",
  secondary: "#1E40AF", // Blue
  success: "#059669", // Green
  warning: "#D97706", // Amber
  error: "#DC2626", // Red
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#1E293B",
  textLight: "#64748B",
};

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

// Month names for the filter
const MONTH_NAMES = [
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

const RevenueWalkPage = ({ onBack }) => {
  // Helper function to get default month (current month - 1, since updates happen at month end)
  const getDefaultMonth = () => {
    const currentMonth = new Date().getMonth(); // 0-11 (0=January, 11=December)
    // If current month is January, default to December of previous year
    // Otherwise, default to previous month
    return currentMonth === 0 ? 11 : currentMonth - 1;
  };

  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("2025");
  const [summaryView, setSummaryView] = useState("grand-total");
  const [activeTab, setActiveTab] = useState("current-analysis");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonth());

  // Get short month name (e.g., "Sept" for September)
  const getShortMonthName = (monthIndex) => {
    return MONTH_NAMES[monthIndex].substring(0, 4);
  };

  useEffect(() => {
    fetchRevenueData();
  }, [selectedMonth]); // Re-fetch data when selected month changes

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      // Pass month parameter to API (selectedMonth is 0-11, API expects 1-12)
      const monthParam = selectedMonth + 1;
      const response = await fetch(
        API_URL + `/api/revenue-walk/new-structure?month=${monthParam}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Also fetch summary data with month parameter
      const summaryResponse = await fetch(
        API_URL + "/api/revenue-walk/summary"
      );
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        data.summaryData = summaryData;
      }

      setRevenueData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(
        API_URL + `/api/download-revenue-walk-template?year=${selectedYear}`
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
        `revenue_walk_${selectedYear}_template.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Error downloading template: ${err.message}`);
    }
  };

  const handleUploadCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("csv_file", file);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL + "/api/upload-revenue-walk", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server error");
      }

      const result = await response.json();

      if (result.success) {
        alert("Revenue walk data updated successfully!");
        fetchRevenueData();
      } else {
        throw new Error(result.message || "Failed to upload file.");
      }
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  // Headline numbers calculation (MKIB, MKFS, MKIC)
  const headlineNumbers = useMemo(() => {
    if (!revenueData) return null;

    const { newBusiness, lostBusiness } = revenueData;

    // Calculate MKIB, MKFS, MKIC for new business
    const newMKIB =
      (newBusiness?.accountsDetailsTotal || 0) +
      (newBusiness?.retailSME || 0) +
      (newBusiness?.reinsurance || 0) +
      (newBusiness?.coast || 0) +
      (newBusiness?.western || 0);
    const newMKFS = newBusiness?.pensions || 0;
    const newMKIC = newBusiness?.corporate || 0;
    const totalNew = newMKIB + newMKFS + newMKIC;

    // Calculate MKIB, MKFS, MKIC for lost business
    const lostMKIB =
      (lostBusiness?.accountsDetailsTotal || 0) +
      (lostBusiness?.retailSME || 0) +
      (lostBusiness?.reinsurance || 0) +
      (lostBusiness?.coast || 0) +
      (lostBusiness?.western || 0);
    const lostMKFS = lostBusiness?.pensions || 0;
    const lostMKIC = lostBusiness?.corporate || 0;
    const totalLost = lostMKIB + lostMKFS + lostMKIC;

    return {
      newBusiness: {
        mkib: newMKIB,
        mkfs: newMKFS,
        mkic: newMKIC,
        total: totalNew,
      },
      lostBusiness: {
        mkib: lostMKIB,
        mkfs: lostMKFS,
        mkic: lostMKIC,
        total: totalLost,
      },
    };
  }, [revenueData]);

  // Net result calculation
  const netResult = useMemo(() => {
    if (!revenueData?.summaryData) return 0;
    const totalInflows =
      revenueData.summaryData.inflowsGrandTotal?.total_inflows || 0;
    const totalOutflows =
      revenueData.summaryData.outflowsGrandTotal?.total_outflows || 0;
    return totalInflows + totalOutflows;
  }, [revenueData]);

  // Prepare division data for charts
  const divisionChartData = useMemo(() => {
    if (!revenueData?.divisions) return [];

    return revenueData.divisions.map((division) => ({
      name: division.name,
      newBusiness2025: division.newBusiness2025,
      newBusiness2024: division.newBusiness2024,
      lostBusiness2025: division.lostBusiness2025,
      lostBusiness2024: division.lostBusiness2024,
      newBusinessGrowth: division.newBusinessYoy,
      lostBusinessGrowth: division.lostBusinessYoy,
    }));
  }, [revenueData]);

  if (loading) {
    return (
      <div
        className="flex flex-col justify-center items-center min-h-screen"
        style={{ backgroundColor: COLORS.background }}
      >
        <RefreshCw
          className="animate-spin h-12 w-12"
          style={{ color: COLORS.primary }}
        />
        <p className="text-xl mt-4" style={{ color: COLORS.text }}>
          Loading revenue data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col justify-center items-center min-h-screen"
        style={{ backgroundColor: COLORS.background }}
      >
        <div
          className="p-6 rounded-2xl max-w-md text-center"
          style={{
            backgroundColor: "#FEF2F2",
            border: `1px solid ${COLORS.error}`,
          }}
        >
          <div
            className="font-bold text-lg mb-2"
            style={{ color: COLORS.error }}
          >
            Error Loading Data
          </div>
          <p className="mb-4" style={{ color: COLORS.text }}>
            {error}
          </p>
          <button
            onClick={fetchRevenueData}
            className="px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: COLORS.primary }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ backgroundColor: COLORS.background }}
      >
        <div className="text-center">
          <p className="text-xl mb-4" style={{ color: COLORS.text }}>
            No revenue data available.
          </p>
          <button
            onClick={fetchRevenueData}
            className="px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: COLORS.primary }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <button
              onClick={onBack}
              className="flex items-center transition-colors font-medium"
              style={{ color: COLORS.primary }}
            >
              <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
            </button>
            <div className="flex flex-col md:flex-row md:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <div
                  className="text-sm flex items-center px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "#E2E8F0",
                    color: COLORS.textLight,
                  }}
                >
                  <Calendar size={16} className="mr-1" />
                  Jan-{MONTH_NAMES[selectedMonth].substring(0, 4)} {timeframe}
                </div>
                <button
                  onClick={fetchRevenueData}
                  className="p-2 rounded-full border transition-colors"
                  style={{
                    backgroundColor: COLORS.card,
                    borderColor: "#E2E8F0",
                  }}
                  title="Refresh data"
                >
                  <RefreshCw size={18} style={{ color: COLORS.primary }} />
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <Download size={18} /> Export Report
                </button>
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl shadow-sm border"
            style={{ backgroundColor: COLORS.card, borderColor: "#E2E8F0" }}
          >
            <h1
              className="text-3xl md:text-4xl font-bold mb-2 flex items-center"
              style={{ color: COLORS.text }}
            >
              Revenue Walk Analysis{" "}
              <DollarSign
                size={32}
                className="ml-2"
                style={{ color: COLORS.success }}
              />
            </h1>
            <p style={{ color: COLORS.textLight }}>
              Comprehensive view of new and lost business performance across
              divisions
            </p>
          </div>
        </header>

        {/* Removed navigation tabs - single view only */}

        {/* Main Content */}
        <div>
          {/* Section 1: Headline Numbers */}
          <section className="mb-8">
            <h2
              className="text-2xl font-bold mb-6 flex items-center"
              style={{ color: COLORS.text }}
            >
              <Target className="mr-2" style={{ color: COLORS.primary }} />{" "}
              Headline Numbers
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* New Business Card */}
              <div
                className="rounded-2xl shadow-sm border p-6"
                style={{
                  backgroundColor: COLORS.card,
                  borderColor: "#E2E8F0",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="text-xl font-bold flex items-center"
                    style={{ color: COLORS.success }}
                  >
                    <TrendingUp className="mr-2" /> New Business
                  </h3>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
                  >
                    Jan-Sept Cumulative
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    className="text-center p-4 rounded-lg"
                    style={{ backgroundColor: "#F0F9FF" }}
                  >
                    <div
                      className="text-sm font-medium mb-1"
                      style={{ color: COLORS.textLight }}
                    >
                      MKIB
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: COLORS.secondary }}
                    >
                      {formatCurrency(headlineNumbers?.newBusiness.mkib)}
                    </div>
                  </div>
                  <div
                    className="text-center p-4 rounded-lg"
                    style={{ backgroundColor: "#F0FDF4" }}
                  >
                    <div
                      className="text-sm font-medium mb-1"
                      style={{ color: COLORS.textLight }}
                    >
                      MKFS
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: COLORS.success }}
                    >
                      {formatCurrency(headlineNumbers?.newBusiness.mkfs)}
                    </div>
                  </div>
                  <div
                    className="text-center p-4 rounded-lg"
                    style={{ backgroundColor: "#FEF7CD" }}
                  >
                    <div
                      className="text-sm font-medium mb-1"
                      style={{ color: COLORS.textLight }}
                    >
                      MKC
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: COLORS.warning }}
                    >
                      {formatCurrency(headlineNumbers?.newBusiness.mkic)}
                    </div>
                  </div>
                  <div
                    className="text-center p-4 rounded-lg"
                    style={{ backgroundColor: "#EFF6FF" }}
                  >
                    <div
                      className="text-sm font-medium mb-1"
                      style={{ color: COLORS.textLight }}
                    >
                      Total
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: COLORS.primary }}
                    >
                      {formatCurrency(headlineNumbers?.newBusiness.total)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lost Business Card */}
              <div
                className="rounded-2xl shadow-sm border p-6"
                style={{
                  backgroundColor: COLORS.card,
                  borderColor: "#E2E8F0",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="text-xl font-bold flex items-center"
                    style={{ color: COLORS.error }}
                  >
                    <TrendingDown className="mr-2" /> Lost Business
                  </h3>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                  >
                    Jan-Sept Cumulative
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    className="text-center p-4 rounded-lg"
                    style={{ backgroundColor: "#FEF2F2" }}
                  >
                    <div
                      className="text-sm font-medium mb-1"
                      style={{ color: COLORS.textLight }}
                    >
                      MKIB
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: COLORS.error }}
                    >
                      {formatCurrency(headlineNumbers?.lostBusiness.mkib)}
                    </div>
                  </div>
                  <div
                    className="text-center p-4 rounded-lg"
                    style={{ backgroundColor: "#FEF2F2" }}
                  >
                    <div
                      className="text-sm font-medium mb-1"
                      style={{ color: COLORS.textLight }}
                    >
                      MKFS
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: COLORS.error }}
                    >
                      {formatCurrency(headlineNumbers?.lostBusiness.mkfs)}
                    </div>
                  </div>
                  <div
                    className="text-center p-4 rounded-lg"
                    style={{ backgroundColor: "#FEF2F2" }}
                  >
                    <div
                      className="text-sm font-medium mb-1"
                      style={{ color: COLORS.textLight }}
                    >
                      MKC
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: COLORS.error }}
                    >
                      {formatCurrency(headlineNumbers?.lostBusiness.mkic)}
                    </div>
                  </div>
                  <div
                    className="text-center p-4 rounded-lg"
                    style={{ backgroundColor: "#FEF2F2" }}
                  >
                    <div
                      className="text-sm font-medium mb-1"
                      style={{ color: COLORS.textLight }}
                    >
                      Total
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: COLORS.error }}
                    >
                      {formatCurrency(headlineNumbers?.lostBusiness.total)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Walk Overview Section */}
          <section className="space-y-6">
            {/* View Toggle */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <h3
                  className="text-lg font-bold"
                  style={{ color: COLORS.text }}
                >
                  Revenue Walk Overview
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSummaryView("grand-total")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      summaryView === "grand-total"
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                    style={{
                      backgroundColor:
                        summaryView === "grand-total"
                          ? COLORS.primary
                          : "#F1F5F9",
                    }}
                  >
                    Grand Total
                  </button>
                  <button
                    onClick={() => setSummaryView("division")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      summaryView === "division"
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                    style={{
                      backgroundColor:
                        summaryView === "division" ? COLORS.primary : "#F1F5F9",
                    }}
                  >
                    By Division
                  </button>
                </div>
              </div>
            </div>

            {/* Grand Total View */}
            {summaryView === "grand-total" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Inflows Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                    <h3
                      className="text-xl font-bold mb-6 flex items-center"
                      style={{ color: COLORS.success }}
                    >
                      <TrendingUp className="mr-2" /> Total Inflows
                    </h3>

                    <div className="space-y-4">
                      <div
                        className="flex justify-between items-center p-3 rounded-lg"
                        style={{ backgroundColor: "#F0F9FF" }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: COLORS.text }}
                        >
                          Total New
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: COLORS.secondary }}
                        >
                          {formatCurrency(
                            revenueData?.summaryData?.inflowsGrandTotal
                              ?.total_2025_new_new_business || 0
                          )}
                        </span>
                      </div>

                      <div
                        className="flex justify-between items-center p-3 rounded-lg"
                        style={{ backgroundColor: "#F0FDF4" }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: COLORS.text }}
                        >
                          2025 MCS/MFS
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: COLORS.success }}
                        >
                          {formatCurrency(
                            revenueData?.summaryData?.inflowsGrandTotal
                              ?.mcs_mfs_2025 || 0
                          )}
                        </span>
                      </div>

                      <div
                        className="flex justify-between items-center p-3 rounded-lg"
                        style={{ backgroundColor: "#FEF7CD" }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: COLORS.text }}
                        >
                          Organic Growth
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: COLORS.warning }}
                        >
                          {formatCurrency(
                            revenueData?.summaryData?.inflowsGrandTotal
                              ?.organic_growth_2025 || 0
                          )}
                        </span>
                      </div>

                      <div
                        className="flex justify-between items-center p-3 rounded-lg"
                        style={{ backgroundColor: "#EFF6FF" }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: COLORS.text }}
                        >
                          Sundry Revenue
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: COLORS.primary }}
                        >
                          {formatCurrency(
                            revenueData?.summaryData?.inflowsGrandTotal
                              ?.sundry_revenue_growth || 0
                          )}
                        </span>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                          <span
                            className="font-bold text-lg"
                            style={{ color: COLORS.success }}
                          >
                            Total Inflows
                          </span>
                          <span
                            className="font-bold text-lg"
                            style={{ color: COLORS.success }}
                          >
                            {formatCurrency(
                              revenueData?.summaryData?.inflowsGrandTotal
                                ?.total_inflows || 0
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Outflows Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                    <h3
                      className="text-xl font-bold mb-6 flex items-center"
                      style={{ color: COLORS.error }}
                    >
                      <TrendingDown className="mr-2" /> Total Outflows
                    </h3>

                    <div className="space-y-4">
                      <div
                        className="flex justify-between items-center p-3 rounded-lg"
                        style={{ backgroundColor: "#FEF2F2" }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: COLORS.text }}
                        >
                          Total Lost
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: COLORS.error }}
                        >
                          {formatCurrency(
                            revenueData?.summaryData?.outflowsGrandTotal
                              ?.total_2025_lost_lost_business || 0
                          )}
                        </span>
                      </div>

                      <div
                        className="flex justify-between items-center p-3 rounded-lg"
                        style={{ backgroundColor: "#FEF2F2" }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: COLORS.text }}
                        >
                          One Off Accounts
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: COLORS.error }}
                        >
                          {formatCurrency(
                            revenueData?.summaryData?.outflowsGrandTotal
                              ?.add_one_off_accounts || 0
                          )}
                        </span>
                      </div>

                      <div
                        className="flex justify-between items-center p-3 rounded-lg"
                        style={{ backgroundColor: "#FEF2F2" }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: COLORS.text }}
                        >
                          MCS/MFS Income
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: COLORS.error }}
                        >
                          {formatCurrency(
                            revenueData?.summaryData?.outflowsGrandTotal
                              ?.add_mcs_mfs_income_2024 || 0
                          )}
                        </span>
                      </div>

                      <div
                        className="flex justify-between items-center p-3 rounded-lg"
                        style={{ backgroundColor: "#FEF2F2" }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: COLORS.text }}
                        >
                          2025 Revenue Shrinkages
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: COLORS.error }}
                        >
                          {formatCurrency(
                            revenueData?.summaryData?.outflowsGrandTotal
                              ?.add_2025_revenue_shrinkages || 0
                          )}
                        </span>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-red-50">
                          <span
                            className="font-bold text-lg"
                            style={{ color: COLORS.error }}
                          >
                            Total Outflows
                          </span>
                          <span
                            className="font-bold text-lg"
                            style={{ color: COLORS.error }}
                          >
                            {formatCurrency(
                              revenueData?.summaryData?.outflowsGrandTotal
                                ?.total_outflows || 0
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Result Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                    <h3
                      className="text-xl font-bold mb-6 flex items-center"
                      style={{ color: COLORS.primary }}
                    >
                      <DollarSign className="mr-2" /> Net Result
                    </h3>

                    <div className="text-center py-8">
                      <div
                        className="text-sm font-medium mb-2"
                        style={{ color: COLORS.textLight }}
                      >
                        Net Growth / Shrinkage
                      </div>
                      <div
                        className={`text-4xl font-bold mb-4 ${
                          netResult >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(netResult)}
                      </div>
                      <div
                        className={`text-lg font-medium ${
                          netResult >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {netResult >= 0 ? "Growth" : "Shrinkage"}
                      </div>
                    </div>

                    <div
                      className="mt-6 p-4 rounded-lg"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <div
                        className="text-sm font-medium mb-2"
                        style={{ color: COLORS.text }}
                      >
                        Calculation
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: COLORS.textLight }}
                      >
                        Total Inflows - Total Outflows = Net Result
                      </div>
                      <div
                        className="text-sm mt-1"
                        style={{ color: COLORS.textLight }}
                      >
                        {formatCurrency(
                          revenueData?.summaryData?.inflowsGrandTotal
                            ?.total_inflows || 0
                        )}{" "}
                        -{" "}
                        {formatCurrency(
                          revenueData?.summaryData?.outflowsGrandTotal
                            ?.total_outflows || 0
                        )}{" "}
                        = {formatCurrency(netResult)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Division View */}
            {summaryView === "division" && revenueData?.summaryData && (
              <div className="space-y-6">
                {/* Inflows by Division */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3
                    className="text-xl font-bold mb-6 flex items-center"
                    style={{ color: COLORS.success }}
                  >
                    <TrendingUp className="mr-2" /> Inflows by Division
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: "#F8FAFC" }}>
                          <th
                            className="text-left p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            Division
                          </th>
                          <th
                            className="text-right p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            Total New
                          </th>
                          <th
                            className="text-right p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            2025 MCS/MFS
                          </th>
                          <th
                            className="text-right p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            Organic Growth
                          </th>
                          <th
                            className="text-right p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            Sundry Revenue
                          </th>
                          <th
                            className="text-right p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            Total Inflows
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueData.summaryData.inflowsByDivision?.map(
                          (division, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100"
                            >
                              <td
                                className="p-4 font-medium"
                                style={{ color: COLORS.text }}
                              >
                                {division.division}
                              </td>
                              <td
                                className="p-4 text-right"
                                style={{ color: COLORS.text }}
                              >
                                {formatCurrency(
                                  division.total_2025_new_new_business
                                )}
                              </td>
                              <td
                                className="p-4 text-right"
                                style={{ color: COLORS.text }}
                              >
                                {formatCurrency(division.mcs_mfs_2025)}
                              </td>
                              <td
                                className="p-4 text-right"
                                style={{ color: COLORS.text }}
                              >
                                {formatCurrency(division.organic_growth_2025)}
                              </td>
                              <td
                                className="p-4 text-right"
                                style={{ color: COLORS.text }}
                              >
                                {formatCurrency(division.sundry_revenue_growth)}
                              </td>
                              <td
                                className="p-4 text-right font-bold"
                                style={{ color: COLORS.success }}
                              >
                                {formatCurrency(division.total_inflows)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Outflows by Division */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3
                    className="text-xl font-bold mb-6 flex items-center"
                    style={{ color: COLORS.error }}
                  >
                    <TrendingDown className="mr-2" /> Outflows by Division
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: "#F8FAFC" }}>
                          <th
                            className="text-left p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            Division
                          </th>
                          <th
                            className="text-right p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            Total Lost
                          </th>
                          <th
                            className="text-right p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            One Off Accounts
                          </th>
                          <th
                            className="text-right p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            MCS/MFS Income
                          </th>
                          <th
                            className="text-right p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            2025 Revenue Shrinkages
                          </th>
                          <th
                            className="text-right p-4 font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            Total Outflows
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueData.summaryData.outflowsByDivision?.map(
                          (division, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100"
                            >
                              <td
                                className="p-4 font-medium"
                                style={{ color: COLORS.text }}
                              >
                                {division.division}
                              </td>
                              <td
                                className="p-4 text-right"
                                style={{ color: COLORS.text }}
                              >
                                {formatCurrency(
                                  division.total_2025_lost_lost_business
                                )}
                              </td>
                              <td
                                className="p-4 text-right"
                                style={{ color: COLORS.text }}
                              >
                                {formatCurrency(division.add_one_off_accounts)}
                              </td>
                              <td
                                className="p-4 text-right"
                                style={{ color: COLORS.text }}
                              >
                                {formatCurrency(
                                  division.add_mcs_mfs_income_2024
                                )}
                              </td>
                              <td
                                className="p-4 text-right"
                                style={{ color: COLORS.text }}
                              >
                                {formatCurrency(
                                  division.add_2025_revenue_shrinkages
                                )}
                              </td>
                              <td
                                className="p-4 text-right font-bold"
                                style={{ color: COLORS.error }}
                              >
                                {formatCurrency(division.total_outflows)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* CSV Upload Section */}
        <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Admin Tools
          </h3>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 max-w-2xl">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              Revenue Walk Data
            </h4>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Year for Template
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
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
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-red-600 border border-red-600 rounded-md shadow-sm hover:bg-red-50 transition text-xs font-medium"
              >
                <Download size={14} /> Download {selectedYear} Template
              </button>
              <label
                htmlFor="revenue-walk-upload"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 transition cursor-pointer text-xs font-medium"
              >
                <Shield size={14} /> Upload CSV
              </label>
              <input
                id="revenue-walk-upload"
                type="file"
                accept=".csv"
                onChange={handleUploadCSV}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueWalkPage;
