import './globals.css';
import AppNav from './AppNav';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a]">
        <AppNav />
        {children}
      </body>
    </html>
  );
}