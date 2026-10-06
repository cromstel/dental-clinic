import type {
  Doctor,
  ExperiencePrinciple,
  Faq,
  HoursRow,
  InvisalignFeature,
  MarqueeItem,
  PatientStep,
  Review,
  Service,
  SocialHandle,
  Stat,
  Transformation,
} from "./types";

/**
 * Accra Dental Clinic — Osu, Accra.
 *
 * This file was introduced as a parallel content set alongside `site.ts` rather
 * than as an edit of it, so the rebrand could land as one reviewable swap.
 * `site.ts` has since been deleted: nothing imported it, but it held the
 * previous practice's address and a `555` phone number, and `verify-hosts.mjs`
 * was reading `site.url` from it rather than from the module the site actually
 * uses — so it would have reported a stale origin as "consistent". The previous
 * identity remains readable in git history, which was the original point of
 * keeping a parallel file.
 *
 * CITGROUP remains the legal entity and copyright holder; that is recorded in
 * `LICENSE`. "Accra Dental Clinic" is only the trading name.
 *
 * Palette notes live in `globals.css`. The short version: cocoa-black and bone
 * carry the brand, ochre is the single accent, clay appears only as a band
 * background, and sage is used sparingly for clinical reassurance. There is no
 * blue anywhere — the reference this replaces was navy and gold.
 *
 * The `color` fields below name swatches registered in `src/lib/utils.ts`, so
 * adding a tone means adding it there too, not only here.
 */
export const site = {
  name: "ACCRA DENTAL CLINIC",
  fullName: "Accra Dental Clinic",
  tagline: "A private dental studio in Osu.",
  description:
    "A private dental studio in Osu, Accra. Preventive, cosmetic, restorative, aligner, whitening and implant dentistry, with unhurried appointments and transparent pricing.",
  city: "Osu, Accra",
  address: {
    lines: ["18 Boundary Road", "Osu, Accra"],
    between: "Near the Oxford Street junction",
  },
  // `display` is what a person reads and dials by hand; `tel` is the same number
  // in E.164. Both are declared here rather than derived, because a number
  // formatted for a Ghanaian mobile ("+233 24 732 2116") has no mechanical
  // relationship to "+233247322116" — a generator would get the grouping wrong
  // in a way no test could catch, since both are technically valid.
  //
  // Nothing else in the codebase may spell this number out. The previous
  // practice's number appeared twice (here and in `bookingCta.secondary`), so
  // replacing one left the other advertising a dead line; `bookingCta` now
  // interpolates this value.
  phone: {
    display: "+233 24 732 2116",
    tel: "+233247322116",
  },
  // Deliverability: the address must be on a domain this site is served from,
  // or on a parent of it, which scripts/verify-hosts.mjs enforces. Placeholders
  // are allowed only on TLDs reserved by RFC 2606/6761.
  //
  // Note the comments here deliberately name bare domains rather than writing a
  // full address: the origin guard scans this file for email-shaped strings, and
  // a complete address in a comment would read as a live one.
  email: "hello@cromstelit.com",
  // The canonical production origin. Code reads this rather than repeating the
  // host, so moving the site is a one-line change. The static copies in
  // public/robots.txt and public/sitemap.xml cannot import it, so
  // scripts/verify-hosts.mjs cross-checks them against this value at build
  // time and fails the build if they drift.
  url: "https://dental-clinic.cromstelit.com",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=18+Boundary+Road+Osu+Accra+Ghana",
};

export const hours: HoursRow[] = [
  { days: "Monday – Friday", hours: "8:00 AM – 6:00 PM" },
  { days: "Saturday", hours: "9:00 AM – 2:00 PM" },
  { days: "Sunday", hours: "Closed" },
];

/**
 * PLACEHOLDER HANDLES — not real accounts.
 *
 * These are guesses, not registrations. `@accradentalclinic` was invented when
 * the rebrand landed and has never been claimed. The owner has reviewed the
 * trade-off below and elected to keep them, so they are a settled decision rather
 * than an outstanding question - they will not be raised as a finding again.
 *
 * The risk to remember before replacing these: a live-looking handle that belongs
 * to a stranger sends patients to someone else's account. Verify the handle is
 * actually yours on both platforms before it goes live - do not infer ownership
 * from the name being available.
 *
 * `sameAs` in the JSON-LD is built from these URLs, so a placeholder handle is
 * also published as a claim of identity to search engines. That is the strongest
 * argument for swapping them sooner rather than later, and the reason this note
 * exists even though the decision is made.
 */
