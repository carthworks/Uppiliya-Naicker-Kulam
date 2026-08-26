import './globals.css';
import { Analytics } from "@vercel/analytics/next";
import NavHeader from './components/NavHeader';
import SiteFooter from './components/SiteFooter';

const baseUrl = 'https://uppiliya-naicker-kulam.vercel.app';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'உப்பிலியர் களம் | உப்பிலிய நாயக்கர் குல அடையாள தளம்',
    template: '%s | உப்பிலியர் களம்',
  },
  description: 'உப்பிலியர் களம் — உப்பிலிய நாயக்கர் சமூகத்தின் 64 குலங்கள், குலதெய்வக் கோவில்கள், பங்காளிகள், மாமன் மச்சான் உறவுகள், வரலாறு, சிந்தனைகள், ராசி பொருத்தம் மற்றும் ஓரை கணிப்பான்.',
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
  icons: {
    icon: '/images/uppliakulam.png',
    shortcut: '/images/uppliakulam.png',
    apple: '/images/uppliakulam.png',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'உப்பிலியர் குலம்',
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

        <SiteFooter />

        <Analytics />
      </body>
    </html>
  );
}
