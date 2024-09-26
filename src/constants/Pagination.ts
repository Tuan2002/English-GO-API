import "dotenv/config";
export const Pagination = {
  DEFAULT_PAGE: Number(process.env.DEFAULT_PAGE) || 1,
  DEFAULT_LIMIT: Number(process.env.DEFAULT_LIMIT) || 10,
};
