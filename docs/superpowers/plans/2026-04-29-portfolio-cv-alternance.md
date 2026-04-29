# Portfolio CV Alternance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the static GitHub Pages portfolio so it matches the latest alternance CV, highlights Edifig, splits experience and education, and exposes the CV as a downloadable PDF.

**Architecture:** Keep the existing static architecture: `index.html`, `styles.css`, and the existing JavaScript modules. Add the CV as a static asset and add one lightweight Node verification script so the portfolio content can be checked without a build system.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript modules, Font Awesome, Matter.js, Node.js for verification.

---

## File Structure

- Modify `index.html`: update metadata, navigation, ID card labels, hero, projects, experiences, formation, skills, contact, and footer year/copy.
- Modify `styles.css`: add small responsive/polish rules for the hero availability line, 3-button CTA row, private-project state, timeline split, and mobile navigation spacing.
- Create `assets/cv-thibaud-thomas-lamotte-alternance.pdf`: clean public filename copied from `C:\Users\tthomaslamotte-ext\OneDrive - Groupe Figaro\Downloads\cv_alternance (2).pdf`.
- Create `tools/check-portfolio-content.mjs`: Node verification script using built-in modules only.
- Do not modify `js/backgrounds.js`, `js/physics.js`, `js/main.js`, or `js/ui.js` unless manual testing reveals a regression.

---

### Task 1: Add Content Verification Script and CV Asset

**Files:**
- Create: `tools/check-portfolio-content.mjs`
- Create: `assets/cv-thibaud-thomas-lamotte-alternance.pdf`

- [ ] **Step 1: Create the verification script**

Create `tools/check-portfolio-content.mjs` with this exact content:

```js
import { existsSync, readFileSync, statSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const cvPath = 'assets/cv-thibaud-thomas-lamotte-alternance.pdf';

const requiredText = [
  'L3 MIAGE - Université Paris Nanterre',
  'Développeur en devenir, orienté logiciel, SI et besoins métier',
  'alternance de 24 mois en Master MIAGE',
  'Rythmes possibles : 3 sem. / 3 sem. ou 3 j. / 2 j.',
  'Télécharger mon CV',
  'Edifig',
  'Stagiaire Développeur - DSI',
  'Société du Figaro',
  'Licence MIASHS parcours MIAGE',
  'Supabase/PostgreSQL',
];

const requiredLinks = [
  'href="#experiences"',
  'href="#formation"',
  `href="${cvPath}"`,
  'download',
  'href="https://github.com/Tibxla/PGI-Automobile"',
  'href="https://github.com/Tibxla/FolioVision"',
  'href="https://github.com/Tibxla/FileRenamer"',
  'href="https://github.com/Tibxla/SteganoPY"',
  'href="https://github.com/Tibxla/Maze-game"',
  'href="https://github.com/selmabayb/projetwebl3"',
];

const forbiddenText = [
  'stage en informatique de au moins 8 semaines',
  'mars 2026',
  'Futur Expert FinTech',
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const text of requiredText) {
  assert(html.includes(text), `Missing required text: ${text}`);
}

for (const link of requiredLinks) {
  assert(html.includes(link), `Missing required link/attribute: ${link}`);
}

for (const text of forbiddenText) {
  assert(!html.includes(text), `Forbidden stale/private text found: ${text}`);
}

assert(existsSync(cvPath), `Missing CV asset at ${cvPath}`);
assert(statSync(cvPath).size > 100_000, 'CV asset is unexpectedly small');
assert(readFileSync(cvPath).subarray(0, 5).toString() === '%PDF-', 'CV asset is not a PDF');

const cvDownloadLinkPattern = new RegExp(`<a\\b[^>]*href="${cvPath}"[^>]*\\bdownload\\b`, 's');
assert(cvDownloadLinkPattern.test(html), 'CV link must point to the PDF and include download');

const edifigCard = html.match(/<article\b[^>]*>[\s\S]*?<h3>Edifig<\/h3>[\s\S]*?<\/article>/);
assert(edifigCard, 'Missing Edifig project card');
assert(!/href\s*=\s*["'][^"']*github/i.test(edifigCard[0]), 'Edifig card must not link to GitHub');

console.log('Portfolio content checks passed.');
```

