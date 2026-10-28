import { t } from 'elysia';

export const UpdateUserSchema = t.Object({
  theme: t.Optional(t.String()),
  locale: t.Optional(t.String()),
  avatar: t.Optional(t.Any()),
});

export const AddEmailSchema = t.Object({
  email: t.String({ format: 'email' }),
  type: t.Optional(t.String()),
  description: t.Optional(t.String()),
  TFA: t.Optional(t.String()),
});

export const DeleteEmailSchema = t.Object({
  email: t.String({ format: 'email' }),
  TFA: t.Optional(t.String()),
});

export const VerifyEmailSchema = t.Object({
  email: t.String({ format: 'email' }),
  code: t.String(),
});

export const AddPhoneSchema = t.Object({
  code: t.String(),
  number: t.String(),
  description: t.Optional(t.String()),
  TFA: t.Optional(t.String()),
});

export const DeletePhoneSchema = t.Object({
  number: t.String(),
  TFA: t.Optional(t.String()),
});

export const VerifyPhoneSchema = t.Object({
  number: t.String(),
  code: t.String(),
});

export const AvatarHistoryQuerySchema = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
});
