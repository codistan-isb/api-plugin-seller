import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";

export default async function getAllFeaturedStores(parent, args, ctx, info) {
  const { ...connectionArgs } = args;
  //   console.log("args here featuredStoreName");
  const featuredStoreName = await ctx.queries.getAllFeaturedStores(ctx, args);
  return getPaginatedResponse(featuredStoreName, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}
