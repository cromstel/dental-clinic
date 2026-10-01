// One-off rebrand of the per-route metadata blocks.
//
// The previous identity's titles and descriptions were hardcoded in each
// page.tsx, so six files carried "Manhattan, NYC" and the old brand name in
// three places each. Editing them by hand is exactly the kind of repetitive
// change where one file gets missed, so the replacements are declared once here
// and applied mechanically.
//
// Safe to run more than once: the replacements are no-ops once applied, and the
// script reports zero changes on a clean tree rather than failing.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");

/** Literal -> literal. Applied to the metadata files only. */
const REPLACEMENTS = [
  // Titles
  [
    "About CITGROUP Dental Studio | Dentist in Chelsea, Manhattan",
    "About Accra Dental Atelier | A private studio in Osu, Accra",
  ],
  [
    "Contact & Book | CITGROUP Dental Studio, Manhattan",
    "Contact & Book | Accra Dental Atelier, Osu, Accra",
  ],
  [
    "Our Dentists in Manhattan, NYC | CITGROUP Dental Studio",
    "Our Dentists in Osu, Accra | Accra Dental Atelier",
  ],
  ["FAQ | CITGROUP Dental Studio, Manhattan", "Questions | Accra Dental Atelier, Osu, Accra"],
  [
    "Invisalign in Manhattan, NYC | CITGROUP Dental Studio",
    "Clear Aligners in Accra | Accra Dental Atelier",
  ],
  [
    "Dental Services in Manhattan, NYC | CITGROUP Dental Studio",
    "Treatments in Osu, Accra | Accra Dental Atelier",
  ],
  // Descriptions. Each is the literal that appears in the file today — these
  // were collected from the pages themselves rather than reconstructed, because
  // an earlier draft guessed the wording and matched none of them.
  [
    "A modern dental studio in Manhattan. Thoughtful care, transparent pricing, digital technology, and appointments designed around real life.",
    "A private dental studio on Boundary Road in Osu, Accra. Unhurried appointments, fixed quotes, and a plan you understand before anything begins.",
  ],
  [
    "Book an appointment at CITGROUP Dental Studio in Manhattan. Call, email, or send an appointment enquiry from this page.",
    "Request an appointment at Accra Dental Atelier in Osu, Accra. Call the studio, or send an enquiry and we will reply within a working day.",
  ],
  [
    // The dash in this one is U+2014 in the file, but an earlier console dump
    // rendered it as "—", and matching that string silently changed nothing.
    // Written here with the escape so the byte sequence cannot be mangled by
    // however this file gets edited or displayed.
    "Meet the dentists at CITGROUP Dental Studio in Manhattan \u2014 cosmetic, restorative, general, and implant dentistry in the heart of NYC.",
    "Meet the clinicians at Accra Dental Atelier \u2014 cosmetic, restorative and implant dentistry, plus routine oral health.",
  ],
  [
    "Answers about new patients, PPO dental insurance, emergency appointments, whitening, Invisalign consultations, and where to find us in Manhattan.",
    "Answers about new patients, health insurance, emergency appointments, whitening, clear aligners, and where to find us in Osu, Accra.",
  ],
  [
    "Clear aligner treatment in Manhattan. Digital smile scans, personalized Invisalign plans, and progress check-ins at CITGROUP Dental Studio.",
    "Clear aligner treatment in Accra. A 3D scan instead of a mould, a simulation of the result before you commit, and aligners you remove to eat.",
  ],
  [
    "Cosmetic dentistry, Invisalign, veneers, whitening, implants, preventive, restorative, and emergency dentistry at CITGROUP Dental Studio in Chelsea, Manhattan.",
    "Cosmetic dentistry, clear aligners, porcelain veneers, whitening, implants, preventive and restorative care at our studio in Osu, Accra.",
  ],
  // Shared copy that appears on more than one page
  [
    "A more relaxed studio experience in the middle of Manhattan",
    "A quieter kind of dentistry in Osu",
  ],
  [
    "Explore CITGROUP",
    "See the treatments",
  ],
];

const PAGES = ["about", "contact", "dentists", "faq", "invisalign", "services"];

let total = 0;
const touched = [];

for (const page of PAGES) {
  const file = join(root, "src", "app", page, "page.tsx");
  const before = readFileSync(file, "utf8");
  let after = before;
  let count = 0;
  for (const [from, to] of REPLACEMENTS) {
    const parts = after.split(from);
    if (parts.length > 1) {
      count += parts.length - 1;
      after = parts.join(to);
    }
  }
  if (count > 0) {
    total += count;
    touched.push({ page, count });
    if (!checkOnly) writeFileSync(file, after);
  }
}

console.log(
  `${checkOnly ? "would replace" : "replaced"}: ${total} strings across ${touched.length} pages`,
);
for (const { page, count } of touched) console.log(`  ${String(count).padStart(3)}  src/app/${page}/page.tsx`);

if (!checkOnly) {
  // Anything still naming the retired brand in metadata is a miss.
  const leftover = [];
  for (const page of PAGES) {
    const text = readFileSync(join(root, "src", "app", page, "page.tsx"), "utf8");
    const hits = [...text.matchAll(/CITGROUP|Manhattan|Chelsea|New York|NYC/gi)];
    if (hits.length) {
      leftover.push(`src/app/${page}/page.tsx: ${[...new Set(hits.map((h) => h[0]))].join(", ")}`);
    }
  }
  if (leftover.length) {
    console.error("\nstill naming the retired identity:");
    for (const l of leftover) console.error(`  ${l}`);
    process.exit(1);
  }
  console.log("\nno retired brand or city references remain in route metadata.");
}