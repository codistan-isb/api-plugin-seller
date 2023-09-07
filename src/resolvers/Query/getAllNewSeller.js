import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
export default async function getAllNewSeller(
    parent,
    args,
    context,
    info
){
    const { searchQuery, ...connectionArgs } = args;
    const sellerInfo = await context.queries.getAllNewSeller(context, args);
  
  
    return getPaginatedResponse(sellerInfo, connectionArgs, {
      includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
      includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
      includeTotalCount: wasFieldRequested("totalCount", info),
    });
}