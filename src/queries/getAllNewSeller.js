import ReactionError from "@reactioncommerce/reaction-error";

export default async function getAllNewSeller(context, args) {
  const { searchQuery, tagsId, ...connectionArgs } = args; // Added tagsIds to your function arguments
  const { collections } = context;
  const { Accounts, Products } = collections;
  console.log("In queries");
  const tagsArray = Array.isArray(tagsId) ? tagsId : [tagsId];
  try {
    // Find the seller
  // Find all sellers with the "vendor" role
const sellers = await Accounts.find({
  roles: "vendor",
})
// .toArray();
// // console.log("Sellers in getSeller", sellers);
// if (!sellers || sellers.length === 0) {
//   throw new ReactionError("No sellers found");
// }

// // Initialize an array to store products
// const sellerIds = sellers.map((seller) => seller._id);

// // Find products for all sellers with matching seller IDs and tags
// const allProducts = await Products.find({
//   sellerId: { $in: sellerIds },
//   tagIds: { $in: tagsArray },
// }).toArray();



// console.log("Products in getSeller", allProducts);

return sellers;

  } catch (error) {
    console.log(error);
    throw new ReactionError(error);
  }
}
