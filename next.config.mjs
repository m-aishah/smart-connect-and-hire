/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*",
            }
        ]
    },
    devIndicators: {
        // appIsrStatus: true,
        // buildActivity: true,
        // buildActivityPosition: "bottom-right",
        position: "bottom-right",
    },
    transpilePackages: [
        '@sanity',
        'next-sanity',
        'sanity',
        'sanity-plugin-*',
        '@sanity/*'
    ],
    // Skip TypeScript checking during build (use this as a temporary solution)
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
