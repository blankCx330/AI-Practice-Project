import { useState } from 'react';
import { useApp, playNotificationSound } from '../../context/StudyContext';
import type { AppSettings } from '../../types';
import Icon from '../Icons';
import './Settings.css';

export default function Settings() {
  const { state, dispatch, updateSettings } = useApp();
  const { settings } = state;
  const [showSoundTest, setShowSoundTest] = useState(false);

  // 保存设置
  const saveSettings = (newSettings: AppSettings) => {
    updateSettings(newSettings);
  };

  // 测试提示音
  const testSound = () => {
    playNotificationSound();
    setShowSoundTest(true);
    setTimeout(() => setShowSoundTest(false), 2000);
  };

  // 请求通知权限
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        saveSettings({ ...settings, enableNotifications: true });
      }
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title"><Icon name="settings" size={20} /> 设置</h2>

      <div className="settings-section">
        <h3 className="section-title">计时器设置</h3>

        <div className="setting-item">
          <label className="setting-label">默认时长（分钟）</label>
          <div className="setting-control">
            <button
              className="time-adjust-btn"
              onClick={() => {
                const newMinutes = Math.max(5, settings.defaultMinutes - 5);
                saveSettings({ ...settings, defaultMinutes: newMinutes });
              }}
            >
              -
            </button>
            <span className="time-display">{settings.defaultMinutes}</span>
            <button
              className="time-adjust-btn"
              onClick={() => {
                const newMinutes = Math.min(120, settings.defaultMinutes + 5);
                saveSettings({ ...settings, defaultMinutes: newMinutes });
              }}
            >
              +
            </button>
          </div>
          <p className="setting-hint">建议时长：15-60分钟</p>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">提示设置</h3>

        <div className="setting-item">
          <label className="setting-label">启用提示音</label>
          <div className="setting-control">
            <button
              className={`toggle-btn ${settings.enableSound ? 'active' : ''}`}
              onClick={() => saveSettings({ ...settings, enableSound: !settings.enableSound })}
            >
              {settings.enableSound ? '开启' : '关闭'}
            </button>
          </div>
          {settings.enableSound && (
            <button className="test-sound-btn" onClick={testSound}>
              {showSoundTest ? <><Icon name="check" size={16} /> 已播放</> : <><Icon name="sound" size={16} /> 测试提示音</>}
            </button>
          )}
        </div>

        <div className="setting-item">
          <label className="setting-label">启用浏览器通知</label>
          <div className="setting-control">
            {settings.enableNotifications ? (
              <button
                className="toggle-btn active"
                onClick={() => saveSettings({ ...settings, enableNotifications: false })}
              >
                开启
              </button>
            ) : (
              <button
                className="toggle-btn"
                onClick={requestNotificationPermission}
              >
                授权
              </button>
            )}
          </div>
          <p className="setting-hint">计时结束时会在浏览器显示通知</p>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">数据管理</h3>

        <div className="setting-item">
          <button
            className="danger-btn"
            onClick={() => {
              if (confirm('确定要清除所有学习记录吗？此操作不可恢复！')) {
                dispatch({ type: 'SET_RECORDS', payload: [] });
                localStorage.removeItem('study-records');
              }
            }}
          >
            清除所有记录
          </button>
          <p className="setting-hint">这将永久删除所有学习记录</p>
        </div>
      </div>

      <div className="settings-footer">
        <p><Icon name="lightbulb" size={16} /> 提示：设置会自动保存到本地</p>
      </div>
    </div>
  );
}