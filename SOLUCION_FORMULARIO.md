# 🔧 Solución Rápida para el Formulario de Contacto

## Problema
El formulario de contacto no funciona ni en localhost ni en GitHub Pages.

### Error Común: "The recipients address is empty"
Si ves este error, significa que el campo **"To Email"** en tu template de EmailJS está vacío. Ver solución en `EMAILJS_FIX.md`.

## Soluciones Disponibles

### ✅ Opción 1: Web3Forms (RECOMENDADO - Más Simple)

Web3Forms es la solución más simple y confiable. Solo toma 2 minutos configurarlo.

#### Pasos:
1. Ve a [https://web3forms.com/](https://web3forms.com/)
2. Ingresa tu email: `zensolutions.designs@gmail.com`
3. Haz clic en **"Get Access Key"**
4. Revisa tu email y copia el **Access Key** que recibas
5. Abre `contact-form.js`
6. Busca esta línea (línea 25):
   ```javascript
   const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
   ```
7. Reemplaza `YOUR_WEB3FORMS_ACCESS_KEY` con tu Access Key real
8. Guarda el archivo
9. ¡Listo! El formulario funcionará inmediatamente

#### Ventajas:
- ✅ Configuración en 2 minutos
- ✅ 250 envíos/mes gratis
- ✅ No requiere configuración de servicios de email
- ✅ Funciona inmediatamente en localhost y GitHub Pages
- ✅ Envía a múltiples destinatarios automáticamente

---

### ⚙️ Opción 2: Verificar EmailJS

Si prefieres usar EmailJS, verifica lo siguiente:

#### 1. Verificar que EmailJS se carga correctamente:
- Abre la consola del navegador (F12)
- Busca mensajes que digan "✅ EmailJS inicializado correctamente"
- Si ves "⚠️ EmailJS no se pudo cargar", hay un problema con el CDN

#### 2. Verificar la configuración:
Abre `contact-form.js` y verifica que estos valores sean correctos:
```javascript
const EMAILJS_CONFIG = {
  publicKey: 'qMKNbVF31zyfAHuy7',
  serviceId: 'service_9ah1qt7',
  templateId: 'template_od1gbg7',
};
```

#### 3. Verificar en EmailJS Dashboard:
1. Ve a [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)
2. Verifica que:
   - El **Service ID** sea correcto
   - El **Template ID** sea correcto
   - El **Public Key** sea correcto
   - El template tenga los emails de destino configurados

#### 4. Verificar límites:
- El plan gratuito de EmailJS permite 200 emails/mes
- Si has alcanzado el límite, verás un error de "quota"

---

## 🔍 Diagnóstico

### Para diagnosticar el problema:

1. **Abre la consola del navegador** (F12 → Console)
2. **Intenta enviar el formulario**
3. **Revisa los mensajes en la consola:**
   - Si ves "📧 Usando Web3Forms..." → Web3Forms está configurado
   - Si ves "📧 Intentando usar EmailJS..." → EmailJS se está intentando usar
   - Si ves "❌ Error..." → Hay un problema específico

### Mensajes comunes:

- `✅ EmailJS inicializado correctamente` → EmailJS está funcionando
- `⚠️ EmailJS no se pudo cargar` → El CDN de EmailJS no se cargó
- `❌ Error de configuración: Template ID inválido` → El Template ID es incorrecto
- `❌ Error de configuración: Service ID inválido` → El Service ID es incorrecto
- `Se ha alcanzado el límite de envíos` → Has alcanzado el límite mensual

---

## 🚀 Solución Rápida (Recomendada)

**Usa Web3Forms** - Es más simple y confiable:

1. Obtén tu Access Key en [web3forms.com](https://web3forms.com/)
2. Reemplázala en `contact-form.js` línea 25
3. Guarda y prueba

El formulario funcionará inmediatamente sin necesidad de configurar servicios de email.

---

## 📧 Emails de Destino

Los correos se enviarán automáticamente a:
- `zensolutions.designs@gmail.com`
- `zensolutions.developer@gmail.com`

Estos están configurados en el código y no necesitas cambiarlos.

---

## ❓ ¿Aún no funciona?

Si después de seguir estos pasos el formulario aún no funciona:

1. Abre la consola del navegador (F12)
2. Intenta enviar el formulario
3. Copia todos los mensajes de error que aparezcan
4. Revisa los mensajes para identificar el problema específico

Los mensajes en la consola te dirán exactamente qué está fallando.

