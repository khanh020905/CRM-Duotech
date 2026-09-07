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
  metadataBase: new URL('https://duotech-crm.vercel.app'),
  title: {
    default: 'Duotech CRM - Tổng quan & Quản lý Khách hàng',
    template: '%s | Duotech CRM',
  },
  description:
    'Bảng điều khiển Duotech CRM hiện đại, theo dõi khách hàng, hợp đồng, pipeline bán hàng và dịch vụ duy trì dành cho doanh nghiệp.',
  keywords: [
    'CRM',
    'Duotech CRM',
    'Quản lý khách hàng',
    'Quản lý hợp đồng',
    'Pipeline bán hàng',
    'Dịch vụ duy trì',
    'Doanh nghiệp',
  ],
  authors: [{ name: 'Duotech Team' }],
  creator: 'Duotech',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://duotech-crm.vercel.app',
    siteName: 'Duotech CRM',
    title: 'Duotech CRM - Bảng điều khiển Quản lý Quan hệ Khách hàng',
    description:
      'Hệ thống CRM chuyên nghiệp giúp tối ưu quản lý khách hàng, cơ hội kinh doanh, tiến độ hợp đồng và dòng tiền duy trì.',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 576,
        alt: 'Giao diện Duotech CRM Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Duotech CRM - Quản lý Quan hệ Khách hàng',
    description:
      'Bảng điều khiển Duotech CRM hiện đại, trực quan, theo dõi khách hàng và hợp đồng hiệu quả.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
