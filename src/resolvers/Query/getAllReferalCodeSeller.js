import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
export default async function getAllReferalCodeSeller(
  parent,
  args,
  context,
  info
) {
  const { searchQuery, ...connectionArgs } = args;
  const stores = await context.queries.getAllReferalCodeSeller(context, args);
//   console.log("stores", stores);

  return getPaginatedResponse(stores, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}
