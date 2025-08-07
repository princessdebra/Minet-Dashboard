import React, { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Tooltip,
    Cell,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    AreaChart,
    Area,
} from 'recharts';
import {
    ArrowLeft, TrendingUp, TrendingDown, LayoutDashboard, Target, Users, MapPin,
    DollarSign, Filter, Download, RefreshCw, Award, Percent, Globe, Leaf, Briefcase, PlusCircle
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

const COLORS = ['#6366f1', '#a855f7', '#d946on', '#06b6d4', '#10b981', '#fcd34d', '#f97316', '#ef4444', '#ec4899', '#be185d'];


const MarketSharePage = ({ onBack }) => {
    const [marketShareData, setMarketShareData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMarketShareData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/market-share'); // Match new backend endpoint
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setMarketShareData(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketShareData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-gray-700">Loading market share data...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-red-600">Error: {error}</div>;
    }

    if (!marketShareData) {
        return <div className="flex justify-center items-center min-h-screen text-xl text-gray-500">No market share data available.</div>;
    }

    const {
        marketShareByProductLine,
        marketShareByClientSegment,
        marketShareByGeographical,
        marketShareByIndustryVerticals,
        insights
    } = marketShareData;


    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4">
                        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">
                        Market Share Analysis <Globe size={32} className="inline text-blue-500 ml-2" />
                    </h1>
                    <p className="text-lg text-gray-600">
                        Deep dive into our competitive position across various segments.
                    </p>
                </header>

                <main>
                    {/* Key Market Share Insights */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Placeholder for overall market share if you have a single number */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Overall Market Share (Est.)</h3>
                                <p className="text-4xl font-bold text-blue-600">{formatPercentage(0.12)}</p> {/* Example Value */}
                            </div>
                            <Award size={48} className="text-blue-300" />
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Growth vs. Competitors</h3>
                                <p className="text-4xl font-bold text-green-600">Strong</p>
                            </div>
                            <TrendingUp size={48} className="text-green-300" />
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Top Performing Region</h3>
                                <p className="text-4xl font-bold text-purple-600">Nairobi</p> {/* Example Value */}
                            </div>
                            <MapPin size={48} className="text-purple-300" />
                        </div>
                    </section>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Chart 1: Market Share by Product Line */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Market Share by Product Line</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                {marketShareByProductLine && marketShareByProductLine.length > 0 ? (
                                    <PieChart>
                                        <Pie
                                            data={marketShareByProductLine}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {marketShareByProductLine.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} formatter={(value) => formatPercentage(value / 100)} /> {/* Assuming value is already percentage */}
                                        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                    </PieChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">No market share by product line data.</div>
                                )}
                            </ResponsiveContainer>
                            <div className="mt-6 text-base text-gray-600 text-center">
                                Distribution of our market share across different product categories.
                            </div>
                        </div>

                        {/* Chart 2: Market Share by Client Segment */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Market Share by Client Segment</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                {marketShareByClientSegment && marketShareByClientSegment.length > 0 ? (
                                    <BarChart data={marketShareByClientSegment} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="segment" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <YAxis tickFormatter={(value) => formatPercentage(value / 100)} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} formatter={(value) => formatPercentage(value / 100)} />
                                        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                        <Bar dataKey="share" name="Market Share" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">No market share by client segment data.</div>
                                )}
                            </ResponsiveContainer>
                            <div className="mt-6 text-base text-gray-600 text-center">
                                Our market penetration across different client demographics.
                            </div>
                        </div>
                    </div>

                    {/* Chart 3: Market Share by Geographical Location */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Market Share by Geographical Location</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            {marketShareByGeographical && marketShareByGeographical.length > 0 ? (
                                <BarChart data={marketShareByGeographical} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <YAxis tickFormatter={(value) => formatPercentage(value / 100)} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} formatter={(value) => formatPercentage(value / 100)} />
                                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                    <Bar dataKey="share" name="Market Share" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">No market share by geographical location data.</div>
                            )}
                        </ResponsiveContainer>
                        <div className="mt-6 text-base text-gray-600 text-center">
                            Our market strength across various regions.
                        </div>
                    </div>

                    {/* Chart 4: Market Share by Industry Verticals */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Market Share by Industry Verticals</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            {marketShareByIndustryVerticals && marketShareByIndustryVerticals.length > 0 ? (
                                <BarChart data={marketShareByIndustryVerticals} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="industry" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <YAxis tickFormatter={(value) => formatPercentage(value / 100)} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} formatter={(value) => formatPercentage(value / 100)} />
                                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '0.9rem' }} />
                                    <Bar dataKey="share" name="Market Share" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">No market share by industry verticals data.</div>
                            )}
                        </ResponsiveContainer>
                        <div className="mt-6 text-base text-gray-600 text-center">
                            Our market presence in different industry sectors.
                        </div>
                    </div>

                    {/* Key Insights and Recommendations */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Market Insights</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-gray-700">
                                <span className="font-medium flex items-center"><TrendingUp className="mr-2 text-green-500" size={20} /> Overall Market Trends:</span>
                                <span className="font-bold text-gray-900">{insights.overallMarketTrends}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-700">
                                <span className="font-medium flex items-center"><Target className="mr-2 text-red-500" size={20} /> Top Underpenetrated Segments:</span>
                                <span className="font-bold text-gray-900">{insights.topUnderpenetrated}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-700">
                                <span className="font-medium flex items-center"><Percent className="mr-2 text-yellow-500" size={20} /> Client Concentration Risk:</span>
                                <span className="font-bold text-gray-900">{formatPercentage(insights.clientConcentration)}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-700">
                                <span className="font-medium flex items-center"><Leaf className="mr-2 text-green-500" size={20} /> Claims Ratio Impact on Perception:</span>
                                <span className="font-bold text-gray-900">{insights.claimsRatioImpact}</span>
                            </div>
                        </div>
                        <h4 className="text-xl font-bold text-gray-800 mt-6 mb-3">Recommendations:</h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-2">
                            <li>Target {insights.topUnderpenetrated} with tailored campaigns.</li>
                            <li>Develop loyalty programs for top clients to reduce concentration risk.</li>
                            <li>Leverage positive claims ratio for marketing and sales.</li>
                        </ul>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MarketSharePage;