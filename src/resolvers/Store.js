// export default {
//   async noOfProduct(parent, args, context, info) {
//     const { collections } = context;
//     const { Products } = collections;
//     let noOfProduct = await Products.find({
//       sellerId: parent.userId,
//     }).count();
//     const count = {
//       count: noOfProduct,
//     };
//     return count;
//   },
// };

export default {
  async noOfProduct(parent, args, context, info) {
    const { collections } = context;
    const { Catalog } = collections;

    let noOfProduct = await Catalog.find({
      "product.variants.uploadedBy.userId": parent.userId,
      "product.isVisible": true,
    }).count();

    const count = {
      count: noOfProduct,
    };

    return count;
  },
};