- [ ] **Step 2: Run the script and verify it fails on the current page**

Run:

```powershell
node tools/check-portfolio-content.mjs
```

Expected: `Error: Missing required text: L3 MIAGE - Université Paris Nanterre`

- [ ] **Step 3: Add the CV asset**

Run:

```powershell
New-Item -ItemType Directory -Force -Path assets
Copy-Item -LiteralPath 'C:\Users\tthomaslamotte-ext\OneDrive - Groupe Figaro\Downloads\cv_alternance (2).pdf' -Destination 'assets\cv-thibaud-thomas-lamotte-alternance.pdf' -Force
```

Expected: `assets/cv-thibaud-thomas-lamotte-alternance.pdf` exists and is larger than 100 KB.

- [ ] **Step 4: Commit the verification script and CV asset**

Run:

```powershell
git add tools/check-portfolio-content.mjs assets/cv-thibaud-thomas-lamotte-alternance.pdf
git commit -m "test: add portfolio content checks and cv asset"
```

Expected: commit succeeds.

---

### Task 2: Update Head, Navigation, ID Card, and Hero

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the page title and meta description**

In `index.html`, replace the current `<title>` and `<meta name="description">` with:

```html
<title>Thibaud Thomas-Lamotte | L3 MIAGE - Alternance Master MIAGE</title>
<meta name="description"
    content="Portfolio de Thibaud Thomas-Lamotte, étudiant L3 MIAGE à l'Université Paris Nanterre, en recherche d'une alternance de 24 mois en Master MIAGE dès septembre 2026.">
```

- [ ] **Step 2: Update the ID card text**

In the front ID card, set:

```html
<span class="card-role">MIAGE ACCESS</span>
<span class="id-number">ALT: 24 MOIS</span>
```

Set the status pill to:

```html
<div class="status-pill"><span class="status-dot"></span>Disponible sept. 2026</div>
```

In the back ID card, replace the current novelty text with:

```html
<p style="color: #10b981;">> Master MIAGE / Ingénierie Logicielle / IA</p>
<p>Rythmes: 3 sem. / 3 sem. ou 3 j. / 2 j.</p>
```

- [ ] **Step 3: Update the navigation links**

Replace the `.nav-links` content with:

```html
<a href="#hero" class="active">Accueil</a>
<a href="#projets">Projets</a>
<a href="#experiences">Expériences</a>
<a href="#formation">Formation</a>
<a href="#competences">Skills</a>
<a href="#contact" class="btn-contact">Contact</a>
```

- [ ] **Step 4: Replace the hero content**

Replace the hero tagline, heading, description, and CTA block with:

```html
<span class="tagline">L3 MIAGE - Université Paris Nanterre</span>
<h1 class="glitch-effect" data-text="Développeur SI & Logiciel">Développeur <br> <span
        class="text-gradient">SI & Logiciel</span></h1>
<p class="hero-desc">
    Développeur en devenir, orienté logiciel, SI et besoins métier. <br>
    Actuellement stagiaire développeur à la DSI du Figaro, je recherche une alternance de 24 mois
    en Master MIAGE à partir de septembre 2026.
</p>
<p class="hero-availability">Rythmes possibles : 3 sem. / 3 sem. ou 3 j. / 2 j.</p>
<div class="hero-cta">
    <a href="#projets" class="btn btn-primary">Voir mes projets <i class="fas fa-arrow-right"></i></a>
    <a href="#contact" class="btn btn-secondary"><i class="fas fa-paper-plane"></i> Me contacter</a>
    <a href="assets/cv-thibaud-thomas-lamotte-alternance.pdf" download
        class="btn btn-secondary"><i class="fas fa-file-arrow-down"></i> Télécharger mon CV</a>
</div>
```

