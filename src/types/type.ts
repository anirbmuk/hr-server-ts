export type HrFilter = Record<
  string,
  number | { $regex: string; $options: 'i' }
>;
