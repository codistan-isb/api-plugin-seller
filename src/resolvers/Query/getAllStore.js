import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";

import getPaginatedResponseFromAggregate from "@reactioncommerce/api-utils/graphql/getPaginatedResponseFromAggregate.js";
import applyOffsetPaginationToMongoAggregate from "@reactioncommerce/api-utils/graphql/applyOffsetPaginationToMongoAggregate.js";

export default async function getAllStore(parent, args, ctx, info) {
  const { searchQuery, ...connectionArgs } = args;

  const stores = await ctx.queries.stores(parent, args, ctx, info);

  console.log("stores are ", stores);

  return stores;

  // return applyOffsetPaginationToMongoAggregate(
  //   collection,
  //   pipeline,
  //   { ...connectionArgs, sortBy: "createdAt" }
  //   // {
  //   //   includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
  //   //   includeHasPreviousPage: wasFieldRequested(
  //   //     "pageInfo.hasPreviousPage",
  //   //     info
  //   //   ),
  //   //   includeTotalCount: wasFieldRequested("totalCount", info),
  //   // }
  // );

  // console.log("stores", stores);
  // return getPaginatedResponse(stores, connectionArgs, {
  //   includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
  //   includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
  //   includeTotalCount: wasFieldRequested("totalCount", info),
  // });
}
