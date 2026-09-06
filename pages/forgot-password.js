import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? window.location.origin + "/reset-password"
        : undefined;

    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setStatus("Check your email for a link to reset your password.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg">
          GETTAP
        </Link>
        <h1 className="font-display text-3xl mt-6 mb-2">
          Reset your password
        </h1>
        <p className="text-sm text-muted mb-6">
          Enter the email you signed up with and we will send you a link to
          set a new password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          {error && <p className="text-sm text-red-400">{error}</p>}
          {status && <p className="text-sm text-teal">{status}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-brass text-ink rounded-card py-2.5 font-medium mt-2 hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="text-sm text-muted mt-6">
          <Link href="/login" className="text-paper underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}