/**
 * App - 主应用逻辑
 * 处理UI交互、事件管理和数据渲染
 */

(function() {
  'use strict';
  
  // DOM 元素引用
  const elements = {
    // Header
    addPlanBtn: document.getElementById('addPlanBtn'),
    
    // Stats
    totalCount: document.getElementById('totalCount'),
    completedCount: document.getElementById('completedCount'),
    inProgressCount: document.getElementById('inProgressCount'),
    pendingCount: document.getElementById('pendingCount'),
    
    // Filters
    typeFilter: document.getElementById('typeFilter'),
    statusFilter: document.getElementById('statusFilter'),
    sortBy: document.getElementById('sortBy'),
    searchInput: document.getElementById('searchInput'),
    
    // Plan List
    planList: document.getElementById('planList'),
    emptyState: document.getElementById('emptyState'),
    
    // Modal
    planModal: document.getElementById('planModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalClose: document.getElementById('modalClose'),
    planForm: document.getElementById('planForm'),
    cancelBtn: document.getElementById('cancelBtn'),
    
    // Form Fields
    planId: document.getElementById('planId'),
    planTitle: document.getElementById('planTitle'),
    planType: document.getElementById('planType'),
    planStartDate: document.getElementById('planStartDate'),
    planEndDate: document.getElementById('planEndDate'),
    planStatus: document.getElementById('planStatus'),
    planProgress: document.getElementById('planProgress'),
    progressValue: document.getElementById('progressValue'),
    
    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteModalClose: document.getElementById('deleteModalClose'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn')
  };
  
  // 当前状态
  let currentFilters = {
    type: 'all',
    status: 'all',
    search: '',
    sortBy: 'createdAt'
  };
  
  let editingPlanId = null;
  let deletingPlanId = null;
  
  /**
   * 初始化应用
   */
  function init() {
    bindEvents();
    loadAndRender();
  }
  
  /**
   * 绑定事件监听
   */
  function bindEvents() {
    // 添加计划按钮
    elements.addPlanBtn.addEventListener('click', openCreateModal);
    
    // 关闭模态框
    elements.modalClose.addEventListener('click', closeModal);
    elements.cancelBtn.addEventListener('click', closeModal);
    elements.planModal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    
    // 删除确认模态框
    elements.deleteModalClose.addEventListener('click', closeDeleteModal);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.deleteModal.querySelector('.modal-overlay').addEventListener('click', closeDeleteModal);
    elements.confirmDeleteBtn.addEventListener('click', confirmDelete);
    
    // 表单提交
    elements.planForm.addEventListener('submit', handleFormSubmit);
    
    // 进度滑块
    elements.planProgress.addEventListener('input', updateProgressValue);
    
    // 状态改变时自动调整进度
    elements.planStatus.addEventListener('change', handleStatusChange);
    
    // 筛选和排序
    elements.typeFilter.addEventListener('change', handleFilterChange);
    elements.statusFilter.addEventListener('change', handleFilterChange);
    elements.sortBy.addEventListener('change', handleFilterChange);
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // 导出导入功能
    document.getElementById('exportBtn').addEventListener('click', handleExport);
    document.getElementById('importBtn').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', handleImport);
  }
  
  /**
   * 加载数据并渲染
   */
  function loadAndRender() {
    const plans = Storage.getPlans();
    renderStats(plans);
    renderPlans(plans);
  }
  
  /**
   * 渲染统计数据
   */
  function renderStats(plans) {
    const stats = window.PlanModel.calculateStats(plans);
    
    elements.totalCount.textContent = stats.total;
    elements.completedCount.textContent = stats.completed;
    elements.inProgressCount.textContent = stats.inProgress;
    elements.pendingCount.textContent = stats.pending;
  }
  
  /**
   * 渲染计划列表
   */
  function renderPlans(plans) {
    // 应用过滤和排序
    let filteredPlans = window.PlanModel.filterPlans(plans, currentFilters);
    filteredPlans = window.PlanModel.sortPlans(filteredPlans, currentFilters.sortBy);
    
    // 显示空状态或计划列表
    if (filteredPlans.length === 0) {
      elements.planList.style.display = 'none';
      elements.emptyState.style.display = 'block';
    } else {
      elements.planList.style.display = 'flex';
      elements.emptyState.style.display = 'none';
      
      elements.planList.innerHTML = filteredPlans.map(plan => createPlanCard(plan)).join('');
      
      // 绑定卡片内的事件
      bindCardEvents(filteredPlans);
    }
  }
  
  /**
   * 创建计划卡片HTML
   */
  function createPlanCard(plan) {
    const typeLabel = window.PlanModel.PlanTypeLabels[plan.type];
    const statusLabel = window.PlanModel.PlanStatusLabels[plan.status];
    const dateInfo = getDateInfo(plan);
    
    return `
      <div class="plan-card" data-id="${plan.id}">
        <div class="plan-card__header">
          <h3 class="plan-card__title">${escapeHtml(plan.title)}</h3>
          <div>
            <span class="plan-card__type plan-card__type--${plan.type}">${typeLabel}</span>
            <span class="plan-card__status plan-card__status--${plan.status}">${statusLabel}</span>
          </div>
        </div>
        
        ${dateInfo ? `<div class="plan-card__dates">${dateInfo}</div>` : ''}
        
        <div class="plan-card__progress">
          <div class="progress-bar">
            <div class="progress-bar__fill progress-bar__fill--${plan.status}" 
                 style="width: ${plan.progress}%"></div>
          </div>
          <span class="progress-text">进度: ${plan.progress}%</span>
        </div>
        
        <div class="plan-card__actions">
          <button class="btn-edit" data-action="edit" data-id="${plan.id}">编辑</button>
          <button class="btn-delete" data-action="delete" data-id="${plan.id}">删除</button>
        </div>
        
        <!-- 任务列表 -->
        <div class="plan-card__tasks">
          ${window.TaskUI.renderTaskList(plan)}
        </div>
      </div>
    `;
  }
  
  /**
   * 获取日期信息HTML
   */
  function getDateInfo(plan) {
    const parts = [];
    
    if (plan.startDate) {
      parts.push(`开始: ${window.DateUtils.formatDateCN(plan.startDate)}`);
    }
    
    if (plan.endDate) {
      parts.push(`截止: ${window.DateUtils.formatDateCN(plan.endDate)}`);
      const status = window.DateUtils.getDateStatus(plan.endDate);
      if (status) {
        parts.push(`<span class="date-status ${plan.status === 'completed' ? '' : 'date-status--warning'}">${status}</span>`);
      }
    }
    
    return parts.length > 0 ? parts.join(' | ') : '';
  }
  
  /**
   * 绑定卡片内的事件
   */
  function bindCardEvents(plans) {
    // 编辑按钮
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const plan = plans.find(p => p.id === id);
        if (plan) openEditModal(plan);
      });
    });
    
    // 删除按钮
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        openDeleteModal(id);
      });
    });
  }
  
  /**
   * 打开创建模态框
   */
  function openCreateModal() {
    editingPlanId = null;
    elements.modalTitle.textContent = '添加计划';
    elements.planForm.reset();
    elements.planId.value = '';
    elements.planProgress.value = 0;
    elements.progressValue.textContent = '0';
    elements.planModal.classList.add('active');
    elements.planTitle.focus();
  }
  
  /**
   * 打开编辑模态框
   */
  function openEditModal(plan) {
    editingPlanId = plan.id;
    elements.modalTitle.textContent = '编辑计划';
    
    elements.planId.value = plan.id;
    elements.planTitle.value = plan.title;
    elements.planType.value = plan.type;
    elements.planStartDate.value = plan.startDate || '';
    elements.planEndDate.value = plan.endDate || '';
    elements.planStatus.value = plan.status;
    elements.planProgress.value = plan.progress;
    elements.progressValue.textContent = plan.progress;
    
    elements.planModal.classList.add('active');
    elements.planTitle.focus();
  }
  
  /**
   * 关闭模态框
   */
  function closeModal() {
    elements.planModal.classList.remove('active');
    editingPlanId = null;
  }
  
  /**
   * 处理表单提交
   */
  function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
      title: elements.planTitle.value.trim(),
      type: elements.planType.value,
      status: elements.planStatus.value,
      progress: parseInt(elements.planProgress.value, 10),
      startDate: elements.planStartDate.value,
      endDate: elements.planEndDate.value
    };
    
    // 验证
    const plan = window.PlanModel.createPlan({
      ...(editingPlanId ? { id: editingPlanId } : {}),
      ...formData
    });
    
    const validation = window.PlanModel.validatePlan(plan);
    if (!validation.valid) {
      alert(validation.errors.join('\n'));
      return;
    }
    
    // 保存
    let success;
    if (editingPlanId) {
      success = Storage.updatePlan(editingPlanId, formData);
    } else {
      success = Storage.addPlan(plan);
    }
    
    if (success) {
      closeModal();
      loadAndRender();
    } else {
      alert('保存失败，请重试');
    }
  }
  
  /**
   * 更新进度显示值
   */
  function updateProgressValue(e) {
    elements.progressValue.textContent = e.target.value;
  }
  
  /**
   * 状态改变时自动调整进度
   */
  function handleStatusChange(e) {
    const status = e.target.value;
    const defaultProgress = window.PlanModel.getDefaultProgress(status);
    elements.planProgress.value = defaultProgress;
    elements.progressValue.textContent = defaultProgress;
  }
  
  /**
   * 处理筛选变化
   */
  function handleFilterChange() {
    currentFilters.type = elements.typeFilter.value;
    currentFilters.status = elements.statusFilter.value;
    currentFilters.sortBy = elements.sortBy.value;
    
    loadAndRender();
  }
  
  /**
   * 处理搜索
   */
  function handleSearch(e) {
    currentFilters.search = e.target.value.trim();
    loadAndRender();
  }
  
  /**
   * 打开删除确认模态框
   */
  function openDeleteModal(id) {
    deletingPlanId = id;
    elements.deleteModal.classList.add('active');
  }
  
  /**
   * 关闭删除确认模态框
   */
  function closeDeleteModal() {
    elements.deleteModal.classList.remove('active');
    deletingPlanId = null;
  }
  
  /**
   * 确认删除
   */
  function confirmDelete() {
    if (deletingPlanId) {
      Storage.deletePlan(deletingPlanId);
      closeDeleteModal();
      loadAndRender();
    }
  }
  
  /**
   * HTML转义
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * 防抖函数
   */
  function debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
  
  /**
   * 处理数据导出
   */
  function handleExport() {
    try {
      const data = window.Storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `学习计划_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (window.Notification) {
        window.Notification.show('数据导出成功！', 'success');
      }
    } catch (error) {
      if (window.ErrorHandler) {
        window.ErrorHandler.handleError(error, '导出失败');
      } else {
        alert('导出失败：' + error.message);
      }
    }
  }
  
  /**
   * 处理数据导入
   */
  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const success = window.Storage.importData(event.target.result);
        if (success) {
          loadAndRender();
          if (window.Notification) {
            window.Notification.show('数据导入成功！', 'success');
          }
        } else {
          throw new Error('导入失败');
        }
      } catch (error) {
        if (window.ErrorHandler) {
          window.ErrorHandler.handleError(error, '导入失败');
        } else {
          alert('导入失败：' + error.message);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // 重置文件输入
  }
  
  // 启动应用
  document.addEventListener('DOMContentLoaded', init);
})();