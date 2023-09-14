import ReactionError from "@reactioncommerce/reaction-error";

export default async function getAllNewSeller(context, args) {
  let { searchQuery, tagsId, itemPerPage, PageNumber } = args;
  const { collections } = context;
  const { Accounts, Products } = collections;
  let itemsPerPage = itemPerPage ? itemPerPage : 10; // Number of items to display per page
  PageNumber = PageNumber ? PageNumber : 1;
  console.log("In queries");

  try {
    // Ensure indexes on 'roles' field in Accounts and 'sellerId' field in Products
    await Accounts.createIndex({ roles: 1 });
    await Products.createIndex({ sellerId: 1 });
    let skipAmount = (PageNumber - 1) * itemsPerPage;
    let pageCount = await Accounts.countDocuments({
      roles: "vendor",
    });
    console.log("data1", pageCount / 10);
    console.log("skipAmount ", skipAmount);
    console.log("itemsPerPage", itemsPerPage);
    // Step 1: Find sellers with the "vendor" role
    let pipeline = [
      {
        $match: {
          roles: "vendor",
        },
      },
      {
        $lookup: {
          from: "Products",
          let: { seller_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$sellerId", "$seller_id"],
                },
              },
            },
          ],
          as: "products",
        },
      },
      {
        $match: {
          products: { $ne: [] },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];
    
    if (tagsId) {
      const tagsArray = Array.isArray(tagsId) ? tagsId : [tagsId];
      pipeline[1].$lookup.pipeline[0].$match.$expr = {
        $and: [
          { $eq: ["$sellerId", "$$seller_id"] },
          { $in: ["$tagIds", tagsArray] },
        ]
      };
    }
    
    
    
    // Step 3: Apply pagination
    pipeline.push(
      { $skip: skipAmount },
      { $limit: itemsPerPage }
    );

    const sellersWithProducts = await Accounts.aggregate(pipeline).toArray();

    // console.log("sellersWithProducts");

    // return sellersWithProducts;
    return {
      AccountDetail: sellersWithProducts,
      totalPage: Math.round(pageCount / 10),
    }
  } catch (error) {
    console.log(error);
    // throw new ReactionError(error);
  }
}
