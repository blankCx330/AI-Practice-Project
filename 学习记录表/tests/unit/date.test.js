/**
 * Unit Tests for Date Utils
 */

describe('Date Utils - 格式化', (test) => {
  
  test('应该正确格式化日期为 YYYY-MM-DD', () => {
    const date = new Date('2025-03-06T10:30:00Z');
    const formatted = window.DateUtils.formatDate(date);
    
    assertEqual(formatted, '2025-03-06', '应该格式化为 YYYY-MM-DD');
  });

  test('应该能够格式化字符串日期', () => {
    const formatted = window.DateUtils.formatDate('2025-03-06T10:30:00Z');
    assertEqual(formatted, '2025-03-06', '应该正确格式化字符串日期');
  });

  test('空值应该返回空字符串', () => {
    const formatted1 = window.DateUtils.formatDate(null);
    const formatted2 = window.DateUtils.formatDate(undefined);
    const formatted3 = window.DateUtils.formatDate('');
    
    assertEqual(formatted1, '', 'null 应该返回空字符串');
    assertEqual(formatted2, '', 'undefined 应该返回空字符串');
    assertEqual(formatted3, '', '空字符串应该返回空字符串');
  });

  test('应该正确格式化为中文显示', () => {
    const formatted = window.DateUtils.formatDateCN('2025-03-06');
    assertEqual(formatted, '2025年3月6日', '应该格式化为中文显示');
  });
});

describe('Date Utils - 日期获取', (test) => {
  
  test('应该返回今天的日期字符串', () => {
    const today = window.DateUtils.getToday();
    const expected = window.DateUtils.formatDate(new Date());
    
    assertEqual(today, expected, '应该返回今天的日期');
    assertTrue(/^\d{4}-\d{2}-\d{2}$/.test(today), '格式应该是 YYYY-MM-DD');
  });
});

describe('Date Utils - 日期计算', (test) => {
  
  test('应该正确计算两个日期之间的天数', () => {
    const days = window.DateUtils.getDaysBetween('2025-03-01', '2025-03-06');
    assertEqual(days, 5, '应该相差5天');
  });

  test('相同日期的天数差应该是 0', () => {
    const days = window.DateUtils.getDaysBetween('2025-03-06', '2025-03-06');
    assertEqual(days, 0, '相同日期应该相差0天');
  });

  test('结束日期早于开始日期应该返回负数', () => {
    const days = window.DateUtils.getDaysBetween('2025-03-10', '2025-03-05');
    assertTrue(days < 0, '结束日期早于开始日期应该返回负数');
  });

  test('应该正确计算剩余天数', () => {
    const today = window.DateUtils.getToday();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = window.DateUtils.formatDate(tomorrow);
    
    const daysLeft = window.DateUtils.getDaysLeft(tomorrowStr);
    assertEqual(daysLeft, 1, '明天应该剩余1天');
  });

  test('过期日期应该返回负数', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = window.DateUtils.formatDate(yesterday);
    
    const daysLeft = window.DateUtils.getDaysLeft(yesterdayStr);
    assertTrue(daysLeft < 0, '过期日期应该返回负数');
  });
});

describe('Date Utils - 日期状态', (test) => {
  
  test('应该正确识别已过期', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const dateStr = window.DateUtils.formatDate(yesterday);
    
    const status = window.DateUtils.getDateStatus(dateStr);
    assertTrue(status.includes('已过期'), '应该识别为已过期');
  });

  test('应该正确识别今天到期', () => {
    const today = window.DateUtils.getToday();
    const status = window.DateUtils.getDateStatus(today);
    
    assertEqual(status, '今天到期', '应该识别为今天到期');
  });

  test('应该正确识别明天到期', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = window.DateUtils.formatDate(tomorrow);
    
    const status = window.DateUtils.getDateStatus(dateStr);
    assertEqual(status, '明天到期', '应该识别为明天到期');
  });

  test('应该正确识别一周内到期', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const dateStr = window.DateUtils.formatDate(future);
    
    const status = window.DateUtils.getDateStatus(dateStr);
    assertTrue(status.includes('天后到期'), '应该识别为几天后到期');
  });

  test('空日期应该返回空字符串', () => {
    const status = window.DateUtils.getDateStatus(null);
    assertEqual(status, '', '空日期应该返回空字符串');
  });
});

describe('Date Utils - 验证', (test) => {
  
  test('应该验证有效的日期格式', () => {
    assertTrue(window.DateUtils.isValidDate('2025-03-06'), 'YYYY-MM-DD 格式应该有效');
    assertTrue(window.DateUtils.isValidDate('2025-12-31'), 'YYYY-MM-DD 格式应该有效');
  });

  test('应该拒绝无效的日期格式', () => {
    assertFalse(window.DateUtils.isValidDate('2025/03/06'), '斜杠分隔符应该无效');
    assertFalse(window.DateUtils.isValidDate('2025-3-6'), '不补零应该无效');
    assertFalse(window.DateUtils.isValidDate('03-06-2025'), '错误顺序应该无效');
    assertFalse(window.DateUtils.isValidDate('invalid'), '非日期字符串应该无效');
  });

  test('应该拒绝无效日期', () => {
    assertFalse(window.DateUtils.isValidDate('2025-13-01'), '无效月份应该无效');
    assertFalse(window.DateUtils.isValidDate('2025-02-30'), '无效日期应该无效');
  });

  test('空值应该无效', () => {
    assertFalse(window.DateUtils.isValidDate(null), 'null 应该无效');
    assertFalse(window.DateUtils.isValidDate(''), '空字符串应该无效');
    assertFalse(window.DateUtils.isValidDate(undefined), 'undefined 应该无效');
  });
});

describe('Date Utils - 相对时间', (test) => {
  
  test('应该显示"刚刚"', () => {
    const now = new Date().toISOString();
    const relative = window.DateUtils.getRelativeTime(now);
    assertEqual(relative, '刚刚', '当前时间应该显示"刚刚"');
  });

  test('应该显示分钟前', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const relative = window.DateUtils.getRelativeTime(fiveMinAgo);
    assertTrue(relative.includes('分钟前'), '应该显示分钟前');
  });

  test('应该显示小时前', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const relative = window.DateUtils.getRelativeTime(twoHoursAgo);
    assertTrue(relative.includes('小时前'), '应该显示小时前');
  });

  test('应该显示天前', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const relative = window.DateUtils.getRelativeTime(threeDaysAgo);
    assertTrue(relative.includes('天前'), '应该显示天前');
  });

  test('较久时间应该显示具体日期', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const relative = window.DateUtils.getRelativeTime(tenDaysAgo);
    assertTrue(relative.includes('年'), '应该显示具体日期');
  });
});