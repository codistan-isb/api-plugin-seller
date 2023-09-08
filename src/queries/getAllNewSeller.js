import ReactionError from "@reactioncommerce/reaction-error";

export default async function getAllNewSeller(context, args) {
  const { searchQuery, ...connectionArgs } = args;
  const { collections } = context;
  const { Accounts, Products } = collections;
  console.log("In queries");
  try {
    const seller = await Accounts.find({
      roles: "vendor",
    });

    return seller;
  } catch (error) {
    console.log(error);
    throw new ReactionError(error);
  }
}
