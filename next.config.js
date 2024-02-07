/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["pbs.twimg.com", "fakeimg.pl"],
  },
  rewrites: () => [
    {
      source: "/admin/",
      destination: "/api/admin/",
    },
    {
      source: "/admin/:admin*",
      destination: "/api/admin/:admin*",
    },
  ],
}

module.exports = nextConfig
