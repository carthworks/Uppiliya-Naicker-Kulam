import './globals.css'

export const metadata = {
  title: 'Uppiliya Naicker Community | Kulam Identifier',
  description: 'Identify your category, kulatheivam, and relationships in the Uppiliya Naicker Community.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ta">
      <body>{children}</body>
    </html>
  )
}
