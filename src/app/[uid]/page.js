import { notFound } from "next/navigation";
import { asImageSrc, isFilled } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { getSiteDefaults } from "@/lib/metadata";
import { sliceContext } from "@/lib/collection";

export default async function Page({ params }) {
  const { uid } = await params;
  const client = createClient();
  const page = await client.getByUID("page", uid).catch(() => notFound());

  return (
    <SliceZone
      slices={page.data.slices}
      components={components}
      context={sliceContext(page)}
    />
  );
}

export async function generateMetadata({ params }) {
  const { uid } = await params;
  const client = createClient();
  const [page, defaults] = await Promise.all([
    client.getByUID("page", uid).catch(() => notFound()),
    getSiteDefaults(),
  ]);

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
    title,
    description,
    openGraph: {
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("page");

  return pages.map((page) => ({ uid: page.uid }));
}
