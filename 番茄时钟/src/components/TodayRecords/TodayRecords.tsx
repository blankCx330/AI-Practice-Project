import { useState, useMemo, useRef, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useApp } from '../../context/StudyContext';
import { useRecentNames } from '../../hooks/useRecentNames';
import { format } from 'date-fns';
import './TodayRecords.css';
import Icon from '../Icons';

const COLORS = ['#ff6b6b', '#ffa502', '#26de81', '#45aaf2', '#a55eea', '#fd9644', '#20bf6b', '#2bcbba'];

const DEFAULT_NAME = '未命名的记录';

interface PieData {
  name: string;
  duration: number;
  percentage: number;
}

export default function TodayRecords() {
  const { getTodayRecords, deleteRecord, updateRecordName } = useApp();
  const { recentNames, addRecentName, removeRecentName } = useRecentNames();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [currentEditingRecordId, setCurrentEditingRecordId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  
  const todayRecords = useMemo(() => {
    return getTodayRecords().sort((a, b) => b.endTime - a.endTime);
  }, [getTodayRecords]);

  const totalMinutes = useMemo(() => {
    return todayRecords.reduce((sum, r) => sum + r.duration, 0);
  }, [todayRecords]);

  // 饼状图数据
  const pieData = useMemo((): PieData[] => {
    if (todayRecords.length === 0 || totalMinutes === 0) return [];
    
    const grouped: Record<string, number> = {};
    todayRecords.forEach(record => {
      const name = record.name || DEFAULT_NAME;
      grouped[name] = (grouped[name] || 0) + record.duration;
    });
    
    return Object.entries(grouped)
      .map(([name, duration]) => ({
        name,
        duration,
        percentage: Math.round((duration / totalMinutes) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.duration - a.duration);
  }, [todayRecords, totalMinutes]);

  // 点击外部关闭popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowNamePopup(false);
        setEditingId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 编辑输入框获取焦点
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条学习记录吗？')) {
      deleteRecord(id);
    }
  };

  // 点击名称开始编辑
  const handleNameClick = (recordId: string, currentName: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPopupPosition({ top: rect.bottom + 5, left: rect.left });
    setCurrentEditingRecordId(recordId);
    setEditValue(currentName === DEFAULT_NAME ? '' : currentName);
    setShowNamePopup(true);
    setEditingId(recordId);
  };

  // 选择最近名称
  const handleSelectRecentName = (name: string) => {
    if (currentEditingRecordId) {
      updateRecordName(currentEditingRecordId, name);
      addRecentName(name);
    }
    setShowNamePopup(false);
    setEditingId(null);
    setCurrentEditingRecordId(null);
  };

  // 删除最近名称
  const handleRemoveRecentName = (name: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeRecentName(name);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (currentEditingRecordId) {
      const trimmedValue = editValue.trim();
      if (trimmedValue) {
        updateRecordName(currentEditingRecordId, trimmedValue);
        addRecentName(trimmedValue);
      } else {
        // 清空名称
        updateRecordName(currentEditingRecordId, '');
      }
    }
    setShowNamePopup(false);
    setEditingId(null);
    setCurrentEditingRecordId(null);
  };

  // 输入框键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setShowNamePopup(false);
      setEditingId(null);
    }
  };

  return (
    <div className="today-records-container">
      <div className="today-header">
        <h2>今日学习</h2>
        <div className="today-stats">
          <span className="total-time">
            总计: <strong>{Math.floor(totalMinutes / 60)}小时{totalMinutes % 60}分钟</strong>
          </span>
          <span className="session-count">
            {todayRecords.length} 次学习
          </span>
        </div>
      </div>

      {/* 饼状图 */}
      {pieData.length > 0 && (
        <div className="pie-chart-section">
          <h3 className="pie-chart-title">时间分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="duration"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => {
                  const pct = percent ? Math.round(percent * 100) : 0;
                  return `${name}: ${pct}%`;
                }}
                labelLine
              >
                {pieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number | undefined) => [`${value ?? 0}分钟`, '时长']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {todayRecords.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Icon name="book" size={48} /></div>
          <p>今天还没有学习记录</p>
          <p className="empty-hint">开始你的第一次学习吧！</p>
        </div>
      ) : (
        <div className="records-list">
          {todayRecords.map((record, index) => {
            const displayName = record.name || DEFAULT_NAME;
            const isEditing = editingId === record.id;
            
            return (
              <div key={record.id} className="record-card">
                <div className="record-index">{index + 1}</div>
                <div className="record-content">
                  <div 
                    className={`record-name ${isEditing ? 'editing' : ''} clickable`}
                    onClick={(e) => handleNameClick(record.id, displayName, e)}
                  >
                    {displayName}
                  </div>
                  <div className="record-time">
                    {format(new Date(record.startTime), 'HH:mm')} - {format(new Date(record.endTime), 'HH:mm')}
                  </div>
                </div>
                <div className="record-duration">
                  {record.duration}分钟
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(record.id)}
                  title="删除记录"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 名称选择弹窗 */}
      {showNamePopup && (
        <div 
          ref={popupRef}
          className="name-popup"
          style={{ top: popupPosition.top, left: popupPosition.left }}
        >
          <div className="name-input-container">
            <input
              ref={inputRef}
              type="text"
              className="name-input"
              placeholder="输入名称..."
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={50}
            />
            <button className="save-btn" onClick={handleSaveEdit}>
              保存
            </button>
          </div>
          
          {recentNames.length > 0 && (
            <div className="recent-names-list">
              <div className="recent-names-title">最近使用</div>
              {recentNames.map((name) => (
                <div 
                  key={name} 
                  className="recent-name-item"
                  onClick={() => handleSelectRecentName(name)}
                >
                  <span className="recent-name-text">{name}</span>
                  <button 
                    className="remove-name-btn"
                    onClick={(e) => handleRemoveRecentName(name, e)}
                    title="删除"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}