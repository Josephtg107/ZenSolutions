# 🚀 Configuración Rápida con Web3Forms (Alternativa Simple)

Web3Forms es más simple que EmailJS y no requiere configuración de servicios de email.

## Pasos Rápidos (5 minutos)

### 1. Obtener Access Key
1. Ve a [https://web3forms.com/](https://web3forms.com/)
2. Ingresa tu email: `zensolutions.designs@gmail.com`
3. Haz clic en **Get Access Key**
4. Revisa tu email y copia el **Access Key**

### 2. Configurar el Código
1. Abre `contact-form.js`
2. Busca esta línea:
```javascript
const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
```
3. Reemplaza `YOUR_WEB3FORMS_ACCESS_KEY` con tu Access Key real

### 3. Listo!
El formulario funcionará automáticamente. Los correos llegarán a ambos emails configurados.

## Ventajas de Web3Forms
- ✅ Configuración en 2 minutos
- ✅ 250 envíos/mes gratis
- ✅ No requiere conectar servicios de email
- ✅ Funciona inmediatamente
- ✅ Envía a múltiples destinatarios automáticamente

## Límites del Plan Gratuito
- 250 emails por mes
- Sin límite de formularios
- Sin branding

## Configuración de Múltiples Destinatarios

En `contact-form.js`, línea del `to:` en la función `sendWithWeb3Forms`:
```javascript
to: 'zensolutions.designs@gmail.com,zensolutions.developer@gmail.com'
```

Los emails deben estar separados por comas.

