/** @type {import('next').NextConfig} */
const nextConfig = {
reactStrictMode: true,
images: {
 domains: ['images.unsplash.com', 'plus.unsplash.com', 'res.cloudinary.com', 'placeholder.com', 'vercel.com'],
 remotePatterns: [
   {
     protocol: 'https',
     hostname: '**',
   },
 ],
 transpilePackages: ['coinbase-commerce-node'],
};

export default nextConfig;
