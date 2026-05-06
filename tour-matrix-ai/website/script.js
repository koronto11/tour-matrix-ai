const API_BASE = '/home/api';

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