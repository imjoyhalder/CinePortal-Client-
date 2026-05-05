"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const OTP_LENGTH = 6;

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;

type Step = "email" | "otp" | "password";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const emailForm = useForm<EmailValues>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  useEffect(() => {
    if (step === "otp") inputRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSendOtp(values: EmailValues) {
    setSending(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "forget-password",
      });
      if (result.error) {
        toast.error(result.error.message || "Failed to send reset code");
      } else {
        setEmail(values.email);
        setStep("otp");
        setCooldown(60);
        toast.success("Reset code sent to your email");
      }
    } catch {
      toast.error("Failed to send reset code");
    } finally {
      setSending(false);
    }
  }

  function handleDigitChange(idx: number, val: string) {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    if (char && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleVerifyOtp() {
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      toast.error("Please enter all 6 digits");
      return;
    }
    setVerifying(true);
    try {
      setVerifiedOtp(otp);
      setStep("password");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setSending(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });
      if (result.error) {
        toast.error(result.error.message || "Failed to resend code");
      } else {
        toast.success("New reset code sent!");
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        setCooldown(60);
      }
    } catch {
      toast.error("Failed to resend code");
    } finally {
      setSending(false);
    }
  }

  async function handleResetPassword(values: ResetValues) {
    setResetting(true);
    try {
      const result = await authClient.emailOtp.resetPassword({
        email,
        otp: verifiedOtp,
        password: values.password,
      });
      if (result.error) {
        toast.error(result.error.message || "Failed to reset password");
        setStep("otp");
        setDigits(Array(OTP_LENGTH).fill(""));
      } else {
        toast.success("Password reset successfully! Please sign in.");
        router.push("/sign-in");
      }
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setResetting(false);
    }
  }

  const isOtpComplete = digits.every((d) => d !== "");

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {(["email", "otp", "password"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === s
                ? "bg-primary text-primary-foreground"
                : (["email", "otp", "password"] as Step[]).indexOf(step) > i
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            {i < 2 && <div className={`h-px w-6 ${(["email", "otp", "password"] as Step[]).indexOf(step) > i ? "bg-primary/40" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Email ───────────────────────────────── */}
      {step === "email" && (
        <>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Forgot password?</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email and we&apos;ll send you a reset code.
            </p>
          </div>

          <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...emailForm.register("email")}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Sending code..." : "Send Reset Code"}
            </Button>
          </form>
        </>
      )}

      {/* ── Step 2: OTP ─────────────────────────────────── */}
      {step === "otp" && (
        <>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Enter reset code</h1>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`w-11 h-14 text-center text-xl font-bold rounded-lg border-2 bg-card outline-none transition-colors ${
                  d
                    ? "border-blue-500 text-blue-400"
                    : "border-border focus:border-blue-500/60"
                }`}
              />
            ))}
          </div>

          <Button className="w-full" onClick={handleVerifyOtp} disabled={verifying || !isOtpComplete}>
            {verifying ? "Verifying..." : "Continue"}
          </Button>

          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Didn&apos;t receive the code?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={sending || cooldown > 0}
              className="flex items-center gap-1.5 text-primary hover:underline disabled:opacity-50 disabled:no-underline mx-auto"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${sending ? "animate-spin" : ""}`} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : sending ? "Sending..." : "Resend code"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mx-auto"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Change email
          </button>
        </>
      )}

      {/* ── Step 3: New password ─────────────────────────── */}
      {step === "password" && (
        <>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Set new password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a strong password for your account.
            </p>
          </div>

          <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className="pl-10 pr-10"
                  {...resetForm.register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {resetForm.formState.errors.password && (
                <p className="text-xs text-destructive">{resetForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  {...resetForm.register("confirmPassword")}
                />
              </div>
              {resetForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{resetForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={resetting}>
              {resetting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </>
      )}

      <div className="text-center">
        <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <FiArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
