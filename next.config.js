/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:5328/api/:path*"
            : "/api/:path*",
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === "development"
        ? "http://localhost:5328"
        : process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
