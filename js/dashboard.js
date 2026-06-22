(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

  function drawBarChart(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const values = [24, 36, 28, 52, 44, 62, 70];
    const max = Math.max(...values);
    const pad = 18;
    const barW = (width - pad * 2) / values.length - 12;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 4; i++) {
      const y = pad + ((height - pad * 2) / 4) * i;
      ctx.fillRect(pad, y, width - pad * 2, 1);
    }

    values.forEach((value, index) => {
      const x = pad + index * (barW + 12);
      const h = ((height - pad * 2) * value) / max;
      const y = height - pad - h;
      const grad = ctx.createLinearGradient(0, y, 0, height - pad);
      grad.addColorStop(0, '#ffa94d');
      grad.addColorStop(1, '#ff7a00');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, h);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(x, y - 8, barW, 2);
    });
  }

  function drawLineChart(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const values = [18, 26, 24, 31, 39, 47, 52, 58];
    const max = Math.max(...values);
    const pad = 20;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 4; i++) {
      const y = pad + ((height - pad * 2) / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(width - pad, y);
      ctx.stroke();
    }

    const stepX = (width - pad * 2) / (values.length - 1);
    ctx.beginPath();
    values.forEach((value, index) => {
      const x = pad + index * stepX;
      const y = height - pad - ((height - pad * 2) * value) / max;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#ff7a00';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffa94d';
    values.forEach((value, index) => {
      const x = pad + index * stepX;
      const y = height - pad - ((height - pad * 2) * value) / max;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawPieChart(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const values = [
      { label: 'Upstream', value: 35, color: '#ff7a00' },
      { label: 'Midstream', value: 25, color: '#ffa94d' },
      { label: 'Downstream', value: 22, color: '#d6dce5' },
      { label: 'Renewables', value: 18, color: '#7ad6ff' },
    ];
    const total = values.reduce((sum, item) => sum + item.value, 0);
    const radius = Math.min(width, height) / 3.2;
    const cx = width / 2;
    const cy = height / 2.05;

    ctx.clearRect(0, 0, width, height);
    let start = -Math.PI / 2;
    values.forEach((item) => {
      const slice = (item.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      start += slice;
    });

    ctx.fillStyle = 'rgba(8,28,58,0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
    ctx.fill();
  }

  function initCharts() {
    const bar = qs('[data-bar-chart]');
    const line = qs('[data-line-chart]');
    const pie = qs('[data-pie-chart]');
    if (bar) drawBarChart(bar);
    if (line) drawLineChart(line);
    if (pie) drawPieChart(pie);
    window.addEventListener('resize', () => {
      if (bar) drawBarChart(bar);
      if (line) drawLineChart(line);
      if (pie) drawPieChart(pie);
    });
  }

  function animateMetrics() {
    qsa('[data-dashboard-count]').forEach((node) => {
      const target = Number(node.dataset.dashboardCount || 0);
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        node.textContent = Math.round(target * progress);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function initSidebarState() {
    const sidebar = qs('[data-sidebar]');
    const overlay = qs('[data-sidebar-overlay]');
    const close = () => sidebar?.classList.remove('is-open');
    overlay?.addEventListener('click', close);
    qsa('[data-sidebar-nav] a').forEach((link) => link.addEventListener('click', close));
  }

  function highlightSidebar() {
    const current = document.body.dataset.panel || 'dashboard';
    qsa('[data-sidebar-nav] a').forEach((link) => {
      if (link.dataset.panel === current) link.classList.add('is-active');
    });
  }

  function init() {
    if (!document.body.classList.contains('dashboard-page')) return;
    initCharts();
    animateMetrics();
    initSidebarState();
    highlightSidebar();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
