"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OverviewTab from "@/components/dashboard/OverviewTab";
import { buildDashboardData, DashboardInputs } from "@/lib/calculations";
import {
  Rocket,
  Check,
  ArrowRight,
  Store,
  Clock3,
  CreditCard,
  Target,
  TrendingUp,
  ListChecks,
  CalendarCheck,
  Sparkles,
  Smile,
  Lightbulb,
  Clock4,
  ShieldCheck,
} from "lucide-react";

type FormDataT = {
  revenue: string;
  orders: string;
  lastWeekRevenue: string;
  topProduct: string;
};

type DashTab = "overview" | "pulse" | "weekly";

export default function Home() {
  const [view, setView] = useState<"landing" | "form" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<DashTab>("overview");
  const [formData, setFormData] = useState<FormDataT>({
    revenue: "",
    orders: "",
    lastWeekRevenue: "",
    topProduct: "",
  });

  function handleChange(field: keyof FormDataT, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActiveTab("overview");
    setView("dashboard");
  }

  const inputs: DashboardInputs = {
    revenue: parseFloat(formData.revenue) || 0,
    orders: parseInt(formData.orders) || 0,
    lastWeekRevenue: parseFloat(formData.lastWeekRevenue) || 0,
    topProduct: formData.topProduct,
  };
  const dashboardData = buildDashboardData(inputs);

  return (
    <div className="min-h-screen bg-[#0A0D0E] text-[#E8EAEB] font-sans">
      <Header />
      <div className="max-w-6xl mx-auto">

        {view === "landing" && (
          <>
            {/* ---------- HERO ---------- */}
            <section className="px-8 pt-12 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#2DD4BF] bg-[#0F2E27] rounded-full px-3 py-1 mb-5">
                  <Rocket size={12} /> Coming Soon · Beta Access
                </span>
                <h1 className="text-[34px] font-semibold leading-[1.2] mb-4">
                  Know what&apos;s happening in your store. <br />
                  <span className="text-[#2DD4BF]">Every morning.</span>
                </h1>
                <p className="text-[14px] text-[#8B9296] leading-relaxed mb-5 max-w-md">
                  ClarityMetrics turns yesterday&apos;s numbers into clear
                  insights and action steps — so you can grow your store with
                  confidence.
                </p>

                <ul className="flex flex-col gap-2 mb-6 text-[13px] text-[#B4BABD]">
                  {[
                    "AI-powered morning brief",
                    "Actionable insights, not just metrics",
                    "Save 30-60 minutes every day",
                    "No integrations. No complex dashboards.",
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check size={14} className="text-[#2DD4BF]" />
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-3 mb-5">
                  <button
                    onClick={() => setView("form")}
                    className="bg-[#2DD4BF] text-[#0A1310] rounded-md px-5 py-3 text-sm font-semibold inline-flex items-center gap-1.5"
                  >
                    Get My Morning Brief <ArrowRight size={15} />
                  </button>
                  <a
                    href="#waitlist"
                    className="border border-[#2A3032] text-[#E8EAEB] rounded-md px-5 py-3 text-sm font-semibold"
                  >
                    Join Beta
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["bg-[#3a4a52]", "bg-[#4a3a52]", "bg-[#3a5246]", "bg-[#2DD4BF]"].map((c, i) => (
                      <div key={i} className={`w-7 h-7 rounded-full border-2 border-[#0A0D0E] ${c}`} />
                    ))}
                  </div>
                  <p className="text-xs text-[#8B9296]">Store owners are signing up for early access</p>
                </div>
              </div>

              {/* ---------- SAMPLE MORNING BRIEF PREVIEW ---------- */}
              <div className="bg-[#13171A] border border-[#232A2D] rounded-xl p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium">Good morning! 👋</p>
                    <p className="text-[11px] text-[#8B9296]">Here&apos;s how your store did yesterday</p>
                  </div>
                  <span className="text-[10px] text-[#5F6366]">Sample preview</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <MiniStat label="Revenue" value="$8,240" sub="↓ 18% vs last day" down />
                  <MiniStat label="Orders" value="124" sub="↓ 12% vs last day" down />
                  <MiniStat label="Best Product" value="Oversized Hoodie" sub="↑ 42% of sales" />
                  <MiniStat label="Top Channel" value="Instagram" sub="71% of orders" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr] gap-3">
                  <div className="bg-[#0A0D0E] border border-[#232A2D] rounded-lg p-3">
                    <p className="text-[11px] font-medium mb-2.5">Top Insights</p>
                    <ul className="flex flex-col gap-2 text-[11px] text-[#B4BABD] leading-snug">
                      <li>Revenue dropped 18% compared to the previous day. Main reason: fewer orders from Instagram.</li>
                      <li>Oversized Hoodie is your top-performing product. It generated 42% of total revenue.</li>
                      <li>Best time to post on Instagram is 7PM–9PM. Engagement is 2.3x higher during this window.</li>
                      <li>Only 6 Oversized Hoodies left in stock. Consider restocking before the weekend.</li>
                    </ul>
                  </div>
                  <div className="bg-[#0A0D0E] border border-[#232A2D] rounded-lg p-3">
                    <p className="text-[11px] font-medium mb-2.5">Revenue trend</p>
                    <svg viewBox="0 0 200 80" className="w-full h-20">
                      <polyline
                        points="0,55 30,60 60,50 90,45 120,30 150,15 180,5"
                        fill="none"
                        stroke="#2DD4BF"
                        strokeWidth="2"
                      />
                    </svg>
                    <div className="flex justify-between mt-1">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <span key={d} className="text-[8px] text-[#5F6366]">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------- TRUST STRIP ---------- */}
            <section className="px-8 pb-8">
              <div className="bg-[#13171A] border border-[#232A2D] rounded-xl px-7 py-5 grid grid-cols-2 sm:grid-cols-5 gap-5">
                <TrustItem icon={<Store size={20} color="#95BF47" />} label="Built for store owners" />
                <TrustItem icon={<Clock3 size={20} color="#378ADD" />} label="5 minutes setup" />
                <TrustItem icon={<CreditCard size={20} color="#EF9F27" />} label="No credit card required" />
                <TrustItem icon={<Target size={20} color="#D4537E" />} label="Insights you can actually use" />
                <TrustItem icon={<TrendingUp size={20} color="#9B8CF2" />} label="Designed for busy entrepreneurs" />
              </div>
            </section>

            {/* ---------- HOW IT WORKS ---------- */}
            <section id="how-it-works" className="px-8 py-10 text-center">
              <p className="text-[11px] text-[#2DD4BF] tracking-wide uppercase mb-2">How it works</p>
              <h2 className="text-2xl font-semibold mb-8">Your morning routine, simplified.</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <StepCard num={1} icon={<ListChecks size={26} className="text-[#2DD4BF]" />} title="Enter yesterday's numbers" text="Just 4 simple inputs. That's it." />
                <StepCard num={2} icon={<CalendarCheck size={26} className="text-[#2DD4BF]" />} title="Get your morning brief" text="AI analyzes your store and creates a personalized summary." />
                <StepCard num={3} icon={<Target size={26} className="text-[#2DD4BF]" />} title="Take action, grow faster" text="Know what to do today and where to focus." />
              </div>
            </section>

            {/* ---------- WHY CLARITYMETRICS ---------- */}
            <section id="why" className="px-8 py-10 text-center">
              <p className="text-[11px] text-[#2DD4BF] tracking-wide uppercase mb-2">Why ClarityMetrics?</p>
              <h2 className="text-2xl font-semibold mb-8">We focus on what matters.</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
                <WhyCard icon={<Smile size={22} color="#95BF47" />} title="Simple, not complicated" text="No confusing dashboards or overwhelming reports." />
                <WhyCard icon={<Lightbulb size={22} color="#EF9F27" />} title="Actionable insights" text="You'll know exactly what to do next." />
                <WhyCard icon={<Clock4 size={22} color="#378ADD" />} title="Saves time daily" text="Get your brief in under 5 minutes." />
                <WhyCard icon={<TrendingUp size={22} color="#D4537E" />} title="Built for growth" text="Make better decisions and grow with confidence." />
              </div>
            </section>

            {/* ---------- FOUNDER STORY ---------- */}
            <section id="founder" className="px-8 py-10">
              <div className="bg-[#13171A] border border-[#232A2D] rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_280px]">
                <div className="p-7">
                  <p className="text-[11px] text-[#2DD4BF] tracking-wide uppercase mb-2">Founder story</p>
                  <h3 className="text-xl font-semibold mb-3">Why I built ClarityMetrics</h3>
                  <p className="text-[13px] text-[#B4BABD] leading-relaxed mb-3">
                    I started my journey as a Shopify store owner. I loved
                    building products, but I struggled to understand my
                    numbers. Dashboards were confusing and time-consuming. I
                    just wanted simple answers every morning.
                  </p>
                  <p className="text-[13px] text-[#B4BABD] leading-relaxed mb-5">
                    So I built ClarityMetrics — to give store owners like you a
                    clear, AI-powered morning brief that saves time and drives
                    growth.
                  </p>
                  <p className="text-sm font-medium">— Anupama, Founder</p>
                </div>
                <div className="p-7 flex flex-col gap-5 justify-center border-t lg:border-t-0 lg:border-l border-[#232A2D]">
                  <FounderPoint icon={<Store size={18} className="text-[#2DD4BF]" />} title="Built by a store owner" text="I understand your challenges because I've been there." />
                  <FounderPoint icon={<Target size={18} className="text-[#2DD4BF]" />} title="Focused on you" text="Every feature is designed to save you time and help you grow." />
                  <FounderPoint icon={<ShieldCheck size={18} className="text-[#2DD4BF]" />} title="Committed to quality" text="Before launching, I'm working closely with early users to make it right." />
                </div>
              </div>
            </section>

            {/* ---------- WAITLIST (real Tally embed) ---------- */}
            <section id="waitlist" className="px-8 py-10">
              <div className="bg-[#13171A] border border-[#232A2D] rounded-xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Beta launching soon.</h3>
                  <p className="text-sm text-[#8B9296] mb-4">Be the first to access ClarityMetrics.</p>
                  <ul className="flex flex-col gap-2 text-[13px] text-[#B4BABD]">
                    {["Early access for beta members", "Help shape the product", "Special pricing for early users"].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <Check size={14} className="text-[#2DD4BF]" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#0A0D0E] border border-[#232A2D] rounded-lg p-5">
                  <p className="text-sm font-medium mb-1">Join the waitlist</p>
                  <p className="text-[11px] text-[#8B9296] mb-4">Get early access and product updates.</p>
                  <iframe
                    src="https://tally.so/embed/KYgoOA?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                    width="100%"
                    height="220"
                    title="Join the ClarityMetrics Beta waitlist"
                    style={{ border: "none" }}
                  />
                </div>
              </div>
            </section>

            {/* ---------- EARLY FEEDBACK (placeholder testimonials) ---------- */}
            <section className="px-8 py-10 text-center">
              <p className="text-[11px] text-[#2DD4BF] tracking-wide uppercase mb-2">From early conversations</p>
              <h2 className="text-2xl font-semibold mb-2">What we&apos;re hearing so far.</h2>
              <p className="text-xs text-[#8B9296] mb-8">
                Real conversations with prospective beta users — quotes shown are illustrative until we publish verified reviews.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <FeedbackCard quote="Finally — something that doesn't require me to learn analytics just to understand my own store." />
                <FeedbackCard quote="If this saves me from opening five tabs every morning, I'm in." />
                <FeedbackCard quote="The plain-English insight idea is exactly what I've wanted from every dashboard I've tried." />
              </div>
            </section>

            <Footer />
          </>
        )}

        {/* ---------- FORM VIEW ---------- */}
        {view === "form" && (
          <section className="px-7 py-10 max-w-md mx-auto">
            <span className="inline-block text-xs text-[#2DD4BF] bg-[#0F2E27] rounded-md px-3 py-1 mb-4">
              Quick preview · takes under a minute
            </span>
            <h2 className="text-xl font-medium mb-2">Let&apos;s see your numbers</h2>
            <p className="text-sm text-[#8B9296] mb-6 leading-relaxed">
              No store connection needed yet — just type in a few real figures
              and we&apos;ll build your full dashboard instantly.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-[#B4BABD] mb-1.5">Yesterday&apos;s revenue ($)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1240"
                  value={formData.revenue}
                  onChange={(e) => handleChange("revenue", e.target.value)}
                  className="w-full bg-[#13171A] border border-[#232A2D] rounded-lg px-3.5 py-2.5 text-sm text-[#E8EAEB] placeholder-[#5F6366] outline-none focus:border-[#2DD4BF]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B4BABD] mb-1.5">Yesterday&apos;s order count</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 18"
                  value={formData.orders}
                  onChange={(e) => handleChange("orders", e.target.value)}
                  className="w-full bg-[#13171A] border border-[#232A2D] rounded-lg px-3.5 py-2.5 text-sm text-[#E8EAEB] placeholder-[#5F6366] outline-none focus:border-[#2DD4BF]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B4BABD] mb-1.5">Same day last week&apos;s revenue ($)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1100"
                  value={formData.lastWeekRevenue}
                  onChange={(e) => handleChange("lastWeekRevenue", e.target.value)}
                  className="w-full bg-[#13171A] border border-[#232A2D] rounded-lg px-3.5 py-2.5 text-sm text-[#E8EAEB] placeholder-[#5F6366] outline-none focus:border-[#2DD4BF]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B4BABD] mb-1.5">Best-selling product right now</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Resistance bands"
                  value={formData.topProduct}
                  onChange={(e) => handleChange("topProduct", e.target.value)}
                  className="w-full bg-[#13171A] border border-[#232A2D] rounded-lg px-3.5 py-2.5 text-sm text-[#E8EAEB] placeholder-[#5F6366] outline-none focus:border-[#2DD4BF]"
                />
              </div>
              <button
                type="submit"
                className="mt-2 w-full bg-[#2DD4BF] text-[#0A1310] rounded-lg py-3 text-sm font-semibold shadow-[0_4px_16px_rgba(45,212,191,0.25)]"
              >
                See my dashboard →
              </button>
            </form>
          </section>
        )}

        {/* ---------- DASHBOARD VIEW (3 TABS) ---------- */}
        {view === "dashboard" && (
          <section className="px-7 py-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <p className="text-xl font-semibold">
                  Good morning, Anupama! <span className="ml-1">☀️</span>
                </p>
                <p className="text-[12px] text-[#8B9296] mt-1">
                  Here&apos;s your store summary —{" "}
                  {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0F2E27] flex items-center justify-center text-[#2DD4BF] font-medium text-sm">
                  A
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-medium">Hi, Anupama</p>
                  <p className="text-[11px] text-[#8B9296]">Store Owner</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#0F2E27] border border-[#2DD4BF] rounded-lg px-3.5 py-2.5 mb-5">
              <span className="text-[#2DD4BF] text-sm">✓</span>
              <p className="text-xs text-[#9FE1CB]">
                Here&apos;s what your dashboard would look like, based on your numbers
              </p>
            </div>

            <div className="flex gap-1 mb-5 bg-[#13171A] border border-[#232A2D] rounded-lg p-1 w-fit">
              {(["overview", "pulse", "weekly"] as DashTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-[13px] capitalize transition-colors ${activeTab === tab
                      ? "bg-[#2DD4BF] text-[#0A1310] font-medium"
                      : "text-[#8B9296] hover:text-[#E8EAEB]"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "overview" && <OverviewTab data={dashboardData} />}

            {activeTab === "pulse" && (
              <div className="bg-[#13171A] border border-[#232A2D] rounded-xl p-8 text-center">
                <p className="text-sm text-[#8B9296]">Pulse tab — coming next</p>
              </div>
            )}

            {activeTab === "weekly" && (
              <div className="bg-[#13171A] border border-[#232A2D] rounded-xl p-8 text-center">
                <p className="text-sm text-[#8B9296]">Weekly tab — coming next</p>
              </div>
            )}

            <button
              onClick={() => setView("landing")}
              className="mt-6 text-xs text-[#8B9296] underline"
            >
              ← Try different numbers
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

// ---------- Small reusable pieces ----------

function MiniStat({ label, value, sub, down }: { label: string; value: string; sub: string; down?: boolean }) {
  return (
    <div className="bg-[#0A0D0E] border border-[#232A2D] rounded-md p-2.5">
      <p className="text-[9px] text-[#8B9296] mb-1">{label}</p>
      <p className="text-[13px] font-semibold leading-tight">{value}</p>
      <p className={`text-[9px] mt-1 ${down ? "text-[#EF9F27]" : "text-[#2DD4BF]"}`}>{sub}</p>
    </div>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
      {icon}
      <p className="text-[11px] text-[#B4BABD] leading-snug">{label}</p>
    </div>
  );
}

function StepCard({ num, icon, title, text }: { num: number; icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-[#13171A] border border-[#232A2D] rounded-xl p-5">
      <div className="w-6 h-6 rounded-full bg-[#2DD4BF] text-[#0A1310] text-[12px] font-semibold flex items-center justify-center mb-4">
        {num}
      </div>
      <div className="mb-3">{icon}</div>
      <p className="text-sm font-medium mb-1.5">{title}</p>
      <p className="text-xs text-[#8B9296] leading-relaxed">{text}</p>
    </div>
  );
}

function WhyCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-[#13171A] border border-[#232A2D] rounded-xl p-5">
      <div className="mb-3">{icon}</div>
      <p className="text-sm font-medium mb-1.5">{title}</p>
      <p className="text-xs text-[#8B9296] leading-relaxed">{text}</p>
    </div>
  );
}

function FounderPoint({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-[13px] font-medium mb-0.5">{title}</p>
        <p className="text-[12px] text-[#8B9296] leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function FeedbackCard({ quote }: { quote: string }) {
  return (
    <div className="bg-[#13171A] border border-[#232A2D] rounded-xl p-5">
      <p className="text-sm text-[#B4BABD] leading-relaxed mb-3">&quot;{quote}&quot;</p>
      <p className="text-[11px] text-[#5F6366]">— Early conversation, prospective user</p>
    </div>
  );
}
