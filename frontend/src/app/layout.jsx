// frontend/src/app/layout.jsx
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import AuthHydrator from '@/components/AuthHydrator';

export const metadata = {
  title: 'FreshMongers - Fresh Fish Online',
  description: 'Buy fresh fish online in Trivandrum with UPI payment and WhatsApp confirmation',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthHydrator />
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          {children}
          <Toaster position="top-right" />
        </div>
      </body>
    </html>
  );
}
