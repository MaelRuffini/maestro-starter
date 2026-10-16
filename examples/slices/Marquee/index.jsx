// Reference: looping row of images with CSS keyframes, duplicated track marked aria-hidden, paused under prefers-reduced-motion.
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

import SliceSection from "@/components/SliceSection";
import SliceTitle from "@/components/SliceTitle";
import Prose from "@/components/Prose";
import "./marquee.scss";

/**
 * @param {{
 *   items: import("@prismicio/client").Content.MarqueeSliceDefaultPrimaryImagesTopItem[] | import("@prismicio/client").Content.MarqueeSliceDefaultPrimaryImagesBottomItem[],
 *   hidden?: boolean,
 * }} props
 */
function MarqueeList({ items, hidden = false }) {
  return (
    <ul className="marquee__list" role="list" aria-hidden={hidden || undefined}>
      {items.map((item, index) => (
        <li key={item.image.id ?? index} className="marquee__item">
          <PrismicNextImage
            field={item.image}
            className="marquee__image"
            sizes="21rem"
            fallbackAlt=""
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * @param {{
 *   items: import("@prismicio/client").Content.MarqueeSliceDefaultPrimaryImagesTopItem[] | import("@prismicio/client").Content.MarqueeSliceDefaultPrimaryImagesBottomItem[],
 *   direction: "ltr" | "rtl",
 * }} props
 */
function MarqueeTrack({ items, direction }) {
  return (
    <div className={`marquee__viewport marquee__viewport--${direction}`}>
      <div className="marquee__track">
        <MarqueeList items={items} />
        <MarqueeList items={items} hidden />
      </div>
    </div>
  );
}

/**
 * @typedef {import("@prismicio/client").Content.MarqueeSlice} MarqueeSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<MarqueeSlice>} MarqueeProps
 * @type {import("react").FC<MarqueeProps>}
 */
const Marquee = ({ slice }) => {
  const { title, description, images_top, images_bottom } = slice.primary;
  const imagesTop = (images_top ?? []).filter((item) => isFilled.image(item.image));
  const imagesBottom = (images_bottom ?? []).filter((item) =>
    isFilled.image(item.image),
  );
  const hasHeader = isFilled.richText(title) || isFilled.richText(description);
  const hasTracks = imagesTop.length > 0 || imagesBottom.length > 0;

  return (
    <SliceSection
      slice={slice}
      className="marquee"
      wrapperClassName="marquee__wrapper"
    >
      {hasHeader && (
        <div className="row justify-center">
          <div className="col col-lg-10 col-md-12">
            <header className="marquee__header">
              <SliceTitle field={title} className="marquee__title h2" />
              {isFilled.richText(description) && (
                <Prose field={description} className="marquee__description" />
              )}
            </header>
          </div>
        </div>
      )}

      {hasTracks && (
        <div className="marquee__tracks">
          {imagesTop.length > 0 && (
            <MarqueeTrack items={imagesTop} direction="ltr" />
          )}
          {imagesBottom.length > 0 && (
            <MarqueeTrack items={imagesBottom} direction="rtl" />
          )}
        </div>
      )}
    </SliceSection>
  );
};

export default Marquee;
