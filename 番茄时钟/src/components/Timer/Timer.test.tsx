import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../context/StudyContext';
import Timer from './Timer';

function renderTimer() {
  return render(
    <AppProvider>
      <Timer />
    </AppProvider>
  );
}

describe('Timer Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('渲染', () => {
    it('应该显示时间选择按钮', () => {
      renderTimer();
      
      expect(screen.getByText('15分钟')).toBeInTheDocument();
      expect(screen.getByText('25分钟')).toBeInTheDocument();
      expect(screen.getByText('30分钟')).toBeInTheDocument();
      expect(screen.getByText('45分钟')).toBeInTheDocument();
      expect(screen.getByText('60分钟')).toBeInTheDocument();
    });

    it('应该显示开始学习按钮', () => {
      renderTimer();
      
      expect(screen.getByText('开始学习')).toBeInTheDocument();
    });

    it('应该显示初始时间 25:00', () => {
      renderTimer();
      
      expect(screen.getByText('25:00')).toBeInTheDocument();
    });

    it('应该显示默认选中25分钟', () => {
      renderTimer();
      
      const btn25 = screen.getByText('25分钟');
      expect(btn25).toHaveClass('active');
    });
  });

  describe('时间选择', () => {
    it('应该能切换到15分钟', () => {
      renderTimer();
      
      const btn15 = screen.getByText('15分钟');
      fireEvent.click(btn15);
      
      expect(screen.getByText('15:00')).toBeInTheDocument();
      expect(btn15).toHaveClass('active');
    });

    it('应该能切换到30分钟', () => {
      renderTimer();
      
      const btn30 = screen.getByText('30分钟');
      fireEvent.click(btn30);
      
      expect(screen.getByText('30:00')).toBeInTheDocument();
      expect(btn30).toHaveClass('active');
    });

    it('计时中不应该能切换时间', () => {
      renderTimer();
      
      // 开始计时
      fireEvent.click(screen.getByText('开始学习'));
      
      // 时间按钮应该被禁用
      const btn15 = screen.getByText('15分钟');
      expect(btn15).toBeDisabled();
    });
  });

  describe('计时控制', () => {
    it('开始后应该显示暂停和完成按钮', () => {
      renderTimer();
      
      fireEvent.click(screen.getByText('开始学习'));
      
      expect(screen.getByText('暂停')).toBeInTheDocument();
      expect(screen.getByText('完成')).toBeInTheDocument();
      expect(screen.getByText('放弃')).toBeInTheDocument();
    });

    it('暂停后应该显示继续和重置按钮', () => {
      renderTimer();
      
      fireEvent.click(screen.getByText('开始学习'));
      fireEvent.click(screen.getByText('暂停'));
      
      expect(screen.getByText('继续')).toBeInTheDocument();
      expect(screen.getByText('完成')).toBeInTheDocument();
      expect(screen.getByText('重置')).toBeInTheDocument();
    });

    it('放弃后应该重置到初始状态', () => {
      renderTimer();
      
      fireEvent.click(screen.getByText('开始学习'));
      fireEvent.click(screen.getByText('放弃'));
      
      expect(screen.getByText('开始学习')).toBeInTheDocument();
      expect(screen.getByText('25:00')).toBeInTheDocument();
    });

    it('重置后应该回到初始状态', () => {
      renderTimer();
      
      fireEvent.click(screen.getByText('开始学习'));
      fireEvent.click(screen.getByText('暂停'));
      fireEvent.click(screen.getByText('重置'));
      
      expect(screen.getByText('开始学习')).toBeInTheDocument();
      expect(screen.getByText('25:00')).toBeInTheDocument();
    });
  });

  describe('学习命名', () => {
    it('计时中应该显示名称输入框', () => {
      renderTimer();
      
      fireEvent.click(screen.getByText('开始学习'));
      
      expect(screen.getByPlaceholderText('为这次学习命名（可选）')).toBeInTheDocument();
    });

    it('空闲时不应该显示名称输入框', () => {
      renderTimer();
      
      expect(screen.queryByPlaceholderText('为这次学习命名（可选）')).not.toBeInTheDocument();
    });
  });
});