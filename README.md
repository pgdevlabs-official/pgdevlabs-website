# PGDevLabs

Production-ready Next.js 15 platform for PGDevLabs — apps directory, projects,
blog, team, admin dashboard, and more.

## Stack

- Next.js 15 (App Router) + TypeScript (strict)
- Tailwind CSS v4
- Framer Motion
- Firebase (Auth, Firestore, Storage) — connected to `kharchamate-cce0d`
- next-themes (dark/light mode)
- lucide-react (icons)

## Pages

Home, Apps (+ detail), Projects (+ detail), Downloads, Blog (+ detail), Team,
About, Contact, Search, Admin, Privacy, Terms, 404 — plus sitemap.xml and
robots.txt for SEO.

## 🔥 Admin panel se Apps/Blog/Projects/Team add karna (step by step)

Is site mein ab ek **Admin panel** hai jaha se bina code touch kiye seedha
form bhar ke apps, blog posts, projects, ya team members add kar sakte ho.
Bas isके liye pehle Firebase ko connect karna hoga (5 minute ka kaam, ek baar
karna hai):

### Step 1: Firebase se apni keys lo

1. https://console.firebase.google.com kholo, `kharchamate-cce0d` project
   kholo (yehi wala jo KharchaMate app use karta hai)
2. Left sidebar mein gear icon → **Project settings**
3. Neeche scroll karo "Your apps" section tak
4. Agar wahan koi **Web app** (</> icon) nahi hai, toh "Add app" pe click
   karo, Web (</>) choose karo, nickname "PGDevLabs" do, register kar do
5. Ab tumhe ek code block dikhega jisme `apiKey`, `messagingSenderId`,
   `appId` jaise values honge — inhe copy kar lo

### Step 2: `.env.local` file banao

Project ke root folder mein `.env.local.example` file hai — usko copy karke
`.env.local` naam se save karo, aur apni real values daal do:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=yahan_apni_apiKey_paste_karo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kharchamate-cce0d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kharchamate-cce0d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kharchamate-cce0d.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=yahan_apna_senderId_paste_karo
NEXT_PUBLIC_FIREBASE_APP_ID=yahan_apna_appId_paste_karo
NEXT_PUBLIC_ADMIN_PASSWORD=apna_khud_ka_password_yahan_daalo
```

### Step 3: Firestore mein collections banane do (automatic)

Kuch karne ki zarurat nahi — jaise hi tum admin panel se pehli baar koi app
add karoge, Firestore mein automatically `apps` collection ban jayegi. Same
`projects`, `blogPosts`, `team` collections ke liye.

**Zaroori:** Firebase Console → Firestore Database → Rules mein jaake dekh lo
ki abhi "test mode" mein hai ya nahi. Test mode mein sabko read/write allowed
hota hai — abhi ke liye theek hai, but live pe jaane se pehle rules ko
production-safe banana:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // sirf logged-in users likh sakein
    }
  }
}
```

### Step 4: APK ka download link kaise banayein (bilkul free, koi card nahi chahiye)

APK file ko seedha admin panel se upload karne ke liye Firebase Storage
chahiye, jo ab **Blaze (paid) plan** maangta hai — chahe use free limit mein
karo. Iske bajaye, APK ko kahin free mein host karo aur uska **link paste**
kar do admin panel mein — bilkul waisa hi kaam karta hai, koi card nahi
chahiye:

**Option A — GitHub Releases (recommended, sabse asaan)**
1. Apna code GitHub pe push karo (agar nahi kiya hai), ya koi bhi khaali
   repo bana lo sirf APKs rakhne ke liye
2. Repo ke andar **"Releases"** section mein jaao → **"Create a new
   release"**
3. Tag likho (jaise `v1.0.0`), title do
4. Neeche **"Attach binaries"** mein apna `.apk` file drag-drop karo
5. **"Publish release"** dabao
6. Uploaded APK pe right-click karke **"Copy link address"** karo — yehi
   link admin panel mein paste karna hai

**Option B — Google Drive**
1. APK ko Google Drive mein upload karo
2. File pe right-click → **"Share"** → **"Anyone with the link"** kar do
3. Link copy karo — is format mein hoga:
   `https://drive.google.com/file/d/FILE_ID/view`
