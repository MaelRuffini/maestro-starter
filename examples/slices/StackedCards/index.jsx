// Reference: repeatable group on container--large, client child (StackedCardsList) isolates GSAP ScrollTrigger, server shell stays here.
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

import SliceSection from "@/components/SliceSection";
import SliceTitle from "@/components/SliceTitle";
import Prose from "@/components/Prose";
import Button from "@/components/Button";
import StackedCardsList from "./StackedCardsList";
import "./stacked-cards.scss";

/**
 * @typedef {import("@prismicio/client").Content.StackedCardsSlice} StackedCardsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<StackedCardsSlice>} StackedCardsProps
 * @type {import("react").FC<StackedCardsProps>}
 */
const StackedCards = ({ slice }) => {
  const { title, description, cards: cardItems, cta } = slice.primary;
  const cards = (cardItems ?? []).filter(
    (card) =>
      isFilled.image(card.image) ||
      isFilled.keyText(card.eyebrow) ||
      isFilled.keyText(card.title) ||
      isFilled.richText(card.description),
  );
  const hasHeader = isFilled.richText(title) || isFilled.richText(description);

  return (
    <SliceSection
      slice={slice}
      className="stacked-cards"
      containerClassName="container--large"
      wrapperClassName="stacked-cards__wrapper"
    >
      <div className="stacked-cards__panel">
        {hasHeader && (
          <div className="row justify-center">
            <div className="col col-lg-8 col-md-12">
              <header className="stacked-cards__header">
                <SliceTitle field={title} className="stacked-cards__title h2" />
                {isFilled.richText(description) && (
                  <Prose
                    field={description}
                    className="stacked-cards__description"
                  />
                )}
              </header>
            </div>
          </div>
        )}

        {cards.length > 0 && (
          <div className="row justify-center">
            <div className="col col-lg-10 col-md-12">
              <StackedCardsList>
                {cards.map((card, index) => (
                  <li
                    key={card.image.id ?? `${card.title ?? "card"}-${index}`}
                    className="stacked-cards__item"
                  >
                    <article className="stacked-cards__card u-theme-dark">
                      {isFilled.image(card.image) && (
                        <PrismicNextImage
                          field={card.image}
                          className="stacked-cards__image"
                          sizes="(max-width: 991px) 100vw, 70vw"
                          fallbackAlt=""
                        />
                      )}
                      <div
                        className="stacked-cards__overlay overlay"
                        aria-hidden="true"
                      />
                      <div className="stacked-cards__body">
                        {isFilled.keyText(card.eyebrow) && (
                          <p className="stacked-cards__eyebrow h6">
                            {card.eyebrow}
                          </p>
                        )}
                        {isFilled.keyText(card.title) && (
                          <h3 className="stacked-cards__card-title h3">
                            {card.title}
                          </h3>
                        )}
                        {isFilled.richText(card.description) && (
                          <Prose
                            field={card.description}
                            className="stacked-cards__card-description"
                          />
                        )}
                      </div>
                    </article>
                  </li>
                ))}
              </StackedCardsList>
            </div>
          </div>
        )}

        {isFilled.link(cta) && (
          <div className="stacked-cards__footer">
            <Button field={cta} />
          </div>
        )}
      </div>
    </SliceSection>
  );
};

export default StackedCards;
