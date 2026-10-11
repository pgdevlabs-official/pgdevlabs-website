import type { Metadata } from "next";
import { DigitalTextMarketplace } from "@/components/shared/DigitalTextMarketplace";

export const metadata: Metadata = {
  title: "Unique Digital Text Marketplace",
  description: "Buy and sell unique digital text items with protected previews and verified delivery.",
};

export default function MarketplacePage() {
  return <DigitalTextMarketplace />;
}
