import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email, password }
    );

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const pendingUsername = router.query.pendingUsername || "";
      await supabase.from("profiles").insert({
        id: user.id,
        username:
          pendingUsername || `user${user.id.slice(0, 8)}`,
        display_name: pendingUsername || "New user",
      });
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg">
          Tapcard
        </Link>
        <h1 className="font-display text-3xl mt-6 mb-2">Welcome back</h1>

        {router.query.justSignedUp && (
          <p className="text-sm text-teal mb-6">
            Check your email to confirm your account, then log in below.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <div>
            <label className="text-sm text-muted block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ink-surface border border-ink-border rounded-card px-3 py-2 outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ink-surface border border-ink-border rounded-card px-3 py-2 outline-none text-sm"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-brass text-ink rounded-card py-2.5 font-medium mt-2 hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm text-muted mt-6">
          No page yet?{" "}
          <Link href="/signup" className="text-paper underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
