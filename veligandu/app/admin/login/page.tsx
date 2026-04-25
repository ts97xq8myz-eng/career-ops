"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { getClientAuth }            = await import("@/lib/firebase/client");
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(getClientAuth(), email, password);
      router.push("/admin");
    } catch {
      setError("Invalid credentials. Contact your system administrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-ocean)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-hero)] p-10">
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-[var(--color-gold)] flex items-center justify-center mb-4 shadow-md">
              <span className="font-serif text-lg font-black text-white">R&amp;S</span>
            </div>
            <p className="text-[9px] font-semibold text-[var(--color-ocean-muted)] uppercase tracking-[0.3em]">
              Reservations &amp; Sales
            </p>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-ocean)] mt-1">
              VELIGANDU
            </h1>
            <p className="text-[var(--color-gold)] text-[10px] tracking-[0.3em] uppercase">
              Staff Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@veligandu.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="text-red-600 text-sm text-center bg-red-50 rounded-lg px-4 py-2">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>
        </div>

        {/* Powered by */}
        <p className="text-center text-white/30 text-xs mt-6">
          Powered by{" "}
          <a
            href="https://www.reservationsandsales.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white transition-colors"
          >
            Reservations &amp; Sales
          </a>
        </p>
      </div>
    </div>
  );
}
