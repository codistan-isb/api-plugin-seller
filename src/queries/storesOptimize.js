export default async function StoresOptimize(Accounts, Catalog, args) {
  try {
    const { searchQuery, first = 10 } = args;

    const matchQuery = {
      roles: "vendor",
    };

    if (searchQuery) {
      matchQuery.storeName = {
        $regex: new RegExp(searchQuery, "i"),
      };
    }

    const pipeline = [
      {
        $match: {
          "product.variants.uploadedBy.userId": { $exists: true },
          "product.isVisible": true,
        },
      },
      {
        $unwind: "$product.variants",
      },
      {
        $match: {
          "product.variants.uploadedBy.userId": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$product.variants.uploadedBy.userId", // Group by uploadedBy.userId
          productCount: { $sum: 1 }, // Count products for each userId
        },
      },
      {
        $sort: { productCount: -1 }, // Sort by product count in descending order
      },
      {
        $lookup: {
          from: "Accounts",
          localField: "_id",
          foreignField: "userId",
          as: "sellerAccount",
        },
      },
      { $unwind: "$sellerAccount" },
      {
        $match: {
          "sellerAccount.roles": "vendor",
          "sellerAccount.isSeller": true,
        },
      },
      {
        $project: {
          _id: 0,
          sellerAccount: 1,
          productCount: 1,
        },
      },
      { $limit: first },
    ];

    const results = await Catalog.aggregate(pipeline).toArray();

    const totalRecords = await Accounts.countDocuments({
      userId: { $exists: true },
    });

    return {
      sellers: results.map((result) => ({
        ...result.sellerAccount,
        productCount: result.productCount, // Add the product count to each seller
      })),
      totalRecords,
    };
  } catch (error) {
    throw new Error(error);
  }
}
