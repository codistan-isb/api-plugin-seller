export default {
  async vendorProducts(parent, args, context, info) {
    try {
      const { collections } = context;
      const { Products } = collections;
      const { _id } = parent;

      const allProducts = await Products.find({
        sellerId: _id,
      })
        .sort({ createdAt: -1 })
        .toArray();

      // Sort products in descending order based on the product count
    //   allProducts.sort((a, b) => b.count - a.count);
console.log("allProducts",allProducts);
      const productsLength = allProducts.length;
      console.log("allProducts",productsLength)

      if (productsLength >= 20) {
        return allProducts;
      } else {
        return []; // Return an empty array if the condition is not met
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },
  picture(parent, args, context, info) {

        return parent?.profile?.picture;
  },
  phone(parent, args, context, info) {
    return parent?.billing?.phone;
  }

};
