import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import { decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";
import xformCatalogBooleanFilters from "../../utils/catalogBooleanFilters.js";
import catalogItemsAggregate from "../../queries/catalogItemsAggregate.js"
import catalogItems from "../../queries/catalogItems.js"

/**
 * @name Query/catalogItems
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a list of catalogItems
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {String[]} [args.searchQuery] - limit to catalog items matching this text search query
 * @param {String[]} [args.sellerIds] - limit to catalog items for these seller
 * @param {String[]} [args.tagIds] - limit to catalog items with this array of tags
 * @param {Object[]} [args.booleanFilters] - Array of boolean filter objects with `name` and `value`
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} A CatalogItemConnection object
 */
export default async function sellerCatalogItems(_, args, context, info) {

  const { sellerIds, tagIds: opaqueTagIds, booleanFilters, storeNameSearch, searchQuery, ...connectionArgs } = args;

  const tagIds = opaqueTagIds && opaqueTagIds.map(decodeTagOpaqueId);

  let catalogBooleanFilters = {};
  if (Array.isArray(booleanFilters) && booleanFilters.length) {
    catalogBooleanFilters = await xformCatalogBooleanFilters(context, booleanFilters);
  }
  if (connectionArgs.sortBy === "featured") {
    if (!tagIds || tagIds.length === 0) {
      throw new ReactionError("not-found", "A tag ID is required for featured sort");
    }
    if (!sellerIds || sellerIds.length === 0) {
      throw new ReactionError("not-found", "A Seller ID is required for fetching seller products");
    }
    if (tagIds.length > 1) {
      throw new ReactionError("invalid-parameter", "Multiple tags cannot be sorted by featured. Only the first tag will be returned.");
    }
    const tagId = tagIds[0];
    return catalogItemsAggregate(context, {
      catalogBooleanFilters,
      connectionArgs,
      searchQuery,
      sellerIds,
      tagId
    });
  }

  // minPrice is a sorting term that does not necessarily match the field path by which we truly want to sort.
  // We allow plugins to return the true field name, or fallback to the default pricing field.
  if (connectionArgs.sortBy === "minPrice") {
    let realSortByField;

    // Allow external pricing plugins to handle this if registered. We'll use the
    // first value returned that is a string.
    for (const func of context.getFunctionsOfType("getMinPriceSortByFieldPath")) {
      realSortByField = await func(context, { connectionArgs }); // eslint-disable-line no-await-in-loop
      if (typeof realSortByField === "string") break;
    }

    if (!realSortByField) {
      Logger.warn("An attempt to sort catalog items by minPrice was rejected. " +
        "Verify that you have a pricing plugin installed and it registers a getMinPriceSortByFieldPath function.");
      throw new ReactionError("invalid-parameter", "Sorting by minPrice is not supported");
    }

    connectionArgs.sortBy = realSortByField;
  }

  const query = await catalogItems(context, {
    catalogBooleanFilters,
    searchQuery,
    sellerIds,
    storeNameSearch,
    tagIds
  });
  // console.log("eueuerur",query)
  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
