// import _ from "lodash";
// import ReactionError from "@reactioncommerce/reaction-error";

// /**
//  * @name catalogItems
//  * @method
//  * @memberof Catalog/NoMeteorQueries
//  * @summary query the Catalog by shop ID and/or tag ID
//  * @param {Object} context - an object containing the per-request state
//  * @param {Object} params - request parameters
//  * @param {String[]} [params.searchQuery] - Optional text search query
//  * @param {String[]} [params.sellerIds] - SellerIds to include (OR)
//  * @param {String[]} [params.tags] - Tag IDs to include (OR)
//  * @returns {Promise<MongoCursor>} - A MongoDB cursor for the proper query
//  */
// export default async function sellercatalogItems(
//   context,
//   {
//     searchQuery,
//     sellerIds,
//     tagIds,
//     catalogBooleanFilters,
//     storeNameSearch,
//   } = {}
// ) {
//   const { collections } = context;
//   const { Catalog } = collections;
//   // if (
//   //   (!tagIds || tagIds.length === 0)
//   // ) {
//   //   throw new ReactionError(
//   //     "invalid-param",
//   //     "You must provide tagIds"
//   //   );
//   // }
//   console.log("catalogBooleanFilters", catalogBooleanFilters);
//   console.log("storeNameSearch", storeNameSearch);

//   if (catalogBooleanFilters?.$and?.length > 0) {
//     console.log("catalogBooleanFilters in if", catalogBooleanFilters);
//     let booleanFilter1 = catalogBooleanFilters?.$and[0];

//     const query = {
//       ...booleanFilter1,
//     };

//     query["product.variants.0.uploadedBy.userId"] = { $in: sellerIds };

//     console.log("query", query);
//     return Catalog.find(query);
//   } else {
//     console.log("else");
//     const query = {
//       "product.isDeleted": { $ne: true },
//       ...catalogBooleanFilters,
//       "product.isVisible": true,
//       "product.media": {
//         $elemMatch: {
//           URLs: { $exists: true, $ne: null, $ne: "", $ne: {} },
//         },
//       },
//       $and: [
//         {
//           "product.media.URLs.large": {
//             $not: { $regex: /public\/bizb-\d+\/\/.*/ },
//           },
//         },
//         {
//           "product.media.URLs.medium": {
//             $not: { $regex: /public\/bizb-\d+\/\/.*/ },
//           },
//         },
//         {
//           "product.media.URLs.small": {
//             $not: { $regex: /public\/bizb-\d+\/\/.*/ },
//           },
//         },
//         {
//           "product.media.URLs.original": {
//             $not: { $regex: /public\/bizb-\d+\/\/.*/ },
//           },
//         },
//       ],
//     };
//     if (storeNameSearch) {
//       // query["product.variants.0.uploadedBy.name"] = { $regex: new RegExp(storeNameSearch, "i") };
//       query["product.variants.0.uploadedBy.name"] = storeNameSearch;
//     }

//     if (sellerIds) {
//       query["product.variants.0.uploadedBy.userId"] = { $in: sellerIds };
//     }
//     if (tagIds) query["product.tagIds"] = { $in: tagIds };

//     if (searchQuery) {
//       query.$text = {
//         $search: _.escapeRegExp(searchQuery),
//       };
//     }
//     console.log("query ", query);
//     return Catalog.find(query);
//   }
// }



import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name sellercatalogItems
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary Query the Catalog by shop ID and/or tag ID, enhanced to include store name searching via Account table
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @returns {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function sellercatalogItems(context, {
  searchQuery,
  tagIds,
  catalogBooleanFilters,
  storeNameSearch
} = {}) {
  const { collections } = context;
  const { Catalog, Accounts } = collections;

  let sellerIds = [];

  // Fetch sellerIds based on storeNameSearch
  if (storeNameSearch) {

    // console.log("STORE NAME SEARCH", storeNameSearch);
    const accounts = await Accounts.find({
      storeName: storeNameSearch
    }).toArray();

    // console.log("account", accounts)
    sellerIds = accounts.map(account => account.userId);

    // console.log("sellerIds", sellerIds);
  }

  const baseQuery = {
    "product.isDeleted": { $ne: true },
    "product.isVisible": true,
    ...catalogBooleanFilters,
    "product.media": {
      $elemMatch: {
        URLs: { $exists: true, $ne: null, $ne: "", $ne: {} }
      }
    },
    $and: [
      { "product.media.URLs.large": { $not: { $regex: /public\/bizb-\d+\/\/.*/ } } },
      { "product.media.URLs.medium": { $not: { $regex: /public\/bizb-\d+\/\/.*/ } } },
      { "product.media.URLs.small": { $not: { $regex: /public\/bizb-\d+\/\/.*/ } } },
      { "product.media.URLs.original": { $not: { $regex: /public\/bizb-\d+\/\/.*/ } } }
    ]
  };

  if (sellerIds.length > 0) {
    baseQuery["product.variants.0.uploadedBy.userId"] = { $in: sellerIds };
  }

  if (tagIds) {
    baseQuery["product.tagIds"] = { $in: tagIds };
  }

  if (searchQuery) {
    baseQuery.$text = {
      $search: _.escapeRegExp(searchQuery)
    };
  }

  console.log("Final query", baseQuery);
  return Catalog.find(baseQuery);
}
