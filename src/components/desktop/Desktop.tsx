import { useEffect, useState } from 'react';
import { Volume2, Wifi, ChevronUp, Power, X } from 'lucide-react';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { dateOf, clockText, weekdays, weekOf } from '../../engine/helpers';
import { MAJORS } from '../../content/world';
import type { AppId } from '../../engine/types';
import { APPS, AppIcon, Avatar, Button, Icon, Progress } from '../ui';
import { Window } from './Window';
import { NewGame } from '../game/NewGame';

const shortcuts: AppId[] = [
  'campus',
  'files',
  'chat',
  'browser',
  'schedule',
  'study',
  'forum',
  'games',
  'diary',
  'grades',
  'rankings',
  'settings',
];

export function Desktop() {
  const { game, send, save, error, clearError } = useGame();
  const desktop = useDesktop();
  const [newGame, setNewGame] = useState(!game);
  const [sleep, setSleep] = useState(false);
  const [tray, setTray] = useState(false);
  const [systemToast, setSystemToast] = useState('');
  useEffect(() => {
    if (game && !desktop.windows.length) desktop.open(game.phase === 'ended' ? 'grades' : 'campus');
  }, []);
  useEffect(() => {
    if (game?.phase === 'ended') desktop.open('grades');
  }, [game?.phase]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSleep(false);
        setTray(false);
      }
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        save();
        setSystemToast('本地存档已保存');
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
  return (
    <main className="desktop" onContextMenu={(e) => e.preventDefault()}>
      <div className="wallpaper" />
      <div className="desktop-vignette" />
      <div className="desktop-brand">
        <strong>
          Game<span>X</span>
        </strong>
        <span>大学生桌面模拟器</span>
        <small>那些回不去的日子，在这里继续。</small>
      </div>
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
              <i>↗</i>
              {app === 'chat' && unread > 0 && <b className="unread-badge">{unread > 99 ? '99+' : unread}</b>}
            </span>
            <span>{APPS[app].short}</span>
          </button>
        ))}
      </nav>
      {game && (
        <aside className="desktop-gadgets">
          <div className="calendar-gadget">
            <span className="gadget-weekday">
              {dateOf(game.day)} · {weekdays[game.day % 7]}
            </span>
            <strong>{clockText(game.minute)}</strong>
            <div>
              <Icon name={game.minute >= 1080 ? 'moon' : 'sun'} size={19} />
              <span>
                {game.day > 72 ? '入冬渐凉' : game.day > 36 ? '秋意正浓' : '晴朗的初秋'}
                <small>第 {weekOf(game.day)} 周 / 共 16 周</small>
              </span>
              <span className="gadget-temperature">
                {game.day > 72 ? '12' : game.day > 36 ? '21' : '28'}
                <sup>°C</sup>
              </span>
            </div>
          </div>
          <div className="profile-gadget">
            <div>
              <Avatar id="player" name={game.profile.name} size={40} />
              <span>
                <strong>{game.profile.name}</strong>
                <small>{MAJORS[game.profile.major].short} · 大一新生</small>
              </span>
              <button title="个人档案" onClick={() => open('grades')}>
                <Icon name="arrow" size={16} />
              </button>
            </div>
            <label>
              <span>今日精力</span>
              <b>{Math.round(game.energy)} / 100</b>
            </label>
            <Progress value={game.energy} color="#abd6b5" label="今日精力" />
            <div className="gadget-wallet">
              <Icon name="money" size={15} />
              <span>生活费</span>
              <b>¥{game.money.toLocaleString()}</b>
            </div>
            <Button className="sleep-gadget" icon="moon" onClick={() => setSleep(true)}>
              {game.phase === 'ended' ? '查看学期回忆' : '结束今天，好好睡一觉'}
            </Button>
          </div>
          <div className="desktop-quote">
            “没有标准答案，
            <br />
            &nbsp;&nbsp;每一种青春都算数。”<small>— 南川大学 · 2012</small>
          </div>
        </aside>
      )}
      {game && desktop.windows.map((win) => <Window key={win.key} win={win} />)}
      {desktop.startMenu && (
        <>
          <div className="menu-dismiss" onClick={desktop.toggleStart} />
          <section className="start-menu">
            <div className="start-apps">
              <h3>常用程序</h3>
              {shortcuts.slice(0, 9).map((app) => (
                <button key={app} onClick={() => open(app)}>
                  <AppIcon app={app} size="small" />
                  {APPS[app].short}
                  <Icon name="arrow" size={13} />
                </button>
              ))}
              <div className="start-search">
                <Icon name="search" size={15} />
                <input
                  placeholder="查找校园程序"
                  aria-label="查找校园程序"
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    if (value) {
                      const app = shortcuts.find((app) => APPS[app].short.includes(value));
                      if (app && value.length >= 2) open(app);
                    }
                  }}
                />
              </div>
            </div>
            <div className="start-right">
              <Avatar id="player" name={game?.profile.name ?? '新'} size={56} />
              <strong>{game?.profile.name ?? '新同学'}</strong>
              {(['files', 'diary', 'grades', 'rankings', 'settings'] as AppId[]).map((app) => (
                <button key={app} onClick={() => open(app)}>
                  {APPS[app].short}
                </button>
              ))}
              <button
                onClick={() => {
                  save();
                  setSystemToast('游戏进度已保存到本机');
                  desktop.toggleStart();
                }}
              >
                保存进度
              </button>
              <button
                onClick={() => {
                  setNewGame(true);
                  desktop.toggleStart();
                }}
              >
                新建游戏
              </button>
              <Button
                icon="moon"
                onClick={() => {
                  desktop.toggleStart();
                  setSleep(true);
                }}
              >
                结束今天
              </Button>
            </div>
          </section>
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
          <small>南川校园 · 点击查看</small>
        </aside>
      )}
      <footer className="taskbar">
        <button className="start-orb" aria-label="打开开始菜单" onClick={desktop.toggleStart}>
          <span>
            <i />
            <i />
            <i />
            <i />
          </span>
        </button>
        <div className="taskbar-separator" />
        <div className="taskbar-apps">
          {(['campus', 'chat', 'browser', 'games', 'files'] as AppId[]).map((app) => {
            const wins = desktop.windows.filter((w) => w.app === app);
            return (
              <button
                key={app}
                aria-label={APPS[app].name}
                title={APPS[app].name}
                className={`taskbar-app ${wins.length ? 'running' : ''} ${wins.some((w) => !w.minimized && w.z === desktop.topZ) ? 'active' : ''}`}
                onClick={() => {
                  const w = wins[0];
                  if (w && !w.minimized && w.z === desktop.topZ) desktop.minimize(w.key);
                  else open(app);
                }}
              >
                <AppIcon app={app} size="medium" />
                {app === 'chat' && unread > 0 && <span className="task-unread">{unread}</span>}
              </button>
            );
          })}
          {desktop.windows
            .filter((w) => !['campus', 'chat', 'browser', 'games', 'files'].includes(w.app))
            .map((w) => (
              <button
                key={w.key}
                className={`taskbar-app running ${w.z === desktop.topZ && !w.minimized ? 'active' : ''}`}
                title={APPS[w.app].name}
                aria-label={APPS[w.app].name}
                onClick={() =>
                  w.z === desktop.topZ && !w.minimized ? desktop.minimize(w.key) : desktop.focus(w.key)
                }
              >
                <AppIcon app={w.app} size="medium" />
              </button>
            ))}
        </div>
        <span className="taskbar-era">2012 · 青春正在进行</span>
        <div className="system-tray">
          <button title="系统托盘" onClick={() => setTray(!tray)}>
            <ChevronUp size={15} />
          </button>
          <button title="离线运行状态" onClick={() => setSystemToast('校园网络已连接 · 游戏完全在本地运行')}>
            <Wifi size={16} />
          </button>
          <button title="声音设置" onClick={() => setSystemToast('当前为静音模式，安心学习、自由游玩')}>
            <Volume2 size={16} />
          </button>
          <button
            className="tray-power"
            title="保存进度"
            onClick={() => {
              save();
              setSystemToast('本地存档已保存');
            }}
          >
            <Power size={15} />
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
          <Icon name="shield" />
          <span>本地运行 · 自动保存开启</span>
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
          <div className="sleep-dialog" role="dialog" aria-modal="true" aria-label="结束今天">
            <span className="sleep-moon">
              <Icon name="moon" size={33} />
            </span>
            <h2>{game.phase === 'ended' ? '秋天的故事，写完了。' : '今天，就到这里吧。'}</h2>
            <p>
              {game.phase === 'ended'
                ? '看看这个学期留下了什么，也许下一次会有不一样的人生。'
                : '电脑休息了，校园还会继续。背景日将按照你的生活计划，真实模拟学习、娱乐与人际关系。'}
            </p>
            <div className="sleep-plan">
              <span>当前生活计划 / 每日课余</span>
              <b>
                学习 {game.plan.study}h · 游戏 {game.plan.gaming}h · 社交 {game.plan.social}h<br />
                兼职 {game.plan.work}h · 休息 {game.plan.rest}h
              </b>
            </div>
            <small>基本生活费 ¥12 / 日 · 每 28 天收到生活费 ¥650</small>
            <div className="dialog-buttons">
              <Button onClick={() => setSleep(false)}>再待一会儿</Button>
              <Button
                className="primary"
                icon="moon"
                onClick={() => {
                  if (game.phase === 'ended') open('grades');
                  else send({ type: 'endDay' });
                  setSleep(false);
                }}
              >
                {' '}
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
