import pkg from "../package.json";
import SimpleSchema from "simpl-schema";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
// const mySchema = importAsString("./schema.graphql");
import schemas from "./schemas/index.js";
import getOrdersByUserId from "./utils/getOrders.js";
import getVariantsByUserId from "./utils/getVariants.js";
import getUserByUserId from "./utils/getUser.js";
import updateUserAccountBook from "./utils/updateUserAccountBook.js";
import updateUserFulfillmentMethod from "./utils/updateUserFulfillmentMethod.js";
import sellerCatalogItems from "./resolvers/Query/catalogItems.js";
import sellerProducts from "./resolvers/Query/sellerProducts.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import getSellerOrders from "./resolvers/Query/getSellerOrders.js";
import sellerRegistration from "./resolvers/Mutation/sellerRegistration.js";
import updateSellerInfo from "./resolvers/Mutation/updateSellerInfo.js";
import updateSellerInfoForAdmin from "./resolvers/Mutation/updateSellerInfoForAdmin.js";
import createSellerDiscountCode from "./resolvers/Mutation/createSellerDiscountCode.js";
import createAnalytics from "./resolvers/Mutation/createAnalytics.js";
import { getAllStore } from "./resolvers/Query/getAllStore.js";
import { getAllStoreOptimize } from "./resolvers/Query/getAllStore.js";
import getAllBrands from "./resolvers/Query/getAllBrands.js";
import createBrands from "./resolvers/Mutation/createBrands.js";
import updateBrands from "./resolvers/Mutation/updateBrands.js";
import removeBrands from "./resolvers/Mutation/removeBrands.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import updateBrandPayload from "./resolvers/updateBrandPayload.js";
import SellerInfo from "./resolvers/SellerInfo.js";
import getAllReferalCodeSeller from "./resolvers/Query/getAllReferalCodeSeller.js";
import getAllReferalCodeCustomer from "./resolvers/Query/getAllReferalCodeCustomer.js";
import getAllNewSeller from "./resolvers/Query/getAllNewSeller.js";
import SellerInformation from "./resolvers/SellerInformation.js";
import discount from "./resolvers/Query/discount.js";
import getAllFeaturedStores from "./resolvers/Query/getAllFeaturedStores.js";
import sellerDetails from "./resolvers/Query/sellerDetails.js";
import Store from "./resolvers/Store.js";
import deleteAccount from "./resolvers/Mutation/deleteAccount.js";

// import updateSellerinfo from "./mutations/updateSellerinfo";
var _context = null;

function ensureArray(item) {
  if (Array.isArray(item)) {
    return item; // Return as is if already an array
  } else if (item) {
    return [item]; // Wrap in an array if it's a single object
  } else {
    return []; // Return an empty array if null or undefined
  }
}

