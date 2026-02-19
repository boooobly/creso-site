export const REVIEW_STATUSES = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
} as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[keyof typeof REVIEW_STATUSES];
