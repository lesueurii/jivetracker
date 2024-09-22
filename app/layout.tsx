import './globals.css'
import { Inter } from 'next/font/google'

import AppWalletProvider from "@/app/components/AppWalletProvider";
import ToastHandler from './components/ToastHandler';

export const metadata = {
  title: 'Jive Tracker',
  description: 'See how much you have been jiving!',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
        <ToastHandler />
      </body>
    </html>
  )
}
