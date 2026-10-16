// Reference: 5/7 two-column layout, native <details>/<summary> accordion, client child (FaqList) isolates the GSAP height tween, server shell stays here.
import { isFilled } from "@prismicio/client";

import SliceSection, { joinClasses } from "@/components/SliceSection";
import SliceTitle from "@/components/SliceTitle";
import Prose from "@/components/Prose";
import Button from "@/components/Button";
import FaqList from "./FaqList";
import "./faq.scss";

/**
 * @typedef {import("@prismicio/client").Content.FaqSlice} FaqSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<FaqSlice>} FaqProps
 * @type {import("react").FC<FaqProps>}
 */
const Faq = ({ slice }) => {
  const { title, description, cta, questions: questionItems } = slice.primary;
  const questions = (questionItems ?? []).filter((item) =>
    isFilled.keyText(item.question),
  );
  const hasIntro =
    isFilled.richText(title) || isFilled.richText(description) || isFilled.link(cta);

  return (
    <SliceSection
      slice={slice}
      className={joinClasses(
        "faq",
        slice.variation === "listLeft" && "faq--list-left",
      )}
      wrapperClassName="faq__wrapper"
    >
      <div className="row faq__row">
        {hasIntro && (
          <div className="col col-lg-5 col-md-12 faq__intro-col">
            <header className="faq__intro">
              <SliceTitle field={title} className="faq__title h2" />
              {isFilled.richText(description) && (
                <Prose field={description} className="faq__description" />
              )}
              {isFilled.link(cta) && <Button field={cta} />}
            </header>
          </div>
        )}

        {questions.length > 0 && (
          <div className="col col-lg-7 col-md-12 faq__list-col">
            <FaqList>
              {questions.map((item, index) => (
                <li key={`${item.question}-${index}`}>
                  <details
                    className={joinClasses(
                      "faq__item",
                      index === 0 && "faq__item--open",
                    )}
                    open={index === 0}
                  >
                    <summary className="faq__question">
                      <h3 className="faq__question-text h7">{item.question}</h3>
                      <span className="faq__icon" aria-hidden="true">
                        <svg
                          className="faq__icon-glyph"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.57793 7.57732L7.57793 11.6196C7.57793 11.7709 7.51949 11.9049 7.40262 12.0218C7.28575 12.1386 7.1517 12.1971 7.00045 12.1971C6.84921 12.1971 6.71516 12.1386 6.59829 12.0218C6.48142 11.9049 6.42298 11.7709 6.42298 11.6196L6.42298 7.57732L2.38069 7.57732C2.22945 7.57732 2.09539 7.51888 1.97852 7.40201C1.86166 7.28514 1.80322 7.15109 1.80322 6.99985C1.80322 6.8486 1.86166 6.71455 1.97852 6.59768C2.09539 6.48081 2.22945 6.42237 2.38069 6.42237L6.42298 6.42238L6.42298 2.38008C6.42298 2.22884 6.48142 2.09478 6.59829 1.97791C6.71516 1.86105 6.84921 1.80261 7.00045 1.80261C7.1517 1.80261 7.28575 1.86105 7.40262 1.97791C7.51949 2.09478 7.57793 2.22884 7.57793 2.38008L7.57793 6.42238H11.6202C11.7715 6.42238 11.9055 6.48081 12.0224 6.59768C12.1393 6.71455 12.1977 6.8486 12.1977 6.99985C12.1977 7.15109 12.1393 7.28514 12.0224 7.40201C11.9055 7.51888 11.7715 7.57732 11.6202 7.57732H7.57793Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </summary>
                    {isFilled.richText(item.answer) && (
                      <div className="faq__content">
                        <Prose field={item.answer} className="faq__answer" />
                      </div>
                    )}
                  </details>
                </li>
              ))}
            </FaqList>
          </div>
        )}
      </div>
    </SliceSection>
  );
};

export default Faq;
