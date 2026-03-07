/**
 * Storage - localStorage 封装
 * 负责数据的持久化存储
 */

const STORAGE_KEY = 'learning_plans';

const Storage = {
  /**
   * 获取所有计划
   * @returns {Array} 计划数组
   */
  getPlans() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const plans = JSON.parse(data);
      return Array.isArray(plans) ? plans : [];
    } catch (error) {
      console.error('读取数据失败:', error);
      return [];
    }
  },
  
  /**
   * 保存计划列表
   * @param {Array} plans - 计划数组
   * @returns {boolean} 是否保存成功
   */
  savePlans(plans) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  },
  
  /**
   * 获取单个计划
   * @param {string} id - 计划ID
   * @returns {Object|null} 计划对象
   */
  getPlanById(id) {
    const plans = this.getPlans();
    return plans.find(plan => plan.id === id) || null;
  },
  
  /**
   * 添加新计划
   * @param {Object} plan - 计划对象
   * @returns {boolean} 是否添加成功
   */
  addPlan(plan) {
    const plans = this.getPlans();
    plans.push(plan);
    return this.savePlans(plans);
  },
  
  /**
   * 更新计划
   * @param {string} id - 计划ID
   * @param {Object} updates - 更新的数据
   * @returns {boolean} 是否更新成功
   */
  updatePlan(id, updates) {
    const plans = this.getPlans();
    const index = plans.findIndex(plan => plan.id === id);
    
    if (index === -1) return false;
    
    plans[index] = {
      ...plans[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.savePlans(plans);
  },
  
  /**
   * 删除计划
   * @param {string} id - 计划ID
   * @returns {boolean} 是否删除成功
   */
  deletePlan(id) {
    const plans = this.getPlans();
    const filtered = plans.filter(plan => plan.id !== id);
    
    if (filtered.length === plans.length) return false;
    
    return this.savePlans(filtered);
  },
  
  /**
   * 清空所有计划
   * @returns {boolean} 是否清空成功
   */
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  },
  
  /**
   * 导出数据为JSON字符串
   * @returns {string} JSON字符串
   */
  exportData() {
    const plans = this.getPlans();
    return JSON.stringify(plans, null, 2);
  },
  
  /**
   * 从JSON字符串导入数据
   * @param {string} jsonString - JSON字符串
   * @returns {boolean} 是否导入成功
   */
  importData(jsonString) {
    try {
      const plans = JSON.parse(jsonString);
      if (!Array.isArray(plans)) {
        throw new Error('数据格式错误');
      }
      return this.savePlans(plans);
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  },

  /**
   * 添加任务到计划
   * @param {string} planId - 计划ID
   * @param {Object} task - 任务对象
   * @returns {boolean} 是否添加成功
   */
  addTask(planId, task) {
    const plan = this.getPlanById(planId);
    if (!plan) return false;
    
    const updatedPlan = window.PlanModel.addTaskToPlan(plan, task);
    return this.updatePlan(planId, updatedPlan);
  },
  
  /**
   * 更新计划中的任务
   * @param {string} planId - 计划ID
   * @param {string} taskId - 任务ID
   * @param {Object} updates - 更新数据
   * @returns {boolean} 是否更新成功
   */
  updateTask(planId, taskId, updates) {
    const plan = this.getPlanById(planId);
    if (!plan) return false;
    
    const updatedPlan = window.PlanModel.updateTaskInPlan(plan, taskId, updates);
    return this.updatePlan(planId, updatedPlan);
  },
  
  /**
   * 删除计划中的任务
   * @param {string} planId - 计划ID
   * @param {string} taskId - 任务ID
   * @returns {boolean} 是否删除成功
   */
  deleteTask(planId, taskId) {
    const plan = this.getPlanById(planId);
    if (!plan) return false;
    
    const updatedPlan = window.PlanModel.removeTaskFromPlan(plan, taskId);
    return this.updatePlan(planId, updatedPlan);
  },
  
  /**
   * 切换任务完成状态
   * @param {string} planId - 计划ID
   * @param {string} taskId - 任务ID
   * @returns {boolean} 是否切换成功
   */
  toggleTask(planId, taskId) {
    const plan = this.getPlanById(planId);
    if (!plan) return false;
    
    const updatedPlan = window.PlanModel.toggleTaskInPlan(plan, taskId);
    return this.updatePlan(planId, updatedPlan);
  },
  
  /**
   * 批量操作任务
   * @param {string} planId - 计划ID
   * @param {string} action - 操作类型 ('completeAll' | 'deleteCompleted')
   * @returns {boolean} 是否操作成功
   */
  bulkTaskOperation(planId, action) {
    const plan = this.getPlanById(planId);
    if (!plan) return false;
    
    let updatedPlan;
    
    switch (action) {
      case 'completeAll':
        const allCompletedTasks = (plan.tasks || []).map(t => 
          window.TaskModel.updateTask(t, { completed: true })
        );
        updatedPlan = window.PlanModel.updatePlan(plan, {
          tasks: allCompletedTasks,
          progress: 100,
          status: window.PlanModel.PlanStatus.COMPLETED
        });
        break;
        
      case 'deleteCompleted':
        const incompleteTasks = (plan.tasks || []).filter(t => !t.completed);
        const newProgress = incompleteTasks.length === 0 ? 0 :
          window.TaskModel.calculateTaskProgress(incompleteTasks);
        updatedPlan = window.PlanModel.updatePlan(plan, {
          tasks: incompleteTasks,
          progress: newProgress,
          manualProgress: incompleteTasks.length === 0
        });
        break;
        
      default:
        return false;
    }
    
    return this.updatePlan(planId, updatedPlan);
  }
};

// 导出到全局
window.Storage = Storage;