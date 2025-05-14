import '@ant-design/v5-patch-for-react-19'; // 补丁，让antd支持react19
import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import localFont from "next/font/local";
// import { headers } from 'next/headers';
// import MenuLayout from "@/components/SiderMenuLayout";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "simbol admin",
  description: "inner admin",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const headersList = await headers();
  // const requestUrl = headersList.get('x-request-url');
  // const pathname = new URL(requestUrl || '').pathname;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </body>
    </html>
  );
}


