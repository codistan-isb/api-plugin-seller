

export default {
  async brandProduct(parent, args, context, info) {
    try {
      const { collections } = context;
      const { Products } = collections;
      const { _id } = parent;
    
      // Step 1: Fetch all products
      const allProducts = await Products.find(
        { brandId: { $exists: true } },
      ).toArray();
      console.log("allProducts", allProducts);
      
      // Step 2: Filter products by brandId using Array.filter
      const brandProducts = allProducts.filter(product => product.brandId.toString() === _id.toString());
      
      console.log("brandProducts", brandProducts);
      return brandProducts;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
