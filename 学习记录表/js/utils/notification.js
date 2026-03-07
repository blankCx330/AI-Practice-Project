/**
 * Notification - 通知提示组件
 * 提供美观的、用户友好的通知提示
 */

const Notification = {
  /**
   * 显示通知提示
   * @param {string} message - 提示消息
   * @param {string} type - 提示类型 ('success', 'error', 'warning', 'info')
   * @param {number} duration - 显示时长（毫秒）
   */
  show(message, type = 'info', duration = 3000) {
    const container = this.getContainer();
    const notification = this.createNotification(message, type);
    
    container.appendChild(notification);
    
    // 自动关闭
    setTimeout(() => {
      this.close(notification);
    }, duration);
  },

  /**
   * 获取或创建通知容器
   * @returns {HTMLElement} 通知容器元素
   */
  getContainer() {
    let container = document.getElementById('notification-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(container);
    }
    
    return container;
  },

  /**
   * 创建通知元素
   * @param {string} message - 提示消息
   * @param {string} type - 提示类型
   * @returns {HTMLElement} 通知元素
   */
  createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    notification.style.cssText = `
      background: white;
      border-left: 4px solid ${colors[type]};
      border-radius: 8px;
      padding: 16px 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease;
      font-size: 14px;
      color: #374151;
    `;
    
    notification.innerHTML = `
      <span style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: ${colors[type]};
        color: white;
        border-radius: 50%;
        font-size: 14px;
        font-weight: bold;
        flex-shrink: 0;
      ">${icons[type]}</span>
      <span style="flex: 1;">${this.escapeHtml(message)}</span>
      <button onclick="Notification.close(this.parentElement)" style="
        background: none;
        border: none;
        font-size: 20px;
        color: #9ca3af;
        cursor: pointer;
        padding: 0;
        margin-left: 8px;
        line-height: 1;
      ">&times;</button>
    `;
    
    return notification;
  },

  /**
   * 关闭通知
   * @param {HTMLElement} notification - 通知元素
   */
  close(notification) {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentElement) {
        notification.parentElement.removeChild(notification);
      }
    }, 300);
  },

  /**
   * HTML 转义
   * @param {string} text - 要转义的文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// 导出到全局
window.Notification = Notification;

// 导出到全局
window.Notification = Notification;