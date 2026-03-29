/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as devLogs from "../devLogs.js";
import type * as http from "../http.js";
import type * as items from "../items.js";
import type * as lib_hashtags from "../lib/hashtags.js";
import type * as lib_parser from "../lib/parser.js";
import type * as lib_search_parser from "../lib/search_parser.js";
import type * as obsidian from "../obsidian.js";
import type * as projects from "../projects.js";
import type * as search from "../search.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  devLogs: typeof devLogs;
  http: typeof http;
  items: typeof items;
  "lib/hashtags": typeof lib_hashtags;
  "lib/parser": typeof lib_parser;
  "lib/search_parser": typeof lib_search_parser;
  obsidian: typeof obsidian;
  projects: typeof projects;
  search: typeof search;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
