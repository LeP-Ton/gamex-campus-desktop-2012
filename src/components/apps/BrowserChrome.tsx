import { useState } from 'react';
import { useDesktop } from '../../stores/desktopStore';
import type { AppId } from '../../engine/types';
import { AppIcon } from '../ui';

const urls: Partial<Record<AppId, string>> = {
  forum: 'http://www.renren.com/home',
  qzone: 'http://user.qzone.qq.com/20120903',
  browser: 'http://campus.nanchuan.edu.cn/',
  campus: 'http://campus.nanchuan.edu.cn/student/',
};
export function BrowserChrome({ app }: { app: AppId }) {
  const open = useDesktop((s) => s.open);
  const [url, setUrl] = useState(urls[app] ?? urls.browser!);
  return (
    <div className="ie9-chrome">
      <div className="ie9-navigation">
        <button className="ie-back" title="返回校园导航" onClick={() => open('browser')}>
          ←
        </button>
        <button className="ie-forward" title="前进" onClick={() => open('campus')}>
          →
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            open(url.includes('qzone') ? 'qzone' : url.includes('renren') ? 'forum' : 'browser');
          }}
        >
          <AppIcon app={app === 'forum' ? 'forum' : app === 'qzone' ? 'qzone' : 'browser'} size="small" />
          <input aria-label="浏览器地址" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button title="转到此网页">↻</button>
        </form>
        <button title="主页" onClick={() => open('browser')}>
          ⌂
        </button>
        <button title="收藏夹" onClick={() => open('files')}>
          ★
        </button>
        <button title="工具" onClick={() => open('settings')}>
          ⚙
        </button>
      </div>
      <div className="ie9-tabs">
        <div>
          <AppIcon app={app} size="small" />
          {app === 'forum'
            ? '人人网 - 新鲜事'
            : app === 'qzone'
              ? 'QQ空间 - 我的主页'
              : app === 'campus'
                ? '南川大学 - 个人信息'
                : '南川大学校园导航'}
          <span>×</span>
        </div>
        <button title="新建标签页" onClick={() => open(app === 'qzone' ? 'forum' : 'qzone')}>
          ＋
        </button>
        <span>☆　收藏夹栏</span>
      </div>
    </div>
  );
}
