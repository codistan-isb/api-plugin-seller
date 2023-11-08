import decodeOpaqueId from "@reactioncommerce/api-utils/decodeOpaqueId.js";

export default async function getAllNewSeller(context, args) {
  let { searchQuery, tagIds } = args;
  const { collections } = context;
  const { Accounts, Products } = collections;

  // Ensure indexes on 'roles' field in Accounts and 'sellerId' field in Products
  await Accounts.createIndex({ roles: 1 });
  await Products.createIndex({ sellerId: 1 });

  const collection = Accounts; // Specify the collection

  const pipeline = [
    {
      $match: {
        roles: "vendor",
      },
    },
    {
      $lookup: {
        from: "Products",
        localField: "_id",
        foreignField: "sellerId",
        as: "products",
      },
    },
    {
      $match: {
        "products.0": { $exists: true }, // Check if the products array is not empty
      },
    },
    {
      $sort: {
        "products.createdAt": -1, // Sort based on product's createdAt field
      },
    },
    {
      $project: {
        products: 0, // Exclude the products array from the output
      },
    },
  ];

  if (tagIds) {
    const tagsArray = Array.isArray(tagIds) ? tagIds : [tagIds];
    pipeline[1].$lookup.pipeline[0].$match.$expr = {
      $and: [
        { $eq: ["$sellerId", "$$seller_id"] },
        { $in: ["$tagIds", tagsArray] },
      ],
    };
  }

  return {
    collection,
    pipeline,
  };
}
