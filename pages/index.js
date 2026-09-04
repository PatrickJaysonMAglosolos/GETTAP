import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="max-w-5xl mx-auto w-full px-6 py-8 flex items-center justify-between">
        <span className="font-display text-lg tracking-tight">GETTAP</span>
        <nav className="flex gap-6 text-sm text-muted">
          <Link href="/login" className="hover:text-paper">
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-ink bg-brass px-4 py-1.5 rounded-card hover:brightness-110"
          >
            Create your page
          </Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto w-full px-6 flex-1 grid md:grid-cols-2 gap-16 items-center py-16">
        <div>
          <h1 className="font-display text-5xl leading-[1.1] mb-6">
            One tap. Every link you own.
          </h1>
          <p className="text-muted text-lg max-w-md mb-8">
            Program a physical card with your Tapcard page. Hand it to
            someone, they tap their phone against it, and every social link
            you have opens instantly &mdash; no typing, no searching.
          </p>
          <div className="flex gap-4">
            <Link
              href="/signup"
              className="bg-brass text-ink px-6 py-3 rounded-card font-medium hover:brightness-110"
            >
              Build your page
            </Link>
            <Link
              href="/login"
              className="border border-ink-border px-6 py-3 rounded-card text-paper hover:border-muted"
            >
              I already have one
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center h-80">
          <div className="tap-ring w-40 h-40" />
          <div className="tap-ring tap-ring-delay w-40 h-40" />
          <div className="tap-ring tap-ring-delay-2 w-40 h-40" />
          <div className="relative w-56 h-36 bg-ink-surface border border-ink-border rounded-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] p-5 flex flex-col justify-between rotate-[-6deg]">
            <div className="w-8 h-6 rounded-sm bg-brass/80" />
            <div>
              <div className="font-display text-base">@yourname</div>
              <div className="text-xs text-muted mt-1">GETTAP.co/yourname</div>
            </div>
          </div>
        </div>
      </main>

      <section className="border-t border-ink-border">
        <div className="max-w-5xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-10">
          <div>
            <div className="font-display text-xl mb-2">Make your page</div>
            <p className="text-muted text-sm">
              Sign up, pick a username, and add every link you want people to
              find &mdash; Instagram, X, a shop, a portfolio, anything.
            </p>
          </div>
          <div>
            <div className="font-display text-xl mb-2">Program the card</div>
            <p className="text-muted text-sm">
              From your dashboard, write your page's link straight to an NFC
              card or sticker using your phone. No coding involved.
            </p>
          </div>
          <div>
            <div className="font-display text-xl mb-2">Hand it over</div>
            <p className="text-muted text-sm">
              Anyone taps their phone to your card and your page opens in
              their browser, right away.
            </p>
          </div>
        </div>
      </section>

      <footer className="max-w-5xl mx-auto w-full px-6 py-8 text-xs text-muted">
        Built with Next.js and Supabase.
      </footer>
    </div>
  );
}
