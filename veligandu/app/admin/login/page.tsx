"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(getClientAuth(), email, password);
      router.push("/admin");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-ocean)] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-[var(--shadow-hero)] p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-serif text-2xl font-bold text-[var(--color-ocean)] block">VELIGANDU</span>
          <span className="text-[var(--color-gold)] text-xs tracking-[0.3em] uppercase">Admin Portal</span>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
