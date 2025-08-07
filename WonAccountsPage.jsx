import React, { useState, useEffect } from 'react';
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
    ComposedChart,
    Line // Added Line for composed chart
} from 'recharts';
import { MapPin, ArrowLeft, DollarSign, Users, TrendingUp, Award, CalendarDays, BarChart3, Briefcase, CheckCircle, XCircle } from 'lucide-react'; // Added new icons

// Helper functions for formatting (consistent with Revenue Walk Page)
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

const COLORS_PIE = ['#22c55e', '#3b82f6', '#8b5cf6', '#a855f7', '#d946on', '#06b6d4', '#fcd34d', '#f97316', '#ef4444', '#ec4899'];


const WonAccountsPage = ({ onBack }) => {
    const [wonAccountsData, setWonAccountsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWonAccountsData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/won-accounts'); // Match new backend endpoint
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setWonAccountsData(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWonAccountsData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-gray-700">Loading won accounts data...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-red-600">Error: {error}</div>;
    }

    if (!wonAccountsData) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-gray-500">No won accounts data available.</div>;
    }

    const {
        totalWonAccounts,
        totalWonRevenue,
        wonAccountsByMonth,
        underwriterPerformance,
        wonByPremiumBand,
        topClientSegments,
        marketSegmentAnalysis
    } = wonAccountsData;

    const monthOrder = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    const sortedWonAccountsByMonth = wonAccountsByMonth ? [...wonAccountsByMonth].sort((a, b) => {
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    }) : [];

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4">
                        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">
                        Won Accounts Insights <CheckCircle size={32} className="inline text-green-500 ml-2" />
                    </h1>
                    <p className="text-lg text-gray-600">
                        Analyzing successful acquisitions to identify winning strategies and key drivers.
                    </p>
                </header>

                <main>
                    {/* Key Metrics */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Total Won Accounts</h3>
                                <p className="text-4xl font-bold text-green-600">{totalWonAccounts}</p>
                            </div>
                            <Users size={48} className="text-green-300" />
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Total Won Revenue</h3>
                                <p className="text-4xl font-bold text-green-600">{formatCurrency(totalWonRevenue)}</p>
                            </div>
                            <DollarSign size={48} className="text-green-300" />
                        </div>
                    </section>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Chart 1: Won Accounts by Month */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Won Accounts by Month</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                {sortedWonAccountsByMonth && sortedWonAccountsByMonth.length > 0 ? (
                                    <AreaChart data={sortedWonAccountsByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                                        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                        <Area type="monotone" dataKey="accountsWon" name="Accounts Won" stroke="#22c55e" fill="#86efac" fillOpacity={0.6} />
                                    </AreaChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">No won accounts by month data.</div>
                                )}
                            </ResponsiveContainer>
                            <div className="mt-6 text-base text-gray-600 text-center">
                                Tracks the number of accounts successfully acquired each month.
                            </div>
                        </div>

                        {/* Chart 2: Won Accounts by Premium Band */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Won Accounts by Premium Band</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                {wonByPremiumBand && wonByPremiumBand.length > 0 ? (
                                    <PieChart>
                                        <Pie
                                            data={wonByPremiumBand}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name} (${formatPercentage(percent)})`}
                                        >
                                            {wonByPremiumBand.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} formatter={(value) => `${value} accounts`} />
                                        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                    </PieChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">No won accounts by premium band data.</div>
                                )}
                            </ResponsiveContainer>
                            <div className="mt-6 text-base text-gray-600 text-center">
                                Shows the distribution of won accounts across different premium value ranges.
                            </div>
                        </div>
                    </div>

                    {/* Other Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Underwriter Performance */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Underwriter Performance</h2>
                            <div className="space-y-4">
                                {underwriterPerformance && underwriterPerformance.length > 0 ? (
                                    underwriterPerformance
                                        .sort((a, b) => b.accountsWon - a.accountsWon) // Sort by accounts won
                                        .map((underwriter, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Users className="text-blue-500" size={20} />
                                                    <span className="text-gray-800 font-medium">{underwriter.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-gray-900 font-bold">{underwriter.accountsWon} accounts</div>
                                                    <div className="text-green-600 text-sm">{formatCurrency(underwriter.revenueGenerated)} revenue</div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-gray-500">No underwriter data available.</p>
                                )}
                            </div>
                        </div>

                        {/* Top Client Segments */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Client Segments</h2>
                            <div className="space-y-4">
                                {topClientSegments && topClientSegments.length > 0 ? (
                                    topClientSegments
                                        .sort((a, b) => b.wonAccounts - a.wonAccounts) // Sort by accounts won
                                        .map((segment, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Briefcase className="text-purple-500" size={20} />
                                                    <span className="text-gray-800 font-medium">{segment.segment}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-gray-900 font-bold">{segment.wonAccounts} accounts</div>
                                                    <div className="text-blue-600 text-sm">{formatCurrency(segment.revenueGenerated)} revenue</div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-gray-500">No top client segment data available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Market Segment Analysis */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Market Segment Analysis</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            {marketSegmentAnalysis && marketSegmentAnalysis.length > 0 ? (
                                <BarChart data={marketSegmentAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="segment" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                    <Bar dataKey="accountsWon" name="Accounts Won" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">No market segment analysis data.</div>
                            )}
                        </ResponsiveContainer>
                        <div className="mt-6 text-base text-gray-600 text-center">
                            Shows accounts won by different market segments.
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WonAccountsPage;