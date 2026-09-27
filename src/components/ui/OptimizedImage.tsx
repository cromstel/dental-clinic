"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type OptimizedImageProps = {
  src: string; // base path without extension (e.g., "/images/services/cosmetic")
  alt: string;
  fill?: boolean;
  sizes?: string;
  widths?: number[]; // responsive variant widths emitted in srcSet (must exist on disk)
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
};

const DEFAULT_WIDTHS = [400, 800];

function getExtensions(src: string): { avif: string } {
  const base = src.replace(/\.(avif|webp|jpg|jpeg|png)$/i, "");
  return { avif: `${base}.avif` };
}

function buildSrcSet(base: string, widths: number[]): string {
  return widths.map((w) => `${base}-${w}w.avif ${w}w`).join(", ");
}

/**
 * Optimized image with responsive AVIF sources via <picture>, plus a single
 * low-width WebP fallback for browsers that can't decode AVIF (Safari < 16.4).
 * Emits srcSet + sizes so the browser downloads only the needed resolution.
 */
export function OptimizedImage({
  src,
  alt,
  fill = false,
  sizes,
  widths = DEFAULT_WIDTHS,
  className,
  priority = false,
  loading = "lazy",
}: OptimizedImageProps) {
  const [loadError, setLoadError] = useState(false);
  const { avif } = getExtensions(src);
  const base = src.replace(/\.(avif|webp|jpg|jpeg|png)$/i, "");
  const fallbackWidth = Math.min(...widths);

  const handleError = () => {
    setLoadError(true);
  };

  return (
    <picture className={cn(fill && "relative block h-full w-full")}>
      <source srcSet={buildSrcSet(base, widths)} sizes={sizes} type="image/avif" />
      <source
        srcSet={`${base}-${fallbackWidth}w.webp ${fallbackWidth}w`}
        sizes={sizes}
        type="image/webp"
      />
      <Image
        src={avif}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        loading={loading}
        onError={handleError}
        className={cn("duration-300 ease-out", loadError && "opacity-0", className)}
      />
    </picture>
  );
}