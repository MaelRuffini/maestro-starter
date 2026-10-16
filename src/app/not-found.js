import Link from "next/link";

import SliceSection from "@/components/SliceSection";

export const metadata = {
  title: "Page introuvable",
};

export default function NotFound() {
  return (
    <SliceSection
      settings={{ padding_top: "Large (160px)", padding_bottom: "Large (160px)" }}
    >
      <h1 className="h2">Page introuvable</h1>
      <p className="text-large">
        La page que vous cherchez n’existe pas ou a été déplacée.
      </p>
      <p>
        <Link href="/" className="link link--simple">
          Retour à l’accueil
        </Link>
      </p>
    </SliceSection>
  );
}
