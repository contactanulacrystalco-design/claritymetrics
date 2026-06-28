// components/Header.tsx
import { ChartLine } from "lucide-react";

export default function Header() {
    return (
        <nav className="flex items-center justify-between px-8 py-4 border-b border-[#232A2D]">
            <div className="flex items-center gap-2">
                <ChartLine size={18} className="text-[#2DD4BF]" />
                <p className="text-[15px] font-semibold">
                    Clarity<span className="text-[#2DD4BF]">Metrics</span>
                </p>
            </div>
            <div className="hidden md:flex items-center gap-7 text-[13px] text-[#B4BABD]">
                <a href="#features" className="hover:text-[#E8EAEB]">Features</a>
                <a href="#how-it-works" className="hover:text-[#E8EAEB]">How it works</a>
                <a href="#why" className="hover:text-[#E8EAEB]">Why it&apos;s different</a>
                <a href="#founder" className="hover:text-[#E8EAEB]">Founder</a>
                <a href="#waitlist" className="hover:text-[#E8EAEB]">FAQ</a>
            </div>
            <a
                href="#waitlist"
                className="bg-[#2DD4BF] text-[#0A1310] rounded-md px-4 py-2 text-[13px] font-semibold"
            >
                Join Beta
            </a>
        </nav>
    );
}
