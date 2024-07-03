/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	// experimental: {
	// 	turbo: true, // Enable Turbo Mode
	// },
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'api.telegram.org',
				pathname: '/file/bot**',
			},
		],
	},
};

module.exports = nextConfig;
