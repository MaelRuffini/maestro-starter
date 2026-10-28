import { Google_Sans_Flex } from "next/font/google";
import { PrismicPreview } from "@prismicio/next";

import { repositoryName } from "@/prismicio";
import { site } from "@/lib/site";
import { getSiteDefaults, getSiteIcons, getThemeColor } from "@/lib/metadata";
import Animations from "@/components/Animations";
import CustomCode from "@/components/CustomCode";
import GridOverlay from "@/components/GridOverlay";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.scss";

const googleSans = Google_Sans_Flex({
  variable: "--font-google-sans-flex",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  display: "swap",
});

export async function generateMetadata() {
  const [defaults, icons] = await Promise.all([getSiteDefaults(), getSiteIcons()]);

  return {
    title: {
      default: defaults.title,
      template: `%s | ${defaults.title}`,
    },
    description: defaults.description,
    openGraph: {
      images: defaults.image ? [{ url: defaults.image }] : undefined,
    },
    icons,
  };
}

export async function generateViewport() {
  return { themeColor: await getThemeColor() };
}

export default function RootLayout({ children }) {
  return (
    <html lang={site.lang} className={googleSans.variable}>
      <body>
        <CustomCode position="head" />
        <a href="#main" className="skip-link">
          Aller au contenu principal
        </a>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SmoothScroll />
        <Animations />
        <GridOverlay />
        <PrismicPreview repositoryName={repositoryName} />
        <CustomCode position="body-end" />
      </body>
    </html>
  );
}
