import './globals.css'
import { Analytics } from "@vercel/analytics/next"
import Link from 'next/link'
export const metadata = {
    title: 'Uppiliya Naicker Community | Kulam Identifier',
    description: 'Identify your category, kulatheivam, and relationships in the Uppiliya Naicker Community.',
}

export default function RootLayout({ children }) {
    return (
        <html lang="ta">
            <body>
                <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Uppiliya.community
                        </div>
                    </Link>
                    <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Link href="/" style={{ color: 'var(--text-light)', textDecoration: 'none', fontSize: '1rem', fontWeight: '500' }}>Home</Link>
                        <Link href="/history" style={{ textDecoration: 'none', fontSize: '1rem', fontWeight: '700', background: 'linear-gradient(90deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>வரலாறு (History)</Link>
                        <Link href="/rasi-porutham" style={{ color: 'var(--text-light)', textDecoration: 'none', fontSize: '1rem', fontWeight: '500' }}>ராசி பொருத்தம்</Link>
                        <Link href="/horai" style={{ color: 'var(--text-light)', textDecoration: 'none', fontSize: '1rem', fontWeight: '500' }}>ஓரை</Link>
                    </nav>
                </header>

                {children}

                <footer style={{ marginTop: '4rem', padding: '3rem 2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.95rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📞 +91 94867 72206
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ✉️ tkarthikeyan@gmail.com
                        </span>
                    </div>
                    <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} Uppiliya Naicker Community Portal. All rights reserved.</p>
                </footer>

                <Analytics />
            </body>
        </html>
    )
}
