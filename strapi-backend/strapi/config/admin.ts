export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'default_admin_jwt_secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'default_api_token_salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
