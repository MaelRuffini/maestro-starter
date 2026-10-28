import groq from "groq";

const sliceProjection = groq`slices[]{ ..., cta{ ..., internal->{_type, slug} } }`;

export const homepageQuery = groq`*[_type == "homepage"][0]{ ..., seo, ${sliceProjection} }`;

export const pageBySlugQuery = groq`*[_type == "page" && slug.current == $slug][0]{ ..., seo, ${sliceProjection} }`;

export const settingsQuery = groq`*[_type == "settings"][0]`;
