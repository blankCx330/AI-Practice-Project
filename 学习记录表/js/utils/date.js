/**
 * Date Utils - 日期处理工具
 * 日期格式化、计算等工具函数
 */

const DateUtils = {
  /**
   * 格式化日期为 YYYY-MM-DD
   * @param {Date|string} date - 日期对象或字符串
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date) {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },
  
  /**
   * 格式化日期为中文显示
   * @param {Date|string} date - 日期对象或字符串
   * @returns {string} 中文格式日期
   */
  formatDateCN(date) {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    
    return `${year}年${month}月${day}日`;
  },
  
  /**
   * 获取今天的日期字符串 (YYYY-MM-DD)
   * @returns {string} 今天的日期
   */
  getToday() {
    return this.formatDate(new Date());
  },
  
  /**
   * 计算两个日期之间的天数
   * @param {string} startDate - 开始日期 (YYYY-MM-DD)
   * @param {string} endDate - 结束日期 (YYYY-MM-DD)
   * @returns {number} 天数差
   */
  getDaysBetween(startDate, endDate) {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },
  
  /**
   * 计算剩余天数
   * @param {string} endDate - 截止日期 (YYYY-MM-DD)
   * @returns {number} 剩余天数 (负数表示已过期)
   */
  getDaysLeft(endDate) {
    if (!endDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },
  
  /**
   * 获取日期的状态描述
   * @param {string} endDate - 截止日期
   * @returns {string} 状态描述
   */
  getDateStatus(endDate) {
    if (!endDate) return '';
    
    const daysLeft = this.getDaysLeft(endDate);
    
    if (daysLeft === null) return '';
    if (daysLeft < 0) return `已过期 ${Math.abs(daysLeft)} 天`;
    if (daysLeft === 0) return '今天到期';
    if (daysLeft === 1) return '明天到期';
    if (daysLeft <= 7) return `${daysLeft} 天后到期`;
    
    return `剩余 ${daysLeft} 天`;
  },
  
  /**
   * 检查日期是否有效
   * @param {string} dateString - 日期字符串 (YYYY-MM-DD)
   * @returns {boolean} 是否有效
   */
  isValidDate(dateString) {
    if (!dateString) return false;
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  },
  
  /**
   * 格式化相对时间
   * @param {string} dateString - ISO日期字符串
   * @returns {string} 相对时间描述
   */
  getRelativeTime(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return this.formatDateCN(dateString);
  }
};

// 导出到全局
window.DateUtils = DateUtils;