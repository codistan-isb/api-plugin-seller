import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import getPaginatedResponseFromAggregate from "@reactioncommerce/api-utils/graphql/getPaginatedResponseFromAggregate.js";
export default async function getAllNewSeller(parent, args, context, info) {
  const { searchQuery, ...connectionArgs } = args;
  const { collection, pipeline } = await context.queries.getAllNewSeller(
    context,
    args
  );

  return getPaginatedResponseFromAggregate(
    collection,
    pipeline,
    { ...connectionArgs, sortBy: "name" },
    {
      includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
      includeHasPreviousPage: wasFieldRequested(
        "pageInfo.hasPreviousPage",
        info
      ),
      includeTotalCount: wasFieldRequested("totalCount", info),
    }
  );
}
