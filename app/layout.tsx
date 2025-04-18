import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import SessionProvider from "./SessionProvider";
import { validateRequest } from "@/auth";
import { CustomerTier } from "./(customer)/_components/(sidebar)/types";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, session } = await validateRequest();

  // Map the `user` object to match `SessionUser` type if needed
  const mappedUser = user
    ? {
        ...user,
        // Map the `tier` property to match the expected type
        tier: user.tier as CustomerTier | undefined,
      }
    : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider value={{ user: mappedUser, session }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}