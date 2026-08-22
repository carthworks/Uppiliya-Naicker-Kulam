import './globals.css';
import { Analytics } from "@vercel/analytics/next";
import NavHeader from './components/NavHeader';

const baseUrl = 'https://uppiliya-naicker-kulam.vercel.app';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'உப்பிலிய நாயக்கர் குல அடையாள தளம் | Uppiliya Naicker Community',
    template: '%s | Uppiliya Naicker Community',
  },
  description: 'உப்பிலிய நாயக்கர் சமூகத்தின் 64 குலங்கள், குலதெய்வக் கோவில்கள், பங்காளிகள், மாமன் மச்சான் உறவுகள், வரலாறு, சிந்தனைகள், ராசி பொருத்தம் மற்றும் ஓரை கணிப்பான்.',
  keywords: [
    'Uppiliya Naicker',
    'உப்பிலிய நாயக்கர்',
    'Uppiliyar',
    'உப்பிலியர்',
    'Kulatheivam',
    'குலதெய்வம்',
    'Pattakarargal',
    'பட்டக்காரர்கள்',
    'Kulam',
    'குலம்',
    'Pangali',
    'பங்காளி',
    'Naicker Kulam',
    'Rasi Porutham',
    'Horai Calculator',
    'Uppara',
    'Upparavar'
  ],
  authors: [{ name: 'T. Karthikeyan', url: 'https://carthworks.vercel.app' }],
  creator: 'T. Karthikeyan',
  publisher: 'Uppiliya Naicker Community Portal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'உப்பிலிய நாயக்கர் குல அடையாள தளம் | Uppiliya Naicker Community',
    description: 'உப்பிலிய நாயக்கர் சமூகத்தின் 64 குலங்கள், குலதெய்வக் கோவில்கள், பங்காளிகள், வரலாறு மற்றும் சிந்தனைகள்.',
    url: baseUrl,
    siteName: 'Uppiliya Naicker Community Portal',
    images: [
      {
        url: '/images/uppliya_2.png',
        width: 1200,
        height: 1800,
        alt: 'Uppiliya Naicker Community History & Infographic',
      },
      {
        url: '/images/uppliakulam.png',
        width: 800,
        height: 600,
        alt: 'Uppiliya Naicker Emblem',
      },
    ],
    locale: 'ta_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'உப்பிலிய நாயக்கர் குல அடையாள தளம் | Uppiliya Naicker Community',
    description: '64 குலங்கள், குலதெய்வக் கோவில்கள், பங்காளிகள், வரலாறு மற்றும் சிந்தனைகள்.',
    images: ['/images/uppliya_2.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Uppiliya Naicker Community Portal',
  alternateName: 'உப்பிலிய நாயக்கர் குல அடையாள தளம்',
  url: baseUrl,
  description: 'Directory of 64 Kulams, Kulatheivam Temples, Pangali Lineage, History, and Community Roadmap for Uppiliya Naicker Community',
  publisher: {
    '@type': 'Organization',
    name: 'Uppiliya Naicker Community Trust',
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/images/uppliakulam.png`,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ta" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NavHeader />

        <main style={{ minHeight: '80vh' }}>
          {children}
        </main>

        <footer style={{
          marginTop: '4rem',
          padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 5vw, 2rem)',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: 'clamp(1rem, 4vw, 2rem)',
            fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📞 +91 94867 72206
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ✉️ tkarthikeyan@gmail.com
            </span>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} Uppiliya Naicker Community Portal. All rights reserved.
          </p>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
