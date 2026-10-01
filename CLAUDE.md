# Trading Doctor Academy — Website Project

## Project Overview
- **Brand:** Trading Doctor Academy (TD Academy)
- **Domain:** tdacademy.net
- **Founder:** Dr. Hussien Tahoun — surgeon, faculty member, and trader
- **Focus:** Arabic-language education for US stock trading (Mark Minervini methodology)
- **Language:** Arabic (RTL), website is fully Arabic
- **Stack:** Static HTML, shared CSS file (`style.css`), no framework, no build system
- **Font:** Cairo (Google Fonts) — all weights 400–900

## Full Autonomy
The user has granted blanket approval for all operations:
- Edit, create, and delete files freely
- Run any shell commands needed
- Make all decisions independently — do not wait for confirmation
- Use subagents for parallel work when beneficial

## Design System

### Design Philosophy
Card-section **glassmorphism** (core identity — keep it):
- Body background: dark green overlay + soft green glow on `hero-bg.webp` texture (fixed on desktop, scroll on mobile)
- Each section is a full-width floating glass card (16px side gutter, 16px gap), `border-radius: var(--radius)` (20px); content inside stays narrow (`.sec-inner`, `.container` = `var(--wrap)` 1200px)
- Glass tokens: `--glass-dark` (navy 0.62), `--glass-light` (white 0.94), `--glass-border`, `--blur` (`blur(18px) saturate(140%)`) — always use the tokens, always add `-webkit-backdrop-filter`
- Dark sections / nav / footer / CTA = `--glass-dark` + `--blur`; light sections = `--glass-light` + `--blur` (text stays readable)
- Glass layer (bottom of `style.css`) on cards, buttons, tags, icon tiles: glossy gradient stroke (`::after` mask, `--stroke-light` / `--stroke-dark`), soft blur (`--glass-soft`), inner shadows, brand-color radial gradients (green top corner, gold bottom corner)
- Sections paint their own texture so inner glass has something to refract: light = white 0.90 over `hero-bg.webp`, dark = navy/green over `hero-bg-blur.webp` (pre-blurred). Sections themselves have NO backdrop-filter (nested backdrop-filters break the inner glass)
- Distortion: inline SVG `#glass-distort` after `<body>` on every public page + script adding `html.gd` (Chromium desktop only); applied to `.card`, `.testimonial`, `.card-dark`, `.community-card` only — keep it limited for performance
- Don't use `::after` on glass components for anything else (it's the stroke)
- Nav: full links ≥1101px, hamburger + CTA buttons 769–1100px, hamburger only ≤768px
- Only clickable cards lift on hover (`a.card`, `.blog-card`); non-clickable cards just change border
- Readability first: body 16px, article text 17px, secondary text min `--g600` on light and white 0.6+ on dark
- Headings use `clamp()` for fluid sizes
- Respect `prefers-reduced-motion`; visible `:focus-visible` outline
- Performance budget: any background image < 300KB WebP, other images < 100KB WebP, no new fonts

### Color Tokens (`:root`)
```css
/* Primary */
--navy: #0A1628;        /* Main dark bg, headings */
--navy-light: #122240;  /* Lighter dark bg */
--navy-mid: #1a3355;    /* Mid-tone dark */

/* Accent */
--green: #10B981;       /* Primary CTA, highlights, active states */
--green-hover: #059669; /* Hover state */
--green-light: #D1FAE5; /* Light bg tags */
--green-dark: #065F46;  /* Dark text on green-light bg */

/* Secondary */
--gold: #D4A853;        /* Special highlights, taglines */

/* Neutrals (Slate scale) */
--g50: #F8FAFC;   --g100: #F1F5F9;  --g200: #E2E8F0;
--g300: #CBD5E1;  --g400: #94A3B8;  --g500: #64748B;
--g600: #475569;  --g700: #334155;  --g800: #1E293B;

--white: #FFFFFF;
```

### Component Patterns
- **Section:** `.sec` (white bg, rounded, shadow) / `.sec-dark` (navy bg) / `.sec-alt` (g50 bg)
- **Cards:** `.card` (white, border g100) / `.card-dark` (transparent, white border 0.08)
- **Tags:** `.sec-tag` (green-light bg, green-dark text) / dark variant (green 0.15 bg, green text)
- **Buttons:** `.btn-primary` (green bg, white text, green shadow) / `.btn-secondary` (transparent, g200 border)
- **Grids:** `.grid-2`, `.grid-3`, `.grid-4` — collapse to 1 column at 768px
- **Timeline:** `.t-item` (horizontal card with tag + title, slides left on hover)
- **Blog cards:** `.blog-card` (image + body, lifts on hover)
- **Testimonials:** right-bordered green card

### Navigation
- Fixed top, 64px height, navy 0.95 bg with blur(14px)
- `.scrolled` class adds shadow on scroll
- Mobile: slides from right, 260px width, overlay
- CTA button: green, rounded 8px
- Active link: green underline below text

### Animations
- `.fade-up` class: `opacity:0; translateY(30px)` → `.visible` removes transform
- Use IntersectionObserver to trigger `.visible` on scroll

### Typography Rules
- Body: Cairo, line-height 1.8, direction RTL
- Section headings: 32px, weight 800, navy (white on dark bg)
- Hero h1: 40px, weight 900, green `<span>` for highlight word
- Body text: 14-15px, g500–g700
- Tags: 11-13px, weight 700, uppercase-equivalent emphasis