- [ ] **Step 5: Run the content check and confirm it still fails only on later sections**

Run:

```powershell
node tools/check-portfolio-content.mjs
```

Expected: it no longer fails on the MIAGE/alternance hero text. It should fail on a later missing item such as `Edifig`, `Stagiaire Développeur - DSI`, or `Société du Figaro`.

- [ ] **Step 6: Commit the head/navigation/hero update**

Run:

```powershell
git add index.html
git commit -m "feat: update portfolio hero for alternance search"
```

Expected: commit succeeds.

---

### Task 3: Rebuild the Project Cards

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the project section heading**

Use:

```html
<h2 class="section-title">Projets informatiques <span class="line"></span></h2>
```

- [ ] **Step 2: Replace all project cards inside `.projects-grid`**

Replace the entire `.projects-grid` contents with:

```html
<article class="project-card featured private-project" data-tilt>
    <div class="project-content">
        <div class="project-header">
            <span class="project-category">Stage DSI & Outil interne</span>
            <h3>Edifig</h3>
        </div>
        <p>Projet réalisé dans le cadre de mon stage à la DSI du Figaro : outil web interne pour composer
            visuellement un chemin de fer magazine et générer automatiquement le XML de production.</p>
        <div class="tech-stack">
            <span>Next.js</span><span>TypeScript</span><span>Supabase</span><span>PostgreSQL</span><span>XML</span><span>Vercel</span>
        </div>
        <p class="project-note"><i class="fas fa-lock"></i> Dépôt privé - présentation publique limitée au périmètre fonctionnel.</p>
    </div>
    <div class="project-visual">
        <div class="visual-placeholder edifig-gradient">
            <i class="fas fa-newspaper"></i>
        </div>
    </div>
</article>

<article class="project-card" data-tilt>
    <div class="project-content">
        <div class="project-header">
            <span class="project-category">Systèmes d'information</span>
            <h3>PGI Automobile</h3>
        </div>
        <p>Système de gestion intégré pour concession automobile : véhicules, ventes, clients, RH et reporting statistique.</p>
        <div class="tech-stack">
            <span>PHP</span><span>MySQL</span><span>HTML/CSS</span><span>JavaScript</span>
        </div>
        <a href="https://github.com/Tibxla/PGI-Automobile" target="_blank" class="icon-link"
            aria-label="GitHub PGI Automobile"><i class="fab fa-github"></i></a>
    </div>
</article>

<article class="project-card" data-tilt>
    <div class="project-content">
        <div class="project-header">
            <span class="project-category">Finance & Web</span>
            <h3>Suivi de Portefeuille</h3>
        </div>
        <p>Gestion de portefeuilles financiers avec tableau de bord dynamique, suivi en temps réel et visualisation de données.</p>
        <div class="tech-stack">
            <span>PHP</span><span>MySQL</span><span>HTML/CSS</span><span>JavaScript</span>
        </div>
        <a href="https://github.com/Tibxla/FolioVision" target="_blank" class="icon-link"
            aria-label="GitHub Suivi de Portefeuille"><i class="fab fa-github"></i></a>
    </div>
</article>

<article class="project-card" data-tilt>
    <div class="project-content">
        <div class="project-header">
            <span class="project-category">Productivité Desktop</span>
            <h3>FileRenamer</h3>
        </div>
        <p>Application de bureau pour le renommage en masse de fichiers et la génération de PDFs, avec interface moderne.</p>
        <div class="tech-stack">
            <span>C++</span><span>Qt</span><span>Desktop</span>
        </div>
        <a href="https://github.com/Tibxla/FileRenamer" target="_blank" class="icon-link"
            aria-label="GitHub FileRenamer"><i class="fab fa-github"></i></a>
    </div>
</article>

<article class="project-card" data-tilt>
    <div class="project-content">
        <div class="project-header">
            <span class="project-category">Cybersécurité</span>
            <h3>Stéganographie Web</h3>
        </div>
        <p>Application web d'encodage et décodage de fichiers dans des images via la méthode LSB, avec traitement Flask/Python.</p>
        <div class="tech-stack">
            <span>Python</span><span>Flask</span><span>LSB</span>
        </div>
        <a href="https://github.com/Tibxla/SteganoPY" target="_blank" class="icon-link"
            aria-label="GitHub Stéganographie Web"><i class="fab fa-github"></i></a>
    </div>
</article>

<article class="project-card" data-tilt>
    <div class="project-content">
        <div class="project-header">
            <span class="project-category">IA & Jeux</span>
            <h3>Minotaur Maze Game</h3>
        </div>
        <p>Jeu avec labyrinthe généré aléatoirement, génération procédurale et algorithmes de pathfinding BFS/A*.</p>
        <div class="tech-stack">
            <span>Python</span><span>Pygame</span><span>NetworkX</span>
        </div>
        <a href="https://github.com/Tibxla/Maze-game" target="_blank" class="icon-link"
            aria-label="GitHub Minotaur Maze Game"><i class="fab fa-github"></i></a>
    </div>
</article>

<article class="project-card" data-tilt>
    <div class="project-content">
        <div class="project-header">
            <span class="project-category">Développement Fullstack</span>
            <h3>Projet Web L3</h3>
        </div>
        <p>Application web réalisée en équipe avec gestion d'utilisateurs, base de données et interface responsive.</p>
        <div class="tech-stack">
            <span>HTML/CSS</span><span>PHP</span><span>MySQL</span><span>JavaScript</span>
        </div>
        <a href="https://github.com/selmabayb/projetwebl3" target="_blank" class="icon-link"
            aria-label="GitHub Projet Web L3"><i class="fab fa-github"></i></a>
    </div>
</article>
```

