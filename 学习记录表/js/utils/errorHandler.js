/**
 * Error Handler - 全局错误处理
 * 提供统一的错误处理和用户友好的错误提示
 */

const ErrorHandler = {
  /**
   * 初始化全局错误处理
   */
  init() {
    // 捕获全局 JavaScript 错误
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'JavaScript Error');
      event.preventDefault();
    });

    // 捕获 Promise 未处理的 rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Promise Rejection');
      event.preventDefault();
    });
  },

  /**
   * 统一错误处理函数
   * @param {Error|string} error - 错误对象或错误消息
   * @param {string} context - 错误上下文
   */
  handleError(error, context = 'Application Error') {
    // 记录错误到控制台
    console.error(`[${context}]`, error);

    // 获取用户友好的错误消息
    const userMessage = this.getUserFriendlyMessage(error);

    // 显示错误提示
    this.showError(userMessage);
  },

  /**
   * 将技术错误转换为用户友好的消息
   * @param {Error|string} error - 错误对象
   * @returns {string} 用户友好的错误消息
   */
  getUserFriendlyMessage(error) {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      // localStorage 相关错误
      if (error.name === 'QuotaExceededError') {
        return '存储空间已满，请删除一些计划后重试';
      }

      // 网络错误
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return '网络连接失败，请检查网络设置';
      }

      // 数据解析错误
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        return '数据格式错误，请刷新页面重试';
      }

      // 其他已知错误
      if (error.message) {
        return error.message;
      }
    }

    // 默认错误消息
    return '操作失败，请稍后重试';
  },

  /**
   * 显示错误提示（使用 Notification 组件）
   * @param {string} message - 错误消息
   * @param {string} type - 提示类型 ('error', 'warning', 'success', 'info')
   */
  showNotification(message, type = 'error') {
    // 检查是否存在 Notification 工具
    if (window.Notification && typeof window.Notification.show === 'function') {
      window.Notification.show(message, type);
    } else {
      // 降级方案：使用 alert
      alert(`${type.toUpperCase()}: ${message}`);
    }
  },

  /**
   * 显示错误提示
   * @param {string} message - 错误消息
   */
  showError(message) {
    this.showNotification(message, 'error');
  },

  /**
   * 显示成功提示
   * @param {string} message - 成功消息
   */
  showSuccess(message) {
    this.showNotification(message, 'success');
  },

  /**
   * 显示警告提示
   * @param {string} message - 警告消息
   */
  showWarning(message) {
    this.showNotification(message, 'warning');
  },

  /**
   * 安全执行函数（带错误处理）
   * @param {Function} fn - 要执行的函数
   * @param {string} context - 错误上下文
   * @param {*} fallbackValue - 失败时的返回值
   * @returns {*} 函数执行结果或 fallbackValue
   */
  safeExecute(fn, context = 'Operation', fallbackValue = null) {
    try {
      return fn();
    } catch (error) {
      this.handleError(error, context);
      return fallbackValue;
    }
  },

  /**
   * 安全执行异步函数（带错误处理）
   * @param {Function} fn - 要执行的异步函数
   * @param {string} context - 错误上下文
   * @param {*} fallbackValue - 失败时的返回值
   * @returns {Promise<*>} Promise 包装的执行结果或 fallbackValue
   */
  async safeExecuteAsync(fn, context = 'Async Operation', fallbackValue = null) {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, context);
      return fallbackValue;
    }
  }
};

// 导出到全局
window.ErrorHandler = ErrorHandler;