// Reference: full-bleed media (container--no-padding + absolute media + inner container--raised), 100svh, centered 8-col lockup, SliceTitle fallbackTag=h1.
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

import SliceSection from "@/components/SliceSection";
import SliceTitle from "@/components/SliceTitle";
import Prose from "@/components/Prose";
import "./hero.scss";

/**
 * @typedef {import("@prismicio/client").Content.HeroSlice} HeroSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<HeroSlice>} HeroProps
 * @type {import("react").FC<HeroProps>}
 */
const Hero = ({ slice }) => {
  const { title, description, video, background_image } = slice.primary;
  const videoSrc = isFilled.link(video) ? video.url : undefined;
  const hasBackground = isFilled.image(background_image);

  return (
    <SliceSection
      slice={slice}
      className="hero"
      containerClassName="container--no-padding"
      wrapperClassName="hero__wrapper"
      background={
        <>
          {hasBackground && (
            <PrismicNextImage
              field={background_image}
              className={
                videoSrc
                  ? "hero__background hero__background--fallback"
                  : "hero__background"
              }
              sizes="100vw"
              fallbackAlt=""
              priority
            />
          )}

          {videoSrc && (
            <video
              className="hero__media"
              src={videoSrc}
              poster={hasBackground ? background_image.url : undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
          )}

          <div className="hero__overlay overlay" aria-hidden="true" />
        </>
      }
    >
      <div className="container container--raised">
        <div className="row justify-center">
          <div className="col col-lg-8 col-md-12">
            <div className="hero__content">
              <SliceTitle
                field={title}
                className="hero__title h1"
                fallbackTag="h1"
              />

              {isFilled.richText(description) && (
                <Prose field={description} className="hero__description" />
              )}
            </div>
          </div>
        </div>
      </div>
    </SliceSection>
  );
};

export default Hero;
