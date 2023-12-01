
import ReactionError from "@reactioncommerce/reaction-error";

export default async function sellerUploadCount(parent, args, context, info) {
    // console.log("sellerUploadCount query", args);
    let { account } = context;
    let { adminUIShopIds } = account
    // console.log("userId", userId);
    // console.log("user", user);
    // console.log("account ", context.account);
    if (adminUIShopIds === null || adminUIShopIds === undefined) {
        throw new ReactionError("access-denied", "Access Denied");
    }
    const sellerUploadCountResp = await context.queries.sellerUploadCount(parent, args, context, info);
    return sellerUploadCountResp;
}

