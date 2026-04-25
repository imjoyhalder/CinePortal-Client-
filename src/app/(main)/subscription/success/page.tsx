import Link from "next/link";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Subscription Active — CinePortal" };

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">You&apos;re all set!</h1>
          <p className="text-muted-foreground">
            Your subscription is now active. Enjoy unlimited access to premium
            content, exclusive titles, and ad-free streaming.
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 text-left space-y-3">
          <h2 className="font-semibold text-sm">What&apos;s included:</h2>
          {[
            "Unlimited reviews & comments",
            "Access to all premium content",
            "Stream exclusive titles",
            "Ad-free experience",
            "Priority support",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <FiCheckCircle className="w-4 h-4 text-primary shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link href="/movies">
              Browse Premium Content
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/profile">View Subscription</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
