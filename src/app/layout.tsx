import '@/utils/reset.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>FrogWifCat Bridge</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
