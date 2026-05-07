const API_BASE = '/home/api';

// Modal functionality
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const modalClose = document.getElementById('modalClose');
const loginForm = document.getElementById('loginForm');

if (loginBtn && loginModal) {
  loginBtn.addEventListener('click', () => {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
}

if (modalClose && loginModal) {
  modalClose.addEventListener('click', () => {
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
  });
}

// Close modal on overlay click
if (loginModal) {
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      loginModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && loginModal && loginModal.classList.contains('active')) {
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Login form submission
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    if (!agreeTerms) {
      alert('Please agree to the Terms of Service, Privacy Policy, and AI Usage Guidelines');
      return;
    }
    
    // TODO: Implement actual login API call
    console.log('Login attempt:', { email, password });
    
    // Simulate login success
    alert('Login functionality will be implemented soon!');
    
    // Close modal after successful login
    // loginModal.classList.remove('active');
    // document.body.style.overflow = '';
  });
}

const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}
document.querySelectorAll('.nav-dropdown-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    if (window.innerWidth <= 860) {
      const parent = btn.closest('.dropdown');
      parent.classList.toggle('open');
    }
  });
});

// Demo form handler
const demoForm = document.querySelector('.demo-section form.demo-form');
if (demoForm) {
  demoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(demoForm);
    const body = Object.fromEntries(formData.entries());
    try {
      const res = await fetch(API_BASE + '/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        demoForm.innerHTML = '<div style="text-align:center;padding:40px"><h3>Thank you!</h3><p>We received your demo request and will follow up soon.</p></div>';
      } else {
        alert('Submission failed. Please try again.');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  });
}

// DMC form handler
const dmcForm = document.querySelector('#partner-form form.demo-form');
if (dmcForm) {
  dmcForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(dmcForm);
    const body = Object.fromEntries(formData.entries());
    try {
      const res = await fetch(API_BASE + '/dmc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        dmcForm.innerHTML = '<div style="text-align:center;padding:40px"><h3>Application received!</h3><p>We will review your DMC partner application and reach out soon.</p></div>';
      } else {
        alert('Submission failed. Please try again.');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  });
}