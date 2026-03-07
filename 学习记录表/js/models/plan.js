/**
 * Plan Model - 计划数据模型
 * 定义计划数据结构和方法
 */

const PlanType = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  LONGTERM: 'longterm'
};

const PlanStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

const PlanTypeLabels = {
  [PlanType.DAILY]: '每日计划',
  [PlanType.WEEKLY]: '每周计划',
  [PlanType.MONTHLY]: '月度计划',
  [PlanType.LONGTERM]: '长期目标'
};

const PlanStatusLabels = {
  [PlanStatus.PENDING]: '未开始',
  [PlanStatus.IN_PROGRESS]: '进行中',
  [PlanStatus.COMPLETED]: '已完成'
};

/**
 * 生成UUID
 * @returns {string} UUID字符串
 */
function generateId() {
  return 'plan_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 创建计划对象
 * @param {Object} data - 计划数据
 * @returns {Object} 计划对象
 */
function createPlan(data) {
  const now = new Date().toISOString();
  
  return {
    id: data.id || generateId(),
    title: data.title || '',
    type: data.type || PlanType.DAILY,
    status: data.status || PlanStatus.PENDING,
    progress: data.progress !== undefined ? data.progress : 0,
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    tasks: data.tasks || [], // 新增：任务数组
    manualProgress: data.manualProgress !== undefined ? data.manualProgress : true, // 新增：是否手动设置进度
    createdAt: data.createdAt || now,
    updatedAt: now
  };
}

/**
 * 验证计划数据
 * @param {Object} plan - 计划对象
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validatePlan(plan) {
  const errors = [];
  
  if (!plan.title || plan.title.trim() === '') {
    errors.push('计划标题不能为空');
  }
  
  if (!Object.values(PlanType).includes(plan.type)) {
    errors.push('无效的计划类型');
  }
  
  if (!Object.values(PlanStatus).includes(plan.status)) {
    errors.push('无效的计划状态');
  }
  
  if (plan.progress < 0 || plan.progress > 100) {
    errors.push('进度必须在0-100之间');
  }
  
  // 如果有截止日期，开始日期不能晚于截止日期
  if (plan.startDate && plan.endDate && plan.startDate > plan.endDate) {
    errors.push('开始日期不能晚于截止日期');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 更新计划对象
 * @param {Object} plan - 原有计划对象
 * @param {Object} updates - 更新的数据
 * @returns {Object} 更新后的计划对象
 */
function updatePlan(plan, updates) {
  return {
    ...plan,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}

/**
 * 根据状态获取默认进度
 * @param {string} status - 计划状态
 * @returns {number} 默认进度
 */
function getDefaultProgress(status) {
  switch (status) {
    case PlanStatus.PENDING:
      return 0;
    case PlanStatus.IN_PROGRESS:
      return 50;
    case PlanStatus.COMPLETED:
      return 100;
    default:
      return 0;
  }
}

/**
 * 过滤计划列表
 * @param {Array} plans - 计划列表
 * @param {Object} filters - 过滤条件
 * @returns {Array} 过滤后的计划列表
 */
function filterPlans(plans, filters) {
  let result = [...plans];
  
  // 按类型过滤
  if (filters.type && filters.type !== 'all') {
    result = result.filter(plan => plan.type === filters.type);
  }
  
  // 按状态过滤
  if (filters.status && filters.status !== 'all') {
    result = result.filter(plan => plan.status === filters.status);
  }
  
  // 按关键词搜索
  if (filters.search) {
    const keyword = filters.search.toLowerCase();
    result = result.filter(plan => 
      plan.title.toLowerCase().includes(keyword)
    );
  }
  
  return result;
}

/**
 * 排序计划列表
 * @param {Array} plans - 计划列表
 * @param {string} sortBy - 排序字段
 * @param {string} order - 排序顺序 'asc' | 'desc'
 * @returns {Array} 排序后的计划列表
 */
function sortPlans(plans, sortBy = 'createdAt', order = 'desc') {
  const sorted = [...plans];
  
  sorted.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'endDate':
        valueA = a.endDate || '9999-99-99';
        valueB = b.endDate || '9999-99-99';
        break;
      case 'progress':
        valueA = a.progress;
        valueB = b.progress;
        break;
      case 'createdAt':
      default:
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
    }
    
    if (order === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
  
  return sorted;
}

/**
 * 计算统计数据
 * @param {Array} plans - 计划列表
 * @returns {Object} 统计数据
 */
function calculateStats(plans) {
  const total = plans.length;
  const completed = plans.filter(p => p.status === PlanStatus.COMPLETED).length;
  const inProgress = plans.filter(p => p.status === PlanStatus.IN_PROGRESS).length;
  const pending = plans.filter(p => p.status === PlanStatus.PENDING).length;
  
  return {
    total,
    completed,
    inProgress,
    pending
  };
}

/**
 * 添加任务到计划
 * @param {Object} plan - 计划对象
 * @param {Object} task - 任务对象
 * @returns {Object} 更新后的计划对象
 */
function addTaskToPlan(plan, task) {
  const tasks = plan.tasks || [];
  const newTasks = [...tasks, task];
  
  // 如果是第一个任务，切换到自动进度模式
  const manualProgress = tasks.length === 0 ? false : plan.manualProgress;
  
  // 计算新的进度
  const newProgress = manualProgress ? plan.progress : 
    window.TaskModel.calculateTaskProgress(newTasks);
  
  return updatePlan(plan, {
    tasks: newTasks,
    progress: newProgress,
    manualProgress
  });
}

/**
 * 从计划中删除任务
 * @param {Object} plan - 计划对象
 * @param {string} taskId - 任务 ID
 * @returns {Object} 更新后的计划对象
 */
function removeTaskFromPlan(plan, taskId) {
  const tasks = plan.tasks || [];
  const newTasks = tasks.filter(t => t.id !== taskId);
  
  // 如果没有任务了，切换回手动进度模式
  const manualProgress = newTasks.length === 0 ? true : plan.manualProgress;
  
  // 计算新的进度
  const newProgress = manualProgress ? (plan.progress || 0) : 
    window.TaskModel.calculateTaskProgress(newTasks);
  
  return updatePlan(plan, {
    tasks: newTasks,
    progress: newProgress,
    manualProgress
  });
}

/**
 * 更新计划中的任务
 * @param {Object} plan - 计划对象
 * @param {string} taskId - 任务 ID
 * @param {Object} updates - 更新数据
 * @returns {Object} 更新后的计划对象
 */
function updateTaskInPlan(plan, taskId, updates) {
  const tasks = plan.tasks || [];
  const newTasks = tasks.map(t => 
    t.id === taskId ? window.TaskModel.updateTask(t, updates) : t
  );
  
  // 自动计算进度
  const newProgress = plan.manualProgress ? plan.progress : 
    window.TaskModel.calculateTaskProgress(newTasks);
  
  return updatePlan(plan, {
    tasks: newTasks,
    progress: newProgress
  });
}

/**
 * 切换计划中任务的完成状态
 * @param {Object} plan - 计划对象
 * @param {string} taskId - 任务 ID
 * @returns {Object} 更新后的计划对象
 */
function toggleTaskInPlan(plan, taskId) {
  const tasks = plan.tasks || [];
  const newTasks = tasks.map(t => 
    t.id === taskId ? window.TaskModel.toggleTaskCompletion(t) : t
  );
  
  // 自动计算进度
  const newProgress = plan.manualProgress ? plan.progress : 
    window.TaskModel.calculateTaskProgress(newTasks);
  
  // 检查是否所有任务都完成了
  const allCompleted = newTasks.length > 0 && 
    newTasks.every(t => t.completed);
  
  // 如果所有任务完成，自动更新计划状态
  const newStatus = allCompleted ? PlanStatus.COMPLETED : plan.status;
  
  return updatePlan(plan, {
    tasks: newTasks,
    progress: newProgress,
    status: newStatus
  });
}

/**
 * 获取计划的任务统计
 * @param {Object} plan - 计划对象
 * @returns {Object} 任务统计信息
 */
function getPlanTaskStats(plan) {
  return window.TaskModel.getTaskStats(plan.tasks || []);
}

// 导出到全局
window.PlanModel = {
  PlanType,
  PlanStatus,
  PlanTypeLabels,
  PlanStatusLabels,
  createPlan,
  validatePlan,
  updatePlan,
  getDefaultProgress,
  addTaskToPlan,
  removeTaskFromPlan,
  updateTaskInPlan,
  toggleTaskInPlan,
  getPlanTaskStats,
  filterPlans,
  sortPlans,
  calculateStats
};