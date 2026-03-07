/**
 * Integration Tests for Core User Flows
 * Tests end-to-end functionality including UI interactions
 */

describe('集成测试 - 创建计划流程', (test) => {
  
  test('用户应该能够成功创建一个新计划', () => {
    localStorage.clear();
    
    // 1. 用户填写表单
    const formData = {
      title: '学习 React Hooks',
      type: 'daily',
      status: 'pending',
      progress: 0,
      startDate: '2025-03-06',
      endDate: '2025-03-06'
    };

    // 2. 验证数据
    const plan = window.PlanModel.createPlan(formData);
    const validation = window.PlanModel.validatePlan(plan);
    assertTrue(validation.valid, '表单数据应该有效');

    // 3. 保存到存储
    const saved = window.Storage.addPlan(plan);
    assertTrue(saved, '保存应该成功');

    // 4. 验证保存结果
    const plans = window.Storage.getPlans();
    assertEqual(plans.length, 1, '应该有1个计划');
    assertEqual(plans[0].title, '学习 React Hooks', '标题应该正确');
    assertEqual(plans[0].type, 'daily', '类型应该正确');
  });

  test('用户创建计划时验证失败应该被阻止', () => {
    localStorage.clear();
    
    // 用户填写无效表单
    const formData = {
      title: '', // 空标题
      type: 'invalid_type', // 无效类型
      progress: 150 // 超出范围
    };

    const plan = window.PlanModel.createPlan(formData);
    const validation = window.PlanModel.validatePlan(plan);
    
    assertFalse(validation.valid, '无效数据应该验证失败');
    assertTrue(validation.errors.length > 0, '应该有错误消息');
    
    // 不应该保存到存储
    const plans = window.Storage.getPlans();
    assertArrayEqual(plans, [], '不应该保存无效计划');
  });
});

describe('集成测试 - 编辑计划流程', (test) => {
  
  test('用户应该能够成功编辑计划', () => {
    localStorage.clear();
    
    // 1. 创建初始计划
    const plan = window.PlanModel.createPlan({
      title: '原始标题',
      type: 'daily',
      status: 'pending',
      progress: 0
    });
    window.Storage.addPlan(plan);

    // 2. 用户编辑计划
    const updates = {
      title: '更新后的标题',
      status: 'in_progress',
      progress: 50
    };

    const updated = window.Storage.updatePlan(plan.id, updates);
    assertTrue(updated, '更新应该成功');

    // 3. 验证更新结果
    const savedPlan = window.Storage.getPlanById(plan.id);
    assertEqual(savedPlan.title, '更新后的标题', '标题应该被更新');
    assertEqual(savedPlan.status, 'in_progress', '状态应该被更新');
    assertEqual(savedPlan.progress, 50, '进度应该被更新');
    assertNotNull(savedPlan.updatedAt, '应该有更新时间');
  });
});

describe('集成测试 - 删除计划流程', (test) => {
  
  test('用户应该能够成功删除计划', () => {
    localStorage.clear();
    
    // 1. 创建计划
    const plan1 = window.PlanModel.createPlan({ title: '计划1' });
    const plan2 = window.PlanModel.createPlan({ title: '计划2' });
    window.Storage.addPlan(plan1);
    window.Storage.addPlan(plan2);

    // 2. 删除一个计划
    const deleted = window.Storage.deletePlan(plan1.id);
    assertTrue(deleted, '删除应该成功');

    // 3. 验证删除结果
    const plans = window.Storage.getPlans();
    assertEqual(plans.length, 1, '应该剩余1个计划');
    assertEqual(plans[0].id, plan2.id, '剩余的应该是 plan2');
    
    const deletedPlan = window.Storage.getPlanById(plan1.id);
    assertEqual(deletedPlan, null, '删除的计划不应该存在');
  });
});

describe('集成测试 - 筛选和搜索', (test) => {
  
  test('用户应该能够按类型筛选计划', () => {
    localStorage.clear();
    
    // 创建不同类型的计划
    window.Storage.addPlan(window.PlanModel.createPlan({ title: '计划1', type: 'daily' }));
    window.Storage.addPlan(window.PlanModel.createPlan({ title: '计划2', type: 'weekly' }));
    window.Storage.addPlan(window.PlanModel.createPlan({ title: '计划3', type: 'daily' }));

    // 筛选 daily 计划
    const plans = window.Storage.getPlans();
    const filtered = window.PlanModel.filterPlans(plans, { type: 'daily' });
    
    assertEqual(filtered.length, 2, '应该筛选出2个 daily 计划');
    assertTrue(filtered.every(p => p.type === 'daily'), '所有结果应该是 daily 类型');
  });

  test('用户应该能够搜索计划', () => {
    localStorage.clear();
    
    window.Storage.addPlan(window.PlanModel.createPlan({ title: '学习 React' }));
    window.Storage.addPlan(window.PlanModel.createPlan({ title: '学习 Vue' }));
    window.Storage.addPlan(window.PlanModel.createPlan({ title: 'React 高级教程' }));

    const plans = window.Storage.getPlans();
    const filtered = window.PlanModel.filterPlans(plans, { search: 'react' });
    
    assertEqual(filtered.length, 2, '应该找到2个包含 react 的计划');
  });

  test('用户应该能够组合筛选条件', () => {
    localStorage.clear();
    
    window.Storage.addPlan(window.PlanModel.createPlan({ 
      title: '学习 React', 
      type: 'daily', 
      status: 'pending' 
    }));
    window.Storage.addPlan(window.PlanModel.createPlan({ 
      title: '学习 React Hooks', 
      type: 'weekly', 
      status: 'pending' 
    }));
    window.Storage.addPlan(window.PlanModel.createPlan({ 
      title: '复习 React', 
      type: 'daily', 
      status: 'completed' 
    }));

    const plans = window.Storage.getPlans();
    const filtered = window.PlanModel.filterPlans(plans, {
      type: 'daily',
      status: 'pending',
      search: 'react'
    });
    
    assertEqual(filtered.length, 1, '应该筛选出1个符合条件的计划');
    assertEqual(filtered[0].title, '学习 React', '标题应该正确');
  });
});

