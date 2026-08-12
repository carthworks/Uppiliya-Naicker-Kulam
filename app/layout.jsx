import './globals.css'
import { Analytics } from "@vercel/analytics/next"
import NavHeader from './components/NavHeader'

export const metadata = {
    title: 'Uppiliya Naicker Community | Kulam Identifier',
    description: 'Identify your category, kulatheivam, and relationships in the Uppiliya Naicker Community.',
}

export default function RootLayout({ children }) {
    return (
        <html lang="ta" suppressHydrationWarning>
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
    )
}
