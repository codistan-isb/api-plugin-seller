import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import StoresOptimize from "../../queries/optimizedQuery.js";
import { applyPagination } from "../../utils/pagination.js";
// import { StoresOptimize } from "../../queries/stores";

export async function getAllStore(parent, args, ctx, info) {
  const { searchQuery, ...connectionArgs } = args;

  const stores = await ctx.queries.stores(parent, args, ctx, info);

  return getPaginatedResponse(stores, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}

// export async function getAllStoreOptimize(parent, args, ctx, info) {
//   const { first = 10 } = args;
//   const { collections } = ctx;
//   const { Accounts, Catalog } = collections;

//   // Fetch the sellers and their product counts
//   const { sellers, totalRecords } = await StoresOptimize(
//     Accounts,
//     Catalog,
//     args
//   );

//   // Sort the sellers by productCount in descending order
//   const sortedSellers = sellers.sort((a, b) => b.productCount - a.productCount);

//   // Apply the pagination logic
//   const pagination = applyPagination({ first, totalRecords });

//   return {
//     nodes: sortedSellers,
//     totalRecords,
//     currentPageNo: 1,
//     ...pagination,
//   };
// }

export async function getAllStoreOptimize(parent, args, ctx, info) {
  const { first = 10 } = args;
  const { collections } = ctx;
  const { Accounts, Catalog } = collections;

  // Fetch the sellers and their product counts (already sorted in StoresOptimize)
  const { sellers, totalRecords } = await StoresOptimize(
    Accounts,
    Catalog,
    args
  );

  // Apply the pagination logic (no need to sort again)
  const pagination = applyPagination({ first, totalRecords });

  return {
    nodes: sellers, // Use the sellers as returned by StoresOptimize
    totalRecords,
    currentPageNo: 1,
    ...pagination,
  };
}
