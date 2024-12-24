import "@/styles/globals.css"
import { GeistSans } from 'geist/font/sans'
import localFont from 'next/font/local'

const ivarSoft = localFont({
  src: [
    {
      path: './fonts/IvarSoft-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    // {
    //   path: './fonts/IvarSoft-Medium.otf',
    //   weight: '500',
    //   style: 'normal',
    // },
  ],
  variable: '--font-ivar-soft'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${ivarSoft.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}