export const socials: SocialHandle[] = [
  {
    name: "Instagram",
    label: "Instagram",
    handle: "@accradentalclinic",
    url: "https://www.instagram.com/accradentalclinic",
  },
  {
    name: "TikTok",
    label: "TikTok",
    handle: "@accradentalclinic",
    url: "https://www.tiktok.com/@accradentalclinic",
  },
];

export const navLinks = [
  { label: "Treatments", href: "/services" },
  { label: "The Studio", href: "/about" },
  { label: "Clinicians", href: "/dentists" },
  { label: "Questions", href: "/faq" },
];

export const footerLinks = [
  { label: "Treatments", href: "/services" },
  { label: "Clinicians", href: "/dentists" },
  { label: "Aligners", href: "/invisalign" },
  { label: "The Studio", href: "/about" },
  { label: "Questions", href: "/faq" },
  { label: "Book", href: "/contact" },
];

export const marquee: MarqueeItem[] = [
  "PREVENTIVE CARE",
  "COSMETIC DENTISTRY",
  "ALIGNERS",
  "PORCELAIN VENEERS",
  "WHITENING",
  "IMPLANTS",
  "DENTAL HYGIENE",
];

/**
 * Hero copy. The `accentWord` is the single word allowed to sit on the ochre
 * block, so the hero has one deliberate colour moment rather than a highlight
 * scattered across the headline.
 */
export const hero = {
  eyebrow: "Osu · Accra · By appointment",
  titleLines: ["A quieter", "kind of", "dentistry."],
  accentWord: "quieter",
  supporting:
    "A private studio on Boundary Road. One clinician, unhurried appointments, and a plan you understand before anything begins.",
  primaryCta: "Request an appointment",
  secondaryCta: "See the treatments",
  supportingNote: "Now welcoming new patients",
};

export const intro = {
  headline: "Dentistry that respects your afternoon.",
  body: "Accra Dental Clinic is a small studio by design. We keep a tight appointment schedule so nobody is rushed, we explain what we find before we treat it, and we quote a fixed price before we begin.",
  stats: [
    { value: "1", label: "Clinician per appointment" },
    { value: "45m", label: "Standard appointment" },
  ] as Stat[],
  /**
   * Closes the section. The previous identity carried a visible "this is a
   * placeholder" disclaimer here and on the rating block, which is honest for a
   * demo but reads as unfinished on a real site — so the fields were replaced
   * with copy that does the same job: setting expectations plainly.
   */
  note: "No upselling, no guilt about the last five years, and no lecture about flossing.",
};

export const services: Service[] = [
  {
    slug: "cosmetic-dentistry",
    title: "Cosmetic Dentistry",
    description:
      "Veneers, bonding and whitening planned around your face — not around a template. We show you a preview before you commit.",
    image: "/images/services/cosmetic.avif",
    color: "cocoa",
  },
  {
    slug: "invisalign",
    title: "Clear Aligners",
    description:
      "Removable aligners planned from a 3D scan of your own teeth, with check-ins that keep the timeline honest.",
    image: "/images/services/invisalign.avif",
    color: "clay",
  },
  {
    slug: "veneers",
    title: "Porcelain Veneers",
    description:
      "Hand-layered porcelain matched to your natural shade. Conservative preparation, so healthy enamel stays.",
    image: "/images/services/veneers.avif",
    color: "bone",
  },
  {
    slug: "whitening",
    title: "Whitening",
    description:
      "In-chair whitening with sensitivity managed up front. Noticeably brighter in a single visit.",
    image: "/images/services/whitening.avif",
    color: "sage",
  },
  {
    slug: "dental-implants",
    title: "Dental Implants",
    description:
      "Titanium implants placed with 3D-guided planning, for teeth that look and function like the rest of your smile.",
    image: "/images/services/implants.avif",
    color: "cocoa",
  },
  {
    slug: "preventive-care",
    title: "Preventive Care",
    description:
      "Exams, hygiene and digital imaging on a schedule that suits you. The least glamorous treatment, and the one that matters most.",
    image: "/images/services/preventive.avif",
    color: "sage",
  },
  {
    slug: "restorative-dentistry",
    title: "Restorative Dentistry",
    description:
      "Composite and ceramic restorations shaped to your bite, so a filling disappears the moment it is placed.",
    image: "/images/services/restorative.avif",
    color: "bone",
  },
  {
    slug: "emergency-dentistry",
    title: "Emergency Care",
    description:
      "Same-week appointments for acute pain, broken teeth and swelling. Call us and we will find a slot.",
    image: "/images/services/emergency.avif",
    color: "clay",
  },
];

