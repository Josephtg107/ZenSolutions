/**
 * Contact Form Handler using EmailJS and Web3Forms as fallback
 * Envía correos automáticamente a ambos emails de Zen Solutions
 */

// Inicializar EmailJS
(function() {
  'use strict';
  
  // Configuración de EmailJS
  // IMPORTANTE: Necesitas obtener estos valores desde https://www.emailjs.com/
  const EMAILJS_CONFIG = {
    publicKey: 'qMKNbVF31zyfAHuy7',
    serviceId: 'service_9ah1qt7',
    templateId: 'template_od1gbg7',
    toEmails: [
      'zensolutions.designs@gmail.com',
      'zensolutions.developer@gmail.com'
    ]
  };

  // Alternativa: Web3Forms (más simple, no requiere configuración compleja)
  // Obtén tu Access Key en: https://web3forms.com/
  // Si tienes una Access Key, reemplázala aquí:
  const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
  
  // Emails de destino para Web3Forms
  const DESTINATION_EMAILS = 'zensolutions.designs@gmail.com,zensolutions.developer@gmail.com';

  // Función para inicializar EmailJS cuando esté disponible
  function initializeEmailJS() {
    if (typeof emailjs !== 'undefined' && emailjs.init) {
      try {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('✅ EmailJS inicializado correctamente');
        return true;
      } catch (error) {
        console.error('❌ Error al inicializar EmailJS:', error);
        return false;
      }
    }
    return false;
  }
  
  // Verificar si EmailJS está disponible y cargado
  function isEmailJSAvailable() {
    return typeof emailjs !== 'undefined' && 
           typeof emailjs.send === 'function' &&
           typeof emailjs.init === 'function';
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
    let emailjsReady = false;
    
    // Esperar a que EmailJS se cargue
    const checkEmailJS = () => {
      if (isEmailJSAvailable()) {
        emailjsReady = initializeEmailJS();
        if (emailjsReady) {
          console.log('✅ EmailJS está listo para usar');
        }
        return emailjsReady;
      }
      return false;
    };
    
    // Intentar inicializar inmediatamente
    checkEmailJS();
    
    // Si no está disponible, esperar un poco más
    if (!emailjsReady) {
      let attempts = 0;
      const maxAttempts = 15;
      const checkInterval = setInterval(() => {
        attempts++;
        emailjsReady = checkEmailJS();
        if (emailjsReady || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          if (!emailjsReady) {
            console.warn('⚠️ EmailJS no se pudo cargar. Se usará Web3Forms si está configurado.');
          }
        }
      }, 300);
    }

    // Función para enviar con Web3Forms (alternativa más simple)
    async function sendWithWeb3Forms(formData, submitBtn, originalText) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      showMessage('', '');

      try {
        console.log('📧 Intentando enviar con Web3Forms...');
        
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
            phone: formData.phone || 'No proporcionado',
            message: formData.message,
            to: DESTINATION_EMAILS
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('📧 Respuesta de Web3Forms:', result);

        if (result.success) {
          showMessage('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.', 'success');
          contactForm.reset();
        } else {
          throw new Error(result.message || 'Error al enviar');
        }
      } catch (error) {
        console.error('❌ Error con Web3Forms:', error);
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
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      showMessage('', '');
      
      // Intentar usar Web3Forms primero si está configurado (más simple y confiable)
      if (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
        console.log('📧 Usando Web3Forms...');
        await sendWithWeb3Forms(formData, submitBtn, originalText);
        return;
      }

      // Si Web3Forms no está configurado, intentar con EmailJS
      console.log('📧 Intentando usar EmailJS...');
      
      // Verificar que EmailJS esté disponible
      if (!isEmailJSAvailable()) {
        console.error('❌ EmailJS no está disponible');
        showMessage('El servicio de envío no está disponible. Por favor configura Web3Forms o contacta directamente por email.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
      }

      // Asegurar que EmailJS esté inicializado
      try {
        if (typeof emailjs.init === 'function') {
          emailjs.init(EMAILJS_CONFIG.publicKey);
          console.log('✅ EmailJS inicializado');
        }
      } catch (initError) {
        console.warn('⚠️ EmailJS ya inicializado o error:', initError);
      }

      try {
        console.log('📧 Enviando con EmailJS...');
        
        // Preparar los parámetros para EmailJS
        // IMPORTANTE: El campo "To Email" debe estar configurado en el template de EmailJS
        // Si quieres usar parámetros dinámicos, usa {{to_email}} en el template
        const templateParams = {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone || 'No proporcionado',
          message: formData.message,
          reply_to: formData.reply_to,
          // Enviar emails de destino como parámetro (debe estar en el template como {{to_email}})
          to_email: EMAILJS_CONFIG.toEmails.join(','),
          // También enviar individualmente por si el template los necesita
          to_email_1: EMAILJS_CONFIG.toEmails[0],
          to_email_2: EMAILJS_CONFIG.toEmails[1],
          subject: `Nuevo mensaje de contacto de ${formData.name}`,
          date: new Date().toLocaleString('es-MX')
        };
        
        console.log('📧 Parámetros enviados:', templateParams);
        
        // Enviar email usando EmailJS
        const response = await emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          templateParams
        );

        console.log('📧 Respuesta de EmailJS:', response);

        // Éxito
        if (response.status === 200 || response.text === 'OK') {
          showMessage('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.', 'success');
          contactForm.reset();
        } else {
          throw new Error('Error al enviar el mensaje');
        }
      } catch (error) {
        console.error('❌ Error enviando formulario:', error);
        console.error('Detalles completos:', {
          message: error.message,
          text: error.text,
          status: error.status
        });
        
        let errorMessage = 'Hubo un error al enviar tu mensaje. Por favor intenta de nuevo o contáctanos directamente por email.';
        
        // Mensajes de error más específicos
        if (error.text) {
          console.error('Detalles del error EmailJS:', error.text);
          if (error.text.includes('recipients address is empty') || error.text.includes('recipients')) {
            errorMessage = 'Error de configuración: El campo "To Email" en el template de EmailJS está vacío. Por favor configura los emails de destino en el template. Ver EMAILJS_FIX.md para más detalles.';
          } else if (error.text.includes('Invalid template') || error.text.includes('template')) {
            errorMessage = 'Error de configuración: Template ID inválido. Por favor contacta al administrador.';
          } else if (error.text.includes('Invalid service') || error.text.includes('service')) {
            errorMessage = 'Error de configuración: Service ID inválido. Por favor contacta al administrador.';
          } else if (error.text.includes('Invalid public key') || error.text.includes('public key')) {
            errorMessage = 'Error de configuración: Public Key inválido. Por favor contacta al administrador.';
          } else if (error.text.includes('quota') || error.text.includes('limit')) {
            errorMessage = 'Se ha alcanzado el límite de envíos. Por favor intenta más tarde o contáctanos directamente por email.';
          }
        } else if (error.message) {
          if (error.message.includes('emailjs') || error.message.includes('EmailJS')) {
            errorMessage = 'EmailJS no está disponible. Por favor recarga la página e intenta de nuevo.';
          } else if (error.message.includes('recipients') || error.message.includes('empty')) {
            errorMessage = 'Error de configuración: El campo "To Email" en el template de EmailJS está vacío. Ver EMAILJS_FIX.md para más detalles.';
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

  // Esperar a que el DOM esté listo
  function initForm() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupContactForm);
    } else {
      // DOM ya está listo
      setupContactForm();
    }
  }

  // Inicializar cuando el script se carga
  initForm();
  
  // También escuchar cuando EmailJS se carga dinámicamente
  window.addEventListener('load', function() {
    console.log('📄 Página cargada completamente');
    if (isEmailJSAvailable()) {
      console.log('✅ EmailJS está disponible');
    } else {
      console.warn('⚠️ EmailJS no está disponible. Se recomienda usar Web3Forms.');
    }
  });
})();