### Responsive Breakpoints
- Desktop: default
- Tablet: 769–1024px (grids go 2-col)
- Mobile: ≤768px (1-col, smaller hero, video replaced by poster)
- Small mobile: ≤480px (footer 1-col)
- `overflow-x: hidden` on html to prevent horizontal scroll

## File Structure
```
LOCAL/
├── index.html          # Homepage
├── curriculum.html     # Course curriculum (8 seasons)
├── about.html          # Dr. Hussien bio
├── community.html      # TD Community
├── blog.html           # Blog listing
├── contact.html        # Contact form
├── style.css           # Shared stylesheet
├── blog/               # Blog articles
│   ├── stock-market-basics.html
│   ├── technical-analysis-importance.html
│   └── trading-psychology.html
├── dashboard/          # Student dashboard (login-gated)
│   ├── login.html
│   ├── index.html
│   ├── profile.html
│   ├── community.html
│   ├── admin.html
│   ├── write-article.html
│   ├── dashboard.css
│   └── app.js
├── landing-page/       # Ad landing pages (NOT linked from site)
│   ├── index.html
│   ├── register.html
│   └── welcome.html
├── site/               # Alternate/backup copy of pages
└── TD_Academy_Final/   # Archive/export
```

## File Naming
- Blog posts: `blog/slug.html` (e.g., `blog/trading-psychology.html`)
- Landing pages: `landing-page/purpose.html` (e.g., `landing-page/register.html`)
- Dashboard pages: `dashboard/name.html`
- Images: descriptive kebab-case (e.g., `img-stock-market.jpg`)

## SEO & AEO Rules

### Meta Structure (every page)
```html
<title>Page Title — Trading Doctor Academy</title>
<meta name="description" content="...">
<meta name="keywords" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:type" content="website">
<meta property="og:locale" content="ar_AR">
```

### JSON-LD Schema
- Homepage: `EducationalOrganization` with founder Person
- Blog posts: `Article` or `BlogPosting` with author, datePublished
- Curriculum: `Course` with provider, hasCourseInstance
- About: `Person` with founder details
- FAQ sections: `FAQPage` with `Question`/`Answer`

### Indexing
- Canonical host: `https://www.tdacademy.net` (`.htaccess` redirects http + non-www)
- Every public page: `<link rel="canonical">` with the full www URL
- `dashboard/` and `landing-page/` = `noindex` (meta tag + `X-Robots-Tag` in `.htaccess`)
- New public page or article → add it to `sitemap.xml`
- Never upload `site/`, `TD_Academy_Final/`, `*.zip`, or original heavy `.jpg` backgrounds — use the `.webp` versions

### Blog & Free-vs-Paid Content Rule
We sell courses — the blog must attract, not replace them.
- **Free (blog):** the *what* and *why* — concepts, definitions, common mistakes, market explanations, psychology, general case studies
- **Paid (course):** the *how* as a system — exact entry/exit rules, screener settings, checklists, step-by-step sequencing across seasons, live trade reviews, templates
- Each article fully answers ONE question (no thin teasers — Google penalizes them), then links to the relevant season in `curriculum.html`
- Never publish a complete step-by-step method in one article
- Full cluster map, free/paid split per season, priority list and article template: `content-plan.md` — read it before writing any article

### AEO (Answer Engine Optimization)
- `BreadcrumbList` schema on every page
- FAQ sections with proper `FAQPage` JSON-LD
- Clear H1→H2→H3 hierarchy for AI crawlers
- Cross-linking between related pages
- NAP consistency (contact info)

### SEO Keywords (Arabic)
تداول الأسهم, تعلم التداول, الأسهم الأمريكية, التحليل الفني, منهج تداول عربي, TD Academy, أكاديمية تداول, مارك مينرفيني, التداول للمبتدئين, تعلم البورصة

## Content Rules

### Key Facts
- Dr. Hussien Tahoun: surgeon + faculty member + trader
- Methodology: Mark Minervini's approach
- 8 educational seasons (مواسم تعليمية)
- 100% Arabic content
- Platform: tdacademy.net
- Email: info@tdacademy.net
- WhatsApp: +971 50 956 6797 (WhatsApp IS allowed on this site, unlike VDC)
- Registration: tdacademy.net/register

### Writing Style
- Arabic, modern but professional
- RTL direction throughout
- Use Cairo font exclusively
- Gold color (--gold) for special highlights and taglines
- Green (--green) for CTAs and active elements
- Numbers in English even in Arabic text
- No medical jargon — this is a trading education site
- Tone: authoritative yet approachable, educational

### Landing Pages
- NOT linked from main site navigation
- Accessible only via ad campaign links
- Simpler, conversion-focused design
- Stronger CTAs

## Technical Notes

### Shared CSS
Unlike VDC (inline CSS per page), TD Academy uses a shared `style.css`. All component styles are defined there. Page-specific styles can be added inline if minimal.

### IntersectionObserver
```javascript
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible') });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
```

### Scroll Nav Transition
```javascript
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', scrollY > 50);
});
```

### Card-Section Pattern
Sections are visually separated cards floating on the body background:
```html
<section class="sec text-center">
  <span class="sec-tag">TAG</span>
  <h2>Section Title</h2>
  <p class="sec-sub">Subtitle text</p>
  <!-- content -->
</section>
```

## Communication
- User (Zaid) communicates in Arabic (Levantine dialect) — respond in Arabic
- Keep updates brief
- Full autonomy granted — make decisions independently
