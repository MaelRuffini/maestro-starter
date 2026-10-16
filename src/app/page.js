import { asImageSrc, isFilled, NotFoundError } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import SetupNotice from "@/components/SetupNotice";
import { getSiteDefaults } from "@/lib/metadata";
import { sliceContext } from "@/lib/collection";

async function getHomepage() {
  const client = createClient();

  try {
    return await client.getSingle("homepage");
  } catch (error) {
    // A freshly created repository has no Homepage document yet. Render a
    // setup notice instead of failing the build so the template deploys.
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

export default async function Home() {
  const page = await getHomepage();

  if (!page) return <SetupNotice />;

  return (
    <SliceZone
      slices={page.data.slices}
      components={components}
      context={sliceContext(page)}
    />
  );
}

export async function generateMetadata() {
  const [page, defaults] = await Promise.all([getHomepage(), getSiteDefaults()]);

  if (!page) {
    return {
      title: { absolute: defaults.title },
      description: defaults.description,
      openGraph: {
        images: defaults.image ? [{ url: defaults.image }] : undefined,
      },
    };
  }

  const title = isFilled.keyText(page.data.meta_title)
    ? page.data.meta_title
    : defaults.title;
  const description = isFilled.keyText(page.data.meta_description)
    ? page.data.meta_description
    : defaults.description;
  const image = isFilled.image(page.data.meta_image)
    ? asImageSrc(page.data.meta_image)
    : defaults.image;

  return {
    title: { absolute: title },
    description,
    openGraph: {
      images: image ? [{ url: image }] : undefined,
    },
  };
}
