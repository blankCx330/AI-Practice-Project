/**
 * Task Model - 任务数据模型
 * 支持将计划分解为具体的执行任务
 */

/**
 * 任务优先级枚举
 */
const TaskPriority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * 任务优先级标签
 */
const TaskPriorityLabels = {
  [TaskPriority.HIGH]: '高优先级',
  [TaskPriority.MEDIUM]: '中优先级',
  [TaskPriority.LOW]: '低优先级'
};

/**
 * 生成任务唯一 ID
 * @returns {string} 唯一 ID
 */
function generateTaskId() {
  return 'task_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 创建任务对象
 * @param {Object} data - 任务数据
 * @param {string} data.planId - 所属计划 ID
 * @param {string} data.title - 任务标题
 * @param {boolean} data.completed - 是否完成
 * @param {string} data.priority - 优先级
 * @param {string} data.dueDate - 截止日期
 * @param {string} data.notes - 任务备注
 * @returns {Object} 任务对象
 */
function createTask(data) {
  const now = new Date().toISOString();
  
  return {
    id: data.id || generateTaskId(),
    planId: data.planId,
    title: data.title || '',
    completed: data.completed || false,
    priority: data.priority || TaskPriority.MEDIUM,
    dueDate: data.dueDate || '',
    notes: data.notes || '',
    createdAt: data.createdAt || now,
    updatedAt: now
  };
}

/**
 * 验证任务数据
 * @param {Object} task - 任务对象
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateTask(task) {
  const errors = [];
  
  // 标题验证
  if (!task.title || task.title.trim() === '') {
    errors.push('任务标题不能为空');
  } else if (task.title.length > 200) {
    errors.push('任务标题长度不能超过200字符');
  }
  
  // 所属计划 ID 验证
  if (!task.planId) {
    errors.push('任务必须属于某个计划');
  }
  
  // 优先级验证
  const validPriorities = Object.values(TaskPriority);
  if (task.priority && !validPriorities.includes(task.priority)) {
    errors.push('无效的任务优先级');
  }
  
  // 截止日期格式验证
  if (task.dueDate && !window.DateUtils.isValidDate(task.dueDate)) {
    errors.push('无效的截止日期格式');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 更新任务对象
 * @param {Object} task - 原任务对象
 * @param {Object} updates - 更新数据
 * @returns {Object} 更新后的任务对象
 */
function updateTask(task, updates) {
  return {
    ...task,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}

/**
 * 切换任务完成状态
 * @param {Object} task - 任务对象
 * @returns {Object} 更新后的任务对象
 */
function toggleTaskCompletion(task) {
  return updateTask(task, { completed: !task.completed });
}

/**
 * 计算任务列表的完成进度
 * @param {Array} tasks - 任务数组
 * @returns {number} 完成百分比 (0-100)
 */
function calculateTaskProgress(tasks) {
  if (!tasks || tasks.length === 0) {
    return 0; // 没有任务返回 0
  }
  
  const completedCount = tasks.filter(task => task.completed).length;
  return Math.round((completedCount / tasks.length) * 100);
}

/**
 * 获取任务统计信息
 * @param {Array} tasks - 任务数组
 * @returns {Object} 统计信息
 */
function getTaskStats(tasks) {
  if (!tasks || tasks.length === 0) {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      progress: 0,
      highPriority: 0,
      overdue: 0
    };
  }
  
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const progress = calculateTaskProgress(tasks);
  
  // 高优先级任务数
  const highPriority = tasks.filter(t => t.priority === TaskPriority.HIGH && !t.completed).length;
  
  // 过期任务数（未完成且截止日期已过）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate < today;
  }).length;
  
  return {
    total,
    completed,
    pending,
    progress,
    highPriority,
    overdue
  };
}

/**
 * 排序任务列表
 * @param {Array} tasks - 任务数组
 * @param {string} sortBy - 排序方式 ('priority' | 'dueDate' | 'created' | 'completed')
 * @param {string} order - 排序顺序 ('asc' | 'desc')
 * @returns {Array} 排序后的任务数组
 */
function sortTasks(tasks, sortBy = 'created', order = 'asc') {
  if (!tasks || tasks.length === 0) return tasks;
  
  const sorted = [...tasks];
  const priorityOrder = {
    [TaskPriority.HIGH]: 3,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.LOW]: 1
  };
  
  sorted.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'priority':
        valueA = priorityOrder[a.priority] || 0;
        valueB = priorityOrder[b.priority] || 0;
        break;
        
      case 'dueDate':
        valueA = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999;
        valueB = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999;
        break;
        
      case 'completed':
        valueA = a.completed ? 1 : 0;
        valueB = b.completed ? 1 : 0;
        break;
        
      case 'created':
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
 * 过滤任务列表
 * @param {Array} tasks - 任务数组
 * @param {Object} filters - 过滤条件
 * @returns {Array} 过滤后的任务数组
 */
function filterTasks(tasks, filters) {
  if (!tasks || tasks.length === 0) return tasks;
  
  let result = [...tasks];
  
  // 按完成状态过滤
  if (filters.completed !== undefined) {
    result = result.filter(task => task.completed === filters.completed);
  }
  
  // 按优先级过滤
  if (filters.priority) {
    result = result.filter(task => task.priority === filters.priority);
  }
  
  // 按截止日期范围过滤
  if (filters.dueBefore) {
    const date = new Date(filters.dueBefore);
    result = result.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < date;
    });
  }
  
  // 按关键词搜索
  if (filters.search) {
    const keyword = filters.search.toLowerCase();
    result = result.filter(task => 
      task.title.toLowerCase().includes(keyword) ||
      (task.notes && task.notes.toLowerCase().includes(keyword))
    );
  }
  
  return result;
}

// 导出到全局
window.TaskModel = {
  TaskPriority,
  TaskPriorityLabels,
  createTask,
  validateTask,
  updateTask,
  toggleTaskCompletion,
  calculateTaskProgress,
  getTaskStats,
  sortTasks,
  filterTasks
};