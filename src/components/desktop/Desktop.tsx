import { useEffect, useState } from 'react';
import { Volume2, ChevronUp, X } from 'lucide-react';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { dateOf, clockText, weekdays, weekOf } from '../../engine/helpers';
import { MAJORS } from '../../content/world';
import type { AppId } from '../../engine/types';
import { APPS, AppIcon, Avatar, Button, Icon } from '../ui';
import { Window } from './Window';
import { NewGame } from '../game/NewGame';

const shortcuts: AppId[] = [
  'files',
  'recycle',
  'browser',
  'chat',
  'games',
  'gamebox',
  'forum',
  'qzone',
  'campus',
  'schedule',
  'study',
  'diary',
  'grades',
  'rankings',
  'settings',
];
const pinned: AppId[] = ['browser', 'files', 'chat', 'games', 'gamebox'];

export function WindowsFlag() {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <path d="M5 8q8-4 16-1v16q-9-3-16 1z" fill="#ed6b28" />
      <path d="M24 8q8 3 16-1v16q-8 4-16 1z" fill="#8ac43e" />
      <path d="M5 27q8-4 16-1v16q-9-3-16 1z" fill="#49a8e4" />
      <path d="M24 27q8 3 16-1v16q-8 4-16 1z" fill="#f3d22e" />
    </svg>
  );
}

