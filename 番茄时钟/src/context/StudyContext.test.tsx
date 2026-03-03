import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider, useApp } from './StudyContext';
import type { StudyRecord, AppSettings } from '../types';

// 测试用的辅助组件
function TestComponent() {
  const { state, dispatch, addRecord, deleteRecord, updateSettings } = useApp();
  
  return (
    <div>
      <span data-testid="timer-status">{state.timerStatus}</span>
      <span data-testid="remaining-seconds">{state.remainingSeconds}</span>
      <span data-testid="timer-minutes">{state.timerMinutes}</span>
      <span data-testid="records-count">{state.records.length}</span>
      <span data-testid="enable-sound">{state.settings.enableSound.toString()}</span>
      <span data-testid="enable-notifications">{state.settings.enableNotifications.toString()}</span>
      
      <button 
        data-testid="start-btn" 
        onClick={() => dispatch({ type: 'SET_TIMER_STATUS', payload: 'running' })}
      >
        Start
      </button>
      <button 
        data-testid="pause-btn" 
        onClick={() => dispatch({ type: 'SET_TIMER_STATUS', payload: 'paused' })}
      >
        Pause
      </button>
      <button 
        data-testid="reset-btn" 
        onClick={() => {
          dispatch({ type: 'SET_TIMER_STATUS', payload: 'idle' });
          dispatch({ type: 'SET_REMAINING_SECONDS', payload: state.timerMinutes * 60 });
        }}
      >
        Reset
      </button>
      <button 
        data-testid="tick-btn" 
        onClick={() => dispatch({ type: 'TICK' })}
      >
        Tick
      </button>
      <button 
        data-testid="add-record-btn" 
        onClick={() => addRecord(25, 'Test Study')}
      >
        Add Record
      </button>
      <button 
        data-testid="delete-record-btn" 
        onClick={() => state.records[0] && deleteRecord(state.records[0].id)}
      >
        Delete Record
      </button>
      <button 
        data-testid="toggle-sound-btn" 
        onClick={() => updateSettings({ ...state.settings, enableSound: !state.settings.enableSound })}
      >
        Toggle Sound
      </button>
      <button 
        data-testid="set-minutes-btn" 
        onClick={() => dispatch({ type: 'SET_TIMER_MINUTES', payload: 30 })}
      >
        Set 30 Min
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AppProvider>
      <TestComponent />
    </AppProvider>
  );
}

describe('StudyContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      renderWithProvider();
      
      expect(screen.getByTestId('timer-status')).toHaveTextContent('idle');
      expect(screen.getByTestId('remaining-seconds')).toHaveTextContent('1500');
      expect(screen.getByTestId('timer-minutes')).toHaveTextContent('25');
      expect(screen.getByTestId('records-count')).toHaveTextContent('0');
      expect(screen.getByTestId('enable-sound')).toHaveTextContent('true');
      expect(screen.getByTestId('enable-notifications')).toHaveTextContent('false');
    });
  });

  describe('Timer 操作', () => {
    it('应该能开始计时', () => {
      renderWithProvider();
      
      fireEvent.click(screen.getByTestId('start-btn'));
      expect(screen.getByTestId('timer-status')).toHaveTextContent('running');
    });

    it('应该能暂停计时', () => {
      renderWithProvider();
      
      fireEvent.click(screen.getByTestId('start-btn'));
      fireEvent.click(screen.getByTestId('pause-btn'));
      expect(screen.getByTestId('timer-status')).toHaveTextContent('paused');
    });

    it('应该能重置计时', () => {
      renderWithProvider();
      
      fireEvent.click(screen.getByTestId('start-btn'));
      fireEvent.click(screen.getByTestId('tick-btn'));
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      expect(screen.getByTestId('timer-status')).toHaveTextContent('idle');
      expect(screen.getByTestId('remaining-seconds')).toHaveTextContent('1500');
    });

    it('TICK 应该减少剩余秒数', () => {
      renderWithProvider();
      
      fireEvent.click(screen.getByTestId('tick-btn'));
      expect(screen.getByTestId('remaining-seconds')).toHaveTextContent('1499');
    });

    it('剩余秒数为0时TICK不应该变为负数', () => {
      renderWithProvider();
      
      for (let i = 0; i < 1501; i++) {
        fireEvent.click(screen.getByTestId('tick-btn'));
      }
      
      expect(screen.getByTestId('remaining-seconds')).toHaveTextContent('0');
    });

    it('应该能设置新的计时时长', () => {
      renderWithProvider();
      
      fireEvent.click(screen.getByTestId('set-minutes-btn'));
      
      expect(screen.getByTestId('timer-minutes')).toHaveTextContent('30');
      expect(screen.getByTestId('remaining-seconds')).toHaveTextContent('1800');
      expect(screen.getByTestId('timer-status')).toHaveTextContent('idle');
    });
  });

  describe('记录管理', () => {
    it('应该能添加学习记录', () => {
      renderWithProvider();
      
      fireEvent.click(screen.getByTestId('add-record-btn'));
      
      expect(screen.getByTestId('records-count')).toHaveTextContent('1');
    });

    it('应该能删除学习记录', () => {
      renderWithProvider();
      
      fireEvent.click(screen.getByTestId('add-record-btn'));
      expect(screen.getByTestId('records-count')).toHaveTextContent('1');
      
      fireEvent.click(screen.getByTestId('delete-record-btn'));
      expect(screen.getByTestId('records-count')).toHaveTextContent('0');
    });
  });

  describe('设置管理', () => {
    it('应该能切换声音设置', () => {
      renderWithProvider();
      
      expect(screen.getByTestId('enable-sound')).toHaveTextContent('true');
      
      fireEvent.click(screen.getByTestId('toggle-sound-btn'));
      expect(screen.getByTestId('enable-sound')).toHaveTextContent('false');
      
      fireEvent.click(screen.getByTestId('toggle-sound-btn'));
      expect(screen.getByTestId('enable-sound')).toHaveTextContent('true');
    });
  });

  describe('localStorage 持久化', () => {
    it('应该从localStorage加载记录', () => {
      const mockRecord: StudyRecord = {
        id: 'record-123',
        startTime: Date.now() - 1500000,
        endTime: Date.now(),
        duration: 25,
        date: new Date().toISOString().split('T')[0],
      };
      
      localStorage.setItem('study-records', JSON.stringify([mockRecord]));
      
      renderWithProvider();
      
      expect(screen.getByTestId('records-count')).toHaveTextContent('1');
    });

    it('应该从localStorage加载设置', () => {
      const mockSettings: AppSettings = {
        defaultMinutes: 30,
        enableSound: false,
        enableNotifications: true,
      };
      
      localStorage.setItem('pomodoro-settings', JSON.stringify(mockSettings));
      
      renderWithProvider();
      
      expect(screen.getByTestId('enable-sound')).toHaveTextContent('false');
      expect(screen.getByTestId('enable-notifications')).toHaveTextContent('true');
    });
  });
});