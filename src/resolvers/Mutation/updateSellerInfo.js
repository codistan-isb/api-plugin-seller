export default async function updateSellerInfo(_, { input }, context) {


  const updatedAccount = await context.mutations.updateSellerInfo(
    context,
    input
  );

  return updatedAccount;
}
