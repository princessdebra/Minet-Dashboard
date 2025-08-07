import React, { useState, useEffect } from 'react';
// Removed the local import of sampleData as it will now be passed via props
// import sampleData from '../Data/SampleData.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  Area, AreaChart, ScatterChart, Scatter, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, ComposedChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Building,
  Calendar, Target, MapPin, Award, AlertCircle, ChevronRight,
  Activity, Zap, Menu, Home, BarChart2, Mail, Settings, User,
  List, Search, ChevronDown, ArrowUpRight, PieChart as PieChartIcon,
  LineChart as LineChartIcon, BarChart as BarChartIcon,
  Briefcase, Shield, HeartPulse, Globe, HandCoins, Scale,
  Banknote, Wallet, Landmark, ArrowRightCircle, RefreshCw,
  Download, CheckCircle, XCircle
} from 'lucide-react';

// Helper functions (consistent with other pages)
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$N/A';
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${(value * 100).toFixed(1)}%`;
};

const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
};


// Accept sampleData as a prop
const DashboardLanding = ({ onNavigate, sampleData }) => { // Changed dashboardData to sampleData
  const [hoveredCard, setHoveredCard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    wonAccounts: 0,
    wonAccountsRevenue: 0,
    lostAccounts: 0,
    lostAccountsRevenue: 0,
    winRate: 0,
    avgTimeToCloseDays: 0,
    marketShare: 0,
  });
  const [timeRange, setTimeRange] = useState('monthly'); // Default time range

  // Removed the local fetch, now relies on sampleData prop
  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     try {
  //       const response = await fetch('http://localhost:8000/api/dashboard');
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const data = await response.json();
  //       setDashboardData(data);
  //     } catch (e) {
  //       setError(e.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchDashboardData();
  // }, []);


  const monthOrder = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];

  // Prepare data for charts based on fetched data (now sampleData)
  const monthlyPerformanceData = sampleData?.monthlyPerformance || [];
  const revenueByMonthData = sampleData?.revenueByMonth || [];
  const topProductLinesData = sampleData?.topProductLines || []; // Ensure this matches backend key


  // Filter and sort monthly data for consistent display
  const getSortedMonthlyData = (data) => {
  return [...data].sort((a, b) => {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });
};


  const sortedMonthlyPerformanceData = getSortedMonthlyData(monthlyPerformanceData);
  const sortedRevenueByMonthData = getSortedMonthlyData(revenueByMonthData);


  // Animation for KPIs
  useEffect(() => {
    if (sampleData) { // Changed dashboardData to sampleData
      const duration = 1000; // milliseconds
      const start = performance.now();

      const animate = (currentTime) => {
        const progress = Math.min((currentTime - start) / duration, 1);

        setAnimatedValues({
          wonAccounts: Math.floor(progress * (sampleData.wonAccounts || 0)),
          wonAccountsRevenue: Math.floor(progress * (sampleData.wonAccountsRevenue || 0)),
          lostAccounts: Math.floor(progress * (sampleData.totalLostAccounts || 0)), // Ensure this matches backend 'totalLostAccounts'
          lostAccountsRevenue: Math.floor(progress * (sampleData.lostAccountsRevenue || 0)),
          winRate: progress * (sampleData.winRate || 0),
          avgTimeToCloseDays: Math.floor(progress * (sampleData.avgTimeToCloseDays || 0)),
          marketShare: progress * (sampleData.marketShare || 0)
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [sampleData]); // Changed dashboardData to sampleData


  // Removed loading and error state from here as they are handled in App.jsx
  // if (loading) {
  //   return <div className="flex justify-center items-center min-h-screen text-xl text-gray-700">Loading dashboard data...</div>;
  // }

  // if (error) {
  //   return <div className="flex justify-center items-center min-h-screen text-xl text-red-600">Error: {error}</div>;
  // }

  if (!sampleData) { // Changed dashboardData to sampleData
    return <div className="flex justify-center items-center min-h-screen text-xl text-gray-500">No dashboard data available.</div>;
  }


  const KPI_CARDS = [
    {
      title: "Won Accounts",
      value: animatedValues.wonAccounts,
      trend: "+15%", // Example, replace with actual trend calculation if available
      icon: <TrendingUp size={24} className="text-green-500" />,
      color: "bg-green-50",
      description: "Total accounts won this year.",
      suffix: "",
    },
    {
      title: "Won Accounts Revenue",
      value: animatedValues.wonAccountsRevenue,
      trend: "+10%", // Example
      icon: <DollarSign size={24} className="text-blue-500" />,
      color: "bg-blue-50",
      description: "Total revenue from won accounts.",
      formatter: formatCurrency,
    },
    {
      title: "Lost Accounts",
      value: animatedValues.lostAccounts,
      trend: "-5%", // Example
      icon: <TrendingDown size={24} className="text-red-500" />,
      color: "bg-red-50",
      description: "Total accounts lost this year.",
      suffix: "",
    },
    {
      title: "Lost Accounts Revenue",
      value: animatedValues.lostAccountsRevenue,
      trend: "+2%", // Example
      icon: <DollarSign size={24} className="text-orange-500" />,
      color: "bg-orange-50",
      description: "Total revenue lost from accounts.",
      formatter: formatCurrency,
    },
    {
      title: "Win Rate",
      value: animatedValues.winRate,
      trend: "+3%", // Example
      icon: <Target size={24} className="text-purple-500" />,
      color: "bg-purple-50",
      description: "Percentage of won opportunities.",
      formatter: formatPercentage,
    },
    {
      title: "Avg. Time to Close",
      value: animatedValues.avgTimeToCloseDays,
      trend: "-7 Days", // Example
      icon: <Calendar size={24} className="text-indigo-500" />,
      color: "bg-indigo-50",
      description: "Average days to convert leads.",
      suffix: " Days",
    },
    {
      title: "Market Share",
      value: animatedValues.marketShare,
      trend: "+1%", // Example
      icon: <Scale size={24} className="text-yellow-500" />,
      color: "bg-yellow-50",
      description: "Our share of the total market.",
      formatter: formatPercentage,
    },
    {
      title: "Upcoming Renewals",
      value: sampleData.upcomingRenewals?.length || 0, // Changed dashboardData to sampleData
      trend: "+5", // Example
      icon: <RefreshCw size={24} className="text-teal-500" />,
      color: "bg-teal-50",
      description: "Policies due for renewal soon.",
      suffix: "",
    },
  ];


  const getXAxisDataKey = () => {
    switch (timeRange) {
      case 'monthly': return 'month';
      case 'quarterly': return 'quarter'; // Assuming your data has a 'quarter' field for quarterly
      case 'yearly': return 'year';     // Assuming your data has a 'year' field for yearly
      default: return 'month';
    }
  };

  // Note: For 'quarterly' and 'yearly' time ranges, your backend would need to provide aggregated data
  // or you'd need to implement client-side aggregation logic here.
  // For now, the charts will display monthly data regardless of timeRange if no aggregated data is provided.
  const displayedMonthlyPerformanceData = sortedMonthlyPerformanceData; // Or apply aggregation here
  const displayedRevenueByMonthData = sortedRevenueByMonthData; // Or apply aggregation here


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">
              Welcome to the <span className="text-blue-600">Brokerage Dashboard</span>
            </h1>
            <p className="text-lg text-gray-600">
              Overview of key performance indicators and trends.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              <Download size={20} className="mr-2" /> Download Report
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">
              <RefreshCw size={20} className="mr-2" /> Refresh Data
            </button>
          </div>
        </header>

        <main>
          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {KPI_CARDS.map((kpi, index) => (
              <div key={index} className={`${kpi.color} p-6 rounded-2xl shadow-md border border-gray-200 transition-transform transform hover:scale-105`}>
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-full ${kpi.color.replace('50', '100')} mr-3`}>
                    {kpi.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{kpi.title}</h3>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {kpi.formatter ? kpi.formatter(kpi.value) : `${formatNumber(kpi.value)}${kpi.suffix || ''}`}
                </p>
                <div className="flex items-center text-sm font-medium">
                  {kpi.trend && (
                    <span className={`flex items-center ${kpi.trend.includes('+') ? 'text-green-600' : 'text-red-600'} mr-2`}>
                      {kpi.trend.includes('+') ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
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
                <h2 className="text-xl font-bold text-gray-800">Won vs. Lost Accounts</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTimeRange('monthly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${timeRange === 'monthly' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setTimeRange('quarterly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${timeRange === 'quarterly' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Quarterly
                  </button>
                  <button
                    onClick={() => setTimeRange('yearly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${timeRange === 'yearly' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                {displayedMonthlyPerformanceData.length > 0 ? (
                  <ComposedChart data={displayedMonthlyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey={getXAxisDataKey()} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis yAxisId="left" orientation="left" stroke="#10b981" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ color: '#4a5568' }}
                      itemStyle={{ color: '#4a5568' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                    <Bar yAxisId="left" dataKey="won" name="Won Accounts" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                    <Bar yAxisId="right" dataKey="lost" name="Lost Accounts" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20} />
                  </ComposedChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No won vs. lost accounts data available.</div>
                )}
              </ResponsiveContainer>
              <div className="mt-6 text-base text-gray-600 text-center">
                Visualizes the number of won and lost accounts over time.
              </div>
            </div>

            {/* Chart 2: Revenue Trend (Line Chart) */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Revenue Trend</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTimeRange('monthly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${timeRange === 'monthly' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setTimeRange('quarterly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${timeRange === 'quarterly' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Quarterly
                  </button>
                  <button
                    onClick={() => setTimeRange('yearly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${timeRange === 'yearly' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                {displayedRevenueByMonthData.length > 0 ? (
                  <LineChart data={displayedRevenueByMonthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey={getXAxisDataKey()} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ color: '#4a5568' }}
                      itemStyle={{ color: '#4a5568' }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No revenue trend data available.</div>
                )}
              </ResponsiveContainer>
              <div className="mt-6 text-base text-gray-600 text-center">
                Shows the overall trend of revenue generated over time.
              </div>
            </div>
          </section>

          {/* Other Sections */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Pipeline (Table) */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Pipeline Overview</h2>
              <div className="overflow-x-auto">
                {sampleData.salesPipeline && sampleData.salesPipeline.length > 0 ? ( // Changed dashboardData to sampleData
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Next Step
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Potential Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sampleData.salesPipeline.map((deal, index) => ( // Changed dashboardData to sampleData
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {deal.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              deal.status === 'Negotiation' ? 'bg-yellow-100 text-yellow-800' :
                              deal.status === 'Contact Made' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {deal.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {deal.nextStep}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatCurrency(deal.potentialRevenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No sales pipeline data available.</p>
                )}
              </div>
            </div>

            {/* Top Product Lines by Revenue (Bar Chart) */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Top Product Lines by Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                {topProductLinesData.length > 0 ? (
                  <BarChart
                    data={topProductLinesData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
                    <XAxis type="number" tickFormatter={formatCurrency} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280', fontSize: 12 }} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ color: '#4a5568' }}
                      itemStyle={{ color: '#4a5568' }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No top product lines data available.</div>
                )}
              </ResponsiveContainer>
              <div className="mt-6 text-base text-gray-600 text-center">
                Displays product lines ranked by total revenue generated.
              </div>
            </div>
          </section>

          {/* Quick Links / Navigation */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">Explore Other Insights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Won Accounts",
                  description: "Deep dive into successful acquisitions",
                  icon: <CheckCircle size={20} className="text-green-600" />,
                  color: "bg-green-50",
                  action: () => onNavigate('won-accounts')
                },
                {
                  title: "Lost Accounts",
                  description: "Analyze reasons for client churn",
                  icon: <XCircle size={20} className="text-red-600" />,
                  color: "bg-red-50",
                  action: () => onNavigate('lost-accounts')
                },
                {
                  title: "Market Share",
                  description: "Understand our position in the market",
                  icon: <PieChartIcon size={20} className="text-purple-600" />,
                  color: "bg-purple-50",
                  action: () => onNavigate('market-share')
                },
                {
                  title: "Revenue Walk",
                  description: "Track revenue and financial metrics",
                  icon: <Banknote size={20} className="text-blue-600" />,
                  color: "bg-blue-50",
                  action: () => onNavigate('revenue-walk')
                }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className={`${item.color} p-4 rounded-xl text-left hover:shadow-sm transition-all`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${item.color.replace('50', '100')} mr-3`}>
                      {item.icon}
                    </div>
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
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
