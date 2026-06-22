window.ecValidation = (() => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+()0-9\s-]{7,}$/;

  function clearFieldMessage(field) {
    const wrap = field.closest('.field') || field.parentElement;
    const message = wrap && wrap.querySelector('.field-error');
    if (message) message.textContent = '';
    field.setAttribute('aria-invalid', 'false');
  }

  function setFieldMessage(field, message) {
    const wrap = field.closest('.field') || field.parentElement;
    const messageEl = wrap && wrap.querySelector('.field-error');
    if (messageEl) messageEl.textContent = message;
    field.setAttribute('aria-invalid', 'true');
  }

  function clearFormMessages(form) {
    form.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.setAttribute('aria-invalid', 'false'));
  }

  function showFormMessage(form, message, type = 'success') {
    let box = form.querySelector('.form-message');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-message';
      form.appendChild(box);
    }
    box.className = `form-message form-message--${type} is-visible`;
    box.textContent = message;
  }

  function hideFormMessage(form) {
    const box = form.querySelector('.form-message');
    if (box) box.classList.remove('is-visible');
  }

  function validateEmail(value) {
    return emailPattern.test(String(value).trim());
  }

  function validatePhone(value) {
    return phonePattern.test(String(value).trim());
  }

  function passwordStrength(value) {
    const pass = String(value);
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return { score, label: labels[score] || labels[0] };
  }

  return {
    clearFieldMessage,
    setFieldMessage,
    clearFormMessages,
    showFormMessage,
    hideFormMessage,
    validateEmail,
    validatePhone,
    passwordStrength,
  };
})();
