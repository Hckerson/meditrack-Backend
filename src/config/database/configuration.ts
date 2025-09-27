export default () => ({
  database: {
    prisma: {
      url: process.env.DATABASE_URL,
    },
    redis: {
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  },
});