- [ ] **Step 3: Run the content check and confirm project checks pass**

Run:

```powershell
node tools/check-portfolio-content.mjs
```

Expected: no failure for `Edifig`, no GitHub link inside the Edifig card, and remaining failures only for experiences/formation/skills/contact.

- [ ] **Step 4: Commit the project section**

Run:

```powershell
git add index.html
git commit -m "feat: add edifig and refresh portfolio projects"
```

Expected: commit succeeds.

---

### Task 4: Split Experiences and Formation, Refresh Skills and Contact

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the combined timeline with an experiences section**

Replace the current `<section id="experiences" ...>` block with:

```html
<section id="experiences" class="section experiences-section">
    <div class="container">
        <h2 class="section-title">Expériences <span class="line"></span></h2>

        <div class="timeline">
            <div class="timeline-item left">
                <div class="timeline-content">
                    <span class="date">Avr. 2026 - Mai 2026</span>
                    <h3>Stagiaire Développeur - DSI</h3>
                    <h4>Société du Figaro, Paris</h4>
                    <p>Développement d'un portail de saisie du chemin de fer éditorial alimentant une interface web de suivi de production avec historisation.</p>
                    <p>Analyse de l'expression de besoin, conception du modèle de données, validation avec les équipes métier et itérations selon les retours utilisateurs.</p>
                </div>
            </div>
            <div class="timeline-item right">
                <div class="timeline-content">
                    <span class="date">Juin 2024 - Août 2024</span>
                    <h3>Vendeur polyvalent</h3>
                    <h4>Boulangerie Ange</h4>
                    <p>Accueil client, gestion des commandes, encaissement et maintien de la qualité de service en environnement dynamique.</p>
                </div>
            </div>
            <div class="timeline-item left">
                <div class="timeline-content">
                    <span class="date">Août 2023 - Mai 2024</span>
                    <h3>Vendeur sur stand</h3>
                    <h4>Un Amour de Bonbon</h4>
                    <p>Relation client lors d'événements, gestion des stocks, encaissements et logistique du stand.</p>
                </div>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Add the new formation section immediately after experiences**

Add:

```html
<section id="formation" class="section formation-section">
    <div class="container">
        <h2 class="section-title">Formation <span class="line"></span></h2>

        <div class="timeline compact-timeline">
            <div class="timeline-item left">
                <div class="timeline-content">
                    <span class="date">2023 - 2026</span>
                    <h3>Licence MIASHS parcours MIAGE</h3>
                    <h4>Université Paris Nanterre</h4>
                    <p>Programmation orientée objet, bases de données relationnelles, développement web, algorithmique, architecture des applications, API et gestion de projet.</p>
                    <p>Double compétence informatique et gestion : analyse financière, comptabilité, marketing et droit du travail.</p>
                </div>
            </div>
            <div class="timeline-item right">
                <div class="timeline-content">
                    <span class="date">2022</span>
                    <h3>Baccalauréat Général - Mention Bien</h3>
                    <h4>Lycée Alfred Kastler, Cergy</h4>
                    <p>Spécialités Mathématiques et NSI, section européenne anglais.</p>
                </div>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 3: Replace the skills section content**

