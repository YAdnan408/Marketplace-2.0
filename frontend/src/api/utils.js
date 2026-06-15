/**
 * Resolves an image path to a full URL.
 * If the path is already a full URL (starting with http), it returns it as is.
 * Otherwise, it prepends the appropriate base directory.
 * 
 * @param {string} path - The image name or URL
 * @param {string} type - 'product' or 'profile'
 * @returns {string} - The resolved URL
 */
export function getImageUrl(path, type = "product") {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  const baseDir = type === "product" ? "/uploads/product_images/" : "/uploads/profile_images/";
  return `${baseDir}${path}`;
}
