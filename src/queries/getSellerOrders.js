import applyProductFilters from "../utils/applyProductFilters.js";
/**
 * @name products
 * @method
 * @memberof GraphQL/Products
 * @summary Query the Products collection for a list of products
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {Boolean} [isArchived] - Filter by archived
 * @param {Boolean} [isVisible] - Filter by visibility
 * @param {String} [metafieldKey] - Filter by metafield key
 * @param {String} [metafieldValue] - Filter by metafield value
 * @param {Number} [priceMax] - Filter by price range maximum value
 * @param {Number} [priceMin] - Filter by price range minimum value
 * @param {String[]} [productIds] - List of product IDs to filter by
 * @param {String} [query] - Regex match query string
 * @param {String[]} shopIds - List of shop IDs to filter by
 * @param {String[]} [tagIds] - List of tag ids to filter by
 * @returns {Promise<Object>} Products object Promise
 */
export default async function getSellerOrders(context, input) {
  const { collections } = context;

  const { SubOrders } = collections;
  const productFilters = input;
  // console.log("input ", input);
  //   // Check the permissions for all shops requested
  //   await Promise.all(
  //     productFilters.shopId.map(async (shopId) => {
  //       await context.validatePermissions("reaction:legacy:products", "read", {
  //         shopId,
  //       });    
  //     })
  //   );
  console.log("seller orders input ", productFilters);

  // Create the mongo selector from the filters
  const selector = applyProductFilters(context, productFilters);

  console.log("selector in query is  ", selector);

  // Get the first N (limit) top-level products that match the query
  const ProductData = await SubOrders.find(selector);
  console.log("ProductData", await SubOrders.find(selector).toArray());
  return ProductData;
}
