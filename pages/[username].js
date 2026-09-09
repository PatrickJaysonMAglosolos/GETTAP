import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export async function getServerSideProps({ params }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username.toLowerCase())
    .maybeSingle();

  if (!profile) {
    return { notFound: true };
  }

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("profile_id", profile.id)
    .order("position", { ascending: true });

  return { props: { profile, links: links || [] } };
}

export default function PublicProfile({ profile, links }) {
  const [openQr, setOpenQr] = useState(null);

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-16 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/nfc-background.png')" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-ink-surface border border-ink-border flex items-center justify-center font-display text-2xl mb-5 overflow-hidden">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              className="w-full h-full object-cover"
            />
          ) : (
            (profile.display_name || profile.username)[0].toUpperCase()
          )}
        </div>
        <h1 className="font-display text-2xl mb-1">
          {profile.display_name || profile.username}
        </h1>
        <p className="text-muted text-sm mb-1">@{profile.username}</p>
        {profile.bio && (
          <p className="text-muted text-sm mt-3 max-w-xs">{profile.bio}</p>
        )}

        <div className="w-full flex flex-col gap-3 mt-10">
          {links.length === 0 && (
            <p className="text-muted text-sm">No links added yet.</p>
          )}
          {links.map((link) => {
            if (link.type === "qr") {
              return (
                <button
                  key={link.id}
                  onClick={() => setOpenQr(link)}
                  className="bg-ink-surface/30 border border-ink-border rounded-card py-3 px-5 text-sm font-medium hover:border-brass transition-colors"
                >
                  {link.label}
                </button>
              );
            }
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-ink-surface/30 border border-ink-border rounded-card py-3 px-5 text-sm font-medium hover:border-brass transition-colors"
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <p className="text-xs text-muted mt-16">
          Made with{" "}
          <a href="/" className="underline">
            GETTAP
          </a>
        </p>
      </div>

      {openQr && (
        <div
          onClick={() => setOpenQr(null)}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-6 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-ink-surface border border-ink-border rounded-card p-5 max-w-xs w-full flex flex-col items-center gap-4"
          >
            <div className="font-display text-lg">{openQr.label}</div>
            <img
              src={openQr.image_url}
              alt={openQr.label}
              className="w-full rounded-sm border border-ink-border"
            />
            <button
              onClick={() => setOpenQr(null)}
              className="text-sm text-muted hover:text-paper"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}