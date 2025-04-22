let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./user.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./user.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
    ],
  },
  // Add the serverExternalPackages at the root level
  serverExternalPackages: ['mysql2'],
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    // Move the serverActions configuration inside experimental
    serverActions: {
      bodySizeLimit: '500mb',
      allowedOrigins: [
        '*.com',
        'www.envy.com.es',
        'envy.com.es',
        '*.net',
        '*.org',
        '*.io',
        '*.dev',
        'localhost:3000',
        '*.app.github.dev',
        'turbo-invention-5gvx6ggg9gpvf7gq7-3000.app.github.dev',
        '*.vercel.app',
        '*.netlify.app',
        '*.herokuapp.com'
      ],
    },
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig