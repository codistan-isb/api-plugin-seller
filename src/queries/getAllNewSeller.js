import ReactionError from "@reactioncommerce/reaction-error";

export default async function getAllNewSeller(context, args) {
  let { searchQuery, tagsId, itemPerPage, PageNumber } = args;
  const { collections } = context;
  const { Accounts, Products } = collections;
  let itemsPerPage = itemPerPage ? itemPerPage : 10; // Number of items to display per page
  PageNumber = PageNumber ? PageNumber : 1;

  try {
    let skipAmount = (PageNumber - 1) * itemsPerPage;
    let pageCount = await Accounts.countDocuments({
      roles: "vendor",
    });

    // Step 1: Find sellers with the "vendor" role
    const sellers = await Accounts.find({ roles: "vendor" }).skip(skipAmount).limit(itemsPerPage).toArray();
    console.log("sellers", sellers)

    // Step 2: For each seller, find their products
    const sellersWithProducts = await Promise.all(sellers.map(async (seller) => {
      let productQuery = { sellerId: seller._id };
      if (tagsId) {
        productQuery.tagIds = { $in: Array.isArray(tagsId) ? tagsId : [tagsId] };
      }
      const products = await Products.find(productQuery).toArray();
      // Convert Unix timestamp to ISO 8601 date-time string
      if (/^\d+(\.\d+)?$/.test(seller.updatedAt)) {
        seller.updatedAt = new Date(seller.updatedAt * 1000).toISOString();
      }
      return { ...seller, products };
    }));
    console.log("sellersWithProducts", sellersWithProducts)

    return {
      AccountDetail: sellersWithProducts,
      totalPage: Math.round(pageCount / 10),
    }
  } catch (error) {
    console.log(error);
  }
}

