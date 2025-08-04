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

Chart.register(ChartDataLabels);

const labels = [
  'Intern\nAAL',
  'Adjunct Faculty\nCSE, AUST',
  'Lecturer\nCSE, SEU',
  'Coordinator\nCSE, SEU',
  'Assistant Moderator\nSEUCC, SEU'
];

const data = {
  datasets: [{
    label: 'Experience',
    data: [
      { x: ['2021-12-01', '2022-02-28'], y: 4 },
      { x: ['2022-02-01', '2022-09-30'], y: 3 },
      { x: ['2022-10-01', '2025-07-30'], y: 2 },
      { x: ['2023-11-01', '2025-07-30'], y: 1 },
      { x: ['2025-01-01', '2025-12-31'], y: 0 }
    ],
    
    backgroundColor: '#d2d2d3ff',
    borderRadius: 6,
    borderSkipped: false,
    barPercentage: 2.5,
    categoryPercentage: 0.9
  }]
};

const config = {
  type: 'bar',
  data: data,
  options: {
    indexAxis: 'y',
    responsive: true,
    scales: {
      x: {
        type: 'time',
        min: '2021-11-01',
        max: '2026-01-01',
        time: {
          unit: 'month',
          tooltipFormat: 'MMM yyyy'
        },
        title: {
          display: true,
          text: 'Timeline'
        }
      },
      y: {
        type: 'linear',
        display: false,
        min: -0.5,
        max: 4.5
      }
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'center',
        align: 'center',
        color: '#000',
        font: {
          weight: 'bold',
          size: 12
        },
        formatter: function (value, context) {
          return labels[context.dataIndex];
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const v = context.raw;
            const start = new Date(v.x[0]).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const end = new Date(v.x[1]).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            return `${labels[context.dataIndex]}: ${start} – ${end}`;
          }
        }
      }
    }
  },
  plugins: [ChartDataLabels]
};

new Chart(document.getElementById('experienceChart').getContext('2d'), config);

  window.addEventListener('scroll', function () {
    const icons = document.getElementById('navbar-icons');
    const scrollThreshold = 500; // adjust as needed

    if (window.scrollY > scrollThreshold) {
      icons.classList.remove('hidden');
    } else {
      icons.classList.add('hidden');
    }
  });