import Link from "next/link";
import { FiXCircle, FiArrowLeft } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Checkout Cancelled — CinePortal" };

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 border border-border flex items-center justify-center">
            <FiXCircle className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">No worries</h1>
          <p className="text-muted-foreground">
            You cancelled the checkout. Your current plan is unchanged — you can
            upgrade whenever you&apos;re ready.
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-3">
          <p className="text-sm font-medium">Still on the free plan?</p>
          <p className="text-sm text-muted-foreground">
            Upgrade to unlock unlimited reviews, premium content, and an
            ad-free experience starting at just $9.99/month.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/#pricing">View Plans</Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <FiArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