Replace `.skills-wrapper` with:

```html
<div class="skills-wrapper">
    <div class="skill-category">
        <h3><i class="fas fa-code"></i> Langages</h3>
        <div class="skill-tags">
            <span class="tag high">Java</span>
            <span class="tag high">Python</span>
            <span class="tag high">TypeScript/JavaScript</span>
            <span class="tag">C</span>
            <span class="tag">C++ / Qt</span>
            <span class="tag">PHP</span>
            <span class="tag">HTML/CSS</span>
            <span class="tag">SQL</span>
        </div>
    </div>

    <div class="skill-category">
        <h3><i class="fas fa-database"></i> Data & Outils</h3>
        <div class="skill-tags">
            <span class="tag high">MySQL</span>
            <span class="tag">SQLite</span>
            <span class="tag high">Supabase/PostgreSQL</span>
            <span class="tag">Git/GitHub</span>
            <span class="tag">Docker</span>
            <span class="tag">VS Code</span>
        </div>
    </div>

    <div class="skill-category">
        <h3><i class="fas fa-layer-group"></i> Frameworks & Libs</h3>
        <div class="skill-tags">
            <span class="tag high">Next.js</span>
            <span class="tag">Node.js</span>
            <span class="tag">Flask</span>
            <span class="tag">Pygame</span>
            <span class="tag">Drizzle</span>
            <span class="tag">Zustand</span>
        </div>
    </div>

    <div class="skill-category">
        <h3><i class="fas fa-brain"></i> Méthodes & Soft Skills</h3>
        <div class="skill-tags">
            <span class="tag outline">Agile / itératif</span>
            <span class="tag outline">POO</span>
            <span class="tag outline">Analyse de besoins</span>
            <span class="tag outline">Autonomie</span>
            <span class="tag outline">Rigueur</span>
            <span class="tag outline">Communication métiers</span>
            <span class="tag outline">Anglais C1</span>
            <span class="tag outline">Espagnol B1</span>
        </div>
    </div>
</div>
```

- [ ] **Step 4: Replace the contact copy and buttons**

Replace the contact heading paragraph and `.social-buttons` with:

```html
<h2>Discutons de votre alternance</h2>
<p>Disponible pour une alternance de 24 mois à partir de septembre 2026 en Master MIAGE, Ingénierie Logicielle ou IA.</p>
<p class="contact-availability">Rythmes possibles : 3 sem. / 3 sem. ou 3 j. / 2 j.</p>
```

Use this `.social-buttons` block:

```html
<div class="social-buttons">
    <a href="assets/cv-thibaud-thomas-lamotte-alternance.pdf" download
        class="btn btn-primary"><i class="fas fa-file-arrow-down"></i> Télécharger mon CV</a>
    <a href="https://www.linkedin.com/in/thibaudthomaslamotte/" target="_blank"
        class="btn btn-secondary"><i class="fab fa-linkedin-in"></i> LinkedIn</a>
    <a href="https://github.com/Tibxla" target="_blank" class="btn btn-secondary"><i
            class="fab fa-github"></i> GitHub</a>
</div>
```

