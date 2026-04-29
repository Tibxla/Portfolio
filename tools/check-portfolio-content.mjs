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
  'https://github.com/Tibxla/Edifig',
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

console.log('Portfolio content checks passed.');
