import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function fetchMetrics() {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:8000/metrics");
      const data = await response.json();

      console.log("Fetched dashboard data:", data);

      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-300">Loading dashboard...</p>
      </div>
    );
  }

  const metrics = dashboardData?.metrics;
  const insights = dashboardData?.insights || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">E-Commerce KPI Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Business performance overview for a simulated online store
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <p className="text-sm text-slate-400">
              Last updated:{" "}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "Not loaded"}
            </p>

            <button
              onClick={fetchMetrics}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Refresh Data
            </button>
          </div>
        </header>

        {/* Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Revenue"
            value={`$${metrics?.total_revenue?.toLocaleString()}`}
            status="good"
          />
          <MetricCard
            label="Average Order Value"
            value={`$${metrics?.average_order_value?.toLocaleString()}`}
            status="neutral"
          />
          <MetricCard
            label="Repeat Purchase Rate"
            value={`${metrics?.repeat_purchase_rate}%`}
            status="good"
          />
          <MetricCard
            label="CAC Estimate"
            value={`$${metrics?.cac_estimate?.assumed_cost_per_customer}`}
            status="neutral"
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueTrendChart data={metrics?.revenue_trend || []} />
          <CategoryPerformanceChart data={metrics?.category_performance || []} />
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InsightsCard insights={insights} />
          <TopProductsTable products={metrics?.top_products || []} />
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, status }) {
  const statusStyles = {
    good: "border-green-500/40 bg-green-500/10",
    neutral: "border-yellow-500/40 bg-yellow-500/10",
    concern: "border-red-500/40 bg-red-500/10",
  };

  return (
    <div className={`border rounded-2xl p-5 ${statusStyles[status]}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}

function RevenueTrendChart({ data }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="text-xl font-semibold mb-1">Revenue Trend</h2>
      <p className="text-sm text-slate-400 mb-4">
        Daily revenue performance over the last 90 days
      </p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CategoryPerformanceChart({ data }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="text-xl font-semibold mb-1">Category Performance</h2>
      <p className="text-sm text-slate-400 mb-4">
        Revenue breakdown by product category
      </p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InsightsCard({ insights }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="text-xl font-semibold mb-1">AI Business Insights</h2>
      <p className="text-sm text-slate-400 mb-4">
        Plain-English recommendations based on the KPI data
      </p>

      <div className="space-y-3">
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <div
              key={index}
              className="bg-slate-800/70 border border-slate-700 rounded-xl p-4"
            >
              <p className="text-sm leading-relaxed">💡 {insight}</p>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-sm">No insights available.</p>
        )}
      </div>
    </div>
  );
}

function TopProductsTable({ products }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="text-xl font-semibold mb-1">Top 5 Products</h2>
      <p className="text-sm text-slate-400 mb-4">
        Highest revenue-generating products
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="text-left py-3">Product</th>
              <th className="text-left py-3">Category</th>
              <th className="text-right py-3">Revenue</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b border-slate-800">
                <td className="py-3">{product.name}</td>
                <td className="py-3 text-slate-400">{product.category}</td>
                <td className="py-3 text-right font-medium">
                  ${product.revenue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="text-slate-400 text-sm mt-4">No product data found.</p>
        )}
      </div>
    </div>
  );
}

export default App;