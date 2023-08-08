export default async function createSellerDiscountCode(
  parent,
  { input },
  context,
  info
) {
  //   await context.validatePermissions("reaction:legacy:discounts", "create", {
  //     shopId,
  //   });

  // console.log("context is ", context);

  const createdSellerDiscountCode =
    await context.mutations.createSellerDiscountCode(context, input);

  console.log("created in main ", createdSellerDiscountCode);

  return true;
}
