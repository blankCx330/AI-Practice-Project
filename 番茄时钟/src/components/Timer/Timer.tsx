import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/StudyContext';
import { useRecentNames } from '../../hooks/useRecentNames';
import './Timer.css';
import Icon from '../Icons';

const TIME_OPTIONS = [15, 25, 30, 45, 60];

// Toast消息类型
interface ToastMessage {
  id: number;
  type: 'success' | 'warning' | 'error';
  message: React.ReactNode;
}

export default function Timer() {
  const { state, dispatch, finishEarly } = useApp();
  const { recentNames, addRecentName, removeRecentName } = useRecentNames();
  const { timerMinutes, timerStatus, remainingSeconds } = state;
  const [sessionName, setSessionName] = useState('');
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // 显示Toast消息
  const showToast = (type: ToastMessage['type'], message: React.ReactNode) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // 点击外部关闭popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowNamePopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 计算进度
  const totalSeconds = timerMinutes * 60;
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  // 计算已学习时间（秒）
  const elapsedSeconds = totalSeconds - remainingSeconds;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  // 格式化已学习时间显示
  const formatElapsedTime = () => {
    if (elapsedMinutes > 0) {
      const secs = elapsedSeconds % 60;
      return `已学习: ${elapsedMinutes}分${secs}秒`;
    } else if (elapsedSeconds > 0) {
      return `已学习: ${elapsedSeconds}秒`;
    }
    return null;
  };

  // 开始
  const handleStart = () => {
    dispatch({ type: 'SET_TIMER_STATUS', payload: 'running' });
    dispatch({ type: 'SET_TIMER_START_TIME', payload: Date.now() });
  };

  // 暂停
  const handlePause = () => {
    dispatch({ type: 'SET_TIMER_STATUS', payload: 'paused' });
  };

  // 重置
  const handleReset = () => {
    dispatch({ type: 'SET_TIMER_STATUS', payload: 'idle' });
    dispatch({ type: 'SET_REMAINING_SECONDS', payload: timerMinutes * 60 });
    dispatch({ type: 'SET_TIMER_START_TIME', payload: null });
    setSessionName('');
  };

  // 选择时长
  const handleMinutesChange = (minutes: number) => {
    dispatch({ type: 'SET_TIMER_MINUTES', payload: minutes });
  };

  // 输入框获取焦点时显示弹窗
  const handleInputFocus = () => {
    setShowNamePopup(true);
  };

  // 选择最近名称
  const handleSelectRecentName = (name: string) => {
    setSessionName(name);
    setShowNamePopup(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // 删除最近名称
  const handleRemoveRecentName = (name: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeRecentName(name);
  };

  // 提前完成
  const handleFinish = () => {
    // 只要计时器在运行或暂停状态且有经过时间就记录
    if (elapsedSeconds > 0) {
      const finalName = sessionName.trim();
      finishEarly(finalName || undefined);
      if (finalName) {
        addRecentName(finalName);
      }
      setSessionName('');
      showToast('success', <><Icon name="check" size={16} /> 已记录 {Math.max(1, Math.round(elapsedSeconds / 60))} 分钟学习时间</>);
    } else {
      showToast('warning', '请至少学习几秒钟再完成');
    }
  };

  // 放弃学习
  const handleAbandon = () => {
    if (elapsedSeconds > 0) {
      if (confirm('确定要放弃这次学习吗？已学习的时间将不会记录。')) {
        handleReset();
        showToast('warning', '已放弃本次学习');
      }
    } else {
      handleReset();
    }
  };

  return (
    <div className="timer-container">
      {/* Toast消息 */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>

      <div className="timer-display">
        {/* 进度圆环 */}
        <svg className="timer-ring" viewBox="0 0 200 200">
          {/* 背景圆 */}
          <circle
            className="timer-ring-bg"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            strokeWidth="8"
          />
          {/* 进度圆 */}
          <circle
            className="timer-ring-progress"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
            style={{
              stroke: timerStatus === 'running' ? '#ff6b6b' : 
                      timerStatus === 'paused' ? '#ffa502' : '#ddd',
              transition: 'stroke-dashoffset 0.5s ease'
            }}
          />
        </svg>
        
        {/* 时间显示 */}
        <div className="timer-time">
          <span className="time-text">{formatTime(remainingSeconds)}</span>
          <span className="time-label">
            {timerStatus === 'running' ? '学习中' : 
             timerStatus === 'paused' ? '已暂停' : '准备开始'}
          </span>
          {elapsedSeconds > 0 && timerStatus !== 'idle' && (
            <span className="elapsed-time">{formatElapsedTime()}</span>
          )}
        </div>
      </div>

      {/* 名称输入 */}
      {timerStatus !== 'idle' && (
        <div className="name-input-wrapper" ref={popupRef}>
          <div className="name-input-container">
            <input
              ref={inputRef}
              type="text"
              className="name-input"
              placeholder="为这次学习命名（可选）"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onFocus={handleInputFocus}
              maxLength={50}
            />
          </div>
          
          {/* 最近命名弹窗 */}
          {showNamePopup && recentNames.length > 0 && (
            <div className="name-suggestion-popup">
              <div className="popup-title">快速选择</div>
              <div className="name-suggestions">
                {recentNames.map((name) => (
                  <div 
                    key={name} 
                    className="name-suggestion-item"
                    onClick={() => handleSelectRecentName(name)}
                  >
                    <span className="suggestion-text">{name}</span>
                    <button 
                      className="remove-suggestion-btn"
                      onClick={(e) => handleRemoveRecentName(name, e)}
                      title="删除"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 时长选择 */}
      <div className="timer-options">
        {TIME_OPTIONS.map(mins => (
          <button
            key={mins}
            className={`time-option ${timerMinutes === mins ? 'active' : ''}`}
            onClick={() => handleMinutesChange(mins)}
            disabled={timerStatus !== 'idle'}
          >
            {mins}分钟
          </button>
        ))}
      </div>

      {/* 控制按钮 */}
      <div className="timer-controls">
        {timerStatus === 'idle' && (
          <button className="control-btn start-btn" onClick={handleStart}>
            开始学习
          </button>
        )}
        {timerStatus === 'running' && (
          <>
            <button className="control-btn pause-btn" onClick={handlePause}>
              暂停
            </button>
            <button className="control-btn finish-btn" onClick={handleFinish}>
              完成
            </button>
            <button className="control-btn reset-btn" onClick={handleAbandon}>
              放弃
            </button>
          </>
        )}
        {timerStatus === 'paused' && (
          <>
            <button className="control-btn resume-btn" onClick={handleStart}>
              继续
            </button>
            <button className="control-btn finish-btn" onClick={handleFinish}>
              完成
            </button>
            <button className="control-btn reset-btn" onClick={handleAbandon}>
              重置
            </button>
          </>
        )}
      </div>

      {/* 提示 */}
      <div className="timer-tip">
        <Icon name="lightbulb" size={16} /> 25分钟是经典的番茄工作法时长，适合保持专注
      </div>
    </div>
  );
}