/**
 * Shared `toJSON` options: clients get `id` (Mongoose's string virtual) instead
 * of `_id`, and never see `__v`.
 */
export const jsonOptions = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
};
