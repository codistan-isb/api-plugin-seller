export default async function brands(parent, args, ctx, info) {
    const { SellerBrands } = ctx.collections;

    const brandNames = await SellerBrands.find();
    // console.log("brandNames ", brandNames);
    return brandNames;
}
