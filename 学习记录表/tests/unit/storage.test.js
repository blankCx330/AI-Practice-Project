/**
 * Unit Tests for Storage Module
 */

describe('Storage - 基础操作', (test) => {
  
  test('应该能够保存和读取计划', () => {
    localStorage.clear();
    
    const plans = [
      { id: '1', title: '计划1' },
      { id: '2', title: '计划2' }
    ];

    const saved = window.Storage.savePlans(plans);
    assertTrue(saved, '保存应该成功');

    const loaded = window.Storage.getPlans();
    assertEqual(loaded.length, 2, '应该读取到2个计划');
    assertEqual(loaded[0].title, '计划1', '第一个计划标题应该正确');
  });

  test('空存储应该返回空数组', () => {
    localStorage.clear();
    
    const plans = window.Storage.getPlans();
    assertArrayEqual(plans, [], '空存储应该返回空数组');
  });

  test('应该能够添加新计划', () => {
    localStorage.clear();
    
    const plan = {
      id: 'test-1',
      title: '测试计划',
      type: 'daily',
      status: 'pending',
      progress: 0
    };

    const added = window.Storage.addPlan(plan);
    assertTrue(added, '添加应该成功');

    const plans = window.Storage.getPlans();
    assertEqual(plans.length, 1, '应该有1个计划');
    assertEqual(plans[0].id, 'test-1', 'ID 应该正确');
  });

  test('应该能够通过 ID 获取单个计划', () => {
    localStorage.clear();
    
    window.Storage.addPlan({ id: 'plan-1', title: '计划1' });
    window.Storage.addPlan({ id: 'plan-2', title: '计划2' });

    const plan = window.Storage.getPlanById('plan-1');
    
    assertNotNull(plan, '应该找到计划');
    assertEqual(plan.title, '计划1', '标题应该正确');
  });

  test('查询不存在的 ID 应该返回 null', () => {
    localStorage.clear();
    
    const plan = window.Storage.getPlanById('nonexistent');
    assertEqual(plan, null, '不存在的 ID 应该返回 null');
  });
});

describe('Storage - 更新操作', (test) => {
  
  test('应该能够更新计划', () => {
    localStorage.clear();
    
    window.Storage.addPlan({ id: 'plan-1', title: '原始标题', progress: 0 });

    const updated = window.Storage.updatePlan('plan-1', {
      title: '更新后的标题',
      progress: 50
    });
    
    assertTrue(updated, '更新应该成功');

    const plan = window.Storage.getPlanById('plan-1');
    assertEqual(plan.title, '更新后的标题', '标题应该被更新');
    assertEqual(plan.progress, 50, '进度应该被更新');
    assertNotNull(plan.updatedAt, '应该有更新时间');
  });

  test('更新不存在的计划应该返回 false', () => {
    localStorage.clear();
    
    const updated = window.Storage.updatePlan('nonexistent', { title: '新标题' });
    assertFalse(updated, '更新不存在的计划应该返回 false');
  });
});

describe('Storage - 删除操作', (test) => {
  
  test('应该能够删除计划', () => {
    localStorage.clear();
    
    window.Storage.addPlan({ id: 'plan-1', title: '计划1' });
    window.Storage.addPlan({ id: 'plan-2', title: '计划2' });

    const deleted = window.Storage.deletePlan('plan-1');
    assertTrue(deleted, '删除应该成功');

    const plans = window.Storage.getPlans();
    assertEqual(plans.length, 1, '应该剩余1个计划');
    assertEqual(plans[0].id, 'plan-2', '剩余的应该是 plan-2');
  });

  test('删除不存在的计划应该返回 false', () => {
    localStorage.clear();
    
    const deleted = window.Storage.deletePlan('nonexistent');
    assertFalse(deleted, '删除不存在的计划应该返回 false');
  });

  test('应该能够清空所有计划', () => {
    localStorage.clear();
    
    window.Storage.addPlan({ id: '1', title: '计划1' });
    window.Storage.addPlan({ id: '2', title: '计划2' });

    const cleared = window.Storage.clearAll();
    assertTrue(cleared, '清空应该成功');

    const plans = window.Storage.getPlans();
    assertArrayEqual(plans, [], '清空后应该没有计划');
  });
});

describe('Storage - 导入导出', (test) => {
  
  test('应该能够导出数据为 JSON', () => {
    localStorage.clear();
    
    window.Storage.addPlan({ id: '1', title: '计划1' });
    window.Storage.addPlan({ id: '2', title: '计划2' });

    const exported = window.Storage.exportData();
    
    assertNotNull(exported, '应该导出数据');
    
    const parsed = JSON.parse(exported);
    assertEqual(parsed.length, 2, '应该导出2个计划');
  });

  test('应该能够导入 JSON 数据', () => {
    localStorage.clear();
    
    const jsonData = JSON.stringify([
      { id: '1', title: '导入计划1' },
      { id: '2', title: '导入计划2' }
    ]);

    const imported = window.Storage.importData(jsonData);
    assertTrue(imported, '导入应该成功');

    const plans = window.Storage.getPlans();
    assertEqual(plans.length, 2, '应该导入2个计划');
    assertEqual(plans[0].title, '导入计划1', '第一个计划标题应该正确');
  });

  test('导入无效 JSON 应该失败', () => {
    localStorage.clear();
    
    const imported = window.Storage.importData('invalid json');
    assertFalse(imported, '导入无效 JSON 应该失败');
  });

  test('导入非数组数据应该失败', () => {
    localStorage.clear();
    
    const imported = window.Storage.importData('{"key": "value"}');
    assertFalse(imported, '导入非数组数据应该失败');
  });
});

describe('Storage - 错误处理', (test) => {
  
  test('应该处理损坏的存储数据', () => {
    localStorage.clear();
    localStorage.setItem('learning_plans', 'invalid json data');
    
    const plans = window.Storage.getPlans();
    assertArrayEqual(plans, [], '损坏的数据应该返回空数组');
  });

  test('应该处理非数组的存储数据', () => {
    localStorage.clear();
    localStorage.setItem('learning_plans', '{"not": "an array"}');
    
    const plans = window.Storage.getPlans();
    assertArrayEqual(plans, [], '非数组数据应该返回空数组');
  });
});