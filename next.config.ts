import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === 'development';

const getSecurityHeaders = () => {
  const headers = [
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block'
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin'
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    {
      key: 'Permissions-Policy',
      value: [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'interest-cohort=()',
        'payment=()',
        'usb=()',
        'bluetooth=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()',
      ].join(', ')
    },
  ];

  // Add HSTS only in production
  if (!isDevelopment) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload'
    });
  }

  // Environment-specific CSP
  const cspDirectives = isDevelopment
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Allow eval and inline for dev tools
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ]
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'", // Next.js requires unsafe-inline for script tags
        "style-src 'self' 'unsafe-inline'", // Tailwind and shadcn require unsafe-inline
        "img-src 'self' data: https://www.google.com", // Google favicons API
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.github.com https://api.cloudflare.com https://api.vercel.com https://api.anthropic.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ];

  headers.push({
    key: 'Content-Security-Policy',
    value: cspDirectives.join('; ')
  });

  return headers;
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: getSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
