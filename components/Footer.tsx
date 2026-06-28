// components/Footer.tsx
export default function Footer() {
    return (
        <footer className="px-10 max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-10 border-t border-[#2A3032] text-[12px]">
                <div>
                    <p className="text-[15px] font-semibold mb-2">
                        Clarity<span className="text-[#2DD4BF]">Metrics</span>
                    </p>
                    <p className="text-[#8B9296] leading-relaxed">
                        Plain-English insights for Shopify store owners.
                    </p>
                </div>
                <div>
                    <p className="font-medium mb-2.5">Product</p>
                    <a href="#how-it-works" className="block mb-1.5 text-[#8B9296] hover:text-[#2DD4BF]">How it works</a>
                    <a href="#pricing" className="block mb-1.5 text-[#8B9296] hover:text-[#2DD4BF]">Pricing</a>
                </div>
                <div>
                    <p className="font-medium mb-2.5">Company</p>
                    <a href="#founder" className="block mb-1.5 text-[#8B9296] hover:text-[#2DD4BF]">About</a>
                    <a href="#" className="block mb-1.5 text-[#8B9296] hover:text-[#2DD4BF]">Contact</a>
                </div>
                <div>
                    <p className="font-medium mb-2.5">Legal</p>
                    <a href="/privacy" className="block mb-1.5 text-[#8B9296] hover:text-[#2DD4BF]">Privacy policy</a>
                    <a href="/terms" className="block mb-1.5 text-[#8B9296] hover:text-[#2DD4BF]">Terms of service</a>
                    <a href="/data-deletion" className="block mb-1.5 text-[#8B9296] hover:text-[#2DD4BF]">Data deletion</a>
                </div>
            </div>
            <div className="flex flex-wrap justify-between gap-2 py-4 border-t border-[#2A3032] text-[11px] text-[#5F6366]">
                <span>© 2026 ClarityMetrics. All rights reserved.</span>
                <span>Not affiliated with Shopify Inc.</span>
            </div>
        </footer>
    );
}
