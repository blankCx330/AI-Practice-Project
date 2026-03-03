import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recent-study-names';
const MAX_NAMES = 20;

export function useRecentNames() {
  const [recentNames, setRecentNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 如果有保存的数据，使用保存的
        if (parsed.length > 0) {
          return parsed;
        }
      }
      // 如果没有保存数据，返回默认值
      return ['学习', '锻炼'];
    } catch {
      return ['学习', '锻炼'];
    }
  });

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentNames));
  }, [recentNames]);

  // 添加名称到最近列表
  const addRecentName = useCallback((name: string) => {
    if (!name || !name.trim()) return;

    const trimmedName = name.trim();
    setRecentNames(prev => {
      // 移除已存在的同名项，然后添加到开头
      const filtered = prev.filter(n => n !== trimmedName);
      const newList = [trimmedName, ...filtered];
      // 限制最大数量
      return newList.slice(0, MAX_NAMES);
    });
  }, []);

  // 从最近列表移除名称
  const removeRecentName = useCallback((name: string) => {
    setRecentNames(prev => prev.filter(n => n !== name));
  }, []);

  return {
    recentNames,
    addRecentName,
    removeRecentName,
  };
}
