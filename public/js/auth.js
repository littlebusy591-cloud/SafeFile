// Login and register pages (the same script handles both forms).
sfRenderIcons();

const alertBox = document.getElementById('formAlert');
const submitBtn = document.getElementById('submitBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// ---------- Login ----------
if (loginForm) {
  if (new URLSearchParams(window.location.search).get('registered') === '1') {
    showAlert(alertBox, 'Account created. Log in to continue.', 'success');
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert(alertBox);

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) {
      return showAlert(alertBox, 'Enter your email and password.', 'error');
    }

    setBusy(submitBtn, true, 'Logging in...');
    try {
      // noRedirect: a wrong password gives 401, which should show a message, not redirect.
      await api('/api/auth/login', { method: 'POST', body: { email, password }, noRedirect: true });
      window.location.href = '/dashboard';
    } catch (err) {
      showAlert(alertBox, err.message, 'error');
      setBusy(submitBtn, false);
    }
  });
}

// ---------- Register ----------
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert(alertBox);

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Quick checks here for a fast response. The server checks everything again.
    if (name.length < 2) return showAlert(alertBox, 'Name must be at least 2 characters.', 'error');
    if (!email) return showAlert(alertBox, 'Enter your email address.', 'error');
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return showAlert(alertBox, 'Password must be at least 8 characters with a letter and a number.', 'error');
    }
    if (password !== confirmPassword) return showAlert(alertBox, 'Passwords do not match.', 'error');

    setBusy(submitBtn, true, 'Creating account...');
    try {
      await api('/api/auth/register', { method: 'POST', body: { name, email, password, confirmPassword }, noRedirect: true });
      window.location.href = '/login?registered=1';
    } catch (err) {
      showAlert(alertBox, err.message, 'error');
      setBusy(submitBtn, false);
    }
  });
}
