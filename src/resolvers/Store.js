
export default {
    async noOfProduct(parent, args, context, info) {
    console.log("parent in getAllStore", parent);
    const { collections } = context;
    const { Products } = collections;
    let noOfProduct = await Products.find({ sellerId: parent.userId }).count();
    console.log("noOfProduct", noOfProduct);
    const count = {
      count:noOfProduct
    };
    return count;
  }}