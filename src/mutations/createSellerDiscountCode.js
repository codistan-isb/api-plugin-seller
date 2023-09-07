export default async function createSellerDiscountCode(context, input) {
  console.log("input is ", input);
  const { collections } = context;
  const { SellerDiscounts } = collections;

  const createdAt = new Date();

  input["createdAt"] = createdAt;
  input["updatedAt"] = createdAt;

  const createdDiscount = await SellerDiscounts.insertOne(input);

  console.log("created Discount is ", createdDiscount);
}
