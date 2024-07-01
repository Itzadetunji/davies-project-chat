/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	experimental: {
		turboMode: true, // Enable Turbo Mode
	},
};

module.exports = nextConfig;
