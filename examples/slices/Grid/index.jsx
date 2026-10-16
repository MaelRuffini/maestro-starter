// Reference: centered 8-col lockup + CSS-grid repeatable cards (--x-columns, minmax(0, 1fr)), per-card .u-theme-* sub-block.
import { isFilled } from "@prismicio/client";

import SliceSection, { joinClasses } from "@/components/SliceSection";
import SliceTitle from "@/components/SliceTitle";
import Prose from "@/components/Prose";
import "./grid.scss";

const CARD_THEME_CLASS = {
  Brand: "u-theme-brand",
  Dark: "u-theme-dark",
  Light: "u-theme-light",
};

const COLUMN_CLASS = {
  2: "grid__list--2",
  3: "grid__list--3",
  4: "grid__list--4",
};

/**
 * @typedef {import("@prismicio/client").Content.GridSlice} GridSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<GridSlice>} GridProps
 * @type {import("react").FC<GridProps>}
 */
const Grid = ({ slice }) => {
  const { title, columns, cards: cardItems } = slice.primary;
  const columnCount = columns && columns in COLUMN_CLASS ? columns : "4";
  const cards = (cardItems ?? []).filter(
    (card) => isFilled.keyText(card.stat) || isFilled.richText(card.description),
  );

  return (
    <SliceSection
      slice={slice}
      className="grid"
      wrapperClassName="grid__wrapper"
    >
      {isFilled.richText(title) && (
        <div className="row justify-center">
          <div className="col col-lg-8 col-md-12">
            <SliceTitle field={title} className="grid__title h2" />
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <ul
          className={joinClasses("grid__list", COLUMN_CLASS[columnCount])}
          role="list"
        >
          {cards.map((card, index) => (
            <li key={`${card.stat ?? "card"}-${index}`} className="grid__item">
              <article
                className={joinClasses(
                  "grid__card",
                  CARD_THEME_CLASS[card.theme] ?? CARD_THEME_CLASS.Dark,
                  card.theme === "Light" && "grid__card--light",
                )}
              >
                {isFilled.keyText(card.stat) && (
                  <h3 className="grid__stat h3">{card.stat}</h3>
                )}
                {isFilled.richText(card.description) && (
                  <Prose
                    field={card.description}
                    className="grid__description"
                  />
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </SliceSection>
  );
};

export default Grid;
