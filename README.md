# Tapcard

A Linktree-style app where each user's page can be opened by tapping an NFC
card programmed with their profile URL.

Stack: **Next.js (JavaScript)** + **Supabase** (auth + database) + **Tailwind CSS**.

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com), create a free project.
2. In **Project Settings > API**, copy the **Project URL** and the
   **anon public key**.
3. In **Authentication > Providers**, make sure Email is enabled.
   - For the fastest setup, also go to **Authentication > Email** and turn
     **off** "Confirm email" so new users are logged in immediately after
     signup. If you leave it on, users confirm via email first, then their
     profile is created the first time they log in.
4. Go to **SQL Editor > New query**, paste the entire contents of
   `supabase/schema.sql` from this project, and click **Run**. This creates
   the `profiles` and `links` tables plus the security rules that keep users
   editing only their own data.

## 2. Run it locally

```bash
npm install
cp .env.local.example .env.local
```

Edit `.env.local` and paste in your Supabase URL and anon key from step 1.

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 3. Deploy it live

The easiest path is **Vercel** (made by the Next.js team, free tier is fine):

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) > New Project > import the repo.
3. In the project's **Environment Variables** settings, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. You'll get a live URL like `tapcard.vercel.app`.
5. Optional: attach a custom domain under **Project > Settings > Domains**.

## 4. Programming an NFC card

Each user has a "Write NFC tag" button on their dashboard. It uses the
**Web NFC API**, which only works in **Chrome on Android**, held close to a
blank NFC tag/card (NTAG213/215/216 cards work well and are cheap online).

If you or your users are on iPhone, or want a phone-app alternative:

1. Buy blank NFC cards/stickers (search "NTAG213 NFC card").
2. Install the free **NFC Tools** app (iOS or Android).
3. In the app: **Write > Add a record > URL/URI**, enter
   `https://yourdomain.com/theirusername`, then hold the phone against the
   card to write it.
4. Tapping the card with any modern phone will now open that profile page.

A QR code of the profile link is also shown on the dashboard as a fallback
for anyone without NFC.

## Project structure

```
pages/
  index.js        landing page
  signup.js        create account + choose username
  login.js         log in
  dashboard.js     edit profile, manage links, write NFC tag, QR code
  [username].js    public profile page (server-rendered)
lib/
  supabaseClient.js
supabase/
  schema.sql       tables + row-level security policies
```

## Notes

- Usernames are lowercase letters, numbers, `-` and `_`, 3-20 characters.
- Row-level security means anyone can *view* profiles/links (needed for
  public pages) but only the owner can create/edit/delete their own.
- Styling is plain Tailwind, no extra UI library, so it's easy to reskin in
  `tailwind.config.js` and `styles/globals.css`.
