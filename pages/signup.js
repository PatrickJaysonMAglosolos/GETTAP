import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,20}$/.test(cleanUsername)) {
      setError(
        "Username must be 3-20 characters: lowercase letters, numbers, - or _"
      );
      return;
    }

    setLoading(true);

    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (existing) {
      setError("That username is already taken.");
      setLoading(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      { email, password }
    );

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const user = signUpData.user;

    if (!signUpData.session) {
      // Email confirmation is required — the profile gets created on first
      // login instead, since we don't have a session yet.
      setLoading(false);
      router.push(
        `/login?justSignedUp=1&pendingUsername=${cleanUsername}`
      );
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      username: cleanUsername,
      display_name: cleanUsername,
    });

    setLoading(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg">
          Tapcard
        </Link>
        <h1 className="font-display text-3xl mt-6 mb-8">Create your page</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-muted block mb-1">Username</label>
            <div className="flex items-center border border-ink-border rounded-card overflow-hidden bg-ink-surface">
              <span className="pl-3 text-muted text-sm">tapcard.co/</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent px-2 py-2 flex-1 outline-none text-sm"
                placeholder="yourname"
                required
              />
            </div>
          </div>

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
              minLength={6}
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
            {loading ? "Creating..." : "Create page"}
          </button>
        </form>

        <p className="text-sm text-muted mt-6">
          Already have a page?{" "}
          <Link href="/login" className="text-paper underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
