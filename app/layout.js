import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import { ThemeProvider } from './context/ThemeContext';
import "./globals.css";

// Load font variants
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: "Travel Budget",
  description: "Track and manage your travel expenses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning 
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
