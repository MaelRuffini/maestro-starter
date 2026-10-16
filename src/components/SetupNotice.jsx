import { repositoryName } from "@/prismicio";
import SliceSection from "./SliceSection";
import "@/styles/components/setup-notice.scss";

/**
 * Shown on the homepage while the Prismic repository has no Homepage document.
 * Disappears as soon as content exists; safe to leave in the template.
 */
export default function SetupNotice() {
  return (
    <SliceSection
      settings={{ padding_top: "Large (160px)", padding_bottom: "Large (160px)" }}
    >
      <p className="label text-muted">Configuration</p>
      <h1 className="h2">Aucune page d’accueil publiée</h1>
      <p className="text-large">
        Le dépôt Prismic <strong>{repositoryName}</strong> ne contient pas encore
        de document « Homepage ». Publiez les modèles puis créez la page :
      </p>
      <ol className="setup-notice__steps">
        <li>
          <code>npx prismic push</code> pour envoyer les types et slices à
          Prismic.
        </li>
        <li>
          Dans le Page Builder, créer un document <strong>Homepage</strong>,
          ajouter des slices et publier.
        </li>
      </ol>
    </SliceSection>
  );
}
