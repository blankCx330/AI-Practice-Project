import { test, expect } from '@playwright/test';

test.describe('番茄时钟 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 清除localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('应该显示计时器界面', async ({ page }) => {
    // 检查标题
    await expect(page.locator('text=25:00')).toBeVisible();
    
    // 检查时间选项
    await expect(page.locator('text=15分钟')).toBeVisible();
    await expect(page.locator('text=25分钟')).toBeVisible();
    await expect(page.locator('text=30分钟')).toBeVisible();
    await expect(page.locator('text=45分钟')).toBeVisible();
    await expect(page.locator('text=60分钟')).toBeVisible();
    
    // 检查开始按钮
    await expect(page.locator('text=开始学习')).toBeVisible();
  });

  test('应该能切换时间选项', async ({ page }) => {
    // 点击15分钟
    await page.locator('text=15分钟').click();
    await expect(page.locator('text=15:00')).toBeVisible();
    
    // 点击30分钟
    await page.locator('text=30分钟').click();
    await expect(page.locator('text=30:00')).toBeVisible();
    
    // 点击45分钟
    await page.locator('text=45分钟').click();
    await expect(page.locator('text=45:00')).toBeVisible();
    
    // 点击60分钟
    await page.locator('text=60分钟').click();
    await expect(page.locator('text=60:00')).toBeVisible();
  });

  test('应该能开始和暂停计时', async ({ page }) => {
    // 开始计时
    await page.locator('text=开始学习').click();
    
    // 检查暂停按钮出现
    await expect(page.locator('text=暂停')).toBeVisible();
    await expect(page.locator('text=完成')).toBeVisible();
    await expect(page.locator('text=放弃')).toBeVisible();
    
    // 检查状态变化
    await expect(page.locator('text=学习中')).toBeVisible();
    
    // 暂停计时
    await page.locator('text=暂停').click();
    
    // 检查继续按钮出现
    await expect(page.locator('text=继续')).toBeVisible();
    await expect(page.locator('text=重置')).toBeVisible();
  });

  test('应该能放弃计时', async ({ page }) => {
    // 开始计时
    await page.locator('text=开始学习').click();
    
    // 放弃计时
    await page.locator('text=放弃').click();
    
    // 检查回到初始状态
    await expect(page.locator('text=开始学习')).toBeVisible();
    await expect(page.locator('text=25:00')).toBeVisible();
  });

  test('应该能重置计时', async ({ page }) => {
    // 开始计时
    await page.locator('text=开始学习').click();
    
    // 暂停计时
    await page.locator('text=暂停').click();
    
    // 重置计时
    await page.locator('text=重置').click();
    
    // 检查回到初始状态
    await expect(page.locator('text=开始学习')).toBeVisible();
    await expect(page.locator('text=25:00')).toBeVisible();
  });

  test('导航栏应该正常工作', async ({ page }) => {
    // 导航到日历
    await page.locator('text=日历').click();
    await expect(page.locator('h2:has-text("日历")')).toBeVisible();
    
    // 导航到统计
    await page.locator('text=统计').click();
    await expect(page.locator('h2:has-text("统计")')).toBeVisible();
    
    // 导航到今日
    await page.locator('text=今日').click();
    await expect(page.locator('h2:has-text("今日记录")')).toBeVisible();
    
    // 导航到设置
    await page.locator('text=设置').click();
    await expect(page.locator('h2:has-text("设置")')).toBeVisible();
    
    // 返回计时器
    await page.locator('text=计时').click();
    await expect(page.locator('text=开始学习')).toBeVisible();
  });

  test('设置页面应该正常工作', async ({ page }) => {
    // 导航到设置
    await page.locator('text=设置').click();
    
    // 检查默认时长
    await expect(page.locator('.time-display:has-text("25")')).toBeVisible();
    
    // 增加时长
    await page.locator('.setting-control >> text=+').first().click();
    await expect(page.locator('.time-display:has-text("30")')).toBeVisible();
    
    // 减少时长
    await page.locator('.setting-control >> text=-').first().click();
    await expect(page.locator('.time-display:has-text("25")')).toBeVisible();
    
    // 切换提示音
    await page.locator('button:has-text("开启")').first().click();
    await expect(page.locator('button:has-text("关闭")')).toBeVisible();
  });

  test('完成学习应该创建记录', async ({ page }) => {
    // 开始计时
    await page.locator('text=开始学习').click();
    
    // 完成学习
    await page.locator('text=完成').click();
    
    // 导航到今日查看记录
    await page.locator('text=今日').click();
    
    // 检查有记录（时间较短，记录1分钟）
    await expect(page.locator('.record-item, .today-records')).toBeVisible();
  });
});