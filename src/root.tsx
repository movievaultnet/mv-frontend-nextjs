import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ThemeProvider } from "./app/components/ThemeProvider";
import { Footer } from "./app/components/Footer";
import { Toaster } from "./app/components/ui/sonner";
import "./styles/index.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MovieVault: Your physical film release database</title>
        <meta
          name="description"
          content="MovieVault is a database and collection space for physical film editions. Discover releases, track formats, and manage your personal cinema archive."
        />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
      <Footer />
      <Toaster />
    </>
  );
}
