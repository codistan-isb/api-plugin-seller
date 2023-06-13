import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeProductOpaqueId } from "../../xforms/id.js";
import getVariants from "../../utils/getVariants.js";
import getVariantMedia from "../../utils/getVariantMedia.js";

export default {
  _id: (node) => {
    console.log("node ", node);
    encodeProductOpaqueId(node._id);
  },
  media: (node, args, context) => getVariantMedia(node, context),
  metafields: (node) => node.metafields || [],
  options: (node, args, context) =>
    getVariants(context, sellerId, undefined, args),
  shop: resolveShopFromShopId,
};
