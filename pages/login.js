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

    const signInResult = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInResult.error) {
      setError(signInResult.error.message);
      setLoading(false);
      return;
    }

    const user = signInResult.data.user;

    const profileResult = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profileResult.data) {
      const pendingUsername = router.query.pendingUsername || "";
      await supabase.from("profiles").insert({
        id: user.id,
        username: pendingUsername || "user" + user.id.slice(0, 8),
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
          GETTAP
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
              onChange={function (e) {
                setEmail(e.target.value);
              }}
              className="w-full bg-ink-surface border border-ink-border rounded-card px-3 py-2 outline-none text-sm"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-muted">Password</label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted hover:text-paper underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={function (e) {
                setPassword(e.target.value);
              }}
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