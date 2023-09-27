export default async function getAllNewSeller(context, args) {
  let { searchQuery, tagsId, itemPerPage, PageNumber } = args;
  const { collections } = context;
  const { Accounts, Products } = collections;
  let itemsPerPage = itemPerPage ? itemPerPage : 10; // Number of items to display per page
  PageNumber = PageNumber ? PageNumber : 1;

  try {
    let skipAmount = (PageNumber - 1) * itemsPerPage;

    // Step 1: Find products with the specified tagsId
    let productQuery = {};
    if (tagsId) {
      productQuery.tagIds = { $in: Array.isArray(tagsId) ? tagsId : [tagsId] };
    }
    const products = await Products.find(productQuery).toArray();

    // Step 2: Extract sellerIds from these products
    const sellerIds = products.map(product => product.sellerId);

    // Step 3: Find sellers with these sellerIds and the "vendor" role
    let pageCount = await Accounts.countDocuments({
      _id: { $in: sellerIds },
      roles: "vendor",
    });
    const sellers = await Accounts.find({ _id: { $in: sellerIds }, roles: "vendor" }).skip(skipAmount).limit(itemsPerPage).toArray();

    // Step 4: For each seller, find their products
    const sellersWithProducts = await Promise.all(sellers.map(async (seller) => {
      const sellerProducts = products.filter(product => product.sellerId === seller._id);
      // Convert Unix timestamp to ISO 8601 date-time string
      if (/^\d+(\.\d+)?$/.test(seller.updatedAt)) {
        seller.updatedAt = new Date(seller.updatedAt * 1000).toISOString();
      }
      return { ...seller, products: sellerProducts };
    }));

    // Step 5: Filter out sellers with no products
    const sellersWithAtLeastOneProduct = sellersWithProducts.filter(seller => seller.products.length > 0);

    return {
      AccountDetail: sellersWithAtLeastOneProduct,
      totalPage: Math.round(pageCount / itemsPerPage),
    }
  } catch (error) {
    console.log(error);
  }
}
