/**
 * Разворачивает дерево категорий в плоский список для select.
 */
export function flattenCategories(categories, depth = 0) {
  if (!categories?.length) return [];
  const result = [];
  for (const category of categories) {
    result.push({
      ...category,
      label: `${depth ? '— '.repeat(depth) : ''}${category.name}`,
    });
    if (category.children?.length) {
      result.push(...flattenCategories(category.children, depth + 1));
    }
  }
  return result;
}

/**
 * Находит категорию в дереве по uuid.
 */
export function findCategoryByUuid(categories, uuid) {
  if (!uuid || !categories?.length) return null;
  for (const category of categories) {
    if (category.uuid === uuid) return category;
    const found = findCategoryByUuid(category.children, uuid);
    if (found) return found;
  }
  return null;
}
