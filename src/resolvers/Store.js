export default {
  async noOfProduct(parent, args, context, info) {
    const { collections } = context;
    const { Products } = collections;
    let noOfProduct = await Products.find({
      sellerId: parent.userId,
    }).count();
    const count = {
      count: noOfProduct,
    };
    return count;
  },
};
