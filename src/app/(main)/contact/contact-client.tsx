"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiMessageSquare, FiSend, FiCheck, FiGithub, FiTwitter } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CONTACT_INFO = [
  {
    icon: <FiMail className="w-5 h-5" />,
    label: "Email",
    value: "support@cineportal.com",
    href: "mailto:support@cineportal.com",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <FiTwitter className="w-5 h-5" />,
    label: "Twitter / X",
    value: "@CinePortalHQ",
    href: "#",
    color: "bg-blue-500/10 text-blue-400",
  },
  {
    icon: <FiGithub className="w-5 h-5" />,
    label: "GitHub",
    value: "github.com/cineportal",
    href: "#",
    color: "bg-purple-500/10 text-purple-400",
  },
];

const SUBJECTS = [
  "General Inquiry",
  "Report a Bug",
  "Report Inappropriate Content",
  "Billing / Subscription",
  "Account Issue",
  "Feature Request",
  "Other",
];

export default function ContactClient() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success("Message sent! We'll get back to you within 24 hours.");
    }, 1200);
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FiMessageSquare className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl font-black mb-3">Get in Touch</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Have a question, found a bug, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact info sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-semibold mb-4">Other ways to reach us</h2>
              <div className="space-y-3">
                {CONTACT_INFO.map(({ icon, label, value, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="font-semibold mb-2">Response time</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We typically respond within <strong className="text-foreground">24–48 hours</strong> on
                business days. For urgent issues, mention it in your message and we&apos;ll prioritize.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="font-semibold mb-2">Check our FAQ first</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Many common questions are already answered there.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/faq">View FAQ →</Link>
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-green-500/20 bg-green-500/5">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <FiCheck className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Message sent!</h2>
                <p className="text-muted-foreground mb-6">
                  Thanks for reaching out. We&apos;ll get back to you within 24–48 hours.
                </p>
                <Button variant="outline" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border/50 bg-card p-6 lg:p-8">
                <h2 className="text-lg font-semibold mb-2">Send us a message</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a subject</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Describe your question or issue in detail..."
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  <FiSend className="w-4 h-4" />
                  {loading ? "Sending..." : "Send Message"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form you agree to our{" "}
                  <Link href="/faq#privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
