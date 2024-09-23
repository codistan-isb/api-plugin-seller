// pagination.js
export function applyPagination({ first = 10, totalRecords }) {
  const isLastPage = first >= totalRecords;
  const startRecord = 1;
  const endRecord = Math.min(first, totalRecords);

  return {
    isLastPage,
    startRecord,
    endRecord,
  };
}
