
export interface PaginationOptions {
  page: number | string;
  pageSize?: number;
}

export const getPageRange = (
  { page, pageSize = 9 }: PaginationOptions
): { start: number; end: number } => {
  const pageNumber = typeof page === 'string' ? parseInt(page, 10) || 1 : page;
  const start = (pageNumber - 1) * pageSize;
  const end = start + pageSize - 1;
  
  return { start, end };
};

export const applyPagination = (query: any, paginationOptions: PaginationOptions) => {
  const { start, end } = getPageRange(paginationOptions);
  return query.range(start, end);
};
