"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FiHelpCircle, FiMail, FiSearch, FiUser,
  FiStar, FiBookmark, FiCreditCard,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  id: string;
  q: string;
  a: string;
}

interface FaqCategory {
  category: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

const FAQS: FaqCategory[] = [
  {
    category: "Account & Access",
    icon: <FiUser className="w-4 h-4" />,
    items: [
      {
        id: "create-account",
        q: "How do I create an account?",
        a: "Click 'Get Started' in the top navigation, fill in your details, and verify your email with the 6-digit code we send you. You can also sign up instantly using your Google account.",
      },
      {
        id: "forgot-password",
        q: "I forgot my password. What do I do?",
        a: "Click 'Forgot password?' on the sign-in page. We will send a 6-digit reset code to your email. The code expires after 10 minutes for security.",
      },
    ],
  },
  {
    category: "Reviews & Ratings",
    icon: <FiStar className="w-4 h-4" />,
    items: [
      {
        id: "write-review",
        q: "How do I write a review?",
        a: "Navigate to any movie page, scroll to the Reviews section, and fill in the form. You can rate 1–10, add tags, and toggle spoiler warnings.",
      },
      {
        id: "review-limit",
        q: "Why can I only write one review per month?",
        a: "Free accounts are limited to 1 review per month. Upgrade to Monthly Pro or Annual Premium for unlimited reviews and comments.",
      },
      {
        id: "review-pending",
        q: "Why is my review not showing yet?",
        a: "New reviews require admin approval to prevent spam. This typically takes less than 24 hours. You'll receive a notification once it's live.",
      },
    ],
  },
  {
    category: "Watchlist & Discovery",
    icon: <FiBookmark className="w-4 h-4" />,
    items: [
      {
        id: "watchlist-info",
        q: "What is the watchlist?",
        a: "It's your personal collection. Click the bookmark icon on any title to save it for later. Access your list from your Profile dashboard.",
      },
      {
        id: "premium-content",
        q: "What is premium content?",
        a: "Premium content is marked with a gold PREMIUM badge. You need an active Pro or Annual subscription to stream these titles.",
      },
    ],
  },
  {
    category: "Subscriptions & Billing",
    icon: <FiCreditCard className="w-4 h-4" />,
    items: [
      {
        id: "billing-security",
        q: "Is my payment information secure?",
        a: "Absolutely. Payments are handled via Stripe (PCI-DSS Level 1). CinePortal never stores your credit card details on our servers.",
      },
      {
        id: "cancel-sub",
        q: "How do I cancel my subscription?",
        a: "Go to Dashboard → Subscription and click 'Cancel Subscription'. Your access continues until the end of the current billing period.",
      },
      {
        id: "free-vs-paid",
        q: "What is the difference between Free and Premium?",
        a: "Free users can browse, create a watchlist, and write 1 review per month. Premium subscribers get unlimited reviews, access to all premium content, ad-free experience, and priority support.",
      },
    ],
  },
];

export default function FAQClient() {
  const [search, setSearch] = useState("");

  const filteredFaqs = useMemo<FaqCategory[]>(() => {
    if (!search) return FAQS;
    const q = search.toLowerCase();
    return FAQS
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(q) ||
            item.a.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <div className="relative min-h-screen py-10 overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <FiHelpCircle className="w-3.5 h-3.5" />
            Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-foreground">
            How can we <span className="text-primary">help?</span>
          </h1>
          <div className="relative max-w-xl mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search for questions..."
              className="pl-12 h-14 rounded-2xl bg-background border-border shadow-xl shadow-primary/5 focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredFaqs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

            {/* Sidebar Navigation */}
            <aside className="hidden md:block md:col-span-3 space-y-1 h-fit sticky top-24">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 px-2">
                Categories
              </p>
              {FAQS.map((cat) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => {
                    document
                      .getElementById(cat.category)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                >
                  {cat.icon}
                  {cat.category}
                </button>
              ))}
            </aside>

            {/* FAQ List */}
            <div className="md:col-span-9 space-y-16">
              {filteredFaqs.map(({ category, items, icon }) => (
                <section key={category} id={category} className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
                    <h2 className="text-lg font-bold tracking-tight">{category}</h2>
                  </div>

                  <Accordion className="w-full space-y-3">
                    {items.map(({ id, q, a }) => (
                      <AccordionItem
                        key={id}
                        value={id}
                        className="border border-border/50 rounded-xl px-2 bg-card/30 backdrop-blur-sm overflow-hidden"
                      >
                        <AccordionTrigger className="hover:no-underline py-4 px-4 text-left text-sm font-semibold">
                          {q}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 text-muted-foreground leading-relaxed">
                          {a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-muted-foreground italic">
              No results found for &quot;{search}&quot;
            </p>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-24 relative group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-md p-10 text-center">
            <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm">
              Can&apos;t find what you&apos;re looking for? Reach out to our support team and
              we&apos;ll get back to you within 24 hours.
            </p>
            <Button
              size="lg"
              className="rounded-full px-8 shadow-lg shadow-primary/20"
              asChild
            >
              <Link href="/contact">
                <FiMail className="mr-2 w-4 h-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
