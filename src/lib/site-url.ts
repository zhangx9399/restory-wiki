export type SiteEnvironment = Readonly<Record<string, string | undefined>>;

export function normalizeSiteOrigin(value: string): string {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("SITE_URL is invalid");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("SITE_URL must use http or https");
  }

  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an origin without a path, query, or hash");
  }

  return url.origin;
}

function normalizeVercelDomain(value: string): string {
  const trimmedValue = value.trim();

  return normalizeSiteOrigin(
    /^https?:\/\//i.test(trimmedValue)
      ? trimmedValue
      : `https://${trimmedValue}`,
  );
}

export function getSiteOrigin(
  environment: SiteEnvironment = process.env,
): string {
  if (environment.SITE_URL) {
    return normalizeSiteOrigin(environment.SITE_URL);
  }

  if (environment.VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizeVercelDomain(environment.VERCEL_PROJECT_PRODUCTION_URL);
  }

  if (environment.VERCEL_URL) {
    return normalizeVercelDomain(environment.VERCEL_URL);
  }

  return "http://localhost:3000";
}