const resolvers = {
  updateBrandPayload,
  SellerInfo,
  SellerInformation,
  Store,
  // getAllFeaturedStores,
  // SellerInfo: {
  //   picture(parent, args, context, info) {

  //     return parent?.profile?.picture;
  //     // console.log("parent", parent);
  //   },
  // },
  Account: {
    async isSeller(parent, args, context, info) {
      const isSeller =
        parent?.isSeller || parent?.groups?.length || parent?.roles == "vendor";
      return isSeller;
    },
    async storeInfo(parent, args, context, info) {
      let storeInfo = {
        image: parent?.storeLogo,
        storeName: parent?.storeName,
        pickUpAddress: parent?.pickUpAddress,
        city: parent?.storeAddress?.city,
        contactNumber: parent?.contactNumber,
        // bankDetail: parent?.bankDetail,
        bankDetail: ensureArray(parent?.bankDetail),
        documentDetails: parent?.documentDetails,
      };

      console.log("STORE INFO", storeInfo);
      return storeInfo;
    },



    async sellerSoldProductCount(parent, args, context, info) {
      console.log("parent in sellerSoldProductCount", parent);
      const { collections } = context;
      const { Products, SimpleInventory } = collections;

      const sellerProducts = await Products.find({
        sellerId: parent.userId,
      }).toArray();

      // Extracting product IDs
      const productIds = sellerProducts.map((product) => product._id);

      // Fetching sold products with inventoryInStock: 0 for the specific seller's products
      const soldProducts = await SimpleInventory.find({
        inventoryInStock: 0,
        "productConfiguration.productId": { $in: productIds },
      }).toArray();

      // Counting the number of sold products
      const sellerSoldProductCount = soldProducts.length;

      console.log("sellerSoldProductCount", sellerSoldProductCount);

      const count = {
        count: sellerSoldProductCount,
      };

      return count;
    },

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
      let reaction_response =
        parent.fulfillmentMethods && parent.fulfillmentMethods.length > 0
          ? parent.fulfillmentMethods.map((id) => {
            return encodeOpaqueIdFunction("reaction/fulfillmentMethod", id);
          })
          : [];
      return reaction_response;
    },
  },
  ProductVariant: {
    async ancestorId(parent, args, context, info) {
      console.log("parent", parent);
      return parent.ancestors[0];
    },
    async parentId(parent, args, context, info) {
      console.log("parent", parent);

      return encodeOpaqueId("reaction/product", parent.ancestors[0]);
      //encode( encodeOpaqueId(parent.ancestors[0]))
    },
  },
  CatalogProductVariant: {
    async uploadedBy(parent, args, context, info) {
      if (parent.uploadedBy.userId) {
        let userInfo = await getUserByUserId(context, parent.uploadedBy.userId);
        let FulfillmentMethods =
          userInfo?.fulfillmentMethods && userInfo.fulfillmentMethods.length > 0
            ? userInfo.fulfillmentMethods.map((id) => {
              return encodeOpaqueIdFunction("reaction/fulfillmentMethod", id);
            })
            : [];

        return {
          name: userInfo?.profile?.username,
          storeName: userInfo?.storeName,
          userId: userInfo?.userId,
          Image: userInfo?.profile?.picture,
          FulfillmentMethods: FulfillmentMethods,
        };
      }
    },
  },

  Query: {
    async getAllSeller(parent, args, context, info) {
      const { Accounts, Products } = context.collections;
      let { offset, limit, searchQuery } = args;

      const filter = { roles: "vendor" };

      const allUsersResponse = await Accounts.find(filter)
        .skip(offset)
        .limit(limit)
        .toArray();
      // console.log("allUsersResponse", allUsersResponse);
      const allUsersLength = allUsersResponse.length;
      console.log("Number of users:", allUsersLength);
      let sellersWithProducts = allUsersResponse;

      if (searchQuery) {
        const cityVariations = [
          "ISB",
          "isb",
          "RWP",
          "Rwp",
          "Isb",
          "Rawalpindi",
          "rawalpindi",
          "rwp",
          "ISLAMABAD",
          "islamabad",
          "Islamabad",
        ];

        const regexPattern = cityVariations
          .map((city) => city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|");
        const regex = new RegExp(`\\b(${regexPattern})\\b`, "i");

        sellersWithProducts = sellersWithProducts.filter((user) =>
          user.billing.city.match(regex)
        );
      }

      console.log("sellersWithProducts", sellersWithProducts.length);
      console.log("sellersWithProducts", sellersWithProducts);

      const sellerIdsWithProducts = await Products.distinct("sellerId");
      sellersWithProducts = sellersWithProducts.filter((user) =>
        sellerIdsWithProducts.includes(user._id.toString())
      );

      return sellersWithProducts;
    },
    getAllStore,
    getAllStoreOptimize,
    sellerCatalogItems,
    sellerProducts,
    getSellerOrders,
    getAllBrands,
    getAllReferalCodeSeller,
    getAllReferalCodeCustomer,
    getAllNewSeller,
    discount,
    getAllFeaturedStores,
    sellerDetails,
  },
  Mutation: {
    createSellerDiscountCode,
    createAnalytics,
    updateSellerInfo,
    updateSellerInfoForAdmin,
    sellerRegistration,
    createBrands,
    deleteAccount,
    updateBrands,
    removeBrands,
    async updateAccountpayBookEntry(parent, args, context, info) {
      let updateResponse = await updateUserAccountBook(context, args.input);
      return updateResponse;
    },
    async updateAvailableFulfillmentMethodEntry(parent, args, context, info) {
      let updateResponse = await updateUserFulfillmentMethod(
        context,
        args.input
      );
      let reaction_response =
        updateResponse.length > 0
          ? updateResponse.map((id) => {
            return encodeOpaqueIdFunction("reaction/fulfillmentMethod", id);
          })
          : [];
      return reaction_response;
    },
    // async updateSellerInfo(parent, { input }, context, info) {
    //   console.log(input);
    // },
  },
};
function encodeOpaqueIdFunction(source, id) {
  return encodeOpaqueId(source, id);
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
  console.log("SELLER PLUGIN REGISTER local===+=+_=_=_=_=_==");
  await app.registerPlugin({
    label: "api-plugin-seller",
    name: "api-plugin-seller",
    version: pkg.version,
    functionsByType: {
      startup: [myStartup1],
      publishProductToCatalog: [myPublishProductToCatalog],
    },
    collections: {
      SellerDiscounts: {
        name: "SellerDiscounts",
      },
      SellerBrands: {
        name: "SellerBrands",
      },
      Analytics: {
        name: "Analytics",
      },
    },
    graphQL: {
      schemas,
      // schemas: [mySchema],
      resolvers,
    },
    queries,
    mutations,
  });
}