4. Isko is format mein badlo taaki direct download ho (FILE_ID same rakhna):
   `https://drive.google.com/uc?export=download&id=FILE_ID`
5. Yehi final link admin panel mein paste karo

**Option C — Firebase Storage (agar future mein Blaze plan lena chaho)**
Blaze plan free-tier limits ke andar hi free rehta hai (5GB storage, 1GB/day
download) — sirf card verification ke liye maangta hai. Agar baad mein isse
seedha upload karna chaho, batana — us hisaab se admin panel wapas update
kar denge.

### Step 5: Restart karo aur admin panel kholo

```bash
npm run dev
```

Browser mein `http://localhost:3000/admin` kholo. Password wahi dalo jo
`.env.local` mein `NEXT_PUBLIC_ADMIN_PASSWORD` mein daala tha (default:
`demo`).

Ab tumhe 4 tabs dikhenge: **Apps / Projects / Blog / Team** — har tab mein
"Add" button hai, form bharo, "Save" dabao — turant Firestore mein save ho
jayega aur website pe live dikhega. Delete bhi wahin se kar sakte ho (trash
icon).

### Agar "Couldn't reach Firestore" error dikhe

Iska matlab `.env.local` sahi se set nahi hui, ya keys galat hain. Dubara
Step 1-2 check karo. Jab tak keys sahi nahi hoti, website apne aap demo/mock
data dikhati rahegi (site kabhi crash nahi hogi) — bas admin se add/delete
tab tak kaam nahi karega jab tak Firebase connect na ho.

---

## Getting started locally (basic)

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Fonts

This build uses a system-font fallback stack (see `globals.css` and
`layout.tsx`) because the sandbox this was built in has no network access to
Google Fonts. To use the intended fonts (Space Grotesk, Inter, JetBrains Mono):

1. In `src/app/layout.tsx`, add back:
   ```ts
   import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
   ```
2. Initialize each with a CSS variable and add the variable classNames back
   onto `<body>`.
3. In `globals.css`, change the `--font-display` / `--font-sans` / `--font-mono`
   values back to `var(--font-space-grotesk)` etc.

This works out of the box on Vercel or any environment with normal internet
access.

## Deploying live

### Vercel (recommended)
```bash
npm i -g vercel
vercel
```
Vercel dashboard mein Project Settings → Environment Variables mein wahi
`.env.local` wali saari values daal do, taaki live site pe bhi Firebase
connect rahe.

### Netlify
```bash
npm i -g netlify-cli
netlify deploy
```

## Project structure

```
src/
  app/            # routes (App Router)
  components/
    ui/           # primitives: Button, StatusChip, Skeleton, RatingStars...
    layout/       # Navbar, Footer
    shared/       # feature components: AppCard, ReviewsSection, CommandPalette...
    shared/admin/ # AdminAppsPanel, AdminProjectsPanel, AdminBlogPanel, AdminTeamPanel
  lib/
    firebaseConfig.ts   # Firebase init (reads .env.local)
    firestoreService.ts # raw Firestore CRUD functions
    dataService.ts      # Firestore-first, mock-data-fallback wrapper (used by all pages)
    mockData.ts         # fallback/demo data — used until Firestore has real docs
  types/          # shared TypeScript interfaces
  context/        # ThemeProvider
```

## Notes

- Search (`/search` page + Ctrl+K palette) now pulls live data (Firestore, or
  mock fallback). For large datasets, swap in a real search index later
  (Algolia / Typesense) — client-side filtering won't scale past a few
  hundred items.
- Reviews submitted on app detail pages are currently local-state only (not
  persisted to Firestore yet). Ask to have this wired to a `reviews`
  subcollection if needed.
- Contact form currently simulates sending. Wire `ContactForm` to a Firestore
  `messages` collection or an API route + email service.
- `/admin` uses a simple client-side password gate for demo purposes. Before
  a public launch, replace with real Firebase Auth + an admin role check.
- **APK link**: In the Apps tab of `/admin`, paste a direct APK download URL
  when creating an app, or click "+ Version / APK" on an existing app to add
  a new version with its own link. This avoids needing Firebase Storage's
  Blaze plan — host the APK on GitHub Releases or Google Drive instead (see
  setup steps above) and paste the link. If you later enable Firebase
  Storage, this can be swapped for direct in-panel file upload.

