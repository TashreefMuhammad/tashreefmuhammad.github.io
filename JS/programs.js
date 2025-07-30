function toggleCategory(header) {
  const category = header.closest('.research-category');
  if (category) {
    category.classList.toggle('expanded');
  }
}
