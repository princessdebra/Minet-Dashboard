// RevenueWalkPage.jsx (Updated)
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, LineChart, ComposedChart } from 'recharts';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Download, RefreshCw, BarChart2, Calendar, Award, Star, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from 'lucide-react'; // Renamed to avoid conflict

const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '$N/A';
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
};

const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `${value.toFixed(1)}%`; // Assuming backend sends as 0-100 for percentage, if 0-1, multiply by 100
};

const RevenueWalkPage = ({ onBack }) => {
    const [revenueWalkData, setRevenueWalkData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRevenueWalkData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/revenue-walk'); // Match new backend endpoint
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setRevenueWalkData(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueWalkData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-gray-700">Loading revenue walk data...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-red-600">Error: {error}</div>;
    }

    if (!revenueWalkData) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-gray-500">No revenue walk data available.</div>;
    }

    const {
        totalMinetBrokeredPremiums,
        revenueTrend,
        quarterlyRevenueBreakdown,
        keyRevenueDrivers,
        growthOpportunities
    } = revenueWalkData;

    const monthOrder = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    const sortedRevenueTrend = revenueTrend ? [...revenueTrend].sort((a, b) => {
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    }) : [];

    const quarterOrder = ["Q1", "Q2", "Q3", "Q4"]; // Assuming quarters are Q1, Q2, Q3, Q4
    const sortedQuarterlyRevenueBreakdown = quarterlyRevenueBreakdown ? [...quarterlyRevenueBreakdown].sort((a, b) => {
        return quarterOrder.indexOf(a.quarter) - quarterOrder.indexOf(b.quarter);
    }) : [];


    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4">
                        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">
                        Revenue Walk Analysis <DollarSign size={32} className="inline text-green-500 ml-2" />
                    </h1>
                    <p className="text-lg text-gray-600">
                        Understanding the drivers and detractors of our revenue performance.
                    </p>
                </header>

                <main>
                    {/* Key Revenue Metrics */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Total Minet Brokered Premiums (Q4 2024)</h3>
                                <p className="text-4xl font-bold text-green-600">{formatCurrency(totalMinetBrokeredPremiums)}</p>
                            </div>
                            <TrendingUp size={48} className="text-green-300" />
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Revenue Growth Rate (YoY)</h3>
                                {/* Dummy value, replace with actual calculation if available */}
                                <p className="text-4xl font-bold text-purple-600">{formatPercentage(0.08)}</p>
                            </div>
                            <Award size={48} className="text-purple-300" />
                        </div>
                    </section>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Chart 1: Revenue Trend */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Trend (Monthly)</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                {sortedRevenueTrend && sortedRevenueTrend.length > 0 ? (
                                    <LineChart data={sortedRevenueTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <YAxis tickFormatter={formatCurrency} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                                            labelStyle={{ color: '#4a5568' }}
                                            itemStyle={{ color: '#4a5568' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                        <Line type="monotone" dataKey="revenue" name="Total Revenue" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">No revenue trend data available.</div>
                                )}
                            </ResponsiveContainer>
                            <div className="mt-6 text-base text-gray-600 text-center">
                                Tracks the total revenue generated each month.
                            </div>
                        </div>

                        {/* Chart 2: Quarterly Revenue Breakdown */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Quarterly Revenue Breakdown</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                {sortedQuarterlyRevenueBreakdown && sortedQuarterlyRevenueBreakdown.length > 0 ? (
                                    <ComposedChart data={sortedQuarterlyRevenueBreakdown} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="quarter" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <YAxis tickFormatter={formatCurrency} tick={{ fill: '#6b7280', fontSize: '#4a5568' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                                            labelStyle={{ color: '#4a5568' }}
                                            itemStyle={{ color: '#4a5568' }}
                                            formatter={(value, name) => [formatCurrency(value), name]}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                        <Bar dataKey="moneyIn" name="Money In" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
                                        <Bar dataKey="moneyOut" name="Money Out" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={28} />
                                        <Line type="monotone" dataKey="ending" name="Ending Balance" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }} activeDot={{ r: 7 }} />
                                    </ComposedChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">No quarterly revenue breakdown data available.</div>
                                )}
                            </ResponsiveContainer>
                            <div className="mt-6 text-base text-gray-600 text-center">
                                Visualizes how money in and out influences the ending balance per quarter.
                            </div>
                        </div>
                    </div>

                    {/* Key Revenue Drivers and Growth Opportunities */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Revenue Drivers & Growth Opportunities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><TrendingUpIcon size={20} className="mr-2 text-green-500" /> Key Drivers:</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-2">
                                    {keyRevenueDrivers && keyRevenueDrivers.length > 0 ? (
                                        keyRevenueDrivers.map((driver, index) => (
                                            <li key={index}>
                                                <span className="font-medium">{driver.name}:</span> {driver.impact} impact
                                            </li>
                                        ))
                                    ) : (
                                        <li>No key revenue drivers identified.</li>
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><Star size={20} className="mr-2 text-yellow-500" /> Growth Opportunities:</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-2">
                                    {growthOpportunities && growthOpportunities.length > 0 ? (
                                        growthOpportunities.map((opportunity, index) => (
                                            <li key={index}>
                                                <span className="font-medium">{opportunity.name}:</span> {opportunity.potential} potential
                                            </li>
                                        ))
                                    ) : (
                                        <li>No growth opportunities identified.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RevenueWalkPage;