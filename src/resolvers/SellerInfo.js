export default {
  async vendorProducts(parent, args, context, info) {
    try {
      console.log("parent", parent);
      const { collections } = context;
      const { Products } = collections;
      const { _id } = parent;

      const allProducts = await Products.find({
        sellerId: _id
      })
        .sort({ createdAt: -1 })
        .toArray();
        console.log("allProducts", allProducts);
  
      // Filter products with counts exceeding 10
      // const productsWithCountExceeding = allProducts.filter(product => product.count > 20);
      // console.log("productsWithCountExceeding", productsWithCountExceeding);

      // return productsWithCountExceeding; // Return the filtered array directly

      return allProducts;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  picture(parent, args, context, info) {
    console.log("parent", parent);
    return parent?.profile?.picture;
  },
  phone(parent, args, context, info) {
    console.log("parent", parent);
    return parent?.billing?.phone;
  },
};
