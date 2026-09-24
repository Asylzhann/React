# Self Promo — React SPA

A single-page self-promotional site built with React + Vite. Includes 6 components
(Header, Hero, AboutMe, Skills, Contact, Footer), a photo, an About Me section, and
safe (non-sensitive) contact info.

## 1. Make it yours

Open `src/App.jsx` and edit the constants at the top:

- `NAME`, `TAGLINE`
- `PHOTO_URL` — replace with your own image. Easiest way: drop a photo into
  `src/assets/` (e.g. `me.jpg`) and change the import:
  ```jsx
  import photo from './assets/me.jpg'
  // then use photo instead of PHOTO_URL in <Hero photoUrl={photo} ... />
  ```
- `ABOUT_PARAGRAPHS`, `FACTS` — your About Me content
- `SKILLS` — your tools/skills list
- `CONTACT_ITEMS` — **no phone numbers or home addresses.** Use things like your
  GitHub, Instagram, a project email, or something fun like "Address: Planet Earth".

Colors/fonts live in `src/index.css` (`:root` variables) if you want to restyle.

## 2. Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

## 4. Deploy to GitHub Pages

1. In `vite.config.js`, set `base` to match your repo name exactly:
   ```js
   base: '/YOUR-REPO-NAME/',
   ```
2. Install the deploy helper (already in devDependencies, just make sure it's installed):
   ```bash
   npm install
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```
   This builds the app and pushes the `dist` folder to a `gh-pages` branch.
4. On GitHub: go to **Settings → Pages**, set **Source** to the `gh-pages` branch
   (root), and save. Your site will be live at:
   ```
   https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
   ```
   (may take a minute or two to go live)

## 5. Submission checklist

- [ ] GitHub repository link
- [ ] Deployed GitHub Pages link
- [ ] Screenshot of the app running in the browser
- [ ] Turn it in before the deadline (Sept 24, 2026 3:00 PM)
