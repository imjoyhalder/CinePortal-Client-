import type { Metadata } from "next";
import PricingSection from "@/components/home/pricing-section";

export const metadata: Metadata = {
  title: "Pricing — CinePortal",
  description:
    "Choose a plan that fits you. Start free, upgrade any time. CinePortal Pro unlocks premium content, unlimited reviews, and an ad-free experience.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <PricingSection />
    </div>
  );
}
