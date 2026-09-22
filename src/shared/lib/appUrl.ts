export function appPath(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}` || normalizedPath;
}

export function absoluteAppUrl(path: string) {
  return `${window.location.origin}${appPath(path)}`;
}
