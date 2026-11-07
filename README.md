# Diwali Greeting

A shareable Diwali greeting site with personalized messages, optional voice notes, fireworks, ambient audio, and WhatsApp sharing.

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). Local greetings are stored in `greetings.db` and uploaded voice notes are stored in `uploads/`.

## GitHub Pages

The repository includes a GitHub Actions workflow that publishes the static frontend from `public/` to GitHub Pages on every push to `main`.

GitHub Pages is static hosting, so it serves the interface and client-side effects but cannot run the included greeting API or store voice uploads. For fully functional shareable links and voice notes, run the included Node server or deploy the Netlify Functions backend described below.

## Deploy to Netlify

The project is configured for Netlify Functions and Netlify Blobs:

```bash
npm install
npx netlify dev
```

Set up Netlify Blobs for the site before publishing so the `greetings` and `audio` stores are available. The production build publishes `public/`, while `netlify/functions/` provides the greeting and audio endpoints.

## Main fixes in this version

- Added the missing `start`/`dev` scripts.
- Added the Express, Multer, and SQLite dependencies required by the included local server.
- Upgraded the local upload handler to Multer 2.
- Added `public/manus-routes.json` for the home and shareable greeting routes.
- Added a committed `package-lock.json` for reproducible installs.
- Added a GitHub Pages deployment workflow for the static frontend.