- [ ] **Step 5: Update the footer year**

Replace:

```html
<p>&copy; 2025 Thibaud Thomas-Lamotte. Tous droits réservés.</p>
```

with:

```html
<p>&copy; 2026 Thibaud Thomas-Lamotte. Tous droits réservés.</p>
```

- [ ] **Step 6: Run the content check**

Run:

```powershell
node tools/check-portfolio-content.mjs
```

Expected: `Portfolio content checks passed.`

- [ ] **Step 7: Commit the content sections**

Run:

```powershell
git add index.html
git commit -m "feat: refresh experience formation skills and contact"
```

Expected: commit succeeds.

---

### Task 5: Add CSS Polish and Browser Verification

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add support styles near the hero/project/contact CSS blocks**

Add these rules after `.hero-desc`:

```css
.hero-availability {
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    margin-bottom: 28px;
    color: var(--text-primary);
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.22);
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
}
```

Add these rules near the project styles:

```css
.edifig-gradient {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(251, 191, 36, 0.12));
    height: 100%;
    width: 100%;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    color: var(--gold);
    min-height: 200px;
}

.project-note {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-bottom: 0;
}
```

Add this rule near contact styles:

```css
.contact-availability {
    margin-top: -24px;
    color: var(--text-primary);
    font-weight: 600;
}
```

- [ ] **Step 2: Add responsive CTA behavior**

Inside `@media (max-width: 768px)`, add:

```css
.hero-content {
    margin-left: 0;
    padding-top: 80px;
}

.hero-cta {
    flex-direction: column;
    align-items: flex-start;
}

.hero-cta .btn {
    width: 100%;
    justify-content: center;
}

.hero-availability {
    display: flex;
    width: 100%;
}
```

- [ ] **Step 3: Run content and whitespace checks**

Run:

```powershell
node tools/check-portfolio-content.mjs
git diff --check
```

Expected:

```text
Portfolio content checks passed.
```

and `git diff --check` exits with no output.

- [ ] **Step 4: Open the static page locally**

Run:

```powershell
Start-Process "$PWD\index.html"
```

Expected: browser opens the portfolio. Manually check that the page loads, the animated background still appears, and the ID card still renders.

- [ ] **Step 5: Verify key interactions manually**

In the browser:

- Click `Voir mes projets`; expected: scrolls to `#projets`.
- Click `Me contacter`; expected: scrolls to `#contact`.
- Click `Télécharger mon CV`; expected: downloads or opens `cv-thibaud-thomas-lamotte-alternance.pdf`.
- Open mobile width or browser devtools responsive mode; expected: nav menu opens, text does not overlap, three hero buttons stack cleanly.
- Check Edifig; expected: visible first, no GitHub link.
- Check public projects; expected: GitHub icons/links remain.

- [ ] **Step 6: Commit CSS polish**

Run:

```powershell
git add styles.css
git commit -m "style: polish alternance portfolio layout"
```

Expected: commit succeeds.

---

### Task 6: Final Verification and Delivery

**Files:**
- Read: `index.html`
- Read: `styles.css`
- Read: `tools/check-portfolio-content.mjs`

- [ ] **Step 1: Run final automated checks**

Run:

```powershell
node tools/check-portfolio-content.mjs
git status --short
```

Expected:

```text
Portfolio content checks passed.
```

`git status --short` should show no uncommitted changes.

- [ ] **Step 2: Review recent commits**

Run:

```powershell
git log --oneline -6
```

Expected: latest commits include the design spec commit and the implementation commits from Tasks 1-5.

- [ ] **Step 3: Prepare the final handoff**

Report:

- CV asset path: `assets/cv-thibaud-thomas-lamotte-alternance.pdf`
- Edifig is first and has no repository link.
- Experiences and formation are separate sections.
- Verification command passed: `node tools/check-portfolio-content.mjs`.
- Manual browser checks completed for desktop and mobile.
