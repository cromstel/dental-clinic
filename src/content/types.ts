export type SocialHandle = {
  name: string;
  label: string;
  handle: string;
  url: string;
};

export type HoursRow = {
  days: string;
  hours: string;
};

export type Doctor = {
  slug: string;
  name: string;
  shortName: string;
  role: string;
  specialties: string[];
  bio: string;
  note: string;
  image: string;
  color: string;
};

export type Service = {
  slug: string;
  title: string;
  description: string;
  image: string;
  color: string;
};

export type Transformation = {
  label: string;
  detail: string;
  before: string;
  after: string;
  color: string;
};

export type ExperiencePrinciple = {
  word: string;
  headline: string;
  copy: string;
  color: string;
  text: string;
};

export type PatientStep = {
  number: string;
  title: string;
  copy: string;
  color: string;
};

export type Review = {
  quote: string;
  author: string;
  location: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type MarqueeItem = string;

export type InvisalignFeature = {
  title: string;
  copy: string;
};