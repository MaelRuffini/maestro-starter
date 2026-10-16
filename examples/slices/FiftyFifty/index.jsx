// Reference: asymmetric inset grid (row justify-between + ml/mr-1-col), alternating media side per item, main + secondary image with position modifier.
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

import SliceSection, { joinClasses } from "@/components/SliceSection";
import SliceTitle from "@/components/SliceTitle";
import Prose from "@/components/Prose";
import "./fifty-fifty.scss";

const SECONDARY_POSITION = {
  "Top left": "top-left",
  "Top right": "top-right",
  "Bottom left": "bottom-left",
  "Bottom right": "bottom-right",
};

/**
 * @param {string | null | undefined} value
 */
function secondaryPositionModifier(value) {
  return SECONDARY_POSITION[value] ?? "bottom-right";
}

/**
 * @typedef {import("@prismicio/client").Content.FiftyFiftySlice} FiftyFiftySlice
 * @typedef {import("@prismicio/react").SliceComponentProps<FiftyFiftySlice>} FiftyFiftyProps
 * @type {import("react").FC<FiftyFiftyProps>}
 */
const FiftyFifty = ({ slice }) => {
  const { title, description, items: rawItems } = slice.primary;
  const items = (rawItems ?? []).filter(
    (item) =>
      isFilled.image(item.image) ||
      isFilled.image(item.image_secondary) ||
      isFilled.keyText(item.title) ||
      isFilled.richText(item.description),
  );
  const hasHeader = isFilled.richText(title) || isFilled.richText(description);

  return (
    <SliceSection
      slice={slice}
      className="fifty-fifty"
      wrapperClassName="fifty-fifty__wrapper"
    >
      {hasHeader && (
        <div className="row justify-center">
          <div className="col col-lg-8 col-md-12">
            <header className="fifty-fifty__header">
              <SliceTitle field={title} className="fifty-fifty__title h2" />
              {isFilled.richText(description) && (
                <Prose field={description} className="fifty-fifty__intro" />
              )}
            </header>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <ul className="fifty-fifty__list" role="list">
          {items.map((item, index) => {
            const mediaFirst = index % 2 === 1;
            const hasMain = isFilled.image(item.image);
            const hasSecondary = isFilled.image(item.image_secondary);
            const hasMedia = hasMain || hasSecondary;
            const position = secondaryPositionModifier(item.secondary_position);

            return (
              <li
                key={
                  item.image.id ??
                  item.image_secondary.id ??
                  `${item.title ?? "item"}-${index}`
                }
                className="fifty-fifty__item"
              >
                <article>
                  <div
                    className={joinClasses(
                      "row justify-between align-center fifty-fifty__row",
                      mediaFirst && "fifty-fifty__row--media-first",
                    )}
                  >
                    <div
                      className={
                        mediaFirst
                          ? "col mr-1-col col-lg-4 col-md-12"
                          : "col ml-1-col col-lg-4 col-md-12"
                      }
                    >
                      <div className="fifty-fifty__copy">
                        {isFilled.keyText(item.title) && (
                          <h3 className="fifty-fifty__item-title h3">
                            {item.title}
                          </h3>
                        )}
                        {isFilled.richText(item.description) && (
                          <Prose
                            field={item.description}
                            className="fifty-fifty__item-description"
                          />
                        )}
                      </div>
                    </div>

                    {hasMedia && (
                      <div
                        className={
                          mediaFirst
                            ? "col ml-1-col col-lg-5 col-md-12"
                            : "col mr-1-col col-lg-5 col-md-12"
                        }
                      >
                        <div
                          className={joinClasses(
                            "fifty-fifty__media",
                            hasMain &&
                              hasSecondary &&
                              `fifty-fifty__media--${position}`,
                          )}
                        >
                          {hasMain && (
                            <PrismicNextImage
                              field={item.image}
                              className="fifty-fifty__image"
                              sizes="(max-width: 991px) 100vw, 42vw"
                              fallbackAlt=""
                            />
                          )}
                          {hasMain && hasSecondary && (
                            <PrismicNextImage
                              field={item.image_secondary}
                              className="fifty-fifty__image-secondary"
                              sizes="(max-width: 991px) 60vw, 25vw"
                              fallbackAlt=""
                            />
                          )}
                          {!hasMain && hasSecondary && (
                            <PrismicNextImage
                              field={item.image_secondary}
                              className="fifty-fifty__image"
                              sizes="(max-width: 991px) 100vw, 42vw"
                              fallbackAlt=""
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </SliceSection>
  );
};

export default FiftyFifty;
