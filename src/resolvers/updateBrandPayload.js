import ObjectID from "mongodb";
export default {
  async brandProduct(parent, args, context, info) {
    try {
      const { collections } = context;
      const { Products } = collections;
      const { _id } = parent;
      console.log("parent", typeof parent._id);
      console.log("parent", parent);
      console.log(
        "ObjectID.ObjectId(parent._id)",
        ObjectID.ObjectId(parent._id)
      );
      let proderesp = await Products.find({
        brandId: ObjectID.ObjectId(parent._id),
      }).toArray();
      // const products = await Products.aggregate([
      //   {
      //     $match: { brandId: parent._id }
      //   }
      // ]).toArray();
      console.log("products", proderesp);
      return proderesp;
    } catch (error) {
      console.error("Error fetching brand products:", error);
      // throw error;
    }
  },
};
