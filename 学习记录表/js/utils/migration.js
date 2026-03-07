/**
 * Data Migration Utility - 数据迁移工具
 * 确保现有数据与新版本兼容
 */

const Migration = {
  /**
   * 当前数据版本
   */
  CURRENT_VERSION: '2.0.0',
  
  /**
   * 迁移计划数据到新版本
   * @param {Object} plan - 旧版本计划对象
   * @returns {Object} 新版本计划对象
   */
  migratePlan(plan) {
    // 如果已经是新版本，直接返回
    if (plan.tasks !== undefined && plan.manualProgress !== undefined) {
      return plan;
    }
    
    // 添加 tasks 数组（默认为空）
    const migratedPlan = {
      ...plan,
      tasks: plan.tasks || [],
      manualProgress: plan.manualProgress !== undefined ? plan.manualProgress : true
    };
    
    return migratedPlan;
  },
  
  /**
   * 迁移所有计划数据
   * @returns {boolean} 是否迁移成功
   */
  migrateAll() {
    try {
      const plans = window.Storage.getPlans();
      const migratedPlans = plans.map(plan => this.migratePlan(plan));
      
      // 检查是否有变化
      const hasChanges = JSON.stringify(plans) !== JSON.stringify(migratedPlans);
      
      if (hasChanges) {
        const success = window.Storage.savePlans(migratedPlans);
        if (success) {
          console.log('数据迁移成功：已添加任务支持');
        }
        return success;
      }
      
      return true; // 无需迁移
    } catch (error) {
      console.error('数据迁移失败:', error);
      return false;
    }
  },
  
  /**
   * 验证数据完整性
   * @param {Object} plan - 计划对象
   * @returns {boolean} 是否有效
   */
  validatePlanIntegrity(plan) {
    // 检查必需字段
    if (!plan.id || !plan.title || !plan.type || !plan.status) {
      return false;
    }
    
    // 检查 tasks 是否为数组
    if (plan.tasks && !Array.isArray(plan.tasks)) {
      return false;
    }
    
    // 检查进度范围
    if (typeof plan.progress !== 'number' || plan.progress < 0 || plan.progress > 100) {
      return false;
    }
    
    return true;
  },
  
  /**
   * 修复损坏的计划数据
   * @param {Object} plan - 损坏的计划对象
   * @returns {Object} 修复后的计划对象
   */
  repairPlan(plan) {
    const repaired = { ...plan };
    
    // 修复缺失的 tasks 数组
    if (!repaired.tasks || !Array.isArray(repaired.tasks)) {
      repaired.tasks = [];
    }
    
    // 修复缺失的 manualProgress 标志
    if (repaired.manualProgress === undefined) {
      repaired.manualProgress = repaired.tasks.length === 0;
    }
    
    // 修复进度值
    if (typeof repaired.progress !== 'number' || isNaN(repaired.progress)) {
      repaired.progress = 0;
    } else {
      repaired.progress = Math.max(0, Math.min(100, repaired.progress));
    }
    
    // 验证并修复任务数据
    repaired.tasks = repaired.tasks.map(task => {
      if (!task.id || !task.title) {
        return null; // 移除无效任务
      }
      
      return {
        id: task.id,
        planId: repaired.id,
        title: task.title,
        completed: task.completed || false,
        priority: task.priority || window.TaskModel.TaskPriority.MEDIUM,
        dueDate: task.dueDate || '',
        notes: task.notes || '',
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: task.updatedAt || new Date().toISOString()
      };
    }).filter(task => task !== null);
    
    return repaired;
  },
  
  /**
   * 自动修复所有数据
   * @returns {boolean} 是否修复成功
   */
  repairAll() {
    try {
      const plans = window.Storage.getPlans();
      const repairedPlans = plans.map(plan => this.repairPlan(plan));
      return window.Storage.savePlans(repairedPlans);
    } catch (error) {
      console.error('数据修复失败:', error);
      return false;
    }
  }
};

// 导出到全局
window.Migration = Migration;