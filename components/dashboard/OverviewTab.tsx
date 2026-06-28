// components/dashboard/OverviewTab.tsx
import { DashboardData } from "@/lib/calculations";
import { Sparkles, TrendingUp, ShoppingBag, Camera, Package, Lightbulb, Clock, ArrowRight } from "lucide-react";

export default function OverviewTab({ data }: { data: DashboardData }) {
    const maxWeekRevenue = Math.max(...data.thisWeek.map((d) => d.revenue), ...data.lastWeek.map((d) => d.revenue), 1);
    const secondProduct = data.products[1];

    return (
        <div className="flex flex-col gap-5">
            {/* ---------- AI MORNING BRIEF — HERO ---------- */}
            <div className="bg-[#161A1C] border border-[#2DD4BF]/40 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0F2E27] flex items-center justify-center flex-shrink-0">
                            <Sparkles size={16} className="text-[#2DD4BF]" />
                        </div>
                        <div>
                            <span className="inline-block text-[10px] text-[#2DD4BF] bg-[#0F2E27] rounded-full px-2.5 py-0.5 mb-2">
                                AI MORNING BRIEF
                            </span>
                            <p className="text-[16px] leading-snug">
                                Your revenue is{" "}
                                <span className={data.isUp ? "text-[#2DD4BF] font-medium" : "text-[#EF9F27] font-medium"}>
                                    {data.isUp ? "up" : "down"} {Math.abs(data.percentChange).toFixed(0)}%
                                </span>{" "}
                                vs last week.
                                <br />
                                <span className="text-[#9B8CF2] font-medium">{data.topProduct}</span> is your top performer — keep the momentum!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                    <BriefChip
                        icon={<TrendingUp size={16} className="text-[#2DD4BF]" />}
                        title="Revenue is up"
                        text={`You earned $${data.revenue.toLocaleString()} vs $${data.lastWeekRevenue.toLocaleString()} last week.`}
                    />
                    <BriefChip
                        icon={<ShoppingBag size={16} className="text-[#9B8CF2]" />}
                        title="Top Product"
                        text={`${data.topProduct} generated ${data.products[0].share}% of sales.`}
                    />
                    <BriefChip
                        icon={<Camera size={16} className="text-[#D4537E]" />}
                        title="Best time to post"
                        text={`Today on Instagram, ${data.bestPostWindow}.`}
                    />
                    <BriefChip
                        icon={<Package size={16} className="text-[#EF9F27]" />}
                        title="Inventory low"
                        text={`${data.inventoryAlert.product} is running low. Only ${data.inventoryAlert.unitsLeft} left.`}
                    />
                </div>
            </div>

            {/* ---------- 4 KPI CARDS ---------- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard
                    icon="💰"
                    label="Revenue"
                    value={`$${data.revenue.toLocaleString()}`}
                    change={data.percentChange}
                    isUp={data.isUp}
                    series={data.thisWeek.map((d) => d.revenue)}
                    color="#2DD4BF"
                />
                <KpiCard
                    icon="🛒"
                    label="Orders"
                    value={`${data.orders.toLocaleString()}`}
                    change={12}
                    isUp={true}
                    series={data.thisWeek.map((d) => d.orders)}
                    color="#9B8CF2"
                />
                <KpiCard
                    icon="👕"
                    label="Best Product"
                    value={data.topProduct}
                    sub={`$${data.products[0].revenue.toLocaleString()} (${data.products[0].share}%)`}
                    change={data.products[0].changePct}
                    isUp={true}
                    series={data.thisWeek.map((d) => d.revenue * 0.4)}
                    color="#378ADD"
                />
                <div className="bg-[#161A1C] border border-[#EF9F27]/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb size={16} className="text-[#EF9F27]" />
                        <p className="text-[11px] text-[#8B9296]">AI Opportunity</p>
                    </div>
                    <p className="text-sm font-medium mb-1.5">{data.aiOpportunity.title}</p>
                    <p className="text-[11px] text-[#8B9296] leading-relaxed mb-3">{data.aiOpportunity.text}</p>
                    <button className="text-[11px] text-[#EF9F27] font-medium inline-flex items-center gap-1">
                        View action plan <ArrowRight size={12} />
                    </button>
                </div>
            </div>

            {/* ---------- PERFORMANCE & INSIGHTS ---------- */}
            <div className="bg-[#161A1C] border border-[#232A2D] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium">Performance & Insights</p>
                    <a href="#" className="text-[11px] text-[#2DD4BF] inline-flex items-center gap-1">
                        View full report <ArrowRight size={12} />
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <InsightCard
                        icon={<Lightbulb size={15} className="text-[#9B8CF2]" />}
                        label="AI Insight"
                        title={`${data.bestDay}s are your best days.`}
                        sub="Plan your campaigns and promotions accordingly."
                        cta="View all insights"
                        ctaColor="#9B8CF2"
                    />
                    <InsightCard
                        icon={<ShoppingBag size={15} className="text-[#2DD4BF]" />}
                        label="Top Product"
                        title={data.topProduct}
                        sub={`$${data.products[0].revenue.toLocaleString()} (${data.products[0].share}%) · ↑ ${data.products[0].changePct}% vs last week`}
                        cta="View details"
                        ctaColor="#2DD4BF"
                    />
                    <InsightCard
                        icon={<Clock size={15} className="text-[#D4537E]" />}
                        label="Best Time To Post"
                        title={data.bestPostWindow}
                        sub={`Engagement is ${data.bestPostLift}x higher during this time.`}
                        cta="View details"
                        ctaColor="#D4537E"
                    />
                    <InsightCard
                        icon={<Package size={15} className="text-[#EF9F27]" />}
                        label="Inventory Alert"
                        title={data.inventoryAlert.product}
                        sub={`Only ${data.inventoryAlert.unitsLeft} left in stock`}
                        cta="View inventory"
                        ctaColor="#EF9F27"
                    />
                    <InsightCard
                        icon={<TrendingUp size={15} className="text-[#378ADD]" />}
                        label="Revenue Trend"
                        title="Last 7 days"
                        sub={`Revenue is ${data.isUp ? "up" : "down"} ${Math.abs(data.percentChange).toFixed(0)}% compared to last week.`}
                        cta="View full report"
                        ctaColor="#378ADD"
                    />
                </div>
            </div>

            {/* ---------- REVENUE OVERVIEW ---------- */}
            <div className="bg-[#161A1C] border border-[#232A2D] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium">Revenue Overview</p>
                    <div className="flex gap-4 text-[11px] text-[#8B9296]">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2DD4BF] inline-block" /> This week</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#5F6366] inline-block" /> Last week</span>
                    </div>
                </div>
                <TrendChart thisWeek={data.thisWeek} lastWeek={data.lastWeek} max={maxWeekRevenue} />
            </div>

            {/* ---------- TOP PRODUCTS ---------- */}
            <div className="bg-[#161A1C] border border-[#232A2D] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm font-medium">Top Products</p>
                        <p className="text-[11px] text-[#8B9296]">By revenue, last 7 days</p>
                    </div>
                    <a href="#" className="text-[11px] text-[#2DD4BF] inline-flex items-center gap-1">
                        View all products <ArrowRight size={12} />
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-[11px] text-[#8B9296] mb-3">🏆 Best Sellers</p>
                        {data.products.map((p, i) => (
                            <RankRow key={p.name} rank={i + 1} name={p.name} value={`$${p.revenue.toLocaleString()} (${p.share}%)`} share={p.share} color="#2DD4BF" />
                        ))}
                    </div>
                    <div>
                        <p className="text-[11px] text-[#8B9296] mb-3">🚀 Winning Products</p>
                        {data.products.map((p, i) => (
                            <RankRow key={p.name} rank={i + 1} name={p.name} value={`↑ ${p.changePct}%`} share={p.changePct * 3} color="#9B8CF2" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------- Small reusable pieces ----------

function BriefChip({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
    return (
        <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-full bg-[#0C0F10] flex items-center justify-center flex-shrink-0">{icon}</div>
            <div>
                <p className="text-[12px] font-medium mb-0.5">{title}</p>
                <p className="text-[11px] text-[#8B9296] leading-snug">{text}</p>
            </div>
        </div>
    );
}

function KpiCard({
    icon,
    label,
    value,
    sub,
    change,
    isUp,
    series,
    color,
}: {
    icon: string;
    label: string;
    value: string;
    sub?: string;
    change: number;
    isUp: boolean;
    series: number[];
    color: string;
}) {
    return (
        <div className="bg-[#161A1C] border border-[#232A2D] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[15px]">{icon}</span>
                <p className="text-[11px] text-[#8B9296]">{label}</p>
            </div>
            <p className="text-lg font-semibold mb-1 truncate">{value}</p>
            {sub && <p className="text-[10px] text-[#8B9296] mb-1.5">{sub}</p>}
            <p className={`text-[11px] mb-2 ${isUp ? "text-[#2DD4BF]" : "text-[#EF9F27]"}`}>
                {isUp ? "↑" : "↓"} {Math.abs(change).toFixed(0)}% vs last week
            </p>
            <Sparkline series={series} color={color} />
        </div>
    );
}

function Sparkline({ series, color }: { series: number[]; color: string }) {
    const max = Math.max(...series, 1);
    const min = Math.min(...series, 0);
    const range = max - min || 1;
    const w = 100;
    const h = 28;
    const step = w / (series.length - 1 || 1);

    const points = series
        .map((v, i) => {
            const x = i * step;
            const y = h - ((v - min) / range) * h;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7" preserveAspectRatio="none">
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
    );
}

function InsightCard({
    icon,
    label,
    title,
    sub,
    cta,
    ctaColor,
}: {
    icon: React.ReactNode;
    label: string;
    title: string;
    sub: string;
    cta: string;
    ctaColor: string;
}) {
    return (
        <div className="bg-[#0C0F10] border border-[#232A2D] rounded-lg p-3.5 flex flex-col">
            <div className="flex items-center gap-1.5 mb-2.5">
                {icon}
                <p className="text-[11px] text-[#8B9296]">{label}</p>
            </div>
            <p className="text-[13px] font-medium mb-1.5 leading-snug">{title}</p>
            <p className="text-[11px] text-[#8B9296] leading-snug mb-3 flex-1">{sub}</p>
            <button className="text-[11px] font-medium inline-flex items-center gap-1 self-start" style={{ color: ctaColor }}>
                {cta} <ArrowRight size={11} />
            </button>
        </div>
    );
}

function RankRow({ rank, name, value, share, color }: { rank: number; name: string; value: string; share: number; color: string }) {
    return (
        <div className="mb-3">
            <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#B4BABD]">
                    <span className="text-[#5F6366] mr-1.5">{rank}</span>
                    {name}
                </span>
                <span className="text-[#8B9296]">{value}</span>
            </div>
            <div className="w-full h-1.5 bg-[#0C0F10] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(share, 100)}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}

function TrendChart({
    thisWeek,
    lastWeek,
    max,
}: {
    thisWeek: { label: string; revenue: number }[];
    lastWeek: { label: string; revenue: number }[];
    max: number;
}) {
    const w = 600;
    const h = 160;
    const step = w / (thisWeek.length - 1 || 1);

    function toPoints(series: { revenue: number }[]) {
        return series
            .map((d, i) => {
                const x = i * step;
                const y = h - (d.revenue / max) * h;
                return `${x},${y}`;
            })
            .join(" ");
    }

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ minHeight: 160 }} preserveAspectRatio="none">
                <polyline points={toPoints(lastWeek)} fill="none" stroke="#5F6366" strokeWidth="2" strokeDasharray="4 3" />
                <polyline points={toPoints(thisWeek)} fill="none" stroke="#2DD4BF" strokeWidth="2.5" />
            </svg>
            <div className="flex justify-between mt-1">
                {thisWeek.map((d) => (
                    <span key={d.label} className="text-[10px] text-[#8B9296]">
                        {d.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
