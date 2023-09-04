import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import { decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";



export default async function getTags(_, connectionArgs, context, info) {
  console.log("In getTags Query")
  const { shopId, excludedTagIds } = connectionArgs;

  const dbShopId = decodeShopOpaqueId(shopId);
  let dbExcludedTagIds;

  if (Array.isArray(excludedTagIds)) {
    dbExcludedTagIds = excludedTagIds.map(decodeTagOpaqueId);
  }

  const query = await context.queries.getTags(context, dbShopId, {
    ...connectionArgs,
    excludedTagIds: dbExcludedTagIds
  });
  console.log("In getTags Query")
console.log("query",query)  
  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
