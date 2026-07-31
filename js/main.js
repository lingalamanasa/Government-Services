/* ============================================================
   GOVERNMENT SERVICES PORTAL — Main JavaScript
   ============================================================ */

/* ── PAGE LOADER ── */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }, 1400);
  }
});

/* ── NAVBAR ── */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    // Scroll to top button
    const scrollTop = document.getElementById('scroll-top');
    if (scrollTop) scrollTop.classList.toggle('visible', window.scrollY > 400);
  });
}

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
  });
  // Close on nav link click
  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
    });
  });
}

/* ── SCROLL TO TOP ── */
const scrollTopBtn = document.getElementById('scroll-top');
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── TOAST ── */
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> ${msg}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target || el.innerText.replace(/\D/g, ''));
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
    if (current >= target) clearInterval(timer);
  }, 16);
}

/* ── INTERSECTION OBSERVER FOR COUNTERS ── */
const counterEls = document.querySelectorAll('.counter[data-target]');
if (counterEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => io.observe(el));
}

/* ── EXPANDABLE CARDS ── */
document.querySelectorAll('.expand-card-header').forEach(header => {
  header.addEventListener('click', () => {
    const card = header.closest('.expand-card');
    const isOpen = card.classList.contains('open');
    // Close all siblings in same group
    const group = header.closest('[data-expand-group]');
    if (group) group.querySelectorAll('.expand-card.open').forEach(c => c.classList.remove('open'));
    if (!isOpen) card.classList.add('open');
  });
});

/* ── HORIZONTAL SCROLL DRAG ── */
document.querySelectorAll('.h-scroll-container').forEach(el => {
  let isDown = false, startX, scrollLeft;
  el.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; });
  el.addEventListener('mouseleave', () => isDown = false);
  el.addEventListener('mouseup', () => isDown = false);
  el.addEventListener('mousemove', e => {
    if (!isDown) return; e.preventDefault();
    el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX);
  });
});

/* ── SPOTLIGHT CARD MOUSE MOVE ── */
document.querySelectorAll('.spotlight-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    const before = card.querySelector(':before') || card;
    card.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(245,158,11,0.1), transparent 60%), var(--glass-bg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

/* ── TYPING ANIMATION ── */
function typeWrite(el, texts, speed = 100) {
  if (!el) return;
  let textIdx = 0, charIdx = 0, deleting = false;
  function type() {
    const current = texts[textIdx];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) { deleting = true; setTimeout(type, 2000); return; }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) { deleting = false; textIdx = (textIdx + 1) % texts.length; }
    }
    setTimeout(type, deleting ? speed / 2 : speed);
  }
  type();
}
const typingEl = document.getElementById('typing-text');
if (typingEl) {
  typeWrite(typingEl, ['Smarter Services', 'Easier Applications', 'Digital India', 'Faster Delivery', 'Transparent Governance']);
}

/* ── AUTH: localStorage helpers ── */
const Auth = {
  save(data) { localStorage.setItem('gov_user', JSON.stringify(data)); },
  get() { try { return JSON.parse(localStorage.getItem('gov_user')); } catch { return null; } },
  clear() { localStorage.removeItem('gov_user'); },
  isLoggedIn() { const u = this.get(); return u && u.loggedIn; },
  getUsers() { try { return JSON.parse(localStorage.getItem('gov_users') || '[]'); } catch { return []; } },
  saveUser(user) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email === user.email);
    if (idx >= 0) users[idx] = user; else users.push(user);
    localStorage.setItem('gov_users', JSON.stringify(users));
  },
  findUser(email) { return this.getUsers().find(u => u.email === email); }
};

/* ── LOGIN FORM ── */
const loginForm = document.getElementById('login-form');
if (loginForm) {
  // Role tabs
  const roleTabs = document.querySelectorAll('.role-tab');
  let selectedRole = 'citizen';
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.dataset.role;
    });
  });

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = loginForm.querySelector('#login-email').value.trim();
    const password = loginForm.querySelector('#login-password').value;
    if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }

    // Check hardcoded admin
    if (selectedRole === 'admin' && email === 'admin@govservices.in' && password === 'Admin@123') {
      Auth.save({ loggedIn: true, role: 'admin', name: 'Admin', email });
      showToast('Welcome back, Admin! Redirecting…');
      setTimeout(() => window.location.href = 'admin-dashboard.html', 1500);
      return;
    }
    // Check registered users
    const user = Auth.findUser(email);
    if (user && user.password === password && user.role === selectedRole) {
      Auth.save({ loggedIn: true, role: user.role, name: user.name, email });
      showToast(`Welcome back, ${user.name}!`);
      setTimeout(() => {
        window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
      }, 1500);
    } else if (selectedRole === 'citizen') {
      // Demo bypass for citizen login
      const tempName = email.split('@')[0];
      Auth.save({ loggedIn: true, role: 'citizen', name: tempName, email });
      showToast(`Welcome back, ${tempName}!`);
      setTimeout(() => window.location.href = 'user-dashboard.html', 1500);
    } else {
      showToast('Invalid credentials or role. Please try again.', 'error');
    }
  });
}

