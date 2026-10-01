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

export const site = {
  name: "CITGROUP",
  fullName: "CITGROUP Dental Studio",
  tagline: "Dentistry worth smiling about.",
  description:
    "Modern dentistry in Manhattan. CITGROUP Dental Studio offers preventive, cosmetic, restorative, Invisalign, whitening, and implant dentistry in New York City.",
  city: "Manhattan, New York City",
  address: {
    lines: ["142 West 21st Street", "New York, NY 10011"],
    between: "Between Sixth & Seventh Avenue",
  },
  phone: {
    display: "+1 (212) 555-0184",
    tel: "+12125550184",
  },
  // Deliverability: the previous value was hello@citgroupdental.com, and
  // citgroupdental.com has no DNS record at all - no NS, no A, no MX - so every
  // enquiry hard-bounced. cromstelit.com resolves to Titan MX (mx1/mx2.titan.email)
  // and is the domain this site is actually served from.
  email: "hello@cromstelit.com",
  // The canonical production origin. Code reads this rather than repeating the
  // host, so moving the site is a one-line change. The static copies in
  // public/robots.txt and public/sitemap.xml cannot import it, so
  // scripts/verify-hosts.mjs cross-checks them against this value at build
  // time and fails the build if they drift.
  url: "https://dental-clinic.cromstelit.com",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=CITGROUP+Dental+Studio+142+West+21st+Street+New+York+NY+10011",
};

export const hours: HoursRow[] = [
  { days: "Monday – Friday", hours: "8:00 AM – 7:00 PM" },
  { days: "Saturday", hours: "9:00 AM – 3:00 PM" },
  { days: "Sunday", hours: "Closed" },
];

export const socials: SocialHandle[] = [
  { name: "Instagram", label: "Instagram", handle: "@citgroupdental", url: "https://www.instagram.com/citgroupdental" },
  { name: "TikTok", label: "TikTok", handle: "@citgroupdental", url: "https://www.tiktok.com/@citgroupdental" },
];

export const navLinks = [
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Dentists", href: "/dentists" },
  { label: "FAQ", href: "/faq" },
];

