import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3ea6ff", "#8ab4f8", "#555", "#ff7a7a", "#7cffc4"];

/* ---------------- UTILS ---------------- */

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDaysBetween(start: Date, end: Date) {
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

function generateViews(days: number, startLabel: string) {
  return Array.from({ length: days }).map((_, i) => ({
    day: `${startLabel} + ${i + 1}`,
    views: Math.floor(Math.random() * 800) + 200,
  }));
}

function generateVideoData(days: number) {
  const videos = [
    "Song of Songs | The Holy Fire",
    "Song of Songs | Arise and Dance",
    "Song of Songs | You Are Truly Royalty",
    "Song of Songs | The Beloved Found Me",
    "Song of Songs | Love That Seals",
  ];

  return videos.map((title, idx) => ({
    id: idx + 1,
    title,
    views: Math.floor((Math.random() * 4000 + 1000) * (days / 28)),
    watchTime: Math.floor((Math.random() * 300 + 50) * (days / 28)),
    subscribers: Math.floor((Math.random() * 140 - 20) * (days / 28)),
    published: `2026-01-${10 + idx}`,
  }));
}

/* ---------------- MAIN ---------------- */

export default function Sanalytics() {
  const [tab, setTab] = useState<
    "Overview" | "Content" | "Audience" | "Trends"
  >("Overview");

  const today = new Date();
  const defaultStart = new Date(today.getTime() - 27 * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState(formatDate(defaultStart));
  const [endDate, setEndDate] = useState(formatDate(today));

  const start = new Date(startDate);
  const end = new Date(endDate);

  const days = getDaysBetween(start, end);

  const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
  const prevStart = new Date(
    prevEnd.getTime() - (days - 1) * 24 * 60 * 60 * 1000
  );
  const prevDays = days;

  const viewsData = useMemo(() => generateViews(days, "Day"), [days]);
  const prevViewsData = useMemo(
    () => generateViews(prevDays, "Prev"),
    [prevDays]
  );
  const videos = useMemo(() => generateVideoData(days), [days]);

  return (
    <div className=" text-slate-400 p-4 sm:p-6 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-medium">Channel analytics</h1>

        <div className="flex flex-wrap gap-2 items-center bg- border border-[#2a2a2a] rounded p-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-black text-slate-400 px-3 py-2 text-sm rounded border border-[#2a2a2a]"
          />
          <span className="text-[#aaaaaa]">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-black text-slate-400 px-3 py-2 text-sm rounded border border-[#2a2a2a]"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-8 overflow-x-auto whitespace-nowrap border-b border-[#2a2a2a] mb-6">
        {["Overview", "Content", "Audience", "Trends"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`pb-3 ${
              tab === t
                ? "border-b-2 border-white text-slate-400 font-medium"
                : "text-[#aaaaaa]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <Overview
          viewsData={viewsData}
          prevViewsData={prevViewsData}
          days={days}
          prevDays={prevDays}
          videos={videos}
        />
      )}
      {tab === "Content" && <ContentTab days={days} />}
      {tab === "Audience" && <AudienceTab />}
      {tab === "Trends" && <TrendsTab />}
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */

function Overview({
  viewsData,
  prevViewsData,
  days,
  prevDays,
  videos,
}: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <MetricGrid days={days} />

        <Card>
          <h3 className="font-medium mb-4">Views over time</h3>
          <ChartCompare current={viewsData} prev={prevViewsData} />
        </Card>

        <Card>
          <h3 className="font-medium mb-4">Per-video analytics</h3>
          <VideoTable videos={videos} />
        </Card>
      </div>

      <Card>
        <h3 className="font-medium mb-2">Realtime</h3>
        <p className="text-xs text-[#aaaaaa] mb-3">Last 48 hours</p>

        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={viewsData.slice(0, 24)}>
            <Bar dataKey="views" fill="#3ea6ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/* ---------------- CONTENT TAB ---------------- */

function ContentTab({ days }: { days: number }) {
  const [type, setType] = useState("Shorts");
  const scale = days / 28;

  const types = [
    "All",
    "Videos",
    "Shorts",
    "Posts",
    "Playlists",
    "Podcasts",
  ];

  return (
    <div className="space-y-6">
      {/* TYPE SELECTOR */}
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-1.5 rounded-full text-sm border ${
              type === t
                ? "bg-white text-black border-white"
                : "bg-black text-slate-400 border-[#2a2a2a]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 bg-black border border-[#2a2a2a] rounded">
        <ContentMetric
          label="Views"
          value={`${Math.round(8500 * scale).toLocaleString()}`}
          sub="476 less than usual"
        />
        <ContentMetric
          label="Engaged views"
          value={`${Math.round(3900 * scale).toLocaleString()}`}
          sub="26% less than previous 28 days"
        />
        <ContentMetric
          label="Likes"
          value="386"
          sub="About the same as previous 28 days"
          positive
        />
        <ContentMetric
          label="Subscribers"
          value="+16"
          sub="14 less than usual"
        />
      </div>

      {/* EXISTING CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-medium mb-4">Views by content type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { name: "Videos", views: 6200 * scale },
                { name: "Shorts", views: 2800 * scale },
                { name: "Live", views: 1030 * scale },
              ]}
            >
              <XAxis dataKey="name" stroke="#717171" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#3ea6ff" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-medium mb-4">Top performing format</h3>
          {["Videos", "Shorts", "Live"].map((n) => (
            <div key={n} className="flex justify-between mb-3 text-sm">
              <span>{n}</span>
              <span className="text-[#aaaaaa]">
                {Math.round(Math.random() * 6000).toLocaleString()} views
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function ContentMetric({ label, value, sub, positive }: any) {
  return (
    <div className="p-4 border-b md:border-b-0 md:border-r last:border-r-0 border-[#2a2a2a]">
      <div className="text-xs text-[#aaaaaa] mb-1">{label}</div>
      <div className="text-2xl font-medium mb-1">{value}</div>
      <div
        className={`text-xs ${
          positive ? "text-green-500" : "text-[#aaaaaa]"
        }`}
      >
        {sub}
      </div>
    </div>
  );
}

/* ---------------- AUDIENCE ---------------- */

function AudienceTab() {
  const AUDIENCE_GENDER = [
    { name: "Male", value: 68 },
    { name: "Female", value: 30 },
    { name: "Other", value: 2 },
  ];

  const AUDIENCE_AGE = [
    { age: "18–24", value: 22 },
    { age: "25–34", value: 38 },
    { age: "35–44", value: 24 },
    { age: "45+", value: 16 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="font-medium mb-4">Gender</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={AUDIENCE_GENDER} dataKey="value" outerRadius={90}>
              {AUDIENCE_GENDER.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="font-medium mb-4">Age range</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={AUDIENCE_AGE}>
            <XAxis dataKey="age" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3ea6ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/* ---------------- TRENDS ---------------- */

function TrendsTab() {
  const TRENDS_SEARCH = [
    { keyword: "Song of Songs", views: 3400 },
    { keyword: "Bible study", views: 2700 },
    { keyword: "Christian teaching", views: 1900 },
  ];

  return (
    <Card>
      <h3 className="font-medium mb-4">Top search terms</h3>
      {TRENDS_SEARCH.map((t) => (
        <div key={t.keyword} className="flex justify-between mb-3 text-sm">
          <span>{t.keyword}</span>
          <span className="text-[#aaaaaa]">
            {t.views.toLocaleString()} views
          </span>
        </div>
      ))}
    </Card>
  );
}

/* ---------------- REUSABLE ---------------- */

function Card({ children }: any) {
  return (
    <div className="bg-black border border-[#2a2a2a] rounded p-4">
      {children}
    </div>
  );
}

function MetricGrid({ days }: { days: number }) {
  const scale = days / 28;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 bg-black border border-[#2a2a2a] rounded">
      <Metric
        label="Views"
        value={`${Math.round(10030 * scale).toLocaleString()}`}
      />
      <Metric
        label="Watch time (hrs)"
        value={(242.8 * scale).toFixed(1)}
      />
      <Metric label="Subscribers" value={`+${Math.round(42 * scale)}`} />
    </div>
  );
}

function Metric({ label, value }: any) {
  return (
    <div className="p-4 border-b sm:border-b-0 sm:border-r last:border-r-0 border-[#2a2a2a]">
      <div className="text-xs text-[#aaaaaa]">{label}</div>
      <div className="text-2xl font-medium">{value}</div>
    </div>
  );
}

function ChartCompare({ current, prev }: any) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={current}>
        <XAxis dataKey="day" hide />
        <YAxis />
        <Tooltip />
        <Line dataKey="views" stroke="#3ea6ff" strokeWidth={2} dot={false} />
        <Line
          dataKey="views"
          data={prev}
          stroke="#ff7a7a"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ---------------- VIDEO TABLE ---------------- */

function VideoTable({ videos }: { videos: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border border-[#2a2a2a] rounded overflow-hidden">
        <thead className="bg-black">
          <tr>
            <th className="p-3 text-left text-xs text-[#aaaaaa]">Video</th>
            <th className="p-3 text-right text-xs text-[#aaaaaa]">Views</th>
            <th className="p-3 text-right text-xs text-[#aaaaaa]">
              Watch time
            </th>
            <th className="p-3 text-right text-xs text-[#aaaaaa]">
              Subscribers
            </th>
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => (
            <tr key={v.id} className="border-t border-[#2a2a2a]">
              <td className="p-3">{v.title}</td>
              <td className="p-3 text-right">
                {Math.round(v.views).toLocaleString()}
              </td>
              <td className="p-3 text-right">
                {Math.round(v.watchTime).toLocaleString()}
              </td>
              <td className="p-3 text-right">
                {Math.round(v.subscribers).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
