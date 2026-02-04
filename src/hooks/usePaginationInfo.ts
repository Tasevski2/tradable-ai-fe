import type { PaginationMeta } from "@/types/api";

interface PaginationInfo {
  startItem: number;
  endItem: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function usePaginationInfo(pagination?: PaginationMeta): PaginationInfo {
  const {
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 0,
    hasNextPage = false,
    hasPreviousPage = false,
  } = pagination || {};

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return {
    startItem,
    endItem,
    totalItems,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages || totalPages === 0,
  };
}
