import { createClient as baseCreateClient } from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import prismicConfig from "../prismic.config.json";

/**
 * The project's Prismic repository name.
 */
export const repositoryName =
	process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || prismicConfig.repositoryName;

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param {import("@prismicio/client").ClientConfig & { preview?: boolean }} [config]
 *   Configuration for the Prismic client. `preview: false` skips the preview
 *   cookie so the query stays on the published release (sitemap).
 */
export const createClient = ({ preview = true, ...config } = {}) => {
	const client = baseCreateClient(repositoryName, {
		routes: prismicConfig.routes,
		// Only needed when the repository's API is private (see .env.local.example).
		accessToken: process.env.PRISMIC_ACCESS_TOKEN || undefined,
		fetchOptions:
			process.env.NODE_ENV === 'production'
				? { next: { tags: ['prismic'] }, cache: 'force-cache' }
				: { next: { revalidate: 5 } },
		...config,
	});

	if (preview) enableAutoPreviews({ client });

	return client;
};