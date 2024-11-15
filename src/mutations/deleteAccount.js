import ReactionError from "@reactioncommerce/reaction-error";

export default async function deleteAccount(context, input) {
  const { Accounts } = context.collections;
  const { userId } = input;
  console.log(`deleteAccount `, input);

  // Find the account to ensure it exists before deleting
  let checkedAccount = await Accounts.findOne({ userId });
  console.log("checkedAccount query response is ", checkedAccount);

  if (!checkedAccount) {
    throw new ReactionError(
      "not-found",
      "User doesn't exist"
    );
  }

  // Permanently delete the account from the database
  const deleteResult = await Accounts.deleteOne({ userId });

  if (deleteResult.deletedCount === 1) {
    console.log("Account deleted successfully");
    return true;  // Return true to indicate success
  } else {
    console.error("Failed to delete the account");
    throw new ReactionError(
      "delete-failed",
      "Failed to delete the account"
    );
  }
}
