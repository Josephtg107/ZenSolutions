/**
 * Contact Form Handler using EmailJS
 * Envía correos automáticamente a ambos emails de Zen Solutions
 */

// Inicializar EmailJS
(function() {
  // Configuración de EmailJS
  // IMPORTANTE: Necesitas obtener estos valores desde https://www.emailjs.com/
  // 1. Crea una cuenta gratuita en EmailJS
  // 2. Crea un servicio de email (Gmail, Outlook, etc.)
  // 3. Crea un template de email
  // 4. Obtén tu Public Key, Service ID y Template ID
  
  const EMAILJS_CONFIG = {
    publicKey: 'qMKNbVF31zyfAHuy7', // Reemplazar con tu Public Key de EmailJS
    serviceId: 'service_9ah1qt7', // Reemplazar con tu Service ID
    templateId: 'template_od1gbg7', // Reemplazar con tu Template ID
    // Emails de destino (configurados en el template de EmailJS)
    toEmails: [
      'zensolutions.designs@gmail.com',
      'zensolutions.developer@gmail.com'
    ]
  };

  // Alternativa: Web3Forms (más simple, no requiere configuración compleja)
  // Obtén tu Access Key en: https://web3forms.com/
  const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY'; // Opcional

  // Función para inicializar EmailJS cuando esté disponible
  function initializeEmailJS() {
    if (typeof emailjs !== 'undefined') {
      try {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('EmailJS inicializado correctamente');
        return true;
      } catch (error) {
        console.error('Error al inicializar EmailJS:', error);
        return false;
      }
    }
    return false;
  }

  // Inicializar cuando el DOM esté listo y EmailJS esté cargado
  function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (!contactForm) {
      console.error('Formulario de contacto no encontrado');
      return;
    }

    // Intentar inicializar EmailJS
    let emailjsReady = initializeEmailJS();
    
    // Si EmailJS no está disponible aún, esperar un poco más
    if (!emailjsReady) {
      let attempts = 0;
      const maxAttempts = 10;
      const checkInterval = setInterval(() => {
        attempts++;
        emailjsReady = initializeEmailJS();
        if (emailjsReady || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          if (!emailjsReady) {
            console.warn('EmailJS no se pudo cargar después de varios intentos');
          }
        }
      }, 200);
    }

    // Función para enviar con Web3Forms (alternativa más simple)
    async function sendWithWeb3Forms(formData, submitBtn, originalText) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      showMessage('', '');

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `Nuevo mensaje de contacto de ${formData.name}`,
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone,
            message: formData.message,
            to: 'zensolutions.designs@gmail.com,zensolutions.developer@gmail.com'
          })
        });

        const result = await response.json();

        if (result.success) {
          showMessage('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.', 'success');
          contactForm.reset();
        } else {
          throw new Error(result.message || 'Error al enviar');
        }
      } catch (error) {
        console.error('Error con Web3Forms:', error);
        showMessage('Hubo un error al enviar tu mensaje. Por favor intenta de nuevo o contáctanos directamente por email.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }

    // Manejar envío del formulario
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Obtener valores del formulario
      const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim() || 'No proporcionado',
        message: document.getElementById('message').value.trim(),
        to_email: EMAILJS_CONFIG.toEmails.join(', '),
        reply_to: document.getElementById('email').value.trim()
      };

      // Validación básica
      if (!formData.name || !formData.email || !formData.message) {
        showMessage('Por favor completa todos los campos requeridos.', 'error');
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showMessage('Por favor ingresa un email válido.', 'error');
        return;
      }

      // Deshabilitar botón y mostrar loading
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Intentar usar Web3Forms primero (más simple)
      if (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
        await sendWithWeb3Forms(formData, submitBtn, originalText);
        return;
      }

      // Validar que EmailJS esté configurado
      if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' || !EMAILJS_CONFIG.publicKey) {
        showMessage('Por favor configura EmailJS o Web3Forms primero. Revisa contact-form.js y WEB3FORMS_SETUP.md', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
      }

      // Verificar que EmailJS esté disponible
      if (typeof emailjs === 'undefined') {
        showMessage('EmailJS no está cargado. Por favor recarga la página e intenta de nuevo.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
      }

      // Asegurar que EmailJS esté inicializado
      try {
        emailjs.init(EMAILJS_CONFIG.publicKey);
      } catch (initError) {
        console.warn('EmailJS ya inicializado o error de inicialización:', initError);
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      showMessage('', '');

      try {
        // Enviar email usando EmailJS
        const response = await emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          {
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone,
            message: formData.message,
            to_email: formData.to_email,
            reply_to: formData.reply_to,
            // Información adicional para el template
            subject: `Nuevo mensaje de contacto de ${formData.name}`,
            date: new Date().toLocaleString('es-MX')
          }
        );

        // Éxito
        if (response.status === 200 || response.text === 'OK') {
          showMessage('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.', 'success');
          contactForm.reset();
        } else {
          throw new Error('Error al enviar el mensaje');
        }
      } catch (error) {
        console.error('Error enviando formulario:', error);
        console.error('Stack trace:', error.stack);
        let errorMessage = 'Hubo un error al enviar tu mensaje. Por favor intenta de nuevo o contáctanos directamente por email.';
        
        // Mensajes de error más específicos
        if (error.text) {
          console.error('Detalles del error EmailJS:', error.text);
          if (error.text.includes('Invalid template') || error.text.includes('template')) {
            errorMessage = 'Error de configuración: Template ID inválido. Por favor contacta al administrador.';
          } else if (error.text.includes('Invalid service') || error.text.includes('service')) {
            errorMessage = 'Error de configuración: Service ID inválido. Por favor contacta al administrador.';
          } else if (error.text.includes('Invalid public key') || error.text.includes('public key')) {
            errorMessage = 'Error de configuración: Public Key inválido. Por favor contacta al administrador.';
          } else if (error.text.includes('quota') || error.text.includes('limit')) {
            errorMessage = 'Se ha alcanzado el límite de envíos. Por favor intenta más tarde o contáctanos directamente por email.';
          }
        } else if (error.message) {
          console.error('Mensaje de error:', error.message);
          if (error.message.includes('emailjs')) {
            errorMessage = 'EmailJS no está disponible. Por favor recarga la página e intenta de nuevo.';
          }
        }
        
        showMessage(errorMessage, 'error');
      } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });

    // Función para mostrar mensajes
    function showMessage(message, type) {
      if (!formMessage) return;
      
      formMessage.textContent = message;
      formMessage.className = 'form-message';
      
      if (type === 'success') {
        formMessage.classList.add('success');
      } else if (type === 'error') {
        formMessage.classList.add('error');
      }
      
      // Scroll suave al mensaje
      if (message) {
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  // Esperar a que el DOM y EmailJS estén listos
  function waitForEmailJS(callback, maxAttempts = 20, attempt = 0) {
    if (typeof emailjs !== 'undefined') {
      console.log('EmailJS detectado, inicializando formulario...');
      callback();
      return;
    }
    
    if (attempt < maxAttempts) {
      setTimeout(() => waitForEmailJS(callback, maxAttempts, attempt + 1), 100);
    } else {
      console.error('EmailJS no se pudo cargar después de', maxAttempts, 'intentos');
      // Intentar inicializar de todas formas por si acaso
      callback();
    }
  }

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      waitForEmailJS(setupContactForm);
    });
  } else {
    // DOM ya está listo
    waitForEmailJS(setupContactForm);
  }
})();

