import { Hero } from "@/components/sections/home/Hero";
import { MarqueeBand } from "@/components/sections/home/MarqueeBand";
import { Intro } from "@/components/sections/home/Intro";
import { Experience } from "@/components/sections/home/Experience";
import { Reviews } from "@/components/sections/home/Reviews";
import { BookingCta } from "@/components/sections/home/BookingCta";
import { LocationTieout } from "@/components/sections/home/LocationTieout";

export default function Home() {
  return (
    <>
      <Hero />
      <MarqueeBand />
      <Intro />
      <Experience />
      <Reviews />
      <BookingCta />
      <LocationTieout />
    </>
  );
}
