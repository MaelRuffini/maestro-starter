// Reference: paired themed cards on container--large (asymmetric CSS grid), per-card .u-theme-* sub-block, decorative image aria-hidden, Button from a Link field.
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

import SliceSection, { joinClasses } from "@/components/SliceSection";
import SliceTitle from "@/components/SliceTitle";
import Prose from "@/components/Prose";
import Button from "@/components/Button";
import "./cta-cards.scss";

const CARD_THEME_CLASS = {
  Brand: "u-theme-brand",
  Dark: "u-theme-dark",
  Light: "u-theme-light",
};

// Figma "material-symbols:check-rounded": filled disc in the text color,
// check cut out in the card background.
function CheckIcon() {
  return (
    <svg
      className="cta-cards__check"
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="18" height="18" rx="9" fill="currentColor" />
      <path
        className="cta-cards__check-mark"
        d="M7.73 10.63l4.39-4.39a.5.5 0 0 1 .73 0 .5.5 0 0 1 0 .74l-4.75 4.76a.5.5 0 0 1-.73 0L5.14 9.52a.5.5 0 0 1 .01-.74.5.5 0 0 1 .74 0l1.84 1.85Z"
      />
    </svg>
  );
}

/**
 * @param {{ field: import("@prismicio/client").RichTextField }} props
 */
function Checklist({ field }) {
  const items = (field ?? []).filter(
    (block) => block.type === "list-item" || block.type === "o-list-item",
  );

  if (items.length === 0) return null;

  return (
    <ul className="cta-cards__points" role="list">
      {items.map((item, index) => (
        <li key={`${item.text ?? "point"}-${index}`} className="cta-cards__point">
          <CheckIcon />
          <span className="cta-cards__point-text">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * @param {{ card: Record<string, any> | undefined, position: "left" | "right" }} props
 */
function Card({ card, position }) {
  if (!card) return null;

  const hasContent =
    isFilled.richText(card.title) ||
    isFilled.richText(card.description) ||
    isFilled.richText(card.points) ||
    isFilled.image(card.image) ||
    isFilled.link(card.cta);

  if (!hasContent) return null;

  const hasImage = isFilled.image(card.image);
  const cta = isFilled.link(card.cta) && (
    <div className="cta-cards__cta">
      <Button field={card.cta} />
    </div>
  );

  return (
    <article
      className={joinClasses(
        "cta-cards__card",
        `cta-cards__card--${position}`,
        hasImage && "cta-cards__card--has-image",
        CARD_THEME_CLASS[card.theme] ?? CARD_THEME_CLASS.Brand,
      )}
    >
      <div className="cta-cards__copy">
        <SliceTitle field={card.title} className="cta-cards__title h3" />
        {isFilled.richText(card.description) && (
          <Prose
            field={card.description}
            className="cta-cards__description text-muted"
          />
        )}
        {isFilled.richText(card.points) && <Checklist field={card.points} />}
        {hasImage && cta}
      </div>
      {hasImage && (
        <div className="cta-cards__media">
          <PrismicNextImage
            field={card.image}
            className="cta-cards__image"
            sizes="(max-width: 991px) 100vw, 18vw"
            fallbackAlt=""
          />
        </div>
      )}
      {!hasImage && cta}
    </article>
  );
}

/**
 * @typedef {import("@prismicio/client").Content.CtaCardsSlice} CtaCardsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<CtaCardsSlice>} CtaCardsProps
 * @type {import("react").FC<CtaCardsProps>}
 */
const CtaCards = ({ slice }) => {
  const left = slice.primary.left_card?.[0];
  const right = slice.primary.right_card?.[0];

  return (
    <SliceSection
      slice={slice}
      className="cta-cards"
      containerClassName="container--large"
      wrapperClassName="cta-cards__wrapper"
    >
      <div className="cta-cards__grid">
        <Card card={left} position="left" />
        <Card card={right} position="right" />
      </div>
    </SliceSection>
  );
};

export default CtaCards;
