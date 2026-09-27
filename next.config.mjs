/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Inline the (small, atomic Tailwind) stylesheet into the HTML <head> so the
  // render-blocking CSS request is removed from the critical path
  // (see node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/inlineCss.md).
  experimental: {
    inlineCss: true,
  },
};

export default nextConfig;