import pkg from "../package.json";
import SimpleSchema from "simpl-schema";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
const mySchema = importAsString("./schema.graphql");
import getOrdersByUserId from "./utils/getOrders.js";
import getVariantsByUserId from "./utils/getVariants.js";
import getUserByUserId from "./utils/getUser.js";
import updateUserAccountBook from "./utils/updateUserAccountBook.js";
import updateUserFulfillmentMethod from "./utils/updateUserFulfillmentMethod.js";
import sellerCatalogItems from "./resolvers/Query/catalogItems.js";


import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
var _context = null;
const resolvers = {
  SellerInfo: {
    picture(parent, args, context, info) {
      return parent?.profile?.picture;
    }
  },
  Account: {
    async productVariants(parent, args, context, info) {
      let productVariant = await getVariantsByUserId(
        context,
        parent.userId,
        true,
        args
      );
      return productVariant;
    },
    async identityVerified(parent, args, context, info) {
      //  let productVariant=await getVariantsByUserId(context, parent.userId, true, args);
      return parent.profile.identityVerified
        ? parent.profile.identityVerified
        : false;
    },
    async AccountBook(parent, args, context, info) {
      return parent.profile.accountBook ? parent.profile.accountBook : [];
    },

    async orderFulfillment(parent, args, context, info) {
      let userOrders = await getOrdersByUserId(
        context,
        parent.userId,
        true,
        args
      );
      return userOrders;
    },
    AvailableFulfillmentMethods(parent, args, context, info) {
      let reaction_response = parent.fulfillmentMethods && parent.fulfillmentMethods.length > 0 ? parent.fulfillmentMethods.map(id => { return encodeOpaqueIdFunction("reaction/fulfillmentMethod", id) }) : []
      return reaction_response;
    }
  },
  ProductVariant: {
    async ancestorId(parent, args, context, info) {
      return parent.ancestors[0];
    },
    async parentId(parent, args, context, info) {
      return encodeOpaqueId("reaction/product", parent.ancestors[0]);
      //encode( encodeOpaqueId(parent.ancestors[0]))
    },
  },
  CatalogProductVariant: {
    async uploadedBy(parent, args, context, info) {
      // console.log("uploadedBy parent", parent);
      console.log("uploadedBy userId", parent.uploadedBy.userId);
      if (parent.uploadedBy.userId) {
        let userInfo = await getUserByUserId(context, parent.uploadedBy.userId);
        let FulfillmentMethods = userInfo?.fulfillmentMethods && userInfo.fulfillmentMethods.length > 0 ? userInfo.fulfillmentMethods.map(id => { return encodeOpaqueIdFunction("reaction/fulfillmentMethod", id) }) : [];

        return {
          name: userInfo?.profile?.username,
          storeName: userInfo?.storeName,
          userId: userInfo?.userId,
          Image: userInfo?.profile?.picture,
          FulfillmentMethods: FulfillmentMethods
        };
      }
    },
  },
  Query: {
    async getAllSeller(parent, args, context, info) {

      // if (context.user === undefined || context.user === null) {
      //   throw new Error("Unauthorized access. Please login first");
      // }
      const { Accounts } = context.collections;
      let { offset, limit } = args;


      const allUsersResponse = await Accounts.find({ roles: "vendor" }).skip(offset).limit(limit).toArray();

      return allUsersResponse;
    },
    sellerCatalogItems,
  },
  Mutation: {
    async updateAccountpayBookEntry(parent, args, context, info) {
      let updateResponse = await updateUserAccountBook(context, args.input);
      return updateResponse;
    },
    async updateAvailableFulfillmentMethodEntry(parent, args, context, info) {
      let updateResponse = await updateUserFulfillmentMethod(context, args.input);
      let reaction_response = updateResponse.length > 0 ? updateResponse.map(id => { return encodeOpaqueIdFunction("reaction/fulfillmentMethod", id) }) : []
      return reaction_response;
    },
  },
};
function encodeOpaqueIdFunction(source, id) {
  return encodeOpaqueId(source, id)
}
function myStartup1(context) {
  _context = context;
  const { app, collections, rootUrl } = context;
  const OwnerInfo = new SimpleSchema({
    userId: {
      type: String,
      max: 30,
      optional: true,
    },
    image: {
      type: String,
      max: 20,
      optional: true,
    },
    name: {
      type: String,
      optional: true,
    },
  });

  context.simpleSchemas.ProductVariant.extend({
    uploadedBy: OwnerInfo,
    ancestorId: {
      type: String,
      optional: true,
    },
    parentId: {
      type: String,
      optional: true,
    },
  });
  context.simpleSchemas.CatalogProductVariant.extend({
    uploadedBy: OwnerInfo,
    ancestorId: {
      type: String,
      optional: true,
    },
    parentId: {
      type: String,
      optional: true,
    },
  });
}
// The new myPublishProductToCatalog function parses our products,
// gets the new uploadedBy attribute, and adds it to the corresponding catalog variant in preparation for publishing it to the catalog
function myPublishProductToCatalog(
  catalogProduct,
  { context, product, shop, variants }
) {
  catalogProduct.variants &&
    catalogProduct.variants.map((catalogVariant) => {
      const productVariant = variants.find(
        (variant) => variant._id === catalogVariant.variantId
      );
      catalogVariant.uploadedBy = productVariant.uploadedBy || null;
      catalogVariant.ancestorId = productVariant["ancestors"][0]
        ? productVariant["ancestors"][0]
        : null;
      // catalogVariant.parentId=productVariant["parentId"]?productVariant["parentId"]:null;
    });
}
/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "api-plugin-seller",
    name: "api-plugin-seller",
    version: pkg.version,
    functionsByType: {
      startup: [myStartup1],
      publishProductToCatalog: [myPublishProductToCatalog],
    },
    graphQL: {
      schemas: [mySchema],
      resolvers
    },
  });
}
