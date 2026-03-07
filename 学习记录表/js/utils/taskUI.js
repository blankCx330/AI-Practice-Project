/**
 * Task UI Handler - 任务UI处理模块
 * 负责任务的渲染、交互和状态管理
 */

const TaskUI = {
  /**
   * 渲染任务列表HTML
   * @param {Object} plan - 计划对象
   * @returns {string} 任务列表HTML
   */
  renderTaskList(plan) {
    const tasks = plan.tasks || [];
    const stats = window.TaskModel.getTaskStats(tasks);
    
    if (tasks.length === 0) {
      return `
        <div class="task-empty">
          <p class="task-empty-text">暂无任务</p>
          <button class="btn btn-sm btn-secondary" onclick="TaskUI.showAddTaskForm('${plan.id}')">
            + 添加任务
          </button>
        </div>
      `;
    }
    
    const taskItems = tasks.map(task => this.renderTaskItem(task, plan.id)).join('');
    
    return `
      <div class="task-list">
        <div class="task-header">
          <span class="task-count">${stats.completed}/${stats.total} 完成</span>
          <button class="btn btn-sm btn-secondary" onclick="TaskUI.showAddTaskForm('${plan.id}')">
            + 添加任务
          </button>
        </div>
        <div class="task-items">
          ${taskItems}
        </div>
      </div>
    `;
  },
  
  /**
   * 渲染单个任务项
   * @param {Object} task - 任务对象
   * @param {string} planId - 所属计划ID
   * @returns {string} 任务项HTML
   */
  renderTaskItem(task, planId) {
    const completedClass = task.completed ? 'task-item--completed' : '';
    const checkboxIcon = task.completed ? '☑' : '☐';
    const priorityClass = `task-item--${task.priority}`;
    
    const dueDateHtml = task.dueDate ? 
      `<span class="task-due-date">${window.DateUtils.formatDateCN(task.dueDate)}</span>` : '';
    
    return `
      <div class="task-item ${completedClass} ${priorityClass}" data-task-id="${task.id}">
        <button class="task-checkbox" onclick="TaskUI.toggleTask('${planId}', '${task.id}')">
          ${checkboxIcon}
        </button>
        <div class="task-content">
          <span class="task-title">${escapeHtml(task.title)}</span>
          ${dueDateHtml}
        </div>
        <div class="task-actions">
          <button class="btn btn-sm btn-edit" onclick="TaskUI.showEditTaskForm('${planId}', '${task.id}')">
            编辑
          </button>
          <button class="btn btn-sm btn-delete" onclick="TaskUI.deleteTask('${planId}', '${task.id}')">
            删除
          </button>
        </div>
      </div>
    `;
  },
  
  /**
   * 切换任务完成状态
   * @param {string} planId - 计划ID
   * @param {string} taskId - 任务ID
   */
  toggleTask(planId, taskId) {
    const success = window.Storage.toggleTask(planId, taskId);
    if (success) {
      // 刷新UI
      if (window.App && window.App.loadAndRender) {
        window.App.loadAndRender();
      }
    }
  },
  
  /**
   * 显示添加任务表单
   * @param {string} planId - 计划ID
   */
  showAddTaskForm(planId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'taskModal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="TaskUI.closeTaskModal()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">添加任务</h2>
          <button class="modal-close" onclick="TaskUI.closeTaskModal()">&times;</button>
        </div>
        <form id="taskForm" onsubmit="TaskUI.handleAddTask(event, '${planId}')">
          <div class="form-group">
            <label class="form-label">任务标题 *</label>
            <input type="text" id="taskTitle" class="input" required placeholder="例如：完成第一章阅读">
          </div>
          <div class="form-group">
            <label class="form-label">优先级</label>
            <select id="taskPriority" class="select">
              <option value="high">高优先级</option>
              <option value="medium" selected>中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">截止日期</label>
            <input type="date" id="taskDueDate" class="input">
          </div>
          <div class="form-group">
            <label class="form-label">备注</label>
            <textarea id="taskNotes" class="input" rows="2" placeholder="可选"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="TaskUI.closeTaskModal()">取消</button>
            <button type="submit" class="btn btn-primary">添加</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('taskTitle').focus();
  },
  
  /**
   * 处理添加任务
   * @param {Event} e - 表单提交事件
   * @param {string} planId - 计划ID
   */
  handleAddTask(e, planId) {
    e.preventDefault();
    
    const taskData = {
      planId: planId,
      title: document.getElementById('taskTitle').value.trim(),
      priority: document.getElementById('taskPriority').value,
      dueDate: document.getElementById('taskDueDate').value,
      notes: document.getElementById('taskNotes').value.trim()
    };
    
    // 创建任务对象
    const task = window.TaskModel.createTask(taskData);
    const validation = window.TaskModel.validateTask(task);
    
    if (!validation.valid) {
      alert(validation.errors.join('\n'));
      return;
    }
    
    // 保存任务
    const success = window.Storage.addTask(planId, task);
    
    if (success) {
      this.closeTaskModal();
      if (window.App && window.App.loadAndRender) {
        window.App.loadAndRender();
      }
    } else {
      alert('添加任务失败');
    }
  },
  
  /**
   * 显示编辑任务表单
   * @param {string} planId - 计划ID
   * @param {string} taskId - 任务ID
   */
  showEditTaskForm(planId, taskId) {
    const plan = window.Storage.getPlanById(planId);
    if (!plan) return;
    
    const task = plan.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'taskModal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="TaskUI.closeTaskModal()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">编辑任务</h2>
          <button class="modal-close" onclick="TaskUI.closeTaskModal()">&times;</button>
        </div>
        <form id="taskForm" onsubmit="TaskUI.handleEditTask(event, '${planId}', '${taskId}')">
          <div class="form-group">
            <label class="form-label">任务标题 *</label>
            <input type="text" id="taskTitle" class="input" required value="${escapeHtml(task.title)}">
          </div>
          <div class="form-group">
            <label class="form-label">优先级</label>
            <select id="taskPriority" class="select">
              <option value="high" ${task.priority === 'high' ? 'selected' : ''}>高优先级</option>
              <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>中优先级</option>
              <option value="low" ${task.priority === 'low' ? 'selected' : ''}>低优先级</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">截止日期</label>
            <input type="date" id="taskDueDate" class="input" value="${task.dueDate || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">备注</label>
            <textarea id="taskNotes" class="input" rows="2">${task.notes || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" id="taskCompleted" ${task.completed ? 'checked' : ''}>
              已完成
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="TaskUI.closeTaskModal()">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('taskTitle').focus();
  },
  
  /**
   * 处理编辑任务
   * @param {Event} e - 表单提交事件
   * @param {string} planId - 计划ID
   * @param {string} taskId - 任务ID
   */
  handleEditTask(e, planId, taskId) {
    e.preventDefault();
    
    const updates = {
      title: document.getElementById('taskTitle').value.trim(),
      priority: document.getElementById('taskPriority').value,
      dueDate: document.getElementById('taskDueDate').value,
      notes: document.getElementById('taskNotes').value.trim(),
      completed: document.getElementById('taskCompleted').checked
    };
    
    const success = window.Storage.updateTask(planId, taskId, updates);
    
    if (success) {
      this.closeTaskModal();
      if (window.App && window.App.loadAndRender) {
        window.App.loadAndRender();
      }
    } else {
      alert('更新任务失败');
    }
  },
  
  /**
   * 删除任务
   * @param {string} planId - 计划ID
   * @param {string} taskId - 任务ID
   */
  deleteTask(planId, taskId) {
    if (!confirm('确定要删除这个任务吗？')) {
      return;
    }
    
    const success = window.Storage.deleteTask(planId, taskId);
    
    if (success) {
      if (window.App && window.App.loadAndRender) {
        window.App.loadAndRender();
      }
    } else {
      alert('删除任务失败');
    }
  },
  
  /**
   * 关闭任务模态框
   */
  closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
      modal.remove();
    }
  }
};

/**
 * HTML转义
 * @param {string} text - 要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 导出到全局
window.TaskUI = TaskUI;