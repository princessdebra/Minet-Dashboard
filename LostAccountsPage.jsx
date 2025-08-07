import React, { useState, useEffect } from 'react';
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
    Area,
} from 'recharts';
import {
    ArrowLeft, AlertTriangle, DollarSign, TrendingDown, Clock, BarChart2,
    Calendar, Users, MapPin, Target, RefreshCw, Download, MinusCircle, Award
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

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#6b7280']; // More vibrant colors


const LostAccountsPage = ({ onBack }) => {
    const [lostAccountsData, setLostAccountsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLostAccountsData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/lost-accounts'); // Match new backend endpoint
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLostAccountsData(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLostAccountsData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-gray-700">Loading lost accounts data...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-red-600">Error: {error}</div>;
    }

    if (!lostAccountsData) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-gray-500">No lost accounts data available.</div>;
    }

    const {
        totalLostAccounts,
        totalLostRevenue,
        lostByReason,
        lostByCompetitor,
        projectedLosses, // Assuming this is now fetched or passed
        winBackCampaigns // Assuming this is now fetched or passed
    } = lostAccountsData;

    const monthOrder = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    const sortedProjectedLosses = projectedLosses ? [...projectedLosses].sort((a, b) => {
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
                        Lost Accounts Insights <TrendingDown size={32} className="inline text-red-500 ml-2" />
                    </h1>
                    <p className="text-lg text-gray-600">
                        Analyzing churn to identify root causes and improve retention strategies.
                    </p>
                </header>

                <main>
                    {/* Key Metrics */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Total Lost Accounts</h3>
                                <p className="text-4xl font-bold text-red-600">{totalLostAccounts}</p>
                            </div>
                            <Users size={48} className="text-red-300" />
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Total Lost Revenue</h3>
                                <p className="text-4xl font-bold text-red-600">{formatCurrency(totalLostRevenue)}</p>
                            </div>
                            <DollarSign size={48} className="text-red-300" />
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Average Retention Rate</h3>
                                {/* This would be calculated, using a dummy for now if not in backend */}
                                <p className="text-4xl font-bold text-green-600">85%</p>
                            </div>
                            <Clock size={48} className="text-green-300" />
                        </div>
                    </section>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Chart 1: Lost Accounts by Reason */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Lost Accounts by Reason</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                {lostByReason && lostByReason.length > 0 ? (
                                    <PieChart>
                                        <Pie
                                            data={lostByReason}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {lostByReason.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                                        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                    </PieChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">No data for lost accounts by reason.</div>
                                )}
                            </ResponsiveContainer>
                            <div className="mt-6 text-base text-gray-600 text-center">
                                Identifies the primary reasons for client loss.
                            </div>
                        </div>

                        {/* Chart 2: Lost Accounts by Competitor */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Lost Accounts by Competitor</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                {lostByCompetitor && lostByCompetitor.length > 0 ? (
                                    <BarChart data={lostByCompetitor} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                                        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                        <Bar dataKey="value" name="Accounts Lost" fill="#f87171" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">No data for lost accounts by competitor.</div>
                                )}
                            </ResponsiveContainer>
                            <div className="mt-6 text-base text-gray-600 text-center">
                                Shows which competitors are winning accounts from us.
                            </div>
                        </div>
                    </div>

                    {/* Projected Losses vs Actual */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Projected Losses vs. Actual</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            {sortedProjectedLosses && sortedProjectedLosses.length > 0 ? (
                                <ComposedChart data={sortedProjectedLosses} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                    <Area type="monotone" dataKey="projected" name="Projected Losses" fill="#fcd34d" stroke="#f59e0b" fillOpacity={0.6} />
                                    <Line type="monotone" dataKey="actual" name="Actual Losses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </ComposedChart>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">No projected vs. actual losses data available.</div>
                            )}
                        </ResponsiveContainer>
                        <div className="mt-6 text-base text-gray-600 text-center">
                            Compares forecasted client losses against actual results.
                        </div>
                    </div>

                    {/* Win-Back Campaign Performance */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Win-Back Campaign Performance</h2>
                        <div className="space-y-4">
                            {winBackCampaigns && winBackCampaigns.length > 0 ? (
                                winBackCampaigns.map((campaign, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="text-gray-900 font-bold">{campaign.name}</div>
                                            <div className="text-gray-600 text-sm">Targeted: {campaign.targetedAccounts} | Recovered: {campaign.recoveredAccounts}</div>
                                        </div>
                                        <div className={`font-bold ${campaign.recoveredAccounts > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                            {formatPercentage(campaign.recoveryRate)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No win-back campaign data available.</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LostAccountsPage;