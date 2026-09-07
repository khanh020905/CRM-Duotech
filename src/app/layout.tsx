import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CRMProvider } from '@/context/CRMContext';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Duotech CRM - Tổng quan & Quản lý Khách hàng',
  description: 'Bảng điều khiển Duotech CRM hiện đại, theo dõi khách hàng và cơ hội kinh doanh dành cho doanh nghiệp.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className={`${inter.className} bg-[#F6F8FC] antialiased selection:bg-[#1765FF]/10 selection:text-[#1765FF]`}>
        <CRMProvider>
          {children}
        </CRMProvider>
      </body>
    </html>
  );
}
