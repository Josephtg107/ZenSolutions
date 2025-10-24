/**
 * Sistema Freemium para Zen Solutions Tools
 * Maneja límites de uso y suscripciones premium
 */

class FreemiumSystem {
  constructor() {
    this.storageKey = 'zen_tools_usage';
    this.premiumKey = 'zen_tools_premium';
    this.limits = {
      free: {
        imageConverter: { daily: 5, perConversion: 3 },
        imageToPdf: { daily: 3, perConversion: 5 },
        mergePdf: { daily: 2, perConversion: 3 }
      },
      premium: {
        imageConverter: { daily: -1, perConversion: 20 }, // -1 = ilimitado
        imageToPdf: { daily: -1, perConversion: 50 },
        mergePdf: { daily: -1, perConversion: 10 }
      }
    };
    
    this.init();
  }

  init() {
    // Verificar si es un nuevo día y resetear contadores si es necesario
    this.checkDailyReset();
  }

  checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('zen_tools_last_reset');
    
    if (lastReset !== today) {
      this.resetDailyCounters();
      localStorage.setItem('zen_tools_last_reset', today);
    }
  }

  resetDailyCounters() {
    const usage = this.getUsageData();
    Object.keys(usage.daily).forEach(tool => {
      usage.daily[tool] = 0;
    });
    localStorage.setItem(this.storageKey, JSON.stringify(usage));
  }

  getUsageData() {
    const defaultUsage = {
      daily: {
        imageConverter: 0,
        imageToPdf: 0,
        mergePdf: 0
      },
      total: {
        imageConverter: 0,
        imageToPdf: 0,
        mergePdf: 0
      }
    };

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : defaultUsage;
    } catch (error) {
      console.error('Error reading usage data:', error);
      return defaultUsage;
    }
  }

  saveUsageData(usage) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(usage));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }

  isPremium() {
    const premiumData = localStorage.getItem(this.premiumKey);
    if (!premiumData) return false;

    try {
      const data = JSON.parse(premiumData);
      const now = new Date();
      const expiry = new Date(data.expiry);
      
      if (now > expiry) {
        // Suscripción expirada
        localStorage.removeItem(this.premiumKey);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  setPremium(months = 1) {
    const now = new Date();
    const expiry = new Date(now.getTime() + (months * 30 * 24 * 60 * 60 * 1000));
    
    const premiumData = {
      active: true,
      startDate: now.toISOString(),
      expiry: expiry.toISOString(),
      plan: 'monthly'
    };
    
    localStorage.setItem(this.premiumKey, JSON.stringify(premiumData));
  }

  canUseTool(toolName, operationCount = 1) {
    const isPremium = this.isPremium();
    const limits = isPremium ? this.limits.premium : this.limits.free;
    const toolLimits = limits[toolName];
    
    if (!toolLimits) return { allowed: true, reason: 'Tool not found' };

    // Verificar límite por operación
    if (toolLimits.perConversion !== -1 && operationCount > toolLimits.perConversion) {
      return {
        allowed: false,
        reason: `Máximo ${toolLimits.perConversion} ${this.getOperationName(toolName)} por operación`,
        limit: toolLimits.perConversion,
        current: operationCount
      };
    }

    // Verificar límite diario
    if (toolLimits.daily !== -1) {
      const usage = this.getUsageData();
      const dailyUsage = usage.daily[toolName] || 0;
      
      if (dailyUsage >= toolLimits.daily) {
        return {
          allowed: false,
          reason: `Límite diario alcanzado (${toolLimits.daily} ${this.getOperationName(toolName)})`,
          limit: toolLimits.daily,
          current: dailyUsage
        };
      }
    }

    return { allowed: true };
  }

  recordUsage(toolName) {
    const usage = this.getUsageData();
    
    if (!usage.daily[toolName]) usage.daily[toolName] = 0;
    if (!usage.total[toolName]) usage.total[toolName] = 0;
    
    usage.daily[toolName]++;
    usage.total[toolName]++;
    
    this.saveUsageData(usage);
  }

  getOperationName(toolName) {
    const names = {
      imageConverter: 'conversiones',
      imageToPdf: 'conversiones',
      mergePdf: 'uniones'
    };
    return names[toolName] || 'operaciones';
  }

  getUsageStats(toolName) {
    const usage = this.getUsageData();
    const isPremium = this.isPremium();
    const limits = isPremium ? this.limits.premium : this.limits.free;
    const toolLimits = limits[toolName];
    
    return {
      daily: usage.daily[toolName] || 0,
      total: usage.total[toolName] || 0,
      dailyLimit: toolLimits.daily,
      perOperationLimit: toolLimits.perConversion,
      isPremium: isPremium
    };
  }

  showUpgradeModal(toolName, reason) {
    const modal = document.createElement('div');
    modal.className = 'freemium-modal';
    modal.innerHTML = `
      <div class="freemium-modal-content">
        <div class="freemium-modal-header">
          <h3>🚀 Desbloquea Más Potencial</h3>
          <button class="freemium-modal-close">&times;</button>
        </div>
        <div class="freemium-modal-body">
          <p><strong>Límite alcanzado:</strong> ${reason}</p>
          <div class="freemium-benefits">
            <h4>Con Zen Premium obtienes:</h4>
            <ul>
              <li>✅ Conversiones ilimitadas</li>
              <li>✅ Hasta 20 imágenes por conversión</li>
              <li>✅ Hasta 50 imágenes por PDF</li>
              <li>✅ Hasta 10 PDFs por unión</li>
              <li>✅ Acceso a herramientas futuras</li>
              <li>✅ Soporte prioritario</li>
            </ul>
          </div>
          <div class="freemium-pricing-subtle">
            <p>💎 <strong>Plan Premium disponible</strong></p>
            <p>Acceso ilimitado a todas las características</p>
          </div>
        </div>
        <div class="freemium-modal-footer">
          <button class="freemium-btn-secondary" onclick="this.closest('.freemium-modal').remove()">
            Continuar Gratis
          </button>
          <button class="freemium-btn-primary" onclick="window.location.href='subscription.html'">
            Ver Opciones Premium
          </button>
        </div>
      </div>
    `;

    // Agregar estilos
    const style = document.createElement('style');
    style.textContent = `
      .freemium-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
      }
      
      .freemium-modal-content {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      
      .freemium-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px 0 24px;
        border-bottom: 1px solid #e5e7eb;
        margin-bottom: 20px;
      }
      
      .freemium-modal-header h3 {
        margin: 0;
        color: #1f2937;
        font-size: 1.5rem;
        font-weight: 700;
      }
      
      .freemium-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .freemium-modal-body {
        padding: 0 24px 20px 24px;
      }
      
      .freemium-benefits {
        background: #f8fafc;
        border-radius: 12px;
        padding: 16px;
        margin: 16px 0;
      }
      
      .freemium-benefits h4 {
        margin: 0 0 12px 0;
        color: #1f2937;
        font-size: 1.1rem;
      }
      
      .freemium-benefits ul {
        margin: 0;
        padding-left: 20px;
        color: #374151;
      }
      
      .freemium-benefits li {
        margin-bottom: 8px;
      }
      
      .freemium-pricing-subtle {
        text-align: center;
        margin: 20px 0;
        padding: 16px;
        background: rgba(167, 139, 250, 0.1);
        border: 1px solid rgba(167, 139, 250, 0.2);
        border-radius: 12px;
        color: #374151;
      }
      
      .freemium-pricing-subtle p {
        margin: 4px 0;
        font-size: 0.95rem;
      }
      
      .freemium-pricing-subtle p:first-child {
        color: #1f2937;
        font-weight: 600;
      }
      
      .freemium-modal-footer {
        display: flex;
        gap: 12px;
        padding: 0 24px 24px 24px;
      }
      
      .freemium-btn-secondary,
      .freemium-btn-primary {
        flex: 1;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        font-size: 1rem;
        transition: all 0.2s;
      }
      
      .freemium-btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }
      
      .freemium-btn-secondary:hover {
        background: #e5e7eb;
      }
      
      .freemium-btn-primary {
        background: linear-gradient(135deg, #a78bfa, #d4ff65);
        color: #1f2937;
      }
      
      .freemium-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
      }
      
      @media (max-width: 600px) {
        .freemium-modal-content {
          width: 95%;
          margin: 20px;
        }
        
        .freemium-modal-header,
        .freemium-modal-body,
        .freemium-modal-footer {
          padding-left: 16px;
          padding-right: 16px;
        }
        
        .freemium-modal-footer {
          flex-direction: column;
        }
        
        .price {
          font-size: 2rem;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Cerrar modal al hacer clic en el fondo
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        style.remove();
      }
    });

    // Cerrar modal con botón X
    modal.querySelector('.freemium-modal-close').addEventListener('click', () => {
      modal.remove();
      style.remove();
    });
  }

  purchasePremium() {
    // Simular compra exitosa (en producción aquí iría la integración con el sistema de pagos)
    this.setPremium(1);
    
    // Mostrar mensaje de éxito
    const modal = document.querySelector('.freemium-modal');
    if (modal) {
      modal.innerHTML = `
        <div class="freemium-modal-content">
          <div class="freemium-modal-header">
            <h3>🎉 ¡Bienvenido a Zen Premium!</h3>
          </div>
          <div class="freemium-modal-body">
            <p>Tu suscripción premium ha sido activada exitosamente.</p>
            <p>Ahora puedes disfrutar de todas las características premium sin límites.</p>
            <div style="text-align: center; margin: 20px 0;">
              <div style="font-size: 3rem;">✨</div>
            </div>
          </div>
          <div class="freemium-modal-footer">
            <button class="freemium-btn-primary" onclick="this.closest('.freemium-modal').remove(); location.reload();" style="width: 100%;">
              ¡Empezar a Usar Premium!
            </button>
          </div>
        </div>
      `;
    }
  }

  showUsageIndicator(toolName) {
    const stats = this.getUsageStats(toolName);
    const isPremium = stats.isPremium;
    
    if (isPremium) {
      return `<div class="usage-indicator premium">⭐ Premium Activo - Sin Límites</div>`;
    }
    
    const dailyUsage = stats.daily;
    const dailyLimit = stats.dailyLimit;
    const percentage = (dailyUsage / dailyLimit) * 100;
    
    let color = '#10b981'; // Verde
    if (percentage > 80) color = '#f59e0b'; // Amarillo
    if (percentage >= 100) color = '#ef4444'; // Rojo
    
    return `
      <div class="usage-indicator">
        <div class="usage-text">Uso diario: ${dailyUsage}/${dailyLimit} ${this.getOperationName(toolName)}</div>
        <div class="usage-bar">
          <div class="usage-progress" style="width: ${Math.min(percentage, 100)}%; background: ${color};"></div>
        </div>
      </div>
    `;
  }
}

// Crear instancia global
window.freemiumSystem = new FreemiumSystem();