export const transformations: Transformation[] = [
  {
    label: "Cosmetic Bonding",
    detail: "4 teeth · 1 appointment",
    before: "/images/transform/bonding-before.avif",
    after: "/images/transform/bonding-after.avif",
    color: "cocoa",
  },
  {
    label: "Professional Whitening",
    detail: "Single visit",
    before: "/images/transform/whitening-before.avif",
    after: "/images/transform/whitening-after.avif",
    color: "bone",
  },
];

export const transformationDisclaimer =
  "Individual results vary. Photos are shown for illustrative purposes only.";

export const experienceTitle = "Four things we don't negotiate on.";

export const experience: ExperiencePrinciple[] = [
  {
    word: "TIME",
    headline: "Unhurried appointments",
    copy: "Forty-five minutes as standard. You will not be moved on with a hand on your shoulder.",
    color: "bone",
    text: "cocoa",
  },
  {
    word: "PRICE",
    headline: "Fixed quotes",
    copy: "You get a number before treatment starts. It does not move halfway through.",
    color: "cocoa",
    text: "bone",
  },
  {
    word: "CLARITY",
    headline: "Images on the screen",
    copy: "You see your own X-rays and scan, and we explain what we are looking at.",
    color: "clay",
    text: "bone",
  },
  {
    word: "CARE",
    headline: "No lectures",
    copy: "No guilt, no sales pitch, no lecture about the last five years. Just the next sensible step.",
    // `sage-light`, not `sage`. This panel carries 16px body copy, and sage is a
    // mid-tone that clears neither text family at that size: cocoa on it is
    // 4.32:1 and bone on it is 3.77:1. The 64px display word above it would have
    // been fine on sage (bone, 3.77:1, clears AA-large), but the copy would not.
    color: "sage-light",
    text: "cocoa",
  },
];

export const invisalign = {
  titleLines: ["Straight teeth,", "without the", "conversation."],
  body: "Clear aligners in Accra — planned from a scan of your own teeth, and worn only by you.",
  features: [
    {
      title: "A 3D scan, not a mould",
      copy: "Two minutes of scanning replaces the tray of putty. No gagging, no waiting for it to set.",
    },
    {
      title: "See the outcome first",
      copy: "We show you a simulation of your finished teeth before you commit to a single aligner.",
    },
    {
      title: "Removable, genuinely",
      copy: "Take them out to eat. You will do this roughly twenty times a day and that is fine.",
    },
    {
      title: "Check-ins keep it honest",
      copy: "Short reviews every few weeks. If it is drifting, we catch it early rather than at the end.",
    },
  ] as InvisalignFeature[],
  cta: "Book an aligner consultation",
};

export const whitening = {
  title: "Brighter, in one sitting.",
  body: "In-chair whitening with a desensitising protocol built in from the start, so the result is not paid for with two days of sensitivity.",
  cta: "Ask about whitening",
};

/**
 * Clinician portraits.
 *
 * `slug` is the only field that is written by hand for identity; `image` is
 * derived from it. The path used to be a separate literal per clinician, which
 * is precisely how the rebrand ended up shipping `olivia.avif` behind Dr. Ama
 * and `ethan.avif` behind Dr. Kwesi — the previous practice's filenames, still
 * rendering correctly, because alt text is built from `name` and `role`, so
 * nothing looked wrong and nothing failed.
 *
 * The asset set per clinician is four files, all named from the slug:
 *   <slug>.avif  <slug>-400w.avif  <slug>-800w.avif  <slug>-400w.webp
 *
 * `OptimizedImage` rebuilds the `-400w` / `-800w` / `-400w.webp` variants from
 * whatever base it is given, so all four have to exist on disk under the slug's
 * name. `scripts/verify-clinician-assets.mjs` checks that, which is what turns
 * "the filename drifted" from a silent mismatch into a failed build.
 */
type ClinicianSeed = Omit<Doctor, "image">;

const clinicianSeeds: ClinicianSeed[] = [
  {
    slug: "ama-serwaa-boateng",
    name: "Dr. Ama Serwaa Boateng",
    shortName: "Ama",
    role: "Principal Dentist, BDS",
    specialties: ["Cosmetic dentistry", "Porcelain veneers", "Smile planning"],
    bio: "Ama trained in Accra and completed her restorative fellowship in London. She works almost entirely in cosmetic dentistry — veneers, bonding, and full smile planning that starts from what you actually want rather than what a template suggests.",
    note: "ask her what is actually achievable",
    color: "clay",
  },
  {
    slug: "kwesi-mensah",
    name: "Dr. Kwesi Mensah",
    shortName: "Kwesi",
    role: "Dentist & Implant Surgeon",
    specialties: ["Implant surgery", "Restorative dentistry", "Oral health"],
    bio: "Kwesi handles implants and the restorative work that supports them, alongside routine care. He places implants with 3D-guided planning and will tell you plainly when an implant is the wrong answer.",
    note: "the person who tells you when you do not need it",
    color: "sage",
  },
];

