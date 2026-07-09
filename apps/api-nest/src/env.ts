const DEFAULT_PORT = 4000;
const DEFAULT_WEB_ANGULAR_ORIGIN = "http://localhost:4200";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  mongodbUri: getRequiredEnv("MONGODB_URI"),
  mongodbDbName: getRequiredEnv("MONGODB_DB_NAME"),
  port: Number(process.env.PORT ?? DEFAULT_PORT),
  webAngularOrigin: process.env.WEB_ANGULAR_ORIGIN ?? DEFAULT_WEB_ANGULAR_ORIGIN,
  isProduction: process.env.NODE_ENV === "production",
};
