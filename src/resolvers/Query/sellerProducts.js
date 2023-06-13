import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import {
  decodeProductOpaqueId,
  decodeShopOpaqueId,
  decodeTagOpaqueId,
} from "../../xforms/id.js";

/**
 * @name Query/products
 * @method
 * @memberof Products/Query
 * @summary Query for a list of products
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - id of user to query
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Products
 */
export default async function sellerProducts(_, args, context, info) {
  const {
    sellerId,
    productIds: opaqueProductIds,
    shopIds: opaqueShopIds,
    tagIds: opaqueTagIds,
    query: queryString,
    isArchived,
    isVisible,
    isExactMatch,
    metafieldKey,
    metafieldValue,
    priceMin,
    priceMax,
    ...connectionArgs
  } = args;
  // console.log("Parent ", _);
  const shopIds = opaqueShopIds.map(decodeShopOpaqueId);
  const productIds =
    opaqueProductIds && opaqueProductIds.map(decodeProductOpaqueId);
  const tagIds = opaqueTagIds && opaqueTagIds.map(decodeTagOpaqueId);

  const query = await context.queries.sellerProducts(context, {
    sellerId,
    productIds,
    shopIds,
    tagIds,
    query: queryString,
    isArchived,
    isVisible,
    isExactMatch,
    metafieldKey,
    metafieldValue,
    priceMin,
    priceMax,
  });
  // console.log("query ", query);
  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}
