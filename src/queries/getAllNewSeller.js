import decodeOpaqueId from "@reactioncommerce/api-utils/decodeOpaqueId.js";

export default async function getAllNewSeller(context, args) {
  let { searchQuery, tagsId, itemPerPage, PageNumber } = args;
  const { collections } = context;
  const { Accounts, Products } = collections;
  let itemsPerPage = itemPerPage ? itemPerPage : 10; // Number of items to display per page
  PageNumber = PageNumber ? PageNumber : 1;

  try {

    let skipAmount = (PageNumber - 1) * itemsPerPage;

    // Step 1: Find sellers with the "vendor" role
    const sellers = await Accounts.find({ roles: "vendor" }).skip(skipAmount).limit(itemsPerPage).toArray();

    // Step 2: Extract sellerIds from these sellers
    const sellerIds = sellers.map(seller => seller._id);

    // Step 3: Find products with the specified tagsId and sellerIds
    let productQuery = { sellerId: { $in: sellerIds } };
    if (tagsId) {
      let decodedTagId = decodeOpaqueId(tagsId);
      console.log("tagsId",decodedTagId);
      productQuery.tagIds = { $in: Array.isArray(decodedTagId.id) ? decodedTagId.id : [decodedTagId.id] };
    }
    const products = await Products.find(productQuery).toArray();

    // Step 4: For each seller, find their products
    const sellersWithProducts = sellers.map(seller => {
      const sellerProducts = products.filter(product => product.sellerId === seller._id);
      // Convert Unix timestamp to ISO 8601 date-time string
      if (/^\d+(\.\d+)?$/.test(seller.updatedAt)) {
        seller.updatedAt = new Date(seller.updatedAt * 1000).toISOString();
      }
      return { ...seller, products: sellerProducts };
    });

    // Step 5: Filter out sellers with no products
    const sellersWithAtLeastOneProduct = sellersWithProducts.filter(seller => seller.products.length > 0);

    return {
      AccountDetail: sellersWithAtLeastOneProduct,
      totalPage: Math.round(sellers.length / itemsPerPage),
    }
  } catch (error) {
    console.log(error);
  }
}