/* ── REGISTER FORM ── */
const registerForm = document.getElementById('register-form');
if (registerForm) {
  const roleTabs = document.querySelectorAll('.role-tab');
  let selectedRole = 'citizen';
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.dataset.role;
    });
  });

  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = registerForm.querySelector('#reg-name').value.trim();
    const email = registerForm.querySelector('#reg-email').value.trim();
    const phone = registerForm.querySelector('#reg-phone').value.trim();
    const password = registerForm.querySelector('#reg-password').value;
    const confirm = registerForm.querySelector('#reg-confirm').value;
    if (!name || !email || !phone || !password) { showToast('Please fill in all required fields', 'error'); return; }
    if (password !== confirm) { showToast('Passwords do not match', 'error'); return; }
    if (password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    if (Auth.findUser(email)) { showToast('An account with this email already exists', 'error'); return; }

    const user = { name, email, phone, password, role: selectedRole, registered: new Date().toISOString() };
    Auth.saveUser(user);
    Auth.save({ loggedIn: true, role: selectedRole, name, email });
    showToast(`Welcome, ${name}! Account created successfully!`);
    setTimeout(() => {
      window.location.href = selectedRole === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
    }, 1800);
  });
}

/* ── DASHBOARD GUARD ── */
function requireAuth(role) {
  const user = Auth.get();
  if (!user || !user.loggedIn) { window.location.href = 'login.html'; return null; }
  if (role && user.role !== role) {
    if (user.role === 'admin') window.location.href = 'admin-dashboard.html';
    else window.location.href = 'user-dashboard.html';
    return null;
  }
  return user;
}

/* ── DASHBOARD SIDEBAR TOGGLE ── */
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    if (sidebarOverlay) sidebarOverlay.classList.toggle('show');
  });
}
if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', () => {
    if (sidebar) sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
  });
}

/* ── LOGOUT ── */
document.querySelectorAll('.logout-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    Auth.clear();
    showToast('Logged out successfully. See you soon!', 'info');
    setTimeout(() => window.location.href = 'login.html', 1200);
  });
});

/* ── GSAP INIT (if available) ── */
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Hero animations
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    gsap.from('.hero-tag', { y: 30, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
    gsap.from('.hero h1', { y: 50, opacity: 0, duration: 1, delay: 0.4, ease: 'power3.out' });
    gsap.from('.hero p', { y: 30, opacity: 0, duration: 0.8, delay: 0.6, ease: 'power3.out' });
    gsap.from('.hero-actions', { y: 30, opacity: 0, duration: 0.8, delay: 0.8, ease: 'power3.out' });
    gsap.from('.hero-image-wrap', { x: 60, opacity: 0, duration: 1, delay: 0.5, ease: 'power3.out' });
    gsap.from('.hero-badge-floating', { scale: 0.8, opacity: 0, duration: 0.8, delay: 1.2, stagger: 0.2, ease: 'back.out(1.7)' });
  }

  // Section reveals via ScrollTrigger
  gsap.utils.toArray('.section-label, .section-title, .section-subtitle').forEach(el => {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });

  // Stat cards stagger
  gsap.utils.toArray('.stat-card').forEach((card, i) => {
    gsap.from(card, {
      y: 50, opacity: 0, duration: 0.8, delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });

  // Bento items stagger (Removed to prevent conflict with AOS which handles bento items in HTML)

  // Timeline items
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      x: i % 2 === 0 ? -60 : 60, opacity: 0, duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });

  // Parallax on hero bg orbs
  gsap.to('.hero-bg-orb-1', {
    y: -100, ease: 'none',
    scrollTrigger: { trigger: '.hero', scrub: true }
  });

  // Sticky "How it works" highlight
  const stepItems = gsap.utils.toArray('.step-item');
  stepItems.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => { stepItems.forEach(s => s.classList.remove('active')); step.classList.add('active'); },
      onEnterBack: () => { stepItems.forEach(s => s.classList.remove('active')); step.classList.add('active'); }
    });
  });
}

/* ── AOS INIT ── */
if (typeof AOS !== 'undefined') {
  AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 80 });
}

/* ── PARTICLES (lightweight) ── */
function initParticles(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * -15}s;
      opacity: ${Math.random() * 0.5 + 0.1};
    `;
    container.appendChild(p);
  }
}
initParticles('hero-particles');
initParticles('auth-particles');

/* ── ACTIVE NAV LINK ── */
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link[href]').forEach(link => {
  const href = link.getAttribute('href').split('/').pop();
  if (href === currentPath || (currentPath === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ── NEWSLETTER FORM ── */
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Subscribed successfully! You\'ll receive government updates.', 'success');
    newsletterForm.reset();
  });
}

/* ── CONTACT FORM ── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Message sent! We\'ll respond within 24 hours.', 'success');
    contactForm.reset();
  });
}

/* ── PROGRESS BAR ANIMATION ── */
document.querySelectorAll('.progress-bar-fill[data-width]').forEach(bar => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { bar.style.width = bar.dataset.width; io.unobserve(bar); }
    });
  }, { threshold: 0.5 });
  io.observe(bar);
});

/* ── STEP ACTIVE STYLE ── */
const style = document.createElement('style');
style.textContent = `.step-item.active { border-bottom-color: rgba(245,158,11,0.3) !important; }
.step-item.active .step-num { animation: pulse-glow 1.5s ease infinite; }
.step-item.active .step-content h3 { color: var(--gold); }`;
document.head.appendChild(style);