describe('集成测试 - 排序功能', (test) => {
  
  test('用户应该能够按创建时间排序', () => {
    localStorage.clear();
    
    const plan1 = window.PlanModel.createPlan({ 
      title: '计划1', 
      createdAt: '2025-03-06T08:00:00Z' 
    });
    const plan2 = window.PlanModel.createPlan({ 
      title: '计划2', 
      createdAt: '2025-03-06T12:00:00Z' 
    });
    const plan3 = window.PlanModel.createPlan({ 
      title: '计划3', 
      createdAt: '2025-03-06T10:00:00Z' 
    });
    
    window.Storage.addPlan(plan1);
    window.Storage.addPlan(plan2);
    window.Storage.addPlan(plan3);

    const plans = window.Storage.getPlans();
    const sorted = window.PlanModel.sortPlans(plans, 'createdAt', 'desc');
    
    assertEqual(sorted[0].title, '计划2', '最新计划应该在最前面');
    assertEqual(sorted[2].title, '计划1', '最旧计划应该在最后面');
  });

  test('用户应该能够按进度排序', () => {
    localStorage.clear();
    
    window.Storage.addPlan(window.PlanModel.createPlan({ title: '计划1', progress: 30 }));
    window.Storage.addPlan(window.PlanModel.createPlan({ title: '计划2', progress: 80 }));
    window.Storage.addPlan(window.PlanModel.createPlan({ title: '计划3', progress: 50 }));

    const plans = window.Storage.getPlans();
    const sorted = window.PlanModel.sortPlans(plans, 'progress', 'desc');
    
    assertEqual(sorted[0].progress, 80, '最高进度应该在最前面');
    assertEqual(sorted[2].progress, 30, '最低进度应该在最后面');
  });
});

describe('集成测试 - 统计数据', (test) => {
  
  test('统计数据应该实时更新', () => {
    localStorage.clear();
    
    // 初始统计
    let stats = window.PlanModel.calculateStats(window.Storage.getPlans());
    assertEqual(stats.total, 0, '初始应该没有计划');

    // 添加计划
    window.Storage.addPlan(window.PlanModel.createPlan({ status: 'completed' }));
    window.Storage.addPlan(window.PlanModel.createPlan({ status: 'completed' }));
    window.Storage.addPlan(window.PlanModel.createPlan({ status: 'in_progress' }));
    window.Storage.addPlan(window.PlanModel.createPlan({ status: 'pending' }));

    stats = window.PlanModel.calculateStats(window.Storage.getPlans());
    assertEqual(stats.total, 4, '总数应该是4');
    assertEqual(stats.completed, 2, '已完成应该是2');
    assertEqual(stats.inProgress, 1, '进行中应该是1');
    assertEqual(stats.pending, 1, '未开始应该是1');

    // 删除一个计划
    const plans = window.Storage.getPlans();
    window.Storage.deletePlan(plans[0].id);

    stats = window.PlanModel.calculateStats(window.Storage.getPlans());
    assertEqual(stats.total, 3, '删除后总数应该是3');
  });
});

describe('集成测试 - 数据持久化', (test) => {
  
  test('数据应该在页面刷新后保持', () => {
    localStorage.clear();
    
    // 创建并保存计划
    const plan = window.PlanModel.createPlan({
      title: '持久化测试',
      type: 'daily',
      status: 'in_progress',
      progress: 75
    });
    window.Storage.addPlan(plan);

    // 模拟页面刷新：重新从 localStorage 读取
    const plans = window.Storage.getPlans();
    
    assertEqual(plans.length, 1, '应该有1个计划');
    assertEqual(plans[0].title, '持久化测试', '标题应该保持');
    assertEqual(plans[0].progress, 75, '进度应该保持');
    assertEqual(plans[0].status, 'in_progress', '状态应该保持');
  });

  test('数据导出导入应该完整', () => {
    localStorage.clear();
    
    // 创建多个计划
    window.Storage.addPlan(window.PlanModel.createPlan({ title: '计划1', progress: 30 }));
    window.Storage.addPlan(window.PlanModel.createPlan({ title: '计划2', progress: 60 }));
    window.Storage.addPlan(window.PlanModel.createPlan({ title: '计划3', progress: 90 }));

    // 导出数据
    const exported = window.Storage.exportData();
    assertNotNull(exported, '应该导出数据');

    // 清空数据
    window.Storage.clearAll();
    assertEqual(window.Storage.getPlans().length, 0, '清空后应该没有数据');

    // 导入数据
    const imported = window.Storage.importData(exported);
    assertTrue(imported, '导入应该成功');

    // 验证数据完整性
    const plans = window.Storage.getPlans();
    assertEqual(plans.length, 3, '应该恢复3个计划');
    assertEqual(plans[0].title, '计划1', '第一个计划标题应该正确');
    assertEqual(plans[0].progress, 30, '第一个计划进度应该正确');
  });
});