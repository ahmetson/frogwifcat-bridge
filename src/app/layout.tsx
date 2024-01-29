import '@/utils/reset.css';
import { Metadata } from 'next';
import { versionConfig } from '@/utils/env';

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: versionConfig.origin
      ? new URL(versionConfig.origin)
      : undefined,
    title: 'OFT Bridge UI',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
