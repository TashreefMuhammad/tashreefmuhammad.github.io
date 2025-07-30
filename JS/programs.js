function toggleCategory(header) {
  const category = header.closest('.research-category');
  if (category) {
    category.classList.toggle('expanded');
  }
}

function enableAutoScrollIfNeeded() {
  const container = document.querySelector('.profile-scroll-container');
  if (container.scrollWidth > container.clientWidth) {
    container.classList.add('auto-scroll');
  } else {
    container.classList.remove('auto-scroll');
  }
}

window.addEventListener('load', enableAutoScrollIfNeeded);
window.addEventListener('resize', enableAutoScrollIfNeeded);