/** 让资源地址同时适用于站点根目录和 GitHub Pages 的项目子目录。 */
export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
