import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
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
  // Metadata for SEO and browser tab information
  title: "Travel Budget",
  description: "Track and manage your travel expenses",
};

/**
 * Root Layout Component
 * 
 * Wraps the entire application, providing global context providers (Theme, Auth)
 * and setting up base HTML structure including fonts.
 * 
 * @param {React.ReactNode} children - The nested page or layout components.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning 
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>
      <body>
        {/* ThemeProvider manages dark/light mode across the app */}
        <ThemeProvider>
          {/* AuthProvider manages user authentication state and related data */}
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
