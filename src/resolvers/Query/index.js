import sellerCatalogItems from "./catalogItems.js";
import catalogItemProduct from "./catalogItemProduct.js";
import vendors from "./vendors.js";
import sellerProduct from "./sellerProduct.js";
import sellerProducts from "./sellerProducts.js";
import getVariants from "../../utils/getVariants.js";
import getSellerOrders from "./getSellerOrders.js";
import getAllStore from "./getAllStore.js";
import brands from "./brands.js";
export default {
  sellerCatalogItems,
  catalogItemProduct,
  vendors,
  sellerProduct,
  getSellerOrders,
  sellerProducts,
  brands,
  getAllStore
  // variants: (node, args, context) =>{
  //   console.log("Node ",node)
  //  return getVariants(context, node._id, true, args)},
};
