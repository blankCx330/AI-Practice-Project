/**
 * StorageMonitor - localStorage 配额监控
 * 监控存储使用情况，在接近限制时警告用户
 */

const StorageMonitor = {
  /**
   * localStorage 限制（字节）
   * 大多数浏览器限制为 5MB
   */
  LIMIT: 5 * 1024 * 1024, // 5MB
  
  /**
   * 警告阈值（百分比）
   */
  WARNING_THRESHOLD: 0.8, // 80%
  
  /**
   * 获取 localStorage 使用量
   * @returns {Object} { used: number, total: number, percentage: number }
   */
  getUsage() {
    try {
      let totalSize = 0;
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          // 计算键和值的总大小（UTF-16 编码，每个字符2字节）
          totalSize += (key.length + localStorage[key].length) * 2;
        }
      }
      
      return {
        used: totalSize,
        total: this.LIMIT,
        percentage: (totalSize / this.LIMIT) * 100,
        usedMB: (totalSize / (1024 * 1024)).toFixed(2),
        totalMB: (this.LIMIT / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      console.error('获取存储使用量失败:', error);
      return {
        used: 0,
        total: this.LIMIT,
        percentage: 0,
        usedMB: '0.00',
        totalMB: '5.00'
      };
    }
  },
  
  /**
   * 检查存储空间是否充足
   * @param {number} requiredSize - 需要的空间大小（字节）
   * @returns {boolean} 是否有足够空间
   */
  hasEnoughSpace(requiredSize = 0) {
    const usage = this.getUsage();
    const available = usage.total - usage.used;
    return available >= requiredSize;
  },
  
  /**
   * 检查是否接近限制
   * @returns {boolean} 是否接近限制
   */
  isNearLimit() {
    const usage = this.getUsage();
    return usage.percentage >= this.WARNING_THRESHOLD * 100;
  },
  
  /**
   * 显示存储使用情况警告
   */
  checkAndWarn() {
    const usage = this.getUsage();
    
    if (usage.percentage >= 90) {
      // 超过 90%，严重警告
      const message = `存储空间已使用 ${usage.percentage.toFixed(1)}%！\n` +
                     `已用: ${usage.usedMB}MB / ${usage.totalMB}MB\n` +
                     '建议导出备份并删除一些计划。';
      
      if (window.Notification) {
        window.Notification.show(message, 'warning', 5000);
      } else {
        alert(message);
      }
      
      return true;
    } else if (usage.percentage >= 80) {
      // 超过 80%，温和警告
      const message = `存储空间已使用 ${usage.percentage.toFixed(1)}%，建议定期备份。`;
      
      if (window.Notification) {
        window.Notification.show(message, 'warning', 3000);
      }
      
      return false;
    }
    
    return false;
  },
  
  /**
   * 监控数据保存操作
   * 在保存前检查空间是否充足
   * @param {Object} data - 要保存的数据
   * @returns {boolean} 是否可以安全保存
   */
  canSave(data) {
    const dataSize = JSON.stringify(data).length * 2; // UTF-16 编码
    const hasSpace = this.hasEnoughSpace(dataSize);
    
    if (!hasSpace) {
      const message = '存储空间不足！\n请删除一些计划或导出备份后重试。';
      
      if (window.Notification) {
        window.Notification.show(message, 'error');
      } else {
        alert(message);
      }
    }
    
    return hasSpace;
  },
  
  /**
   * 显示存储统计信息
   * @returns {string} 格式化的统计信息
   */
  getUsageReport() {
    const usage = this.getUsage();
    return `存储使用情况:\n` +
           `- 已用: ${usage.usedMB}MB (${usage.percentage.toFixed(1)}%)\n` +
           `- 总量: ${usage.totalMB}MB\n` +
           `- 可用: ${(usage.total - usage.used) / (1024 * 1024)).toFixed(2)}MB`;
  }
};

// 导出到全局
window.StorageMonitor = StorageMonitor;