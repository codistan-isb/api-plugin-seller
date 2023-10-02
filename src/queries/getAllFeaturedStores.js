export default async function getAllFeaturedStores(context, args) {
  console.log("args here");
  const { collections } = context;
  const { Accounts, Products } = collections;
  let ProductData = await Products.aggregate([
    {
      $match: {
        ancestors: { $eq: [] },
      },
    },
    {
      $group: {
        _id: "$sellerId",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 5,
    },
    {
      $project: { _id: 1 },
    },
  ]).toArray();

  // let ProductData = await Products.aggregate([
  //   {
  //     $match: {
  //       ancestors: { $eq: [] }
  //     }
  //   },
  //   {
  //     $group: {
  //       _id: "$sellerId",
  //       count: { $sum: 1 },
  //     },
  //   },
  //   {
  //     $sort: { count: -1 },
  //   },
  //   {
  //     $limit: 5,
  //   },
  // ]).toArray();

  // console.log("ProductData", ProductData);
  let sellerIds = ProductData.map((product) => product._id);
  // console.log("sellerIds", sellerIds);
  // let sellerInfo = await Accounts.find({ _id: { $in: sellerIds } }).toArray();
  // console.log("sellerInfo", sellerInfo);
  return Accounts.find({ _id: { $in: sellerIds } });
}
