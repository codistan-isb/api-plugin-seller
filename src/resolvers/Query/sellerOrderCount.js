
export default async function sellerOrderCount(parent, args, context, info) {
    let { account } = context;
    let { adminUIShopIds } = account;
    if (adminUIShopIds === null || adminUIShopIds === undefined) {
        throw new ReactionError("access-denied", "Access Denied");
    } const sellerOrderCountResp = await context.queries.sellerOrderCount(parent, args, context, info);
    return sellerOrderCountResp;
}

