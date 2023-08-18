export default async function createBrands(context, input) {
  const { collections } = context;
  console.log("input", input);
  const { brandName, brandCategory } = input;
  const { SellerBrands } = collections;

  const brand = await SellerBrands.insertOne({
    brandName,
    brandCategory,
  });
  console.log("brands", brand);
  return brand.ops[0];
}
