/**
 * Unit Tests for Task Model
 */

describe('Task Model - 创建和验证', (test) => {
  
  test('应该成功创建一个有效的任务对象', () => {
    const taskData = {
      planId: 'plan-123',
      title: '完成第一章阅读',
      priority: 'high',
      dueDate: '2025-03-10',
      notes: '重点学习前两节'
    };

    const task = window.TaskModel.createTask(taskData);

    assertNotNull(task.id, '任务应该有 ID');
    assertEqual(task.planId, 'plan-123', 'planId 应该正确');
    assertEqual(task.title, '完成第一章阅读', '标题应该正确');
    assertEqual(task.priority, 'high', '优先级应该正确');
    assertEqual(task.dueDate, '2025-03-10', '截止日期应该正确');
    assertNotNull(task.createdAt, '应该有创建时间');
    assertNotNull(task.updatedAt, '应该有更新时间');
  });

  test('创建任务时应该使用默认值', () => {
    const task = window.TaskModel.createTask({ 
      planId: 'plan-1',
      title: '测试任务' 
    });

    assertEqual(task.completed, false, '默认应该未完成');
    assertEqual(task.priority, 'medium', '默认优先级应该是 medium');
  });

  test('应该正确验证有效的任务', () => {
    const task = window.TaskModel.createTask({
      planId: 'plan-1',
      title: '有效任务',
      priority: 'low'
    });

    const validation = window.TaskModel.validateTask(task);
    assertTrue(validation.valid, '有效任务应该通过验证');
    assertArrayEqual(validation.errors, [], '不应该有错误');
  });

  test('应该拒绝空标题', () => {
    const task = window.TaskModel.createTask({
      planId: 'plan-1',
      title: ''
    });
    const validation = window.TaskModel.validateTask(task);
    
    assertFalse(validation.valid, '空标题应该验证失败');
    assertTrue(validation.errors.length > 0, '应该有错误消息');
  });

  test('应该拒绝缺少 planId 的任务', () => {
    const task = window.TaskModel.createTask({
      title: '没有计划的 task'
    });
    const validation = window.TaskModel.validateTask(task);
    
    assertFalse(validation.valid, '缺少 planId 应该验证失败');
  });

  test('应该拒绝无效的优先级', () => {
    const task = window.TaskModel.createTask({
      planId: 'plan-1',
      title: '测试',
      priority: 'invalid'
    });
    const validation = window.TaskModel.validateTask(task);
    
    assertFalse(validation.valid, '无效优先级应该验证失败');
  });
});

describe('Task Model - 更新功能', (test) => {
  
  test('应该正确更新任务', () => {
    const original = window.TaskModel.createTask({
      planId: 'plan-1',
      title: '原始标题',
      completed: false
    });

    const updated = window.TaskModel.updateTask(original, {
      title: '更新后的标题',
      completed: true
    });

    assertEqual(updated.title, '更新后的标题', '标题应该被更新');
    assertEqual(updated.completed, true, '完成状态应该被更新');
    assertNotNull(updated.updatedAt, '应该有新的更新时间');
    assertEqual(updated.id, original.id, 'ID 应该保持不变');
  });

  test('应该正确切换完成状态', () => {
    const task = window.TaskModel.createTask({
      planId: 'plan-1',
      title: '测试任务',
      completed: false
    });

    const toggled = window.TaskModel.toggleTaskCompletion(task);
    assertEqual(toggled.completed, true, '应该切换为已完成');

    const toggledAgain = window.TaskModel.toggleTaskCompletion(toggled);
    assertEqual(toggledAgain.completed, false, '应该切换为未完成');
  });
});

describe('Task Model - 进度计算', (test) => {
  
  test('空任务列表进度应该是 0', () => {
    const progress = window.TaskModel.calculateTaskProgress([]);
    assertEqual(progress, 0, '空任务列表进度应该是 0');
  });

  test('应该正确计算进度', () => {
    const tasks = [
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务1', completed: true }),
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务2', completed: true }),
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务3', completed: false }),
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务4', completed: false })
    ];

    const progress = window.TaskModel.calculateTaskProgress(tasks);
    assertEqual(progress, 50, '进度应该是 50%');
  });

  test('全部完成的进度应该是 100', () => {
    const tasks = [
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务1', completed: true }),
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务2', completed: true })
    ];

    const progress = window.TaskModel.calculateTaskProgress(tasks);
    assertEqual(progress, 100, '进度应该是 100%');
  });
});

describe('Task Model - 统计功能', (test) => {
  
  test('应该正确计算任务统计', () => {
    const tasks = [
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务1', completed: true, priority: 'high' }),
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务2', completed: false, priority: 'high' }),
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务3', completed: false }),
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务4', completed: false })
    ];

    const stats = window.TaskModel.getTaskStats(tasks);

    assertEqual(stats.total, 4, '总数应该是4');
    assertEqual(stats.completed, 1, '已完成应该是1');
    assertEqual(stats.pending, 3, '待完成应该是3');
    assertEqual(stats.progress, 25, '进度应该是25%');
    assertEqual(stats.highPriority, 1, '高优先级应该是1');
  });
});

describe('Task Model - 排序功能', (test) => {
  
  test('应该按优先级排序', () => {
    const tasks = [
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务1', priority: 'low' }),
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务2', priority: 'high' }),
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务3', priority: 'medium' })
    ];

    const sorted = window.TaskModel.sortTasks(tasks, 'priority', 'desc');
    
    assertEqual(sorted[0].priority, 'high', '高优先级应该在最前面');
    assertEqual(sorted[2].priority, 'low', '低优先级应该在最后面');
  });

  test('应该按完成状态排序', () => {
    const tasks = [
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务1', completed: true }),
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务2', completed: false }),
      window.TaskModel.createTask({ planId: 'plan-1', title: '任务3', completed: true })
    ];

    const sorted = window.TaskModel.sortTasks(tasks, 'completed', 'asc');
    
    assertFalse(sorted[0].completed, '未完成任务应该在最前面');
    assertTrue(sorted[2].completed, '已完成任务应该在最后面');
  });
});