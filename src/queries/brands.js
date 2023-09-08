export default async function brands(parent, args, ctx, info) {
    const { SellerBrands } = ctx.collections;
    const { searchQuery } = args;
    const filter = searchQuery ? { brandCategory: searchQuery } : {};

    const brandNames = await SellerBrands.find(
        {
            ...filter,
        }
    );
    console.log("brandNames ", brandNames);
    return brandNames;
}
