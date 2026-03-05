export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Add it to .env and restart the server.`);
  }
  return value;
}

export function getAdminBasePath() {
  return getRequiredEnv("ADMIN_BASE_PATH");
}
