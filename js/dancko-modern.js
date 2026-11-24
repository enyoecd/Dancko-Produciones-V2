/**
 * Dancko Producciones — Modern Navigation & Contact Form Controller
 */
(function () {
  'use strict';

  document.body.classList.add('dk-enhanced');

  /* ------------------------------------------------------------------------
   * 1. Fixed Navbar: Scroll State + Accessible Mobile Menu Toggle
   * ------------------------------------------------------------------------ */
  var navbar = document.querySelector('.dk-navbar');
  var navToggle = document.querySelector('.dk-nav-toggle');
  var navLinks = document.querySelectorAll('.dk-nav a');

  function updateNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 24) {
      navbar.classList.add('dk-navbar--scrolled');
    } else {
      navbar.classList.remove('dk-navbar--scrolled');
    }
  }

  function closeMobileMenu() {
    if (!navbar || !navToggle) return;
    navbar.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navbar && navToggle) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navbar.classList.toggle('is-open', !expanded);
      navToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileMenu();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });

    document.addEventListener('click', function (e) {
      if (navbar.classList.contains('is-open') && !navbar.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  window.addEventListener('scroll', updateNavbarScroll, { passive: true });
  updateNavbarScroll();

  /* ------------------------------------------------------------------------
   * 2. Contact Forms Validation & Smart Lead Delivery (Home & Contactos)
   * ------------------------------------------------------------------------ */
  var forms = document.querySelectorAll('.js-dk-contact-form');

  function formatChileanPhone(rawValue) {
    var digits = (rawValue || '').replace(/\D/g, '');
    if (digits.indexOf('56') === 0) {
      digits = digits.slice(2);
    }
    return '+56' + digits.slice(0, 9);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  forms.forEach(function (form) {
    var nameInput = form.querySelector('[name="your-name"]');
    var emailInput = form.querySelector('[name="your-email"]');
    var phoneInput = form.querySelector('[name="tel-628"]');
    var subjectInput = form.querySelector('[name="your-subject"]');
    var messageInput = form.querySelector('[name="your-message"]');
    var feedbackBox = form.querySelector('.dk-form__feedback');

    function setFieldError(input, message) {
      if (!input) return;
      var field = input.closest('.dk-field');
      var errEl = field ? field.querySelector('.dk-field__error') : null;
      if (field) {
        field.classList.toggle('is-invalid', Boolean(message));
      }
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (errEl) {
        errEl.textContent = message || '';
      }
    }

    function clearFeedback() {
      if (!feedbackBox) return;
      feedbackBox.className = 'dk-form__feedback';
      feedbackBox.innerHTML = '';
    }

    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        phoneInput.value = formatChileanPhone(phoneInput.value);
        setFieldError(phoneInput, '');
      });
    }

    [nameInput, emailInput, subjectInput, messageInput].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () {
        if (el.value.trim() !== '') {
          setFieldError(el, '');
        }
      });
      el.addEventListener('change', function () {
        if (el.value.trim() !== '') {
          setFieldError(el, '');
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();

      clearFeedback();
      if (phoneInput && phoneInput.value.trim() !== '') {
        phoneInput.value = formatChileanPhone(phoneInput.value);
      }

      var firstInvalid = null;
      function fail(input, msg) {
        setFieldError(input, msg);
        if (!firstInvalid) firstInvalid = input;
      }

      [nameInput, emailInput, phoneInput, subjectInput, messageInput].forEach(function (el) {
        setFieldError(el, '');
      });

      var nameVal = nameInput ? nameInput.value.trim() : '';
      var emailVal = emailInput ? emailInput.value.trim() : '';
      var phoneVal = phoneInput ? phoneInput.value.trim() : '';
      var subjectVal = subjectInput ? subjectInput.value.trim() : '';
      var messageVal = messageInput ? messageInput.value.trim() : '';

      if (!nameVal) {
        fail(nameInput, 'Por favor, ingresa tu nombre completo.');
      }

      if (!emailVal) {
        fail(emailInput, 'Por favor, ingresa tu correo electrónico.');
      } else if (!isValidEmail(emailVal)) {
        fail(emailInput, 'Ingresa un correo electrónico válido (ej: nombre@correo.cl).');
      }

      if (phoneVal && phoneVal !== '+56' && phoneVal.replace(/\D/g, '').length < 10) {
        fail(phoneInput, 'Ingresa los 9 dígitos después de +56 (ej: +56983690847).');
      }

      if (!subjectVal) {
        fail(subjectInput, 'Selecciona o escribe el tipo de evento o asunto.');
      }

      if (!messageVal) {
        fail(messageInput, 'Cuéntanos brevemente qué necesitas para tu evento.');
      }

      if (firstInvalid) {
        if (feedbackBox) {
          feedbackBox.className = 'dk-form__feedback is-visible is-error';
          feedbackBox.setAttribute('role', 'alert');
          feedbackBox.textContent = 'Por favor, revisa los campos marcados en rojo antes de enviar.';
        }
        firstInvalid.focus();
        return;
      }

      var cleanPhone = phoneVal && phoneVal !== '+56' ? phoneVal : 'No indicado';
      var summaryLines = [
        'Hola Dancko Producciones, solicito cotización / información:',
        '• Nombre: ' + nameVal,
        '• Correo: ' + emailVal,
        '• Teléfono: ' + cleanPhone,
        '• Evento / Asunto: ' + subjectVal,
        '• Mensaje: ' + messageVal
      ].join('\n');

      var waUrl = 'https://wa.me/56983690847?text=' + encodeURIComponent(summaryLines);
      var mailUrl =
        'mailto:eventos@danckoproducciones.cl?subject=' +
        encodeURIComponent('Cotización Web: ' + subjectVal + ' - ' + nameVal) +
        '&body=' +
        encodeURIComponent(summaryLines);

      if (feedbackBox) {
        feedbackBox.className = 'dk-form__feedback is-visible is-success';
        feedbackBox.setAttribute('role', 'status');
        feedbackBox.innerHTML =
          '<strong>¡Solicitud lista, ' +
          nameVal.replace(/[<>&"]/g, '') +
          '!</strong> Elige cómo enviarla directamente a nuestro equipo para atención inmediata:' +
          '<div class="dk-feedback-actions">' +
          '<a class="dk-feedback-btn dk-feedback-btn--wa" href="' +
          waUrl +
          '" target="_blank" rel="noopener noreferrer"><i class="fa fa-whatsapp" aria-hidden="true"></i> Enviar por WhatsApp</a>' +
          '<a class="dk-feedback-btn dk-feedback-btn--mail" href="' +
          mailUrl +
          '"><i class="fa fa-envelope" aria-hidden="true"></i> Enviar por Correo</a>' +
          '</div>';
      }
    });
  });
})();
