import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [nfcStatus, setNfcStatus] = useState("");
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async (userId) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
      setDisplayName(profileData.display_name || "");
      setBio(profileData.bio || "");
    }

    const { data: linksData } = await supabase
      .from("links")
      .select("*")
      .eq("profile_id", userId)
      .order("position", { ascending: true });

    setLinks(linksData || []);
  }, []);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
        return;
      }
      await loadData(data.session.user.id);
      setLoadingAuth(false);
    }
    init();
  }, [router, loadData]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ display_name: displayName, bio })
      .eq("id", profile.id);
    setSaving(false);
  }

  async function addLink(e) {
    e.preventDefault();
    if (!newLabel.trim() || !newUrl.trim()) return;

    let url = newUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    const { data, error } = await supabase
      .from("links")
      .insert({
        profile_id: profile.id,
        label: newLabel.trim(),
        url,
        position: links.length,
      })
      .select()
      .single();

    if (!error) {
      setLinks([...links, data]);
      setNewLabel("");
      setNewUrl("");
    }
  }

  async function deleteLink(id) {
    await supabase.from("links").delete().eq("id", id);
    setLinks(links.filter((l) => l.id !== id));
  }

  async function moveLink(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= links.length) return;

    const updated = [...links];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setLinks(updated);

    await Promise.all(
      updated.map((l, i) =>
        supabase.from("links").update({ position: i }).eq("id", l.id)
      )
    );
  }

  const profileUrl =
    typeof window !== "undefined" && profile
      ? `${window.location.origin}/${profile.username}`
      : "";

  async function copyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function writeNfcTag() {
    if (!("NDEFReader" in window)) {
      setNfcStatus(
        "Web NFC isn't supported here. Use Chrome on Android, or write the tag with the free NFC Tools app instead."
      );
      return;
    }
    try {
      setNfcStatus("Hold an NFC tag against the back of your phone...");
      const ndef = new window.NDEFReader();
      await ndef.write({ records: [{ recordType: "url", data: profileUrl }] });
      setNfcStatus("Tag written. Tap it with any phone to test it.");
    } catch (err) {
      setNfcStatus("Couldn't write the tag: " + err.message);
    }
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="font-display text-lg">
          Tapcard
        </Link>
        <button onClick={handleSignOut} className="text-sm text-muted hover:text-paper">
          Sign out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-24 flex flex-col gap-10">
        {/* Your card link + NFC */}
        <section className="bg-ink-surface border border-ink-border rounded-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm text-muted mb-1">Your page</div>
              <div className="font-display text-xl">{profileUrl}</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="border border-ink-border px-4 py-2 rounded-card text-sm hover:border-muted"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
              <button
                onClick={writeNfcTag}
                className="bg-brass text-ink px-4 py-2 rounded-card text-sm font-medium hover:brightness-110"
              >
                Write NFC tag
              </button>
            </div>
          </div>
          {nfcStatus && (
            <p className="text-sm text-teal mt-4">{nfcStatus}</p>
          )}
          {profileUrl && (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                profileUrl
              )}`}
              alt="QR code for your page"
              className="mt-5 rounded-sm border border-ink-border"
              width={140}
              height={140}
            />
          )}
        </section>

        {/* Profile info */}
        <section>
          <h2 className="font-display text-2xl mb-4">Profile</h2>
          <form onSubmit={saveProfile} className="flex flex-col gap-4 max-w-md">
            <div>
              <label className="text-sm text-muted block mb-1">
                Display name
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-ink-surface border border-ink-border rounded-card px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-muted block mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-ink-surface border border-ink-border rounded-card px-3 py-2 text-sm outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="self-start bg-brass text-ink px-5 py-2 rounded-card text-sm font-medium hover:brightness-110 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </section>

        {/* Links */}
        <section>
          <h2 className="font-display text-2xl mb-4">Links</h2>

          <form onSubmit={addLink} className="flex gap-3 mb-6 flex-wrap">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label, e.g. Instagram"
              className="flex-1 min-w-[140px] bg-ink-surface border border-ink-border rounded-card px-3 py-2 text-sm outline-none"
            />
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 min-w-[180px] bg-ink-surface border border-ink-border rounded-card px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="border border-ink-border px-4 py-2 rounded-card text-sm hover:border-muted"
            >
              Add
            </button>
          </form>

          <div className="flex flex-col gap-3">
            {links.length === 0 && (
              <p className="text-muted text-sm">
                No links yet. Add your first one above.
              </p>
            )}
            {links.map((link, i) => (
              <div
                key={link.id}
                className="flex items-center gap-3 bg-ink-surface border border-ink-border rounded-card px-4 py-3"
              >
                <div className="flex flex-col">
                  <button
                    onClick={() => moveLink(i, -1)}
                    disabled={i === 0}
                    className="text-muted disabled:opacity-30 text-xs leading-none"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveLink(i, 1)}
                    disabled={i === links.length - 1}
                    className="text-muted disabled:opacity-30 text-xs leading-none"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{link.label}</div>
                  <div className="text-xs text-muted truncate">{link.url}</div>
                </div>
                <button
                  onClick={() => deleteLink(link.id)}
                  className="text-sm text-muted hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
