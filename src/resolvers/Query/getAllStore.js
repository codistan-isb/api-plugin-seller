import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
// import { StoresOptimize } from "../../queries/stores";

export async function getAllStore(parent, args, ctx, info) {
  const { searchQuery, ...connectionArgs } = args;

  const stores = await ctx.queries.stores(parent, args, ctx, info);

  return getPaginatedResponse(stores, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}

async function StoresOptimize(Accounts, Products, args) {
  try {
    const { searchQuery, first = 10 } = args; // Use 'first' for pagination

    // Base match query to filter vendors based on roles and storeName (if searchQuery is provided)
    const matchQuery = {
      roles: "vendor",
    };

    if (searchQuery) {
      matchQuery.storeName = {
        $regex: new RegExp(searchQuery, "i"),
      };
    }

    // Aggregation pipeline
    const pipeline = [
      // Match products that have a sellerId
      {
        $match: { sellerId: { $exists: true } },
      },

      // Group by sellerId and count the number of products
      {
        $group: {
          _id: "$sellerId", // Group by sellerId
          productCount: { $sum: 1 }, // Count products for each seller
        },
      },

      // Sort sellers by productCount in descending order
      { $sort: { productCount: -1 } },

      // Join with the Accounts collection to fetch seller details
      {
        $lookup: {
          from: "Accounts", // Collection name to join with
          localField: "_id", // Field from 'Products' collection (sellerId)
          foreignField: "userId", // Field from 'Accounts' collection (userId)
          as: "sellerAccount", // Output field for matched data
        },
      },

      // Unwind the result to get individual account documents
      { $unwind: "$sellerAccount" },

      // Filter only vendors
      {
        $match: {
          "sellerAccount.roles": "vendor",
        },
      },

      // Project the final result fields (full account details and productCount)
      {
        $project: {
          _id: 0, // Do not include the internal MongoDB _id field
          sellerId: "$_id",
          sellerAccount: 1,
        },
      },

      // Limit the result to the 'first' number of valid sellers AFTER lookup and filtering
      { $limit: first },
    ];

    // Execute the aggregation pipeline
    const results = await Products.aggregate(pipeline).toArray();

    // Total number of records for pagination (optional step if total count is needed)
    const totalRecords = await Accounts.countDocuments({
      userId: { $exists: true },
      roles: "vendor",
    });

    // Return the aggregated sellers and totalRecords
    return {
      sellers: results.map((result) => ({
        ...result.sellerAccount, // Spread the seller's full account details
      })),
      totalRecords,
    };
  } catch (error) {
    throw new Error(error);
  }
}

export async function getAllStoreOptimize(parent, args, ctx, info) {
  const { first = 10 } = args;
  const { collections } = ctx;
  const { Accounts, Products } = collections;

  const { sellers, totalRecords } = await StoresOptimize(
    Accounts,
    Products,
    args
  );

  const isLastPage = first >= totalRecords;
  const startRecord = 1;
  const endRecord = Math.min(first, totalRecords);

  return {
    nodes: sellers,
    totalRecords,
    currentPageNo: 1,
    isLastPage,
    startRecord,
    endRecord,
  };
}

// async function StoresOptimize(Accounts, Products, args) {
//   try {
//     const { searchQuery, first = 10 } = args; // Use 'first' for pagination

//     // Base query to filter vendors
//     let query = {
//       roles: "vendor",
//     };

//     if (searchQuery) {
//       query.storeName = {
//         $regex: new RegExp(searchQuery, "i"),
//       };
//     }

//     // Fetch products cursor to count products per seller
//     const productsCursor = Products.find(
//       { sellerId: { $exists: true } },
//       { projection: { sellerId: 1 } }
//     ).sort({ createdAt: -1 });

//     const productCountBySeller = {};

//     // Count products per seller
//     await productsCursor.forEach((product) => {
//       const sellerId = product.sellerId;
//       productCountBySeller[sellerId] =
//         (productCountBySeller[sellerId] || 0) + 1;
//     });

//     // Sort sellers by product count
//     const sortedProductCountBySeller = Object.entries(productCountBySeller)
//       .sort((a, b) => b[1] - a[1])
//       .map(([sellerId, count]) => ({ sellerId, count }));

//     // Total number of records for pagination
//     const totalRecords = sortedProductCountBySeller.length;

//     const sellersWithFullAccounts = [];

//     // Fetch full account details for the sellers based on the 'first' argument
//     for (const { sellerId } of sortedProductCountBySeller) {
//       const account = await Accounts.findOne(
//         { userId: sellerId, roles: "vendor" } // Fetch full account details
//       );

//       if (account) {
//         sellersWithFullAccounts.push({
//           ...account, // Return all account details
//         });
//       }

//       // Stop once we've collected 'first' valid sellers
//       if (sellersWithFullAccounts.length === first) {
//         break;
//       }
//     }

//     // Return the paginated sellers and total records
//     return {
//       sellers: sellersWithFullAccounts,
//       totalRecords,
//     };
//   } catch (error) {
//     throw new Error(error);
//   }
// }