export function Desktop() {
  const { game, send, save, error, clearError } = useGame();
  const desktop = useDesktop();
  const [newGame, setNewGame] = useState(!game);
  const [sleep, setSleep] = useState(false);
  const [tray, setTray] = useState(false);
  const [systemToast, setSystemToast] = useState('');
  const [context, setContext] = useState<{ x: number; y: number } | null>(null);
  const [allPrograms, setAllPrograms] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (game && !desktop.windows.length) desktop.open(game.phase === 'ended' ? 'grades' : 'chat');
  }, []);
  useEffect(() => {
    if (game?.phase === 'ended') desktop.open('grades');
  }, [game?.phase]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSleep(false);
        setTray(false);
        setContext(null);
        if (useDesktop.getState().startMenu) desktop.toggleStart();
      }
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        save();
        setSystemToast('游戏进度已保存到本机。');
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [save]);
  const open = (app: AppId) => {
    if (!game) setNewGame(true);
    else desktop.open(app);
  };
  const unread = game?.messages.filter((m) => !m.read && m.from === 'npc').length ?? 0;
  const currentNotice = game?.notices.at(-1);
  const appList = query
    ? shortcuts.filter((app) => APPS[app].short.toLowerCase().includes(query.toLowerCase()))
    : allPrograms
      ? shortcuts
      : (['browser', 'files', 'chat', 'games', 'gamebox', 'forum', 'qzone', 'study', 'diary'] as AppId[]);
  const taskApps = [
    ...pinned,
    ...desktop.windows
      .map((w) => w.app)
      .filter((app, i, apps) => !pinned.includes(app) && apps.indexOf(app) === i),
  ];
  return (
    <main
      className="desktop windows-seven"
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).closest('.aero-window,.taskbar,.modal-backdrop')) return;
        e.preventDefault();
        setContext({
          x: Math.min(e.clientX, window.innerWidth - 210),
          y: Math.min(e.clientY, window.innerHeight - 270),
        });
      }}
    >
      <div className="wallpaper" onClick={() => setContext(null)} />
      <nav className="desktop-shortcuts" aria-label="桌面快捷方式">
        {shortcuts.map((app) => (
          <button
            className="desktop-shortcut"
            aria-label={APPS[app].short}
            key={app}
            onClick={() => open(app)}
          >
            <span className="shortcut-icon-wrap">
              <AppIcon app={app} size="large" />
              {!['files', 'recycle'].includes(app) && <i>➚</i>}
              {app === 'chat' && unread > 0 && <b className="unread-badge">{unread > 99 ? '99+' : unread}</b>}
            </span>
            <span>{APPS[app].short}</span>
          </button>
        ))}
      </nav>
      {game && (
        <>
          <aside className="win-sticky-note" aria-label="大学生活便笺">
            <div>
              <span>＋</span>
              <b>九月，新生活。</b>
              <button onClick={() => open('campus')} title="打开大学生活">
                ↗
              </button>
            </div>
            <p>
              {game.profile.name}，{MAJORS[game.profile.major].short}
              <br />
              大一上学期 · 第 {weekOf(game.day)} 周
            </p>
            <dl>
              <dt>精力</dt>
              <dd>{Math.round(game.energy)} / 100</dd>
              <dt>生活费</dt>
              <dd>¥{game.money.toLocaleString()}</dd>
              <dt>今天</dt>
              <dd>
                {dateOf(game.day, true)}　{weekdays[game.day % 7]}
              </dd>
            </dl>
            <footer>
              <button onClick={() => open('schedule')}>看一眼课表</button>
              <button className="sleep-gadget" onClick={() => setSleep(true)}>
                {game.phase === 'ended' ? '学期回忆' : '结束今天'}
              </button>
            </footer>
          </aside>
          <aside className="win-clock-gadget" aria-label="Windows 桌面时钟">
            <div className="analog-clock">
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} style={{ transform: `rotate(${i * 30}deg)` }} />
              ))}
              <span
                className="hour-hand"
                style={{ transform: `rotate(${((game.minute / 60) % 12) * 30}deg)` }}
              />
              <span className="minute-hand" style={{ transform: `rotate(${(game.minute % 60) * 6}deg)` }} />
              <b />
            </div>
            <span>
              {clockText(game.minute)}　{weekdays[game.day % 7]}
            </span>
          </aside>
        </>
      )}
      {game && desktop.windows.map((win) => <Window key={win.key} win={win} />)}
      {desktop.startMenu && (
        <>
          <div className="menu-dismiss" onClick={desktop.toggleStart} />
          <section className="start-menu">
            <div className="start-apps">
              <div className="start-program-list">
                {appList.map((app) => (
                  <button key={app} onClick={() => open(app)}>
                    <AppIcon app={app} size="medium" />
                    <span>
                      {APPS[app].short}
                      <small>{APPS[app].subtitle}</small>
                    </span>
                  </button>
                ))}
              </div>
              <button
                className="all-programs"
                onClick={() => {
                  setAllPrograms(!allPrograms);
                  setQuery('');
                }}
              >
                {allPrograms ? '◀ 返回' : '▶ 所有程序'}
              </button>
              <div className="start-search">
                <input
                  placeholder="搜索程序和文件"
                  aria-label="查找校园程序"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Icon name="search" size={14} />
              </div>
            </div>
            <div className="start-right">
              <Avatar id="player" name={game?.profile.name ?? '新同学'} size={54} />
              <button className="start-username" onClick={() => open('grades')}>
                {game?.profile.name ?? '新同学'}
              </button>
              <button onClick={() => open('files')}>文档</button>
              <button onClick={() => open('qzone')}>图片</button>
              <button onClick={() => open('qzone')}>音乐</button>
              <hr />
              <button onClick={() => open('games')}>游戏</button>
              <button onClick={() => open('files')}>计算机</button>
              <button onClick={() => open('campus')}>大学生活</button>
              <hr />
              <button onClick={() => open('settings')}>控制面板</button>
              <button onClick={() => open('schedule')}>我的课程表</button>
              <button onClick={() => open('grades')}>学期档案</button>
              <button
                onClick={() => {
                  setNewGame(true);
                  desktop.toggleStart();
                }}
              >
                新建游戏
              </button>
              <div className="start-shutdown">
                <button
                  onClick={() => {
                    desktop.toggleStart();
                    setSleep(true);
                  }}
                >
                  关机
                </button>
                <button
                  title="保存进度"
                  onClick={() => {
                    save();
                    setSystemToast('游戏进度已保存。');
                    desktop.toggleStart();
                  }}
                >
                  ▶
                </button>
              </div>
            </div>
          </section>
        </>
      )}
      {context && (
        <>
          <div className="context-dismiss" onClick={() => setContext(null)} />
          <div className="win-context-menu" style={{ left: context.x, top: context.y }}>
            <button
              onClick={() => {
                desktop.windows.forEach((w) => desktop.minimize(w.key));
                setContext(null);
              }}
            >
              查看桌面
            </button>
            <button
              onClick={() => {
                setContext(null);
                setSystemToast('桌面已刷新。');
              }}
            >
              刷新
            </button>
            <hr />
            <button
              onClick={() => {
                open('files');
                setContext(null);
              }}
            >
              打开计算机
            </button>
            <button
              onClick={() => {
                open('settings');
                setContext(null);
              }}
            >
              个性化
            </button>
          </div>
        </>
      )}
      {currentNotice && !newGame && (
        <aside className="desktop-notification">
          <div>
            <AppIcon app={currentNotice.app} size="small" />
            <strong>{currentNotice.title}</strong>
            <button onClick={() => send({ type: 'dismiss', id: currentNotice.id })} aria-label="关闭通知">
              <X size={14} />
            </button>
          </div>
          <button
            className="notification-body"
            onClick={() => {
              open(currentNotice.app);
              send({ type: 'dismiss', id: currentNotice.id });
            }}
          >
            {currentNotice.text}
          </button>
          <small>单击此处查看消息</small>
        </aside>
      )}
      <footer className="taskbar">
        <button className="start-orb" aria-label="打开开始菜单" onClick={desktop.toggleStart}>
          <span>
            <WindowsFlag />
          </span>
        </button>
        <div className="taskbar-apps">
          {taskApps.map((app) => {
            const wins = desktop.windows.filter((w) => w.app === app).sort((a, b) => b.z - a.z);
            return (
              <button
                key={app}
                aria-label={APPS[app].name}
                title={APPS[app].name}
                className={`taskbar-app ${wins.length ? 'running' : ''} ${wins.some((w) => !w.minimized && w.z === desktop.topZ) ? 'active' : ''} ${wins.length > 1 ? 'stacked' : ''}`}
                onClick={() => {
                  const w = wins[0];
                  if (w && !w.minimized && w.z === desktop.topZ) desktop.minimize(w.key);
                  else if (w) desktop.focus(w.key);
                  else open(app);
                }}
              >
                <AppIcon app={app} size="medium" />
                {app === 'chat' && unread > 0 && (
                  <span className="task-unread">{unread > 99 ? '99+' : unread}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="system-tray">
          <button title="系统托盘" onClick={() => setTray(!tray)}>
            <ChevronUp size={13} />
          </button>
          <button
            className="input-language"
            title="输入法"
            onClick={() => setSystemToast('中文（简体）－微软拼音输入法')}
          >
            CH
          </button>
          <button
            className="win-network"
            title="本地连接"
            onClick={() => setSystemToast('本地连接：校园网 · 游戏离线运行')}
          >
            <span>▂▄▆█</span>
          </button>
          <button title="扬声器" onClick={() => setSystemToast('扬声器：静音')}>
            <Volume2 size={16} />
          </button>
          <button className="taskbar-clock" onClick={() => open('schedule')}>
            <b>{game ? clockText(game.minute) : '08:00'}</b>
            <span>
              {game ? dateOf(game.day).replace('年', '/').replace('月', '/').replace('日', '') : '2012/9/3'}
            </span>
          </button>
        </div>
        <button
          className="show-desktop"
          aria-label="显示桌面"
          onClick={() => desktop.windows.forEach((w) => desktop.minimize(w.key))}
        />
      </footer>
      {tray && (
        <div className="tray-popup">
          <AppIcon app="chat" size="small" />
          <Icon name="shield" />
          <span>自动保存已开启</span>
        </div>
      )}
      {systemToast && (
        <button className="system-toast" onClick={() => setSystemToast('')}>
          <Icon name="check" size={16} />
          {systemToast}
          <X size={13} />
        </button>
      )}
      {error && (
        <div className="error-banner" role="alert">
          <Icon name="alert" size={19} />
          {error}
          <button onClick={clearError}>关闭</button>
        </div>
      )}
      {sleep && game && (
        <div className="modal-backdrop">
          <div
            className="sleep-dialog win-shutdown-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="结束今天"
          >
            <div className="shutdown-title">
              <AppIcon app="files" size="small" />
              关闭 Windows<button onClick={() => setSleep(false)}>×</button>
            </div>
            <div className="shutdown-copy">
              <WindowsFlag />
              <span>
                <h2>{game.phase === 'ended' ? '2012 年秋季学期已结束' : '您希望计算机做什么？'}</h2>
                <p>
                  {game.phase === 'ended' ? '查看这个学期的成绩、朋友和校园回忆。' : '关机，结束今天的生活。'}
                </p>
              </span>
            </div>
            <div className="sleep-plan">
              <span>背景日会执行当前生活计划：</span>
              <b>
                学习 {game.plan.study}h · 游戏 {game.plan.gaming}h · 社交 {game.plan.social}h<br />
                兼职 {game.plan.work}h · 休息 {game.plan.rest}h
              </b>
            </div>
            <p className="shutdown-note">每天基本生活费 ¥12；每 28 天收到生活费 ¥650。</p>
            <div className="dialog-buttons">
              <Button onClick={() => setSleep(false)}>取消</Button>
              <Button
                className="primary"
                onClick={() => {
                  if (game.phase === 'ended') open('grades');
                  else send({ type: 'endDay' });
                  setSleep(false);
                }}
              >
                {game.phase === 'ended' ? '打开学期档案' : '关机睡觉，迎接新一天'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {newGame && <NewGame close={() => setNewGame(false)} />}
    </main>
  );
}
