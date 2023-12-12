export default async function sellerDetails(parent, args, context, info) {
    console.log("sellerDetails query");
    const sellerDetails = await context.queries.sellerDetails(parent, args, context, info);
    return sellerDetails;
    }