/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, /* @note: To prevent duplicated call of useEffect */
    swcMinify: true,

    async rewrites() {
        return [{
            source: "/api/:path*",
            destination: "http://127.0.0.1:8000/:path*",
            //destination: "https://okok-am-backend-dev-okok.app.secoder.net/:path*",
        }];
    }
};

module.exports = nextConfig;
