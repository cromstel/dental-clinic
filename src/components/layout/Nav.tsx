"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Menu, X, Share, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks, site, socials } from "@/content/site";
import { SmileGraphic } from "@/components/ui/SmileGraphic";
import { Cta } from "@/components/ui/Cta";

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    // Coalesce scroll events to at most one state update per frame so the
    // header doesn't re-render on every scroll tick.
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      // Save scroll position when menu opens
      scrollPosRef.current = window.scrollY;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosRef.current}px`;
      document.body.style.width = "100%";
    } else {
      // Restore scroll position when menu closes
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollPosRef.current);
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollPosRef.current);
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open || e.key !== "Tab") return;
      const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [open]
  );

  useEffect(() => {
    if (open) {
      closeBtnRef.current?.focus();
      const handler = (e: KeyboardEvent) => handleKeyDown(e as unknown as React.KeyboardEvent);
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    } else {
      hamburgerRef.current?.focus();
    }
  }, [open, handleKeyDown]);

  // The home hero is midnight navy and fills the first viewport, so while the
  // header is still transparent there the header has to switch to the ivory
  // palette. Charcoal-on-navy is a 1.03:1 contrast ratio — the nav was
  // effectively invisible. Other routes start on the cream page and keep the
  // existing dark-on-light treatment.
  const overDarkHero = pathname === "/" && !scrolled;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-charcoal/10 bg-cream/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav className="container-custom flex items-center justify-between py-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label={`${site.fullName} — home`}
          >
            <SmileGraphic
              className={cn("h-4 w-6", overDarkHero ? "text-ivory" : "text-charcoal")}
              animated={false}
            />
            <span
              className={cn(
                "font-display text-xl font-bold tracking-tight",
                overDarkHero ? "text-ivory" : "text-ink",
              )}
            >
              {site.name}
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-cursor="hover"
                  className={cn(
                    "group relative text-sm font-medium tracking-tight transition-colors",
                    overDarkHero
                      ? active
                        ? "text-ivory"
                        : "text-ivory/80 hover:text-ivory"
                      : active
                        ? "text-ink"
                        : "text-charcoal hover:text-ink",
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-1 left-0 h-[2px] transition-all duration-300",
                      overDarkHero ? "bg-gold" : "bg-ink",
                      active ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Cta href="/contact" variant="lime">
                Book now
              </Cta>
            </div>
            <button
              ref={hamburgerRef}
              onClick={() => setOpen(true)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border transition-colors lg:hidden",
                overDarkHero
                  ? "border-ivory/40 text-ivory hover:bg-ivory hover:text-midnight"
                  : "border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-cream",
              )}
              aria-label="Open menu"
              data-cursor="hover"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[80] flex flex-col bg-lime lg:hidden"
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center justify-between px-6 py-4">
              <span className="font-display text-xl font-bold tracking-tight text-ink">
                {site.name}
              </span>
              <button
                ref={closeBtnRef}
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:bg-ink hover:text-lime"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-2 px-6">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1], duration: 0.6 }}
                >
                  <Link
                    href={link.href}
                    className="block font-display text-6xl font-bold tracking-tight text-ink"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between px-6 pb-10 text-ink"
            >
              <div className="space-y-1 text-sm">
                <a href={`tel:${site.phone.tel}`} className="flex items-center gap-2 font-semibold">
                  <Phone className="h-4 w-4" /> {site.phone.display}
                </a>
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" /> {site.address.lines[1]}
                </a>
              </div>
              <a
                href={socials[0].url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-lime"
              >
                <Share className="h-5 w-5" />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const links = [{ href: "/", label: "Home" }, ...navLinks, { href: "/contact", label: "Contact" }];