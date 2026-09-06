import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(function () {
    supabase.auth.getSession().then(function (result) {
      setReady(true);
      if (!result.data.session) {
        setError(
          "This reset link is invalid or has expired. Please request a new one."
        );
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const result = await supabase.auth.updateUser({ password: password });
    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setDone(true);
    setTimeout(function () {
      router.push("/login");
    }, 2000);
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg">
          GETTAP
        </Link>
        <h1 className="font-display text-3xl mt-6 mb-6">
          Set a new password
        </h1>

        {done ? (
          <p className="text-sm text-teal">
            Password updated. Redirecting you to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-muted block mb-1">
                New password
              </label>
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
            <div>
              <label className="text-sm text-muted block mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={function (e) {
                  setConfirmPassword(e.target.value);
                }}
                className="w-full bg-ink-surface border border-ink-border rounded-card px-3 py-2 outline-none text-sm"
                required
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="bg-brass text-ink rounded-card py-2.5 font-medium mt-2 hover:brightness-110 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}