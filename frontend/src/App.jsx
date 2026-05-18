import { useCallback, useEffect, useState } from "react";
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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const SERIF = "Georgia, 'Times New Roman', serif";
const AMBER = "#d97706";
const AMBER_DIM = "#92400e";
const CARD_BG = "#1c1917";
const PAGE_BG = "#0c0a09";
const BORDER = "#292524";
const MUTED = "#78716c";
const FAINT = "#44403c";

function formatMastDate(date) {
  return date
    .toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    .toUpperCase();
}

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedDays, setSelectedDays] = useState(90);

  const fetchMetrics = useCallback(async (days) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/metrics?days=${days}`);
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const data = await response.json();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics(selectedDays);
  }, [selectedDays, fetchMetrics]);

  if (loading && !dashboardData) {
    return (
      <div style={{ backgroundColor: PAGE_BG }} className="min-h-screen flex items-center justify-center">
        <p style={{ color: MUTED, letterSpacing: "0.2em", fontSize: "11px" }} className="uppercase">
          Loading
        </p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div style={{ backgroundColor: PAGE_BG }} className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: MUTED, letterSpacing: "0.2em", fontSize: "11px" }} className="uppercase">
          Failed to load dashboard
        </p>
        <p style={{ color: FAINT, fontSize: "12px" }}>{error}</p>
        <button
          onClick={() => fetchMetrics(selectedDays)}
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            border: `1px solid ${FAINT}`,
            color: MUTED,
            backgroundColor: "transparent",
            padding: "6px 16px",
            cursor: "pointer",
            marginTop: "8px",
          }}
          className="uppercase"
        >
          ↺ Retry
        </button>
      </div>
    );
  }

  const metrics = dashboardData?.metrics;
  const insights = dashboardData?.insights || [];
  const now = new Date();

  return (
    <div style={{ backgroundColor: PAGE_BG }} className="min-h-screen text-stone-100 px-6 py-5">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Masthead */}
        <header>
          <div
            style={{ borderBottom: `1px solid ${BORDER}`, color: MUTED, fontSize: "11px", letterSpacing: "0.15em" }}
            className="flex items-center justify-between uppercase pb-3"
          >
            <span>E-Commerce KPI Dashboard · {formatMastDate(now)}</span>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2">
                <span style={{ backgroundColor: AMBER }} className="w-1.5 h-1.5 rounded-full inline-block" />
                Live
              </span>
              {lastUpdated && (
                <span>Synced {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pt-6">
            <div>
              <p style={{ color: MUTED, fontSize: "11px", letterSpacing: "0.18em" }} className="uppercase mb-4">
                The Quarterly · E-Commerce Bulletin
              </p>
              <h1
                style={{ fontFamily: SERIF, lineHeight: 1.08, fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
                className="font-bold text-stone-100"
              >
                Business{" "}
                <em style={{ color: AMBER, fontStyle: "italic" }}>performance</em>
                <br />
                at a glance.
              </h1>
              <p style={{ color: MUTED, fontSize: "13px" }} className="mt-3 max-w-md">
                A composed view of revenue, retention, and product mix for the simulated online store.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
              <div className="flex gap-1">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDays(d)}
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.12em",
                      border: `1px solid ${selectedDays === d ? AMBER : FAINT}`,
                      color: selectedDays === d ? AMBER : MUTED,
                      backgroundColor: selectedDays === d ? "rgba(217,119,6,0.08)" : "transparent",
                      padding: "4px 12px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    className="uppercase"
                  >
                    {d}d
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchMetrics(selectedDays)}
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  border: `1px solid ${FAINT}`,
                  color: MUTED,
                  backgroundColor: "transparent",
                  padding: "4px 12px",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
                className="uppercase hover:border-stone-500"
              >
                ↺ Refresh data
              </button>
            </div>
          </div>
        </header>

        {/* Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: BORDER }}>
          <MetricCard label="Total Revenue"     value={`$${metrics?.total_revenue?.toLocaleString()}`}                         context="gross sales" />
          <MetricCard label="Average Order"     value={`$${metrics?.average_order_value?.toLocaleString()}`}                   context="per order" />
          <MetricCard label="Repeat Rate"       value={`${metrics?.repeat_purchase_rate}%`}                                   context="of customers" />
          <MetricCard label="Acquisition Cost"  value={`$${metrics?.cac_estimate?.assumed_cost_per_customer}`}                context="blended CAC" />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ backgroundColor: BORDER }}>
          <RevenueTrendChart data={metrics?.revenue_trend || []} days={selectedDays} />
          <CategoryPerformanceChart data={metrics?.category_performance || []} />
        </section>

        {/* Bottom */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ backgroundColor: BORDER }}>
          <InsightsCard insights={insights} />
          <TopProductsTable products={metrics?.top_products || []} />
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, context }) {
  return (
    <div style={{ backgroundColor: CARD_BG, padding: "24px" }}>
      <p style={{ color: MUTED, fontSize: "10px", letterSpacing: "0.18em" }} className="uppercase mb-4">
        {label}
      </p>
      <p style={{ fontFamily: SERIF, fontSize: "2rem", lineHeight: 1 }} className="font-bold text-stone-100">
        {value}
      </p>
      <p style={{ color: FAINT, fontSize: "11px", fontStyle: "italic" }} className="mt-3">
        {context}
      </p>
    </div>
  );
}

function RevenueTrendChart({ data, days }) {
  return (
    <div style={{ backgroundColor: CARD_BG, padding: "24px" }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p style={{ color: AMBER_DIM, fontSize: "10px", letterSpacing: "0.18em" }} className="uppercase mb-1">
            Fig. 01
          </p>
          <h2 style={{ fontFamily: SERIF }} className="text-lg font-bold text-stone-100">
            Revenue trend
          </h2>
        </div>
        <p style={{ color: MUTED, fontSize: "11px", fontStyle: "italic" }}>
          Daily · last {days} days · USD
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: MUTED }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: MUTED }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={44}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#111110", border: `1px solid ${BORDER}`, borderRadius: 0, fontSize: 12 }}
              labelStyle={{ color: "#a8a29e", marginBottom: 4 }}
              itemStyle={{ color: AMBER }}
              formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={AMBER}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: AMBER, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CategoryPerformanceChart({ data }) {
  return (
    <div style={{ backgroundColor: CARD_BG, padding: "24px" }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p style={{ color: AMBER_DIM, fontSize: "10px", letterSpacing: "0.18em" }} className="uppercase mb-1">
            Fig. 02
          </p>
          <h2 style={{ fontFamily: SERIF }} className="text-lg font-bold text-stone-100">
            Category performance
          </h2>
        </div>
        <p style={{ color: MUTED, fontSize: "11px", fontStyle: "italic" }}>Revenue by segment</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: MUTED }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 11, fill: "#a8a29e" }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#111110", border: `1px solid ${BORDER}`, borderRadius: 0, fontSize: 12 }}
              labelStyle={{ color: "#a8a29e", marginBottom: 4 }}
              itemStyle={{ color: AMBER }}
              formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="revenue" fill={AMBER} radius={0} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InsightsCard({ insights }) {
  return (
    <div style={{ backgroundColor: CARD_BG, padding: "24px" }}>
      <p style={{ color: AMBER_DIM, fontSize: "10px", letterSpacing: "0.18em" }} className="uppercase mb-1">
        Analysis
      </p>
      <h2 style={{ fontFamily: SERIF }} className="text-lg font-bold text-stone-100 mb-5">
        Business insights
      </h2>

      <div className="space-y-4">
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <div
              key={index}
              style={{ borderLeft: `2px solid ${AMBER_DIM}`, paddingLeft: "14px" }}
            >
              <p style={{ color: "#a8a29e", fontSize: "13px", lineHeight: 1.6 }}>{insight}</p>
            </div>
          ))
        ) : (
          <p style={{ color: MUTED, fontSize: "13px" }}>No insights available.</p>
        )}
      </div>
    </div>
  );
}

function TopProductsTable({ products }) {
  return (
    <div style={{ backgroundColor: CARD_BG, padding: "24px" }}>
      <p style={{ color: AMBER_DIM, fontSize: "10px", letterSpacing: "0.18em" }} className="uppercase mb-1">
        Rankings
      </p>
      <h2 style={{ fontFamily: SERIF }} className="text-lg font-bold text-stone-100 mb-5">
        Top products
      </h2>

      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            {["Product", "Category", "Revenue"].map((h, i) => (
              <th
                key={h}
                style={{ color: MUTED, fontSize: "10px", letterSpacing: "0.15em", fontWeight: 400, paddingBottom: "10px" }}
                className={`uppercase ${i === 2 ? "text-right" : "text-left"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index} style={{ borderBottom: `1px solid ${BORDER}` }}>
              <td style={{ padding: "12px 0", fontSize: "13px" }} className="text-stone-200 pr-4">
                {product.name}
              </td>
              <td style={{ padding: "12px 0", fontSize: "13px", color: MUTED }}>
                {product.category}
              </td>
              <td style={{ padding: "12px 0", fontSize: "13px" }} className="text-right text-stone-200 font-medium">
                ${product.revenue?.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && (
        <p style={{ color: MUTED, fontSize: "13px", marginTop: "16px" }}>No product data found.</p>
      )}
    </div>
  );
}

export default App;
