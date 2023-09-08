import ReactionError from "@reactioncommerce/reaction-error";
import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
export default async function getSellerOrders(_, args, context, info) {
  const { sellerId, status, ...connectionArgs } = args;

  if (!context.user) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  const selector = {};
  if (sellerId) {
    selector["sellerId"] = sellerId;
  }

  if (status) {
    selector["status"] = status;
  }

  const query = await context.queries.getSellerOrders(context, selector);

  console.log("query is ", query);
  //
  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}
