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
  const [copied, setCopied] = useState(false);

  const [qrLabel, setQrLabel] = useState("");
  const [qrFile, setQrFile] = useState(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [qrError, setQrError] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

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

  async function uploadAvatar(e) {
    e.preventDefault();
    setAvatarError("");
    if (!avatarFile) return;

    setUploadingAvatar(true);

    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile);

    if (uploadError) {
      setAvatarError(uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, avatar_url: urlData.publicUrl });
      setAvatarFile(null);
    } else {
      setAvatarError(error.message);
    }

    setUploadingAvatar(false);
  }

  async function addLink(e) {
    e.preventDefault();
    if (!newLabel.trim() || !newUrl.trim()) return;

    if (regularLinks.length >= 3) {
      alert("You can only add up to 3 links. Remove one to add another.");
      return;
    }

    let url = newUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    const { data, error } = await supabase
      .from("links")
      .insert({
        profile_id: profile.id,
        label: newLabel.trim(),
        url,
        type: "link",
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

  async function uploadQr(e) {
    e.preventDefault();
    setQrError("");
    if (!qrLabel.trim() || !qrFile) return;

    if (qrLinks.length >= 1) {
      setQrError("You can only have 1 QR code. Remove the existing one to upload a new one.");
      return;
    }

    setUploadingQr(true);

    const fileExt = qrFile.name.split(".").pop();
    const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("qr-codes")
      .upload(filePath, qrFile);

    if (uploadError) {
      setQrError(uploadError.message);
      setUploadingQr(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("qr-codes")
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from("links")
      .insert({
        profile_id: profile.id,
        label: qrLabel.trim(),
        url: urlData.publicUrl,
        type: "qr",
        image_url: urlData.publicUrl,
        position: links.length,
      })
      .select()
      .single();

    if (!error) {
      setLinks([...links, data]);
      setQrLabel("");
      setQrFile(null);
      e.target.reset();
    } else {
      setQrError(error.message);
    }

    setUploadingQr(false);
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

  const regularLinks = links.filter((l) => l.type !== "qr");
  const qrLinks = links.filter((l) => l.type === "qr");

  const profileUrl =
    typeof window !== "undefined" && profile
      ? `${window.location.origin}/${profile.username}`
      : "";

  async function copyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-4">Profile</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-ink-surface border border-ink-border flex items-center justify-center font-display text-2xl overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                (profile.display_name || profile.username)[0].toUpperCase()
              )}
            </div>
            <form onSubmit={uploadAvatar} className="flex items-center gap-3 flex-wrap">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="text-sm text-muted file:mr-3 file:py-2 file:px-3 file:rounded-card file:border file:border-ink-border file:bg-ink file:text-paper file:text-sm"
              />
              <button
                type="submit"
                disabled={uploadingAvatar || !avatarFile}
                className="bg-brass text-ink px-4 py-2 rounded-card text-sm font-medium hover:brightness-110 disabled:opacity-60"
              >
                {uploadingAvatar ? "Uploading..." : "Upload picture"}
              </button>
            </form>
          </div>
          {avatarError && <p className="text-sm text-red-400 mb-4">{avatarError}</p>}

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

        <section>
          <h2 className="font-display text-2xl mb-4">Links</h2>

          {regularLinks.length >= 3 ? (
            <p className="text-sm text-muted mb-6 bg-ink-surface border border-ink-border rounded-card px-4 py-3">
              You've reached the 3-link limit. Remove a link below to add a new one.
            </p>
          ) : (
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
          )}

          <div className="flex flex-col gap-3">
            {regularLinks.length === 0 && (
              <p className="text-muted text-sm">
                No links yet. Add your first one above.
              </p>
            )}
            {regularLinks.map((link) => {
              const i = links.findIndex((l) => l.id === link.id);
              return (
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
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-2">Payment QR codes</h2>
          <p className="text-muted text-sm mb-4">
            Upload a QR code image (GCash, Maya, bank transfer, etc). It'll
            show as a button on your page &mdash; tapping it pops up the QR
            code so people can scan it.
          </p>

          {qrLinks.length >= 1 ? (
            <p className="text-sm text-muted mb-6 max-w-md bg-ink-surface border border-ink-border rounded-card px-4 py-3">
              You've reached the 1 QR code limit. Remove the existing one below to upload a new one.
            </p>
          ) : (
            <form
              onSubmit={uploadQr}
              className="flex flex-col gap-3 mb-6 max-w-md bg-ink-surface border border-ink-border rounded-card p-4"
            >
              <input
                value={qrLabel}
                onChange={(e) => setQrLabel(e.target.value)}
                placeholder="Label, e.g. GCash"
                className="bg-ink border border-ink-border rounded-card px-3 py-2 text-sm outline-none"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                className="text-sm text-muted file:mr-3 file:py-2 file:px-3 file:rounded-card file:border file:border-ink-border file:bg-ink file:text-paper file:text-sm"
              />
              {qrError && <p className="text-sm text-red-400">{qrError}</p>}
              <button
                type="submit"
                disabled={uploadingQr}
                className="self-start bg-brass text-ink px-4 py-2 rounded-card text-sm font-medium hover:brightness-110 disabled:opacity-60"
              >
                {uploadingQr ? "Uploading..." : "Upload QR code"}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-3">
            {qrLinks.length === 0 && (
              <p className="text-muted text-sm">No QR codes uploaded yet.</p>
            )}
            {qrLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 bg-ink-surface border border-ink-border rounded-card px-4 py-3"
              >
                <img
                  src={link.image_url}
                  alt={link.label}
                  className="w-12 h-12 object-cover rounded-sm border border-ink-border"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{link.label}</div>
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