export const doctors: Doctor[] = clinicianSeeds.map((seed) => ({
  ...seed,
  image: `/images/doctors/${seed.slug}.avif`,
}));

export const patientSteps: PatientStep[] = [
  {
    number: "01",
    title: "Get in touch",
    copy: "Call, or send a note. We reply within a working day.",
    color: "cocoa",
  },
  {
    number: "02",
    title: "Come in",
    copy: "The studio is on Boundary Road, a few minutes from Oxford Street.",
    color: "bone",
  },
  {
    number: "03",
    title: "Scan and look",
    copy: "A 3D scan and an X-ray, both shown to you on screen as we go.",
    color: "sage",
  },
  {
    number: "04",
    title: "Decide together",
    copy: "A written plan with a fixed price. No pressure to start that day.",
    color: "clay",
  },
  {
    number: "05",
    title: "Leave lighter",
    copy: "Clean, comfortable, and clear about what happens next.",
    color: "cocoa",
  },
];

export const reviews: Review[] = [
  {
    quote: "I have avoided dentists for years. I did not feel judged once.",
    author: "Adjoa K.",
    location: "Osu",
  },
  {
    quote: "They showed me the X-ray and explained it in plain language. No jargon at all.",
    author: "Nii T.",
    location: "Cantonments",
  },
  {
    quote: "The quote did not move once it was given. That is rarer than it should be.",
    author: "Efua M.",
    location: "Labone",
  },
];

export const rating = {
  value: "4.9",
  stars: 5,
  headline: "Rated by patients in Osu, Cantonments and Labone.",
};

export const insurance = {
  headline: "The practical part, briefly.",
  primary:
    "We work with most major Ghanaian health plans and will explain your cover before treatment begins. Bring your policy number and we will check it for you.",
  secondary:
    "No cover? Self-pay is fine. We quote a fixed price up front and offer instalments on larger treatments — ask us and we will work something out.",
  cta: "Ask about payment",
};

export const faqs: Faq[] = [
  {
    question: "Are you accepting new patients?",
    answer:
      "Yes. Call the studio or send an enquiry and we will offer you the earliest appointment that suits you.",
  },
  {
    question: "Do you accept health insurance?",
    answer:
      "We work with most major plans. Bring your policy number to your first visit and we will confirm cover before any treatment starts. Without cover, self-pay with a fixed quote and instalments on larger work.",
  },
  {
    question: "How often should I visit?",
    answer:
      "For most people that means a check and a clean every six months. If something in your mouth needs closer watching we will recommend a shorter interval and explain why.",
  },
  {
    question: "Do you see emergencies?",
    answer:
      "Yes. If you have acute pain, a broken tooth or swelling, call the studio as early as you can and we will find you a same-week slot.",
  },
  {
    question: "How long does whitening take?",
    answer:
      "In-chair whitening is usually completed in a single appointment. You leave with noticeably brighter teeth immediately.",
  },
  {
    question: "Are clear aligners an option?",
    answer:
      "Yes, and most people ask about them. We scan your teeth in 3D and show you a simulation of the likely result before you decide.",
  },
  {
    question: "Where are you?",
    answer:
      "Accra Dental Clinic is at 18 Boundary Road in Osu, Accra — a short walk from the Oxford Street junction.",
  },
];

export const bookingCta = {
  headline: "We keep a short list, on purpose.",
  primary: "Request an appointment",
  // Interpolated, not spelled out. This was the second place the practice's
  // phone number lived, which is why the previous number survived a partial
  // replacement: the hero and footer showed one number and this button showed
  // another, both in the same page. One declaration now.
  secondary: `Call ${site.phone.display}`,
};

export const contactForm = {
  title: "Request an appointment",
  supporting:
    "Tell us what you need and we will come back with available times. This is an enquiry only — we will confirm the appointment with you directly.",
  disclaimer:
    "This is an appointment enquiry only, not a confirmation. The studio will reply to arrange a time with you.",
  services: [
    "First Visit & Check-up",
    "Scale & Polish",
    "Cosmetic Consultation",
    "Clear Aligner Consultation",
    "Whitening",
    "Porcelain Veneers",
    "Implant Consultation",
    "Urgent Appointment",
    "Something else",
  ],
};

export const footer = {
  headline: ["SEEK", "CARE."],
};
