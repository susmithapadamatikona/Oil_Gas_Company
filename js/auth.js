(function () {
  const USERS_KEY = 'stacklyUsers';
  const SESSION_KEY = 'stacklySession';
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

  function read(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getUsers() {
    return read(USERS_KEY, []);
  }

  function saveUsers(users) {
    write(USERS_KEY, users);
  }

  function getSession() {
    const local = read(SESSION_KEY, null);
    if (local) return local;
    try {
      const session = sessionStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  }

  function setSession(user, remember = false) {
    const payload = {
      name: user.name,
      company: user.company,
      email: user.email,
      phone: user.phone || '',
      role: user.role || '',
    };
    if (remember) {
      write(SESSION_KEY, payload);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
      localStorage.removeItem(SESSION_KEY);
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  function formatRole(role) {
    const value = String(role || '').trim();
    return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : 'N/A';
  }

  function showInlineHint(form, message) {
    let hint = form.querySelector('[data-auth-hint]');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'auth-note';
      hint.setAttribute('data-auth-hint', 'true');
      form.appendChild(hint);
    }
    hint.textContent = message;
  }

  function wirePasswordToggles() {
    qsa('[data-password-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('aria-controls');
        const input = targetId && document.getElementById(targetId);
        if (!input) return;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        button.classList.toggle('is-visible', show);
      });
    });
  }

  function updateStrength(field) {
    const strengthBox = field.closest('form')?.querySelector('[data-strength]');
    if (!strengthBox) return;
    const info = window.ecValidation.passwordStrength(field.value);
    strengthBox.dataset.level = String(info.score);
    const label = strengthBox.querySelector('[data-strength-label]');
    if (label) label.textContent = info.label;
  }

  function handleLogin() {
    const form = qs('[data-login-form]');
    if (!form) return;
    const email = qs('[name="email"]', form);
    const role = qs('[name="role"]', form);
    const password = qs('[name="password"]', form);
    const remember = qs('[name="remember"]', form);
    const submitButton = qs('[type="submit"]', form);

    function clearLoginFields() {
      email.value = '';
      role.value = '';
      password.value = '';
      if (remember) remember.checked = false;
      window.ecValidation.clearFormMessages(form);
    }

    const submit = async () => {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = 'Signing in...';
      form.classList.add('is-loading');
      await new Promise((resolve) => setTimeout(resolve, 900));
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || 'Login';
      form.classList.remove('is-loading');
    };

    clearLoginFields();
    requestAnimationFrame(clearLoginFields);
    setTimeout(clearLoginFields, 250);
    setTimeout(clearLoginFields, 800);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      window.ecValidation.clearFormMessages(form);
      let valid = true;

      if (!email.value.trim()) {
        window.ecValidation.setFieldMessage(email, 'Please enter your email address.');
        valid = false;
      } else if (!window.ecValidation.validateEmail(email.value)) {
        window.ecValidation.setFieldMessage(email, 'Enter a valid business email.');
        valid = false;
      }
      if (!role.value.trim()) {
        window.ecValidation.setFieldMessage(role, 'Please select your role.');
        valid = false;
      }
      if (!password.value.trim()) {
        window.ecValidation.setFieldMessage(password, 'Please enter your password.');
        valid = false;
      }
      if (!valid) return;

      await submit();

      const emailValue = email.value.trim();
      const userName = emailValue.split('@')[0] || 'Stackly User';
      const user = {
        name: userName,
        company: 'Stackly',
        email: emailValue,
        phone: '',
        role: role.value.trim(),
        password: password.value,
      };

      setSession(user, remember.checked);
      window.ecValidation.showFormMessage(form, 'Login successful. Redirecting to the dashboard...', 'success');
      setTimeout(() => {
        location.href = 'dashboard.html';
      }, 850);
    });
  }

  function handleSignup() {
    const form = qs('[data-signup-form]');
    if (!form) return;
    const role = qs('[name="role"]', form);
    const password = qs('[name="password"]', form);
    const confirm = qs('[name="confirmPassword"]', form);
    const terms = qs('[name="terms"]', form);

    password?.addEventListener('input', () => updateStrength(password));
    updateStrength(password);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      window.ecValidation.clearFormMessages(form);
      const fields = {
        firstName: qs('[name="firstName"]', form),
        lastName: qs('[name="lastName"]', form),
        role,
        email: qs('[name="email"]', form),
        phone: qs('[name="phone"]', form),
        password,
        confirm,
      };

      let valid = true;
      if (!fields.firstName.value.trim()) {
        window.ecValidation.setFieldMessage(fields.firstName, 'Please enter your first name.');
        valid = false;
      }
      if (!fields.lastName.value.trim()) {
        window.ecValidation.setFieldMessage(fields.lastName, 'Please enter your last name.');
        valid = false;
      }
      if (!fields.role.value.trim()) {
        window.ecValidation.setFieldMessage(fields.role, 'Please select a role.');
        valid = false;
      }
      if (!window.ecValidation.validateEmail(fields.email.value)) {
        window.ecValidation.setFieldMessage(fields.email, 'Please enter a valid email address.');
        valid = false;
      }
      if (!window.ecValidation.validatePhone(fields.phone.value)) {
        window.ecValidation.setFieldMessage(fields.phone, 'Please enter a valid mobile number.');
        valid = false;
      }
      if ((password.value || '').length < 8) {
        window.ecValidation.setFieldMessage(password, 'Password must be at least 8 characters.');
        valid = false;
      }
      if (password.value !== confirm.value) {
        window.ecValidation.setFieldMessage(confirm, 'Passwords do not match.');
        valid = false;
      }
      if (!terms.checked) {
        window.ecValidation.showFormMessage(form, 'You must accept the terms to continue.', 'error');
        valid = false;
      }
      if (!valid) return;

      const users = getUsers();
      const emailLower = fields.email.value.trim().toLowerCase();
      if (users.some((user) => user.email.toLowerCase() === emailLower)) {
        window.ecValidation.showFormMessage(form, 'An account with that email already exists.', 'error');
        return;
      }

      const fullName = `${fields.firstName.value.trim()} ${fields.lastName.value.trim()}`.trim();
      users.push({
        name: fullName,
        company: 'Stackly',
        role: fields.role.value.trim(),
        email: fields.email.value.trim(),
        phone: fields.phone.value.trim(),
        password: password.value,
      });
      saveUsers(users);
      window.ecValidation.showFormMessage(form, 'Registration complete. Redirecting to login...', 'success');
      setTimeout(() => {
        location.href = 'login.html';
      }, 1100);
    });
  }

  function handleForgotPassword() {
    qsa('[data-forgot-password]').forEach((button) => {
      button.addEventListener('click', () => {
        location.href = '404.html';
      });
    });
  }

  function protectDashboard() {
    if (!document.body.classList.contains('dashboard-page')) return;
    const session = getSession();
    if (!session) {
      location.href = 'login.html';
      return;
    }
    const userName = qs('[data-user-name]');
    const companyName = qs('[data-user-company]');
    const userEmail = qs('[data-user-email]');
    const userRole = qs('[data-user-role]');
    const displayRole = formatRole(session.role);
    qsa('[data-user-fullname]').forEach((node) => (node.textContent = session.name));
    qsa('[data-user-company]').forEach((node) => (node.textContent = session.company));
    qsa('[data-user-email]').forEach((node) => (node.textContent = session.email));
    qsa('[data-user-phone]').forEach((node) => (node.textContent = session.phone || 'N/A'));
    qsa('[data-user-role]').forEach((node) => (node.textContent = displayRole));
    if (userName) userName.textContent = session.name;
    if (companyName) companyName.textContent = session.company;
    if (userEmail) userEmail.textContent = session.email;
    if (userRole) userRole.textContent = displayRole;
  }

  function wireLogout() {
    qsa('[data-logout]').forEach((button) => {
      button.addEventListener('click', () => {
        clearSession();
        location.href = 'login.html';
      });
    });
  }

  function init() {
    wirePasswordToggles();
    handleLogin();
    handleSignup();
    handleForgotPassword();
    protectDashboard();
    wireLogout();

    qsa('[data-dropdown-toggle]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const dropdown = button.closest('[data-dropdown]');
        dropdown?.classList.toggle('is-open');
      });
    });

    document.addEventListener('click', () => {
      qsa('[data-dropdown].is-open').forEach((node) => node.classList.remove('is-open'));
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
