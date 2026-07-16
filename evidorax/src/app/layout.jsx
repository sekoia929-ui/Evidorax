import './globals.css'

export const metadata = {
  title: 'EvidoraX — Evidence extraction',
  description: 'Upload research papers, get a verified PICO and GRADE extraction table in minutes.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
