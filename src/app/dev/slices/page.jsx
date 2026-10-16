import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";

import { components } from "@/slices";
import "./dev-slices.scss";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Slice library (dev)",
  robots: { index: false, follow: false },
};

const SLICES_DIR = path.join(process.cwd(), "src/slices");

/**
 * Loads every `src/slices/<Name>/mocks.json`, one entry per variation. A mock
 * entry may carry a top-level `fixtures` key (`{ "<type>": [documents] }`)
 * for slices that list a collection (SKILL.md §3.7); it is passed to the
 * slice through `context.fixtures` instead of being part of the slice.
 */
async function loadMocks() {
  const entries = await readdir(SLICES_DIR, { withFileTypes: true });
  const mocks = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      const raw = await readFile(path.join(SLICES_DIR, entry.name, "mocks.json"), "utf8");
      mocks.push(
        ...JSON.parse(raw).map(({ fixtures, ...slice }) => ({
          folder: entry.name,
          slice,
          fixtures,
        })),
      );
    } catch {
      mocks.push({ folder: entry.name, slice: null });
    }
  }

  return mocks;
}

/** What a page route would pass as `context`, with the mock's fixtures on top. */
const devContext = (fixtures) => ({
  document: { id: "dev", type: "dev", uid: null },
  fixtures,
});

/**
 * Development-only gallery of every slice rendered from its mocks.json.
 * Use it to check a slice visually before opening a PR:
 *   /dev/slices              → all slices, all variations
 *   /dev/slices?slice=hero   → one slice
 */
export default async function DevSlicesPage({ searchParams }) {
  if (process.env.NODE_ENV === "production") notFound();

  const { slice: filter } = await searchParams;
  const mocks = (await loadMocks()).filter(
    ({ folder, slice }) =>
      !filter || folder.toLowerCase() === filter.toLowerCase() || slice?.slice_type === filter,
  );

  if (mocks.length === 0) {
    return (
      <div className="dev-slices">
        <p className="dev-slices__empty">
          {filter
            ? <>No slice matches <code>{filter}</code>.</>
            : <>No slice yet. Create one with <code>npm run slice:scaffold -- Name --fields fields.json</code>; reference patterns live in <code>examples/slices/</code>.</>}
        </p>
      </div>
    );
  }

  return (
    <div className="dev-slices">
      {mocks.map(({ folder, slice, fixtures }, index) => (
        <div key={`${folder}-${slice?.variation ?? index}`} className="dev-slices__entry">
          <p className="dev-slices__meta">
            <strong>{folder}</strong>
            {slice ? ` · ${slice.variation}` : " · missing mocks.json"}
          </p>
          {slice ? (
            <SliceZone
              slices={[slice]}
              components={components}
              context={devContext(fixtures)}
            />
          ) : (
            <p className="dev-slices__empty">
              Add <code>src/slices/{folder}/mocks.json</code> to preview this slice.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
