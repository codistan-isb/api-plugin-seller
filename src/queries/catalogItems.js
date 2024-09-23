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
export default async function sellercatalogItems(
  context,
  {
    searchQuery,
    sellerIds,
    tagIds,
    catalogBooleanFilters,
    storeNameSearch,
  } = {}
) {
  const { collections } = context;
  const { Catalog } = collections;
  if (
    (!sellerIds || sellerIds.length === 0) &&
    (!tagIds || tagIds.length === 0)
  ) {
    throw new ReactionError(
      "invalid-param",
      "You must provide tagIds or sellerIds or both"
    );
  }
  console.log("catalogBooleanFilters", catalogBooleanFilters);
  console.log("storeNameSearch", storeNameSearch);

  if (catalogBooleanFilters?.$and?.length > 0) {
    console.log("catalogBooleanFilters in if", catalogBooleanFilters);
    let booleanFilter1 = catalogBooleanFilters?.$and[0];

    const query = {
      ...booleanFilter1,
    };

    query["product.variants.0.uploadedBy.userId"] = { $in: sellerIds };

    console.log("query", query);
    return Catalog.find(query);
  } else {
    console.log("else");
    const query = {
      "product.isDeleted": { $ne: true },
      ...catalogBooleanFilters,
      "product.isVisible": true,
      "product.media": {
        $elemMatch: {
          URLs: { $exists: true, $ne: null, $ne: "", $ne: {} },
        },
      },
      $and: [
        {
          "product.media.URLs.large": {
            $not: { $regex: /public\/bizb-\d+\/\/.*/ },
          },
        },
        {
          "product.media.URLs.medium": {
            $not: { $regex: /public\/bizb-\d+\/\/.*/ },
          },
        },
        {
          "product.media.URLs.small": {
            $not: { $regex: /public\/bizb-\d+\/\/.*/ },
          },
        },
        {
          "product.media.URLs.original": {
            $not: { $regex: /public\/bizb-\d+\/\/.*/ },
          },
        },
      ],
    };
    if (storeNameSearch) {
      query["product.variants.0.uploadedBy.name"] = storeNameSearch;
    }
    if (sellerIds) {
      query["product.variants.0.uploadedBy.userId"] = { $in: sellerIds };
    }
    if (tagIds) query["product.tagIds"] = { $in: tagIds };

    if (searchQuery) {
      query.$text = {
        $search: _.escapeRegExp(searchQuery),
      };
    }
    console.log("query ", query);
    return Catalog.find(query);
  }
}
