import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../../context/StudyContext';
import Settings from './Settings';

// Mock Notification API
vi.stubGlobal('Notification', {
  requestPermission: vi.fn().mockResolvedValue('granted'),
  permission: 'default',
});

function renderSettings() {
  return render(
    <AppProvider>
      <Settings />
    </AppProvider>
  );
}

describe('Settings Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('渲染', () => {
    it('应该显示设置标题', () => {
      renderSettings();
      
      expect(screen.getByText('设置')).toBeInTheDocument();
    });

    it('应该显示计时器设置部分', () => {
      renderSettings();
      
      expect(screen.getByText('计时器设置')).toBeInTheDocument();
      expect(screen.getByText('默认时长（分钟）')).toBeInTheDocument();
    });

    it('应该显示提示设置部分', () => {
      renderSettings();
      
      expect(screen.getByText('提示设置')).toBeInTheDocument();
      expect(screen.getByText('启用提示音')).toBeInTheDocument();
      expect(screen.getByText('启用浏览器通知')).toBeInTheDocument();
    });

    it('应该显示数据管理部分', () => {
      renderSettings();
      
      expect(screen.getByText('数据管理')).toBeInTheDocument();
      expect(screen.getByText('清除所有记录')).toBeInTheDocument();
    });

    it('应该显示默认时长25分钟', () => {
      renderSettings();
      
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  describe('时长调整', () => {
    it('应该能减少时长', async () => {
      renderSettings();
      
      const decreaseBtn = screen.getByText('-');
      await userEvent.click(decreaseBtn);
      
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('应该能增加时长', async () => {
      renderSettings();
      
      const increaseBtn = screen.getByText('+');
      await userEvent.click(increaseBtn);
      
      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('时长最小值应该是5分钟', async () => {
      renderSettings();
      
      const decreaseBtn = screen.getByText('-');
      
      // 点击4次从25减到5
      for (let i = 0; i < 4; i++) {
        await userEvent.click(decreaseBtn);
      }
      expect(screen.getByText('5')).toBeInTheDocument();
      
      // 再点一次应该保持5
      await userEvent.click(decreaseBtn);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('时长最大值应该是120分钟', async () => {
      renderSettings();
      
      const increaseBtn = screen.getByText('+');
      
      // 点击19次从25增到120
      for (let i = 0; i < 19; i++) {
        await userEvent.click(increaseBtn);
      }
      expect(screen.getByText('120')).toBeInTheDocument();
      
      // 再点一次应该保持120
      await userEvent.click(increaseBtn);
      expect(screen.getByText('120')).toBeInTheDocument();
    });
  });

  describe('提示音设置', () => {
    it('默认应该开启提示音', () => {
      renderSettings();
      
      const soundToggle = screen.getByRole('button', { name: '开启' });
      expect(soundToggle).toBeInTheDocument();
    });

    it('应该能切换提示音', async () => {
      renderSettings();
      
      const soundToggle = screen.getByRole('button', { name: '开启' });
      await userEvent.click(soundToggle);
      
      expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
    });

    it('开启时应该显示测试提示音按钮', () => {
      renderSettings();
      
      expect(screen.getByText('测试提示音')).toBeInTheDocument();
    });

    it('关闭时不应该显示测试提示音按钮', async () => {
      renderSettings();
      
      const soundToggle = screen.getByRole('button', { name: '开启' });
      await userEvent.click(soundToggle);
      
      expect(screen.queryByText('测试提示音')).not.toBeInTheDocument();
    });
  });

  describe('浏览器通知设置', () => {
    it('默认应该关闭通知', () => {
      renderSettings();
      
      expect(screen.getByRole('button', { name: '授权' })).toBeInTheDocument();
    });
  });

  describe('数据管理', () => {
    it('点击清除按钮应该显示确认对话框', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      renderSettings();
      
      const clearBtn = screen.getByText('清除所有记录');
      await userEvent.click(clearBtn);
      
      expect(window.confirm).toHaveBeenCalledWith('确定要清除所有学习记录吗？此操作不可恢复！');
    });
  });
});