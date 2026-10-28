import { t } from 'elysia';

export const LoginBodySchema = t.Object({
  username: t.Optional(t.String()),
  password: t.Optional(t.String()),
  TFA: t.Optional(t.String()),
});

export const AuthChangeExpiredPasswordSchema = t.Object({
  username: t.String(),
  oldPassword: t.String(),
  newPassword: t.String(),
});

export const QrAuthSchema = t.Object({
  code: t.String({ minLength: 1, description: 'QR Token code or JSON string' }),
});

export const ForgotPassSchema = t.Object({
  username: t.Optional(t.String()),
  token: t.Optional(t.String()),
  selectedEmail: t.Optional(t.String()),
  emailCode: t.Optional(t.String()),
  newPassword: t.Optional(t.String()),
  TFA: t.Optional(t.String()),
});

export const ChangePasswordSchema = t.Object({
  oldpassword: t.String({ minLength: 1 }),
  password: t.String({ minLength: 6 }),
  TFA: t.Optional(t.String()),
});

export const PasskeyVerifyAuthSchema = t.Object({
  response: t.Any(),
  challenge: t.String(),
});

export const PasskeyVerifyRegSchema = t.Object({
  response: t.Any(),
  challenge: t.Optional(t.String()),
});

export const PasskeyUpdateSchema = t.Object({
  id: t.Union([t.String(), t.Number()]),
  name: t.String({ minLength: 1, maxLength: 100 }),
});

export const PasskeyRemoveSchema = t.Object({
  id: t.Union([t.String(), t.Number()]),
});
