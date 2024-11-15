export default async function deleteAccount(_, { input }, context) {
  console.log("Input is ", input);
  const { userId } = input;

  console.log("user id is ", userId);
  const account = context.mutations.deleteAccount(context, {
    userId,
  });
  return account;
}
