import ReactionError from "@reactioncommerce/reaction-error";
export default async function getSellerOrders(_, args, context) {
  const { sellerId, status } = args;
  const { collections } = context;
  const { SubOrders } = collections;
  if (!context.user) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  const selector = {};
  if (sellerId) {
    selector["sellerId"] = sellerId;
  }

  if (status) {
    selector["workflow.status"] = status;
  }

  const data = await SubOrders.find(selector).toArray();
  return data;
}