export const footerLinks = [
  { label: "Services", href: "/services" },
  { label: "Dentists", href: "/dentists" },
  { label: "Invisalign", href: "/invisalign" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const marquee: MarqueeItem[] = [
  "COSMETIC DENTISTRY",
  "INVISALIGN",
  "WHITENING",
  "VENEERS",
  "IMPLANTS",
  "CLEANINGS",
];

export const hero = {
  titleLines: ["Dentistry", "worth smiling", "about."],
  smilingWord: "smiling",
  supporting:
    "Modern dentistry in the heart of Manhattan. Thoughtful care, beautiful results, and appointments that don't feel like a trip to the dentist.",
  primaryCta: "Book an Appointment",
  secondaryCta: "Explore CITGROUP",
};

export const intro = {
  headline: "We made going to the dentist feel a little less like going to the dentist.",
  body: "CITGROUP combines modern dental technology, thoughtful care, and a more relaxed studio experience in the middle of Manhattan.",
  stats: [
    { value: "4.9 / 5", label: "Average patient rating" },
    { value: "2,500+", label: "Smiles cared for" },
  ] as Stat[],
  placeholder: "Placeholder statistics for this demo site.",
};

export const services: Service[] = [
  {
    slug: "cosmetic-dentistry",
    title: "Cosmetic Dentistry",
    description:
      "Thoughtful treatments designed to improve the appearance, proportion, and confidence of your smile.",
    image: "/images/services/cosmetic.avif",
    color: "cream",
  },
  {
    slug: "invisalign",
    title: "Invisalign",
    description: "Clear aligner treatment designed around your lifestyle.",
    image: "/images/services/invisalign.avif",
    color: "lavender",
  },
  {
    slug: "veneers",
    title: "Veneers",
    description:
      "Custom porcelain veneers planned around your facial proportions and natural smile.",
    image: "/images/services/veneers.avif",
    color: "peach",
  },
  {
    slug: "whitening",
    title: "Whitening",
    description: "Professional whitening for a noticeably brighter smile.",
    image: "/images/services/whitening.avif",
    color: "butter",
  },
  {
    slug: "dental-implants",
    title: "Dental Implants",
    description: "Modern solutions for replacing missing teeth.",
    image: "/images/services/implants.avif",
    color: "mint",
  },
  {
    slug: "preventive-care",
    title: "Preventive Care",
    description:
      "Routine exams, cleanings, digital imaging, and personalized preventive care.",
    image: "/images/services/preventive.avif",
    color: "lavender",
  },
  {
    slug: "restorative-dentistry",
    title: "Restorative Dentistry",
    description:
      "Modern restorations designed around function, comfort, and natural appearance.",
    image: "/images/services/restorative.avif",
    color: "peach",
  },
  {
    slug: "emergency-dentistry",
    title: "Emergency Dentistry",
    description: "Urgent appointments for unexpected dental problems.",
    image: "/images/services/emergency.avif",
    color: "lime",
  },
];

export const transformations: Transformation[] = [
  {
    label: "Cosmetic Bonding",
    detail: "4 teeth · 1 appointment",
    before: "/images/transform/bonding-before.avif",
    after: "/images/transform/bonding-after.avif",
    color: "peach",
  },
  {
    label: "Professional Whitening",
    detail: "Single visit",
    before: "/images/transform/whitening-before.avif",
    after: "/images/transform/whitening-after.avif",
    color: "butter",
  },
];

export const transformationDisclaimer =
  "Individual results vary. Patient photos are shown for illustrative purposes only.";

export const experienceTitle = "The dentist, redesigned.";

export const experience: ExperiencePrinciple[] = [
  {
    word: "COMFORT",
    headline: "No judgment",
    copy: "We're here to help you move forward, not lecture you about the past.",
    color: "peach",
    text: "charcoal",
  },
  {
    word: "CLARITY",
    headline: "Transparent care",
    copy: "We explain options clearly before treatment begins.",
    color: "lavender",
    text: "charcoal",
  },
  {
    word: "TECH",
    headline: "Modern technology",
    copy: "Digital scanning, imaging, and treatment planning make visits easier.",
    color: "mint",
    text: "charcoal",
  },
  {
    word: "CARE",
    headline: "Designed for humans",
    copy: "Comfortable spaces, friendly people, and appointments designed around real schedules.",
    color: "charcoal",
    text: "cream",
  },
];

export const invisalign = {
  titleLines: ["Straight teeth.", "Without making it obvious."],
  body: "Invisalign in Manhattan — clear aligners planned around your lifestyle.",
  features: [
    { title: "Digital smile scan", copy: "A quick 3D scan captures your smile without messy impressions." },
    { title: "Personalized treatment plan", copy: "See your predicted outcome before you begin." },
    { title: "Clear aligners", copy: "Nearly invisible trays you can wear anywhere." },
    { title: "Progress check-ins", copy: "We keep your treatment moving on schedule." },
  ] as InvisalignFeature[],
  cta: "Explore Invisalign",
};

export const whitening = {
  title: "Brighten things up.",
  body: "Professional whitening designed to brighten your smile safely and efficiently during a single studio visit.",
  cta: "Learn About Whitening",
};

export const doctors: Doctor[] = [
  {
    slug: "olivia-bennett",
    name: "Dr. Olivia Bennett",
    shortName: "Olivia",
    role: "Cosmetic & Restorative Dentist",
    specialties: ["Veneers", "Whitening", "Smile planning", "Restorative care"],
    bio: "Olivia focuses on cosmetic and restorative dentistry — veneers, whitening, restorative treatments, and comprehensive smile planning that starts from what you actually want.",
    note: "ask her about your dream smile",
    image: "/images/doctors/olivia.avif",
    color: "peach",
  },
  {
    slug: "ethan-parker",
    name: "Dr. Ethan Parker",
    shortName: "Ethan",
    role: "General & Implant Dentist",
    specialties: ["Preventive care", "Restorative dentistry", "Implants", "Oral health"],
    bio: "Ethan focuses on preventive dentistry, restorative dentistry, dental implants, and the long-term oral health that keeps you out of trouble.",
    note: "your mouth's biggest fan",
    image: "/images/doctors/ethan.avif",
    color: "mint",
  },
];

export const patientSteps: PatientStep[] = [
  {
    number: "01",
    title: "Say Hello",
    copy: "Book online or call the studio.",
    color: "peach",
  },
  {
    number: "02",
    title: "Come In",
    copy: "Visit our Manhattan studio.",
    color: "lavender",
  },
  {
    number: "03",
    title: "Digital Scan",
    copy: "We use modern imaging to understand your smile.",
    color: "mint",
  },
  {
    number: "04",
    title: "Make a Plan",
    copy: "We'll explain what we see and discuss your options.",
    color: "butter",
  },
  {
    number: "05",
    title: "Leave Smiling",
    copy: "That's the idea.",
    color: "lime",
  },
];

export const reviews: Review[] = [
  {
    quote: "I genuinely forgot I was at the dentist.",
    author: "Rachel M.",
    location: "Chelsea",
  },
  {
    quote: "This is probably the first dental appointment I've ever actually enjoyed.",
    author: "Michael T.",
    location: "SoHo",
  },
  {
    quote: "Everything from booking to the appointment itself felt incredibly easy.",
    author: "Jessica L.",
    location: "West Village",
  },
];

export const rating = {
  value: "4.9",
  stars: 5,
  headline: "Loved by New Yorkers who used to hate going to the dentist.",
  placeholder: "Placeholder rating for this demo site.",
};

export const insurance = {
  headline: "Let's talk about the boring stuff.",
  primary:
    "We work with many PPO dental insurance plans and can help you understand your benefits before treatment.",
  secondary:
    "No insurance? No problem. Ask us about self-pay options and flexible payment plans.",
  cta: "Ask About Insurance",
};

export const faqs: Faq[] = [
  {
    question: "Are you accepting new patients?",
    answer:
      "Yes — we're currently welcoming new patients. Book an appointment online or give the studio a call and we'll find a time that works for you.",
  },
  {
    question: "Do you accept dental insurance?",
    answer:
      "We work with many PPO dental insurance plans. We can help you understand your benefits before treatment begins. No insurance? Ask us about self-pay options and flexible payment plans.",
  },
  {
    question: "How often should I visit the dentist?",
    answer:
      "For most people, a checkup and cleaning every six months keeps things on track. We'll always recommend a schedule based on your individual oral health.",
  },
  {
    question: "Do you offer emergency appointments?",
    answer:
      "Yes. If you're dealing with an unexpected dental problem, call the studio as soon as you can and we'll make room for you.",
  },
  {
    question: "How long does professional whitening take?",
    answer:
      "Most professional whitening appointments are designed to be completed in a single studio visit.",
  },
  {
    question: "Do you offer Invisalign consultations?",
    answer:
      "Yes. We offer Invisalign consultations that start with a digital smile scan, so you can see what treatment could look like for you.",
  },
  {
    question: "Where are you located?",
    answer:
      "CITGROUP Dental Studio is at 142 West 21st Street, New York, NY 10011 — between Sixth and Seventh Avenue in Manhattan.",
  },
];

export const bookingCta = {
  headline: "Your next favorite dentist is accepting new patients.",
  primary: "Book an Appointment",
  secondary: "Call +1 212 555 0184",
};

export const contactForm = {
  title: "Book your visit",
  supporting:
    "Tell us a little about what you need and we'll follow up to confirm availability. This is an appointment enquiry only — not a confirmation.",
  disclaimer: "This is an appointment enquiry only, not a confirmation of an appointment. The clinic will follow up with you to confirm availability.",
  services: [
    "New Patient Exam",
    "Cleaning",
    "Cosmetic Consultation",
    "Invisalign Consultation",
    "Whitening",
    "Veneers",
    "Dental Implant Consultation",
    "Emergency Visit",
    "Other",
  ],
};

export const footer = {
  headline: ["KEEP", "SMILING."],
};
