import React from 'react';
import ReactDOM from 'react-dom/client';
import { Desktop } from './components/desktop/Desktop';
import './styles.css';
import './period.css';

class GameErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="fatal-error">
        <h1>桌面遇到了一点问题</h1>
        <p>你的本地存档仍然保留。请刷新页面恢复，或清理浏览器扩展后重试。</p>
        <button onClick={() => location.reload()}>重新打开桌面</button>
      </div>
    ) : (
      this.props.children
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameErrorBoundary>
      <Desktop />
    </GameErrorBoundary>
  </React.StrictMode>,
);

// 生产版本首次加载后缓存全部静态资源，断网刷新也能继续玩；开发环境保留热更新。
if (import.meta.env.PROD && 'serviceWorker' in navigator)
  navigator.serviceWorker.register('/sw.js').catch(() => {});
