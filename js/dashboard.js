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
    const toggle = qs('[data-sidebar-toggle]');
    const close = () => {
      sidebar?.classList.remove('is-open');
      overlay?.classList.remove('is-visible');
      toggle?.setAttribute('aria-expanded', 'false');
      toggle?.setAttribute('aria-label', 'Open sidebar');
      document.body.classList.remove('dashboard-sidebar-open');
    };
    const open = () => {
      sidebar?.classList.add('is-open');
      overlay?.classList.add('is-visible');
      toggle?.setAttribute('aria-expanded', 'true');
      toggle?.setAttribute('aria-label', 'Close sidebar');
      document.body.classList.add('dashboard-sidebar-open');
    };
    const setOpen = (nextOpen) => {
      if (nextOpen) open();
      else close();
    };

    toggle?.addEventListener('click', () => setOpen(!sidebar?.classList.contains('is-open')));
    overlay?.addEventListener('click', close);
    qsa('[data-sidebar-close]').forEach((button) => button.addEventListener('click', close));
    qsa('[data-sidebar-nav] a').forEach((link) => link.addEventListener('click', close));
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 920) close();
    });
  }

  const dashboardViews = {
    dashboard: { section: '#overview' },
    profile: { section: '#profile', panel: 'profile' },
    projects: { section: '#messages', panel: 'projects' },
    reports: { section: '#reports' },
    analytics: { section: '#analytics' },
    messages: { section: '#messages', panel: 'messages' },
    settings: { section: '#profile', panel: 'settings' },
  };

  function setActiveSidebar(current) {
    qsa('[data-sidebar-nav] a').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.panel === current);
    });
  }

  function getPanelFromHash() {
    const panel = (location.hash || '#overview').replace('#', '');
    if (panel === 'overview') return 'dashboard';
    return dashboardViews[panel] ? panel : 'dashboard';
  }

  function showDashboardView(panel) {
    const current = dashboardViews[panel] ? panel : 'dashboard';
    const view = dashboardViews[current];
    document.body.dataset.panel = current;

    qsa('[data-dashboard-section]').forEach((section) => section.classList.add('is-hidden'));
    qsa('[data-dashboard-panel]').forEach((item) => item.classList.add('is-hidden'));

    const section = qs(view.section);
    if (!section) return;
    section?.classList.remove('is-hidden');

    if (view.panel) {
      qs(`[data-dashboard-panel="${view.panel}"]`, section)?.classList.remove('is-hidden');
    } else {
      qsa('[data-dashboard-panel]', section).forEach((item) => item.classList.remove('is-hidden'));
    }

    setActiveSidebar(current);
    if (window.AOS) window.AOS.refreshHard();
    if (current === 'analytics' || current === 'reports') {
      requestAnimationFrame(initCharts);
    }
  }

  function initDashboardViews() {
    qsa('[data-sidebar-nav] a').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const href = link.getAttribute('href') || '#overview';
        history.pushState(null, '', href);
        showDashboardView(getPanelFromHash());
      });
    });

    window.addEventListener('popstate', () => showDashboardView(getPanelFromHash()));
    window.addEventListener('hashchange', () => showDashboardView(getPanelFromHash()));
    showDashboardView(getPanelFromHash());
  }

  function init() {
    if (!document.body.classList.contains('dashboard-page')) return;
    initCharts();
    animateMetrics();
    initSidebarState();
    initDashboardViews();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
