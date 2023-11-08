// import decodeOpaqueId from "@reactioncommerce/api-utils/decodeOpaqueId.js";

// export default async function Stores(parent, args, ctx, info) {
//   try {
//     const { collections } = ctx;
//     const { Accounts, Products } = collections;
//     const { searchQuery } = args;

//     const pipeline = [
//       { $match: { roles: "vendor", _id: "e3cfa91ce51b4c8d" } },
//       {
//         $lookup: {
//           from: "Catalog",
//           localField: "_id",
//           foreignField: "product.variants.0.uploadedBy.userId",
//           as: "catalogData",
//         },
//       },
//       {
//         $unwind: "$catalogData",
//       },
//       {
//         $addFields: {
//           newTagIds: {
//             $ifNull: ["$catalogData.product.tagIds", []], // Renamed field to newTagIds
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "Tags",
//           let: { tagIds: "$catalogData.product.tagIds" }, // Change to newTagIds here as well
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $in: ["$_id", "$$tagIds"] }, // Change to newTagIds here as well
//               },
//             },
//           ],
//           as: "tagsData",
//         },
//       },
//     ];

//     // const sellers = await Accounts.aggregate(pipeline).count();

//     // console.log("sellers are ", sellers);

//     return {
//       collection: Accounts,
//       pipeline,
//     };
//   } catch (error) {
//     throw new Error(error);
//   }
// }

import decodeOpaqueId from "@reactioncommerce/api-utils/decodeOpaqueId.js";

// export default async function Stores(parent, args, ctx, info) {
//   try {
//     const { collections } = ctx;
//     const { Accounts, Products, Catalog } = collections;
//     const { searchQuery, first, after } = args; // Get pagination parameters

//     const sellersAccounts = await Accounts.find({
//       roles: "vendor",
//       _id: {
//         $in: Catalog.find(
//           {
//             "product.tagIds": "BL3jHhDLDYbxvkWYX",
//           },
//           {
//             "product.variants.0.uploadedBy.userId": 1,
//             _id: 0,
//           }
//         ).map((catalog) => catalog.product.variants[0].uploadedBy.userId),
//       },
//     }).toArray();

//     console.log("seller Accoutns are ", sellersAccounts);
//     return;

//     // Define a cursor variable for MongoDB cursor-based pagination
//     let cursor = null;

//     if (after) {
//       // Decode the cursor to extract relevant data (e.g., _id or timestamp)
//       cursor = after;
//     }

//     const pipeline = [
//       { $match: { roles: "vendor" } },
//       {
//         $lookup: {
//           from: "Catalog",
//           localField: "_id",
//           foreignField: "product.variants.0.uploadedBy.userId",
//           as: "catalogData",
//         },
//       },
//       {
//         $unwind: "$catalogData",
//       },
//       {
//         $addFields: {
//           newTagIds: {
//             $ifNull: ["$catalogData.product.tagIds", []],
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "Tags",
//           let: { tagIds: "$catalogData.product.tagIds" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $in: ["$_id", "$$tagIds"] }, // Change to newTagIds here as well
//               },
//             },
//           ],
//           as: "tagsData",
//         },
//       },

//       // Apply cursor-based pagination
//       {
//         $match: {
//           roles: "vendor",
//           _id: cursor ? { $gt: cursor } : { $ne: null }, // Adjust as needed
//         },
//       },
//       {
//         $limit: first, // Limit the number of results
//       },
//     ];

//     const sellers = await Accounts.aggregate(pipeline).toArray(); // Execute the aggregation query

//     console.log("sellers are ", sellers.length, typeof sellers.length);
//     console.log("first is  ", first, typeof first);

//     // Build a connection object for pagination response
//     const hasNextPage = sellers.length === first;
//     const endCursor = hasNextPage ? sellers[sellers.length - 1]._id : null; // Assuming _id is used as a cursor

//     console.log("end cursor is ", endCursor);

//     return {
//       edges: sellers.map((seller) => ({
//         node: seller,
//         cursor: seller._id, // Use an appropriate cursor field
//       })),
//       pageInfo: {
//         hasNextPage,
//         endCursor,
//       },
//     };
//   } catch (error) {
//     throw new Error(error);
//   }
// }

export default async function Stores(_, args, ctx, info) {
  const { collections } = ctx;
  const { Accounts, Products, Catalog } = collections;
  const { searchQuery, first, after } = args; // Get pagination parameters

  const matchginTagIds = await Catalog.find({
    "product.tagIds": { $in: ["BL3jHhDLDYbxvkWYX"] },
  }).toArray();

  console.log("products are ", matchginTagIds);

  // const sellersAccounts = await Accounts.find({
  //   roles: "vendor",
  //   _id: {
  //     $in: await Catalog.find(
  //       {
  //         "product.tagIds": "BL3jHhDLDYbxvkWYX",
  //       },
  //       {
  //         "product.variants.0.uploadedBy.userId": 1,
  //         _id: 0,
  //       }
  //     ).map((catalog) => catalog.product.variants[0].uploadedBy.userId),
  //   },
  // }).toArray();

  console.log("seller Accoutns are ", sellersAccounts);
  return;
}
