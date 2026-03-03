import { useState, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/StudyContext';
import Layout from './components/Layout/Layout';
import type { ViewType } from './types';
import './App.css';

// 懒加载视图组件
const Timer = lazy(() => import('./components/Timer/Timer'));
const Calendar = lazy(() => import('./components/Calendar/Calendar'));
const Statistics = lazy(() => import('./components/Statistics/Statistics'));
const TodayRecords = lazy(() => import('./components/TodayRecords/TodayRecords'));
const Settings = lazy(() => import('./components/Settings/Settings'));

// 加载占位符
function LoadingFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '200px',
      color: '#999'
    }}>
      加载中...
    </div>
  );
}

function AppContent() {
  const { dispatch } = useApp();
  const [currentView, setCurrentView] = useState<ViewType>('timer');

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  };

  const renderContent = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {(() => {
          switch (currentView) {
            case 'timer':
              return <Timer />;
            case 'today':
              return <TodayRecords />;
            case 'calendar':
              return <Calendar />;
            case 'statistics':
              return <Statistics />;
            case 'settings':
              return <Settings />;
            default:
              return <Timer />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <Layout currentView={currentView} onViewChange={handleViewChange}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;