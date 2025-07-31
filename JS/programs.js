function toggleCategory(header) {
  const category = header.closest('.research-category');
  if (category) {
    category.classList.toggle('expanded');
  }
}

  window.addEventListener('scroll', function () {
    const scrollBar = document.getElementById('scroll-bar');
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    scrollBar.style.width = progress + '%';
  });

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