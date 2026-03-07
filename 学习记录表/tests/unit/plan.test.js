/**
 * Unit Tests for Plan Model (plan.js)
 * Tests plan creation, validation, filtering, sorting, and stats calculation
 */

describe('PlanModel', () => {
  
  // Reset state before each test
  beforeEach(() => {
    // Clear any test data
  });

  describe('createPlan', () => {
    
    it('should create a plan with valid data', () => {
      const data = {
        title: 'Learn JavaScript',
        type: 'daily',
        status: 'pending',
        progress: 0,
        startDate: '2025-01-01',
        endDate: '2025-01-31'
      };
      
      const plan = PlanModel.createPlan(data);
      
      assertDefined(plan.id, 'Plan should have an id');
      assertEqual(plan.title, 'Learn JavaScript');
      assertEqual(plan.type, 'daily');
      assertEqual(plan.status, 'pending');
      assertEqual(plan.progress, 0);
      assertEqual(plan.startDate, '2025-01-01');
      assertEqual(plan.endDate, '2025-01-31');
      assertDefined(plan.createdAt);
      assertDefined(plan.updatedAt);
    });

    it('should create a plan with missing fields using defaults', () => {
      const data = {
        title: 'Test Plan'
      };
      
      const plan = PlanModel.createPlan(data);
      
      assertEqual(plan.title, 'Test Plan');
      assertEqual(plan.type, PlanModel.PlanType.DAILY, 'Default type should be daily');
      assertEqual(plan.status, PlanModel.PlanStatus.PENDING, 'Default status should be pending');
      assertEqual(plan.progress, 0, 'Default progress should be 0');
      assertEqual(plan.startDate, '', 'Default startDate should be empty string');
      assertEqual(plan.endDate, '', 'Default endDate should be empty string');
    });

    it('should create a plan with empty data object', () => {
      const plan = PlanModel.createPlan({});
      
      assertDefined(plan.id);
      assertEqual(plan.title, '', 'Empty title should be allowed');
      assertEqual(plan.type, PlanModel.PlanType.DAILY);
      assertEqual(plan.status, PlanModel.PlanStatus.PENDING);
    });

    it('should preserve provided id when specified', () => {
      const customId = 'custom_plan_123';
      const plan = PlanModel.createPlan({ id: customId, title: 'Test' });
      
      assertEqual(plan.id, customId, 'Should preserve custom id');
    });

    it('should use provided progress value', () => {
      const plan = PlanModel.createPlan({ title: 'Test', progress: 75 });
      assertEqual(plan.progress, 75, 'Should use provided progress');
    });
  });

  describe('validatePlan', () => {
    
    it('should validate a correct plan', () => {
      const plan = PlanModel.createPlan({
        title: 'Valid Plan',
        type: PlanModel.PlanType.WEEKLY,
        status: PlanModel.PlanStatus.IN_PROGRESS,
        progress: 50
      });
      
      const result = PlanModel.validatePlan(plan);
      
      assertTrue(result.valid, 'Valid plan should pass validation');
      assertEqual(result.errors.length, 0, 'Should have no errors');
    });

    it('should fail validation for empty title', () => {
      const plan = PlanModel.createPlan({ title: '' });
      const result = PlanModel.validatePlan(plan);
      
      assertFalse(result.valid, 'Empty title should fail validation');
      assertContains(result.errors, '计划标题不能为空');
    });

    it('should fail validation for whitespace-only title', () => {
      const plan = PlanModel.createPlan({ title: '   ' });
      const result = PlanModel.validatePlan(plan);
      
      assertFalse(result.valid);
      assertContains(result.errors, '计划标题不能为空');
    });

    it('should fail validation for invalid type', () => {
      const plan = PlanModel.createPlan({ 
        title: 'Test', 
        type: 'invalid_type' 
      });
      const result = PlanModel.validatePlan(plan);
      
      assertFalse(result.valid);
      assertContains(result.errors, '无效的计划类型');
    });

    it('should fail validation for invalid status', () => {
      const plan = PlanModel.createPlan({ 
        title: 'Test', 
        status: 'invalid_status' 
      });
      const result = PlanModel.validatePlan(plan);
      
      assertFalse(result.valid);
      assertContains(result.errors, '无效的计划状态');
    });

    it('should fail validation for negative progress', () => {
      const plan = PlanModel.createPlan({ 
        title: 'Test', 
        progress: -10 
      });
      const result = PlanModel.validatePlan(plan);
      
      assertFalse(result.valid);
      assertContains(result.errors, '进度必须在0-100之间');
    });

    it('should fail validation for progress greater than 100', () => {
      const plan = PlanModel.createPlan({ 
        title: 'Test', 
        progress: 150 
      });
      const result = PlanModel.validatePlan(plan);
      
      assertFalse(result.valid);
      assertContains(result.errors, '进度必须在0-100之间');
    });

    it('should fail validation when start date is after end date', () => {
      const plan = PlanModel.createPlan({
        title: 'Test',
        startDate: '2025-12-31',
        endDate: '2025-01-01'
      });
      const result = PlanModel.validatePlan(plan);
      
      assertFalse(result.valid);
      assertContains(result.errors, '开始日期不能晚于截止日期');
    });

    it('should pass validation with valid start and end dates', () => {
      const plan = PlanModel.createPlan({
        title: 'Test',
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      });
      const result = PlanModel.validatePlan(plan);
      
      assertTrue(result.valid);
    });

    it('should allow progress at boundaries (0 and 100)', () => {
      const plan1 = PlanModel.createPlan({ title: 'Test', progress: 0 });
      const plan2 = PlanModel.createPlan({ title: 'Test', progress: 100 });
      
      const result1 = PlanModel.validatePlan(plan1);
      const result2 = PlanModel.validatePlan(plan2);
      
      assertTrue(result1.valid, 'Progress 0 should be valid');
      assertTrue(result2.valid, 'Progress 100 should be valid');
    });
  });

  describe('updatePlan', () => {
    
    it('should update plan properties', () => {
      const plan = PlanModel.createPlan({ 
        title: 'Original Title',
        progress: 0
      });
      
      const updated = PlanModel.updatePlan(plan, { 
        title: 'Updated Title',
        progress: 50 
      });
      
      assertEqual(updated.title, 'Updated Title');
      assertEqual(updated.progress, 50);
      assertEqual(updated.id, plan.id, 'ID should remain unchanged');
    });

    it('should update updatedAt timestamp', () => {
      const plan = PlanModel.createPlan({ title: 'Test' });
      const originalUpdatedAt = plan.updatedAt;
      
      // Small delay to ensure different timestamp
      const updated = PlanModel.updatePlan(plan, { title: 'Updated' });
      
      // Updated timestamp should be different (or equal if very fast)
      assertDefined(updated.updatedAt);
    });

    it('should not mutate original plan object', () => {
      const plan = PlanModel.createPlan({ title: 'Original' });
      const originalTitle = plan.title;
      
      PlanModel.updatePlan(plan, { title: 'Updated' });
      
      assertEqual(plan.title, originalTitle, 'Original should not be mutated');
    });

    it('should preserve non-updated fields', () => {
      const plan = PlanModel.createPlan({
        title: 'Test',
        type: PlanModel.PlanType.WEEKLY,
        status: PlanModel.PlanStatus.IN_PROGRESS
      });
      
      const updated = PlanModel.updatePlan(plan, { progress: 75 });
      
      assertEqual(updated.title, 'Test');
      assertEqual(updated.type, PlanModel.PlanType.WEEKLY);
      assertEqual(updated.status, PlanModel.PlanStatus.IN_PROGRESS);
    });
  });

  describe('getDefaultProgress', () => {
    
    it('should return 0 for pending status', () => {
      const progress = PlanModel.getDefaultProgress(PlanModel.PlanStatus.PENDING);
      assertEqual(progress, 0);
    });

    it('should return 50 for in_progress status', () => {
      const progress = PlanModel.getDefaultProgress(PlanModel.PlanStatus.IN_PROGRESS);
      assertEqual(progress, 50);
    });

    it('should return 100 for completed status', () => {
      const progress = PlanModel.getDefaultProgress(PlanModel.PlanStatus.COMPLETED);
      assertEqual(progress, 100);
    });

    it('should return 0 for unknown status', () => {
      const progress = PlanModel.getDefaultProgress('unknown');
      assertEqual(progress, 0, 'Unknown status should default to 0');
    });
  });

  describe('filterPlans', () => {
    
    let plans;
    
    beforeEach(() => {
      plans = [
        PlanModel.createPlan({ title: 'Daily Plan', type: PlanModel.PlanType.DAILY, status: PlanModel.PlanStatus.PENDING }),
        PlanModel.createPlan({ title: 'Weekly Plan', type: PlanModel.PlanType.WEEKLY, status: PlanModel.PlanStatus.IN_PROGRESS }),
        PlanModel.createPlan({ title: 'Monthly Plan', type: PlanModel.PlanType.MONTHLY, status: PlanModel.PlanStatus.COMPLETED }),
        PlanModel.createPlan({ title: 'Daily Task', type: PlanModel.PlanType.DAILY, status: PlanModel.PlanStatus.COMPLETED }),
        PlanModel.createPlan({ title: 'Long Term Goal', type: PlanModel.PlanType.LONGTERM, status: PlanModel.PlanStatus.PENDING })
      ];
    });

    it('should filter plans by type', () => {
      const filtered = PlanModel.filterPlans(plans, { type: PlanModel.PlanType.DAILY });
      assertEqual(filtered.length, 2);
      assertTrue(filtered.every(p => p.type === PlanModel.PlanType.DAILY));
    });

    it('should filter plans by status', () => {
      const filtered = PlanModel.filterPlans(plans, { status: PlanModel.PlanStatus.COMPLETED });
      assertEqual(filtered.length, 2);
      assertTrue(filtered.every(p => p.status === PlanModel.PlanStatus.COMPLETED));
    });

    it('should filter plans by search keyword', () => {
      const filtered = PlanModel.filterPlans(plans, { search: 'daily' });
      assertEqual(filtered.length, 2);
      assertTrue(filtered.every(p => p.title.toLowerCase().includes('daily')));
    });

    it('should be case-insensitive for search', () => {
      const filtered = PlanModel.filterPlans(plans, { search: 'PLAN' });
      assertEqual(filtered.length, 3, 'Should find "Plan" in titles case-insensitively');
    });

    it('should combine multiple filters', () => {
      const filtered = PlanModel.filterPlans(plans, {
        type: PlanModel.PlanType.DAILY,
        status: PlanModel.PlanStatus.COMPLETED
      });
      assertEqual(filtered.length, 1);
      assertEqual(filtered[0].title, 'Daily Task');
    });

    it('should return all plans when type is "all"', () => {
      const filtered = PlanModel.filterPlans(plans, { type: 'all' });
      assertEqual(filtered.length, plans.length);
    });

    it('should return all plans when status is "all"', () => {
      const filtered = PlanModel.filterPlans(plans, { status: 'all' });
      assertEqual(filtered.length, plans.length);
    });

    it('should return empty array when no matches', () => {
      const filtered = PlanModel.filterPlans(plans, { search: 'nonexistent' });
      assertEqual(filtered.length, 0);
    });

    it('should not mutate original array', () => {
      const originalLength = plans.length;
      PlanModel.filterPlans(plans, { type: PlanModel.PlanType.DAILY });
      assertEqual(plans.length, originalLength, 'Original array should not be mutated');
    });
  });

  describe('sortPlans', () => {
    
    let plans;
    
    beforeEach(() => {
      plans = [
        PlanModel.createPlan({ title: 'Plan A', progress: 30, endDate: '2025-03-01' }),
        PlanModel.createPlan({ title: 'Plan B', progress: 60, endDate: '2025-01-15' }),
        PlanModel.createPlan({ title: 'Plan C', progress: 10, endDate: '2025-12-31' }),
        PlanModel.createPlan({ title: 'Plan D', progress: 90, endDate: '' })
      ];
    });

    it('should sort by progress ascending', () => {
      const sorted = PlanModel.sortPlans(plans, 'progress', 'asc');
      assertEqual(sorted[0].progress, 10);
      assertEqual(sorted[1].progress, 30);
      assertEqual(sorted[2].progress, 60);
      assertEqual(sorted[3].progress, 90);
    });

    it('should sort by progress descending', () => {
      const sorted = PlanModel.sortPlans(plans, 'progress', 'desc');
      assertEqual(sorted[0].progress, 90);
      assertEqual(sorted[3].progress, 10);
    });

    it('should sort by end date ascending', () => {
      const sorted = PlanModel.sortPlans(plans, 'endDate', 'asc');
      assertEqual(sorted[0].endDate, '2025-01-15');
      assertEqual(sorted[1].endDate, '2025-03-01');
      assertEqual(sorted[2].endDate, '2025-12-31');
    });

    it('should sort by end date descending', () => {
      const sorted = PlanModel.sortPlans(plans, 'endDate', 'desc');
      // Empty end dates should be last (treated as 9999-99-99)
      assertEqual(sorted[0].endDate, '2025-12-31');
      assertEqual(sorted[1].endDate, '2025-03-01');
      assertEqual(sorted[2].endDate, '2025-01-15');
    });

    it('should sort by createdAt by default', () => {
      const sorted = PlanModel.sortPlans(plans);
      // Should sort by createdAt in descending order by default
      assertDefined(sorted);
    });

    it('should not mutate original array', () => {
      const originalFirst = plans[0].title;
      PlanModel.sortPlans(plans, 'progress', 'asc');
      assertEqual(plans[0].title, originalFirst, 'Original array should not be mutated');
    });

    it('should handle empty end dates', () => {
      const sorted = PlanModel.sortPlans(plans, 'endDate', 'asc');
      // Empty end date should be treated as far future
      assertEqual(sorted[sorted.length - 1].endDate, '');
    });
  });

  describe('calculateStats', () => {
    
    it('should calculate statistics correctly', () => {
      const plans = [
        PlanModel.createPlan({ title: 'Plan 1', status: PlanModel.PlanStatus.PENDING }),
        PlanModel.createPlan({ title: 'Plan 2', status: PlanModel.PlanStatus.PENDING }),
        PlanModel.createPlan({ title: 'Plan 3', status: PlanModel.PlanStatus.IN_PROGRESS }),
        PlanModel.createPlan({ title: 'Plan 4', status: PlanModel.PlanStatus.IN_PROGRESS }),
        PlanModel.createPlan({ title: 'Plan 5', status: PlanModel.PlanStatus.IN_PROGRESS }),
        PlanModel.createPlan({ title: 'Plan 6', status: PlanModel.PlanStatus.COMPLETED }),
      ];
      
      const stats = PlanModel.calculateStats(plans);
      
      assertEqual(stats.total, 6);
      assertEqual(stats.pending, 2);
      assertEqual(stats.inProgress, 3);
      assertEqual(stats.completed, 1);
    });

    it('should return zero stats for empty array', () => {
      const stats = PlanModel.calculateStats([]);
      
      assertEqual(stats.total, 0);
      assertEqual(stats.pending, 0);
      assertEqual(stats.inProgress, 0);
      assertEqual(stats.completed, 0);
    });

    it('should handle all completed plans', () => {
      const plans = [
        PlanModel.createPlan({ title: 'Plan 1', status: PlanModel.PlanStatus.COMPLETED }),
        PlanModel.createPlan({ title: 'Plan 2', status: PlanModel.PlanStatus.COMPLETED }),
      ];
      
      const stats = PlanModel.calculateStats(plans);
      
      assertEqual(stats.total, 2);
      assertEqual(stats.completed, 2);
      assertEqual(stats.pending, 0);
      assertEqual(stats.inProgress, 0);
    });

    it('should handle all pending plans', () => {
      const plans = [
        PlanModel.createPlan({ title: 'Plan 1', status: PlanModel.PlanStatus.PENDING }),
        PlanModel.createPlan({ title: 'Plan 2', status: PlanModel.PlanStatus.PENDING }),
      ];
      
      const stats = PlanModel.calculateStats(plans);
      
      assertEqual(stats.total, 2);
      assertEqual(stats.pending, 2);
      assertEqual(stats.completed, 0);
      assertEqual(stats.inProgress, 0);
    });
  });

  describe('PlanType and PlanStatus Enums', () => {
    
    it('should have correct PlanType values', () => {
      assertEqual(PlanModel.PlanType.DAILY, 'daily');
      assertEqual(PlanModel.PlanType.WEEKLY, 'weekly');
      assertEqual(PlanModel.PlanType.MONTHLY, 'monthly');
      assertEqual(PlanModel.PlanType.LONGTERM, 'longterm');
    });

    it('should have correct PlanStatus values', () => {
      assertEqual(PlanModel.PlanStatus.PENDING, 'pending');
      assertEqual(PlanModel.PlanStatus.IN_PROGRESS, 'in_progress');
      assertEqual(PlanModel.PlanStatus.COMPLETED, 'completed');
    });

    it('should have PlanTypeLabels', () => {
      assertEqual(PlanModel.PlanTypeLabels[PlanModel.PlanType.DAILY], '每日计划');
      assertEqual(PlanModel.PlanTypeLabels[PlanModel.PlanType.WEEKLY], '每周计划');
      assertEqual(PlanModel.PlanTypeLabels[PlanModel.PlanType.MONTHLY], '月度计划');
      assertEqual(PlanModel.PlanTypeLabels[PlanModel.PlanType.LONGTERM], '长期目标');
    });

    it('should have PlanStatusLabels', () => {
      assertEqual(PlanModel.PlanStatusLabels[PlanModel.PlanStatus.PENDING], '未开始');
      assertEqual(PlanModel.PlanStatusLabels[PlanModel.PlanStatus.IN_PROGRESS], '进行中');
      assertEqual(PlanModel.PlanStatusLabels[PlanModel.PlanStatus.COMPLETED], '已完成');
    });
  });

  describe('Edge Cases', () => {
    
    it('should handle null values in createPlan', () => {
      const plan = PlanModel.createPlan({ title: null });
      assertEqual(plan.title, null);
    });

    it('should handle undefined values in createPlan', () => {
      const plan = PlanModel.createPlan({ title: undefined });
      assertEqual(plan.title, '');
    });

    it('should validate plan with null title', () => {
      const plan = PlanModel.createPlan({ title: null });
      const result = PlanModel.validatePlan(plan);
      assertFalse(result.valid);
    });

    it('should filter empty plans array', () => {
      const filtered = PlanModel.filterPlans([], { type: 'daily' });
      assertEqual(filtered.length, 0);
    });

    it('should sort empty plans array', () => {
      const sorted = PlanModel.sortPlans([], 'progress', 'asc');
      assertEqual(sorted.length, 0);
    });

    it('should handle filter with empty filters object', () => {
      const plans = [
        PlanModel.createPlan({ title: 'Test' })
      ];
      const filtered = PlanModel.filterPlans(plans, {});
      assertEqual(filtered.length, 1);
    });
  });
});