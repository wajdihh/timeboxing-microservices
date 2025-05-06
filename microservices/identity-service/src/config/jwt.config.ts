export default () => ({
    jwt: {
      secret: process.env.JWT_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    },
  });