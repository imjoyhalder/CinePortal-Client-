import type { Metadata } from "next";
import Link from "next/link";
import { FiHelpCircle, FiMail } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ — CinePortal",
  description: "Frequently asked questions about CinePortal.",
};

const FAQS = [
  {
    category: "Account & Access",
    items: [
      {
        q: "How do I create an account?",
        a: "Click 'Get Started' in the top navigation, fill in your name, email, and password, then verify your email with the 6-digit code we send you. You can also sign up instantly using your Google account.",
      },
      {
        q: "I forgot my password. What do I do?",
        a: "Click 'Forgot password?' on the sign-in page, enter your email, and we'll send you a 6-digit reset code. Use the code to set a new password — it expires after 10 minutes.",
      },
      {
        q: "Why do I need to verify my email?",
        a: "Email verification helps us keep the platform spam-free and ensures you can recover your account if needed. We send a one-time code to your inbox — just enter it and you're in.",
      },
      {
        q: "Can I use social login?",
        a: "Yes! You can sign in with your Google account for instant access — no password required.",
      },
    ],
  },
  {
    category: "Reviews & Ratings",
    items: [
      {
        q: "How do I write a review?",
        a: "Navigate to any movie or series detail page, scroll to the Reviews section, and fill in the review form. You can rate on a 1–10 scale, write your thoughts, add tags like 'underrated' or 'classic', and toggle a spoiler warning.",
      },
      {
        q: "Why is my review not showing yet?",
        a: "New reviews are submitted with 'Pending' status and require admin approval before they appear publicly. This typically takes less than 24 hours. Once approved, your review will be visible to everyone.",
      },
      {
        q: "Can I edit or delete my review?",
        a: "Yes — you can edit or delete your own reviews while they are in 'Pending' status (before admin approval). Once approved, reviews become part of the permanent record to maintain trust.",
      },
      {
        q: "How does the 1–10 rating scale work?",
        a: "Rate from 1 (unwatchable) to 10 (masterpiece). Whole numbers and half-points are both accepted. The displayed star rating on movie cards represents the average across all approved reviews.",
      },
    ],
  },
  {
    category: "Watchlist & Discovery",
    items: [
      {
        q: "What is the watchlist?",
        a: "The watchlist is your personal list of movies and series you want to watch later. Click the bookmark icon on any title to add it, or remove it from your Profile → Watchlist tab.",
      },
      {
        q: "How do I find movies by genre or platform?",
        a: "Go to the Browse page and use the filters: genre pills at the top for quick filtering, or the Filters panel for advanced options like streaming platform, release year, pricing, and sort order.",
      },
      {
        q: "What does 'Premium' content mean?",
        a: "Premium titles are available only to subscribers. Free content is accessible to all users. Upgrade to a Pro or Premium plan to unlock all titles.",
      },
    ],
  },
  {
    category: "Subscriptions & Billing",
    items: [
      {
        q: "What plans are available?",
        a: "We offer three tiers: Free (limited access), Pro ($9.99/month or $119.88/year), and Premium ($9.99/month or $79.99/year billed annually). Pro and Premium unlock all content and features.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to Profile → Subscription tab and click 'Cancel Subscription'. Your access continues until the end of the current billing period — you won't be charged again after that.",
      },
      {
        q: "What happens when my subscription expires?",
        a: "Your plan automatically downgrades to Free. You retain access to all free content and your reviews, watchlist, and profile history are preserved.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. Payments are processed entirely by Stripe, a PCI-DSS Level 1 certified payment processor. CinePortal never sees or stores your card details.",
      },
    ],
  },
  {
    category: "Admin & Moderation",
    items: [
      {
        q: "How does content moderation work?",
        a: "Our admin team reviews all submitted reviews before approval. Content that violates our community guidelines (hate speech, spam, personal attacks) is removed. Legitimate critical opinions are always welcomed.",
      },
      {
        q: "How do I report inappropriate content?",
        a: "Use the Contact page to report any content that violates our guidelines. Include the URL of the content and a brief description of the issue.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FiHelpCircle className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl font-black mb-3">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about CinePortal.
          </p>
        </div>

        {/* FAQ sections */}
        <div className="space-y-12">
          {FAQS.map(({ category, items }) => (
            <div key={category}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border/40">
                {category}
              </h2>
              <div className="space-y-1">
                {items.map(({ q, a }) => (
                  <details key={q} className="group border border-border/40 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-medium text-sm select-none hover:bg-card/60 transition-colors">
                      <span>{q}</span>
                      <svg
                        className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/30 bg-card/30">
                      {a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still need help? */}
        <div className="mt-16 rounded-2xl border border-border/50 bg-card p-8 text-center">
          <FiMail className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Can&apos;t find what you&apos;re looking for? Our team is happy to help.
          </p>
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
