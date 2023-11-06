import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
export default async function getAllReferalCodeCustomer(
  parent,
  args,
  context,
  info
) {
    const { searchQuery, ...connectionArgs } = args;
    const orders = await context.queries.getAllReferalCodeCustomer(context, args);
    console.log("orders", orders);

  
    return getPaginatedResponse(orders, connectionArgs, {
      includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
      includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
      includeTotalCount: wasFieldRequested("totalCount", info),
    });

}
