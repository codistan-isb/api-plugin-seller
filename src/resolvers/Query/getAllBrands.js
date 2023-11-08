import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";

export default async function getAllBrands(parent, args, ctx, info) {
  const { searchQuery, ...connectionArgs } = args;
  const brandNames = await ctx.queries.brands(parent, args, ctx, info);
  console.log("brandNames ", brandNames);

  return getPaginatedResponse(brandNames, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}
