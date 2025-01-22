
export default async function getSellerStores(parent, args, context, info) {
    if (!context.queries.getSellerStore) {
        throw new Error("GetAllCategories function is not defined in queries.");
    }

    console.log("HIT THE QUERY")
    let getSellerStores = await context.queries.getSellerStore(context, args);
    return getSellerStores;
}
