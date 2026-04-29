# Portfolio CV Alternance Design

## Summary

Update the existing static portfolio to match the latest CV and current search: a 24-month Master MIAGE alternance starting September 2026. Keep the current dark tech visual identity, animations, project card system, and overall page feel, but rewrite and reorganize the content for recruiters.

The portfolio should present Thibaud Thomas-Lamotte as a L3 MIAGE student at Université Paris Nanterre, currently a developer intern at the Société du Figaro DSI, focused on software development, information systems, and business needs.

## Key Changes

- Keep the existing style, animated background, interactive ID card, typography, and project-card visual language.
- Update the hero:
  - Tagline: `L3 MIAGE - Université Paris Nanterre`
  - Main message: `Développeur en devenir, orienté logiciel, SI et besoins métier`
  - Description: `Actuellement stagiaire développeur à la DSI du Figaro, je recherche une alternance de 24 mois en Master MIAGE à partir de septembre 2026.`
  - Availability line: `Rythmes possibles : 3 sem. / 3 sem. ou 3 j. / 2 j.`
  - CTAs: `Voir mes projets`, `Me contacter`, and `Télécharger mon CV`
- Add the latest CV PDF to the site as a downloadable asset, using a clean public filename such as `cv-thibaud-thomas-lamotte-alternance.pdf`.
- Update navigation to include separate `Expériences` and `Formation` anchors instead of one combined section.
- Keep email, phone, LinkedIn, and GitHub contact options.

## Project Section

Keep all current projects and add Edifig as the first, featured project.

- `Edifig`: featured first. Describe it as a project built during the Figaro DSI internship: an internal web tool for visually composing a magazine flatplan and generating production XML. Do not include a GitHub link because the repository is private. Suggested tags: `Next.js`, `TypeScript`, `Supabase`, `PostgreSQL`, `XML`, `Vercel`.
- `PGI Automobile`: integrated management system for vehicles, sales, clients, HR, and statistical reporting.
- `Suivi de Portefeuille`: dynamic financial dashboard for portfolio tracking and data visualization.
- `FileRenamer`: C++/Qt desktop app for bulk file renaming and PDF generation.
- `Stéganographie Web`: Flask/Python app for LSB file encoding and decoding in images.
- `Minotaur Maze Game`: Python game with procedural generation and BFS/A* pathfinding.
- `Projet Web L3`: team web app with users, database, and responsive UI.

Public projects keep their GitHub links. Edifig has no external repository link.

## Experience, Formation, Skills, Contact

Split the current combined timeline into two separate sections.

Experiences:

- `Stagiaire Développeur - DSI, Société du Figaro`, `Avr. 2026 - Mai 2026`: portal for editorial flatplan entry, production tracking with history, needs analysis, data model design, business-team validation, iterative feedback.
- `Vendeur polyvalent - Boulangerie Ange`, `Juin 2024 - Août 2024`: customer reception, orders, checkout, and service organization.
- `Vendeur sur stand - Un Amour de Bonbon`, `Août 2023 - Mai 2024`: event customer relations, stock management, checkout, and stand logistics.

Formation:

- `Licence MIASHS parcours MIAGE - Université Paris Nanterre`, `2023 - 2026`: Java/OOP, MySQL, web development, PHP, algorithms, application architecture, APIs, project management, accounting, marketing, financial analysis.
- `Baccalauréat Général - Mention Bien`, `2022`: Mathematics, NSI, European English section.

Skills should stay tag-based but align with the CV:

- Languages: Java, Python, TypeScript/JavaScript, C, C++/Qt, PHP, HTML/CSS, SQL.
- Databases and tools: MySQL, SQLite, Supabase/PostgreSQL, Git/GitHub, Docker, VS Code.
- Frameworks and libraries: Next.js, Node.js, Flask, Pygame, Qt, Drizzle, Zustand.
- Methods: iterative/agile development, object-oriented design, needs analysis, Git versioning.
- Soft skills and languages: autonomy, rigor, problem solving, adaptability, business communication, English C1, Spanish B1.

Contact copy should state availability for a 24-month alternance from September 2026 in Master MIAGE, Software Engineering, or AI, with rhythms `3 sem. / 3 sem.` or `3 j. / 2 j.`. Include a CV download link in the contact section as well as the hero.

## Test Plan

- Open the static page locally and verify all anchors navigate correctly: hero, projects, experiences, formation, skills, contact.
- Verify the CV download link works and points to the clean public PDF filename.
- Verify Edifig appears first and has no GitHub/external link.
- Verify all public project links still open in a new tab.
- Check desktop and mobile layouts for text overflow, especially the hero availability line, project cards, and navigation.
- Confirm French accents render correctly with UTF-8 and no mojibake remains in visible text.

## Assumptions

- The latest CV source is `cv_alternance (2).pdf`.
- The site remains a static GitHub Pages portfolio without adding a build step.
- Visual style changes are limited to what is needed to support the new content and split sections.
- No private details from Edifig beyond the high-level public-safe description should be exposed.
