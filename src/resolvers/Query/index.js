import sellerCatalogItems from "./catalogItems.js";
import catalogItemProduct from "./catalogItemProduct.js";
import vendors from "./vendors.js";
import sellerProduct from "./sellerProduct.js";
import sellerProducts from "./sellerProducts.js";
import getVariants from "../../utils/getVariants.js";
import getSellerOrders from "./getSellerOrders.js";
export default {
  sellerCatalogItems,
  catalogItemProduct,
  vendors,
  sellerProduct,
  getSellerOrders,
  sellerProducts,
  // variants: (node, args, context) =>{
  //   console.log("Node ",node)
  //  return getVariants(context, node._id, true, args)},
};
