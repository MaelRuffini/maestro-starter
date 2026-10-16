import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

type HomepageDocumentDataSlicesSlice = never

/**
 * Content for Homepage documents
 */
interface HomepageDocumentData {
	/**
	 * Slice Zone field in *Homepage*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: homepage.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<HomepageDocumentDataSlicesSlice>;/**
	 * Meta Title (50–60 characters) field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Shown in search results and social cards. Empty = site default
	 * - **API ID Path**: homepage.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description (120–155 characters) field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: One or two sentences. Empty = site default
	 * - **API ID Path**: homepage.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image (1200×630 px, JPG or PNG, under 1 MB) field in *Homepage*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: homepage.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Homepage document from Prismic
 *
 * - **API ID**: `homepage`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type HomepageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<HomepageDocumentData>, "homepage", Lang>;

type PageDocumentDataSlicesSlice = never

/**
 * Content for Page documents
 */
interface PageDocumentData {
	/**
	 * Slice Zone field in *Page*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<PageDocumentDataSlicesSlice>;/**
	 * Meta Title (50–60 characters) field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Shown in search results and social cards. Empty = site default
	 * - **API ID Path**: page.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description (120–155 characters) field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: One or two sentences. Empty = site default
	 * - **API ID Path**: page.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image (1200×630 px, JPG or PNG, under 1 MB) field in *Page*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Page document from Prismic
 *
 * - **API ID**: `page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PageDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<PageDocumentData>, "page", Lang>;

/**
 * Item in *Settings → Redirects*
 */
export interface SettingsDocumentDataRedirectsItem {
	/**
	 * From (path starting with /, no domain) field in *Settings → Redirects*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: /old-page
	 * - **API ID Path**: settings.redirects[].from
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	from: prismic.KeyTextField;
	
	/**
	 * To (path or full URL) field in *Settings → Redirects*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: /new-page  or  https://example.com/page
	 * - **API ID Path**: settings.redirects[].to
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	to: prismic.KeyTextField;
	
	/**
	 * Permanent (301 = moved for good, 302 = temporary) field in *Settings → Redirects*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: true
	 * - **API ID Path**: settings.redirects[].permanent
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	permanent: prismic.BooleanField;
}

/**
 * Content for Settings documents
 */
interface SettingsDocumentData {
	/**
	 * Meta title (50–60 characters) field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Default title for search results and social cards; also the suffix of every page title
	 * - **API ID Path**: settings.meta_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta description (120–155 characters) field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Default summary shown under the title in search results
	 * - **API ID Path**: settings.meta_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * OG image (1200×630 px, JPG or PNG, under 1 MB) field in *Settings*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.og_image
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	og_image: prismic.ImageField<never>;/**
	 * Favicon (SVG preferred, or square PNG 512×512 px) field in *Settings*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Shown in browser tabs and bookmarks
	 * - **API ID Path**: settings.favicon
	 * - **Tab**: Icons
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	favicon: prismic.ImageField<never>;
	
	/**
	 * Apple touch icon (PNG 180×180 px, opaque background, square corners) field in *Settings*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: iOS home screen icon; iOS rounds the corners itself
	 * - **API ID Path**: settings.apple_touch_icon
	 * - **Tab**: Icons
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	apple_touch_icon: prismic.ImageField<never>;
	
	/**
	 * Theme color (hex, usually the site background) field in *Settings*
	 *
	 * - **Field Type**: Color
	 * - **Placeholder**: Tints the browser UI on mobile
	 * - **API ID Path**: settings.theme_color
	 * - **Tab**: Icons
	 * - **Documentation**: https://prismic.io/docs/fields/color
	 */
	theme_color: prismic.ColorField;/**
	 * Head code (meta, link and script tags, pasted as-is) field in *Settings*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: <!-- Tag Manager, Search Console verification, font preconnect… -->
	 * - **API ID Path**: settings.head_code
	 * - **Tab**: Custom code
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	head_code: prismic.RichTextField;
	
	/**
	 * Body end code (scripts, noscript and widgets, pasted as-is) field in *Settings*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: <!-- Tag Manager noscript, chat widget… -->
	 * - **API ID Path**: settings.body_end_code
	 * - **Tab**: Custom code
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body_end_code: prismic.RichTextField;/**
	 * Redirects field in *Settings*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.redirects[]
	 * - **Tab**: Redirects
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	redirects: prismic.GroupField<Simplify<SettingsDocumentDataRedirectsItem>>;
}

/**
 * Settings document from Prismic
 *
 * - **API ID**: `settings`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SettingsDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<SettingsDocumentData>, "settings", Lang>;

export type AllDocumentTypes = HomepageDocument | PageDocument | SettingsDocument;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			HomepageDocument,
			HomepageDocumentData,
			HomepageDocumentDataSlicesSlice,
			PageDocument,
			PageDocumentData,
			PageDocumentDataSlicesSlice,
			SettingsDocument,
			SettingsDocumentData,
			SettingsDocumentDataRedirectsItem,
			AllDocumentTypes
		}
	}
}