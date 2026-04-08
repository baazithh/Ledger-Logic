import './globals.css';
import AppNav from './AppNav';
import RouteTransitionLoader from './RouteTransitionLoader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a]">
        <RouteTransitionLoader />
        <AppNav />
        {children}
      </body>
    </html>
  );
}