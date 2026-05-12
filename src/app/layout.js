import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata = {
  title: "Цифровий Гардероб",
  description: "Стильний додаток для управління вашим гардеробом, створення образів та капсул.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
