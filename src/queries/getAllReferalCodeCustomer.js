import ReactionError from "@reactioncommerce/reaction-error";
export default async function getAllReferalCodeCustomer(context, args) {
  const { searchQuery, ...connectionArgs } = args;
  const { collections } = context;
  const { Orders } = collections;
  console.log("In queries");
  try {
    const orders = await Orders.find({
        "discounts": {
            $elemMatch: {
              discountId: { $exists: true },
              amount: { $exists: true }
            }
          }
    });
    console.log("orders", orders);
   
    return orders;
  } catch (error) {
    console.log(error);
    throw new ReactionError(error);
  }
}
