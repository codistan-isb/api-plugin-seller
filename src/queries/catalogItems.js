import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name catalogItems
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Catalog by shop ID and/or tag ID
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String[]} [params.searchQuery] - Optional text search query
 * @param {String[]} [params.sellerIds] - SellerIds to include (OR)
 * @param {String[]} [params.tags] - Tag IDs to include (OR)
 * @returns {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function catalogItems(context, { searchQuery, sellerIds, tagIds, catalogBooleanFilters } = {}) {
  const { collections } = context;
  const { Catalog } = collections;
  console.log("sellerIds",sellerIds)
  if ((!sellerIds || sellerIds.length === 0) && (!tagIds || tagIds.length === 0)) {
    throw new ReactionError("invalid-param", "You must provide tagIds or sellerIds or both");
  }

  const query = {
    "product.isDeleted": { $ne: true },
    ...catalogBooleanFilters,
    "product.isVisible": true
  };

  if (sellerIds) {
    query["product.variants.0.uploadedBy.userId"] = { $in: sellerIds };
  }
  if (tagIds) query["product.tagIds"] = { $in: tagIds };

  if (searchQuery) {
    query.$text = {
      $search: _.escapeRegExp(searchQuery)
    };
  }

  return Catalog.find(query);
}
