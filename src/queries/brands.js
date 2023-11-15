export default async function brands(parent, args, ctx, info) {
  const { SellerBrands, Tags } = ctx.collections;
  const { searchQuery } = args;
  //   const filter = searchQuery ? { brandCategory: searchQuery } : {};

  //   const brandNames = await SellerBrands.find({
  //     ...filter,
  //   });
  let filter = { name: { $regex: /brand/i } };
  if (searchQuery) {
    filter = {
      name: { $regex: new RegExp(`^brand-${searchQuery}`, "i") },
    };
  }

  const brandNames = Tags.find(filter);

  return brandNames;
}
