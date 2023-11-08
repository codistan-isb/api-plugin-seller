export default async function Stores(parent, args, ctx, info) {
  try {
    const { collections } = ctx;
    const { Accounts, Products } = collections;
    const { searchQuery, storeNameSearch } = args;
    console.log("storeNameSearch", storeNameSearch);
    // if (searchQuery) {

    //     const matchingRiderIDs = await collections.Products.distinct("sellerId", {
    //       $or: [
    //         {
    //           "profile.firstName": {
    //             $regex: new RegExp(searchQuery, "i"),
    //           },
    //         },
    //         {
    //           "profile.lastName": {
    //             $regex: new RegExp(searchQuery, "i"),
    //           },
    //         },
    //         {
    //           fullName: {
    //             $regex: new RegExp(searchQuery, "i"),
    //           },
    //         },
    //       ],
    //     });
    // }

    let query = {
      roles: "vendor",
    };

    if (searchQuery) {
      query.storeName = {
        $regex: new RegExp(searchQuery, "i"),
      };
    }

    const storeNames = Accounts.find(query);
    // console.log("storeNames", storeNames);

    return storeNames;
  } catch (error) {
    throw new Error(error);
  }
}
