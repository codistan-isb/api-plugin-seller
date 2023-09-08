import ReactionError from "@reactioncommerce/reaction-error";

export default async function deleteAccount(context, input) {

    const {Accounts} = context.collections;
    const { userId } = input;
    let checkedAccount = await Accounts.findOne({
        userId,
      });
      console.log("checkedAccount query response is ", checkedAccount);
  if (checkedAccount?.isDeleted) {
    throw new ReactionError(
      "not-found",
      "User doesn't exist or is already deleted"
    );
  }

  return true;
}
