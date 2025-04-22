import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Reparaciónes Tesla's",
  },
  description: "Aplicación para gestión de órdenes de trabajo",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
}

// Make the layout more resilient to errors
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Wrap the entire layout in a try-catch to prevent build failures
  try {
    return (
      <html lang="es" suppressHydrationWarning>
        <body className={`${inter.className} print-layout`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>

          <Toaster
            position="top-right"
            visibleToasts={5}
            theme="system"
            richColors
            toastOptions={{
              classNames: {
                toast: "cursor-pointer",
              },
            }}
          />
        </body>
      </html>
    )
  } catch (error) {
    // Fallback layout in case of errors
    console.error("Error in root layout:", error)
    return (
      <html lang="es">
        <body className={inter.className}>
          <div>{children}</div>
        </body>
      </html>
    )
  }
}
