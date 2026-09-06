import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [showCard, setShowCard] = useState(false);

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
          <button
            type="button"
            onClick={function () {
              setShowCard(true);
            }}
            className="cursor-zoom-in"
          >
            <img
              src="/card.png"
              alt="GETTAP card"
              className="relative w-64 rounded-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] rotate-[-6deg] hover:brightness-110 transition"
            />
          </button>
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

      {showCard && (
        <div
          onClick={function () {
            setShowCard(false);
          }}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-6 z-50"
        >
          <div
            onClick={function (e) {
              e.stopPropagation();
            }}
            className="max-w-md w-full flex flex-col items-center gap-4"
          >
            <img
              src="/card.png"
              alt="GETTAP card"
              className="w-full rounded-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
            />
            <button
              type="button"
              onClick={function () {
                setShowCard(false);
              }}
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
