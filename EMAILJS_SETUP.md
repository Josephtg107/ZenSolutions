# 📧 Configuración de EmailJS para el Formulario de Contacto

## Pasos para Configurar EmailJS (Gratis)

### 1. Crear Cuenta en EmailJS
1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita (hasta 200 emails/mes gratis)
3. Confirma tu email

### 2. Configurar Servicio de Email
1. Ve a **Email Services** en el dashboard
2. Haz clic en **Add New Service**
3. Selecciona **Gmail** (o tu proveedor de email preferido)
4. Conecta tu cuenta de Gmail
5. **Copia el Service ID** (ejemplo: `service_abc123`)

### 3. Crear Template de Email
1. Ve a **Email Templates** en el dashboard
2. Haz clic en **Create New Template**
3. Configura el template así:

**Template Name:** `zen_contact_form`

**Subject:** `Nuevo mensaje de contacto de {{from_name}}`

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head></head>
<body>
  <h2>Nuevo Mensaje de Contacto - Zen Solutions</h2>
  8
  <p><strong>Nombre:</strong> {{from_name}}</p>
  <p><strong>Email:</strong> {{from_email}}</p>
  <p><strong>Teléfono:</strong> {{phone}}</p>
  <p><strong>Fecha:</strong> {{date}}</p>
  
  <h3>Mensaje:</h3>
  <p>{{message}}</p>
  
  <hr>
  <p><small>Este mensaje fue enviado desde el formulario de contacto de Zen Solutions.</small></p>
</body>
</html>
```

**To Email:** 
```
zensolutions.designs@gmail.com,zensolutions.developer@gmail.com
```

**From Name:** `{{from_name}}`
**Reply To:** `{{reply_to}}`

4. **Guarda el Template ID** (ejemplo: `template_xyz789`)

### 4. Obtener Public Key
1. Ve a **Account** > **General**
2. **Copia tu Public Key** (ejemplo: `abcdefghijklmnop`)

### 5. Configurar el Código
1. Abre `contact-form.js`
2. Reemplaza estos valores:

```javascript
const EMAILJS_CONFIG = {
  publicKey: 'TU_PUBLIC_KEY_AQUI',
  serviceId: 'TU_SERVICE_ID_AQUI',
  templateId: 'TU_TEMPLATE_ID_AQUI',
  toEmails: [
    'zensolutions.designs@gmail.com',
    'zensolutions.developer@gmail.com'
  ]
};
```

### 6. Probar el Formulario
1. Abre `index-new.html` en tu navegador
2. Ve a la sección de contacto
3. Completa el formulario
4. Envía un mensaje de prueba
5. Verifica que ambos correos reciban el mensaje

## Configuración del Template en EmailJS

### Variables Disponibles:
- `{{from_name}}` - Nombre del remitente
- `{{from_email}}` - Email del remitente
- `{{phone}}` - Teléfono (opcional)
- `{{message}}` - Mensaje
- `{{date}}` - Fecha y hora
- `{{reply_to}}` - Email para responder

### Configuración de Destinatarios Múltiples:
En el campo "To Email" del template, separa los emails con comas:
```
zensolutions.designs@gmail.com,zensolutions.developer@gmail.com
```

## Límites del Plan Gratuito
- ✅ 200 emails por mes
- ✅ Sin límite de formularios
- ✅ Soporte básico
- ✅ Templates personalizados

## Solución de Problemas

### El formulario no envía
- Verifica que hayas reemplazado los valores en `contact-form.js`
- Revisa la consola del navegador para errores
- Asegúrate de que EmailJS esté inicializado correctamente

### No llegan los correos
- Verifica que el Service ID esté correcto
- Revisa que el Template ID sea el correcto
- Verifica que los emails de destino estén bien escritos en el template
- Revisa la carpeta de spam

### Error de CORS
- EmailJS maneja CORS automáticamente, pero si hay problemas, verifica que estés usando la versión correcta del SDK

## Alternativas Gratuitas

Si EmailJS no funciona para ti, puedes usar:
- **Formspree** - https://formspree.io/ (50 envíos/mes gratis)
- **Web3Forms** - https://web3forms.com/ (250 envíos/mes gratis)
- **Getform** - https://getform.io/ (50 envíos/mes gratis)

