import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { BACKUP_KEY, serialize } from '../../engine/save';
import { dateOf, weekOf } from '../../engine/helpers';
import { MAJORS, RANKINGS } from '../../content/world';
import { sortLeaderboard } from '../../systems/settlement';
import { Avatar, Button, Empty, Icon, Progress, Tag } from '../ui';
import { NewGame } from '../game/NewGame';

export function downloadFile(name: string, text: string, mime = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Files() {
  const s = useGame((x) => x.game)!;
  const open = useDesktop((x) => x.open);
  const [folder, setFolder] = useState('我的电脑');
  const [file, setFile] = useState<string | null>(null);
  const files =
    folder === '校园收藏'
      ? s.inventory
      : folder === '我的文档'
        ? ['新生入学须知.txt', '我的课程表.lnk', '校园回忆.lnk', '游戏存档.json']
        : ['我的文档', '校园收藏', '学期档案'];
  const inspect = (name: string) => {
    if (name === '我的文档' || name === '校园收藏' || name === '学期档案') {
      if (name === '学期档案') open('grades');
      else setFolder(name);
    } else if (name.includes('课程表')) open('schedule');
    else if (name.includes('回忆')) open('diary');
    else if (name.includes('存档')) downloadFile(`南川大学-${s.profile.name}.json`, serialize(s));
    else setFile(name);
  };
  return (
    <>
      <div className="explorer-toolbar">
        <button
          className="icon-button"
          onClick={() => {
            setFolder('我的电脑');
            setFile(null);
          }}
        >
          ←
        </button>
        <div className="address-bar">
          <Icon name="monitor" size={14} />
          计算机
          <Icon name="arrow" size={12} />
          {folder}
        </div>
      </div>
      <div className="files-layout">
        <aside className="files-sidebar">
          <b>收藏夹</b>
          {['我的电脑', '我的文档', '校园收藏'].map((f) => (
            <button
              className={f === folder ? 'selected' : ''}
              key={f}
              onClick={() => {
                setFolder(f);
                setFile(null);
              }}
            >
              <Icon name={f === '我的电脑' ? 'monitor' : 'folder'} size={17} />
              {f}
            </button>
          ))}
          <b>大学生活</b>
          <button onClick={() => open('grades')}>
            <Icon name="graduation" size={17} />
            学期档案
          </button>
          <button onClick={() => open('diary')}>
            <Icon name="diary" size={17} />
            我的日记
          </button>
          <button onClick={() => open('settings')}>
            <Icon name="settings" size={17} />
            存档管理
          </button>
        </aside>
        <div className="files-main scroll-area">
          <h3>{folder}</h3>
          {folder === '我的电脑' && (
            <div className="disk-card">
              <Icon name="monitor" size={39} />
              <span>
                <strong>校园生活 (C:)</strong>
                <Progress value={((s.day + 1) / 112) * 100} color="#6f99bd" />
                <small>已记录 {s.day + 1} 天 / 首个学期共 112 天</small>
              </span>
            </div>
          )}
          <div className="file-grid">
            {files.map((name) => (
              <button key={name} onClick={() => inspect(name)}>
                <Icon
                  name={
                    name === '我的文档' || name === '校园收藏' || name === '学期档案'
                      ? 'folder'
                      : name.includes('照片') || name.includes('合影') || name.includes('合照')
                        ? 'camera'
                        : name.includes('信') || name.includes('便条')
                          ? 'mail'
                          : 'file'
                  }
                  size={42}
                />
                <span>{name}</span>
              </button>
            ))}
          </div>
          {file && (
            <div className="file-preview">
              <div>
                <Icon name="file" size={18} />
                <h3>{file}</h3>
                <button onClick={() => setFile(null)}>×</button>
              </div>
              <p>
                {file === '新生入学须知.txt'
                  ? '欢迎来到南川大学！本学期共16周。每天的时间和精力有限，记得按时上课、完成作业，也别错过与朋友相处的机会。生活计划会在背景日自动执行。没有规定的人生目标，愿你度过自己的秋天。'
                  : `这是你真实经历中留下的“${file}”。它来自入学或校园事件，会随存档一起保留。多年以后，它也许会让你想起这个秋天。`}
              </p>
              <small>存放于本地存档 · 不连接外部网盘</small>
            </div>
          )}
          <div className="file-status">{files.length} 个项目 · 点击打开 · 收藏来自真实游戏经历</div>
        </div>
      </div>
    </>
  );
}

export function Diary() {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const [tab, setTab] = useState('memories');
  const [text, setText] = useState(s.diary.find((d) => d.day === s.day)?.text ?? '');
  const [day, setDay] = useState(s.day);
  const records = s.history
    .filter((h) => !['学习', '日常'].includes(h.kind))
    .slice()
    .reverse();
  const changeDay = (value: number) => {
    setDay(value);
    setText(s.diary.find((d) => d.day === value)?.text ?? '');
  };
  return (
    <>
      <div className="diary-header">
        <Icon name="diary" size={29} />
        <span>
          <h1>我的大学日记</h1>
          <p>有些日子平平无奇，回过头却闪闪发光。</p>
        </span>
        <span>2012 · 秋</span>
      </div>
      <div className="diary-tabs">
        <button className={tab === 'memories' ? 'selected' : ''} onClick={() => setTab('memories')}>
          校园回忆
        </button>
        <button
          className={tab === 'write' ? 'selected' : ''}
          onClick={() => {
            setTab('write');
            changeDay(s.day);
          }}
        >
          写下今天
        </button>
        <button className={tab === 'entries' ? 'selected' : ''} onClick={() => setTab('entries')}>
          我的手记 <small>{s.diary.length}</small>
        </button>
        <Button
          className="push-right"
          icon="file"
          onClick={() =>
            downloadFile(
              `我的大学回忆-${s.profile.name}.txt`,
              `${s.profile.name}的大学 · 2012秋\n种子：${s.seed}\n\n${records
                .slice()
                .reverse()
                .map((h) => `${dateOf(h.day)} 第${weekOf(h.day)}周\n${h.text}`)
                .join(
                  '\n\n',
                )}\n\n我的手记\n${s.diary.map((d) => `${dateOf(d.day)}\n${d.text}`).join('\n\n')}`,
              'text/plain;charset=utf-8',
            )
          }
        >
          导出回忆
        </Button>
      </div>
      <div className="diary-content scroll-area">
        {tab === 'memories' ? (
          <>
            <div className="memory-intro">
              <span>致我们的大学时光</span>
              <h2>这个秋天，发生过的故事。</h2>
              <p>这里没有编造的精彩，只有你确实走过的日子。</p>
            </div>
            <div className="memory-timeline">
              {records.map((h) => (
                <div className="memory-entry" key={h.id}>
                  <span className="memory-date">
                    <b>{dateOf(h.day, true)}</b>
                    <small>第 {weekOf(h.day)} 周</small>
                  </span>
                  <i />
                  <div>
                    <Tag color={h.kind === '恋爱' ? 'pink' : h.kind === '竞技' ? 'blue' : ''}>{h.kind}</Tag>
                    <p>{h.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : tab === 'write' ? (
          <div className="diary-paper">
            <div>
              <b>
                {dateOf(day)}　
                {['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'][day % 7]}
              </b>
              <span>天气：{day > 72 ? '渐凉' : '晴'}</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              placeholder="今天的课、某个人的话，或是食堂一顿好吃的饭……想记什么都可以。"
              aria-label="日记内容"
              readOnly={day !== s.day}
            />
            <footer>
              <small>{text.length} / 2000 字</small>
              {day === s.day ? (
                <Button className="primary" icon="check" onClick={() => send({ type: 'diary', text })}>
                  保存这一天
                </Button>
              ) : (
                <Button onClick={() => changeDay(s.day)}>回到今天</Button>
              )}
            </footer>
          </div>
        ) : s.diary.length ? (
          <div className="diary-entry-list">
            {[...s.diary].reverse().map((d) => (
              <button
                key={d.day}
                onClick={() => {
                  changeDay(d.day);
                  setTab('write');
                }}
              >
                <Icon name="diary" size={20} />
                <span>
                  <b>{dateOf(d.day)}</b>
                  <small>{d.text.slice(0, 80)}</small>
                </span>
                <Icon name="arrow" size={15} />
              </button>
            ))}
          </div>
        ) : (
          <Empty icon="diary" title="第一篇日记，还在等你。" text="写下今天的小事，未来的自己会喜欢的。" />
        )}
      </div>
    </>
  );
}

export function Rankings() {
  const s = useGame((x) => x.game)!;
  const history = useGame((x) => x.history);
  const [kind, setKind] = useState('academic');
  const [sameSeed, setSameSeed] = useState(false);
  const def = RANKINGS.find((r) => r.id === kind)!;
  const ranked = sortLeaderboard(history, kind, sameSeed ? s.seed : undefined);
  return (
    <>
      <div className="ranking-header">
        <Icon name="trophy" size={34} />
        <span>
          <h1>校园风云榜</h1>
          <p>每一种认真生活的方式，都有自己的光。</p>
        </span>
        <Tag color="gold">本地历史记录</Tag>
      </div>
      <div className="ranking-tabs">
        {RANKINGS.map((r) => (
          <button key={r.id} onClick={() => setKind(r.id)} className={kind === r.id ? 'selected' : ''}>
            {r.name}
          </button>
        ))}
      </div>
      <div className="scroll-area app-padding">
        <div className="rank-filter">
          <span>{def.note}</span>
          <label>
            <input type="checkbox" checked={sameSeed} onChange={(e) => setSameSeed(e.target.checked)} />
            只看相同种子
          </label>
        </div>
        {ranked.length ? (
          <>
            <div className="rank-podium">
              <span>NO. 01</span>
              <Icon name="trophy" size={40} />
              <h2>{ranked[0].name}</h2>
              <p>
                {MAJORS[ranked[0].major].short} · {ranked[0].titles.join(' / ')}
              </p>
              <strong>
                {ranked[0].ranking[kind]}
                <small>{def.unit}</small>
              </strong>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>名次</th>
                  <th>同学</th>
                  <th>人生标签</th>
                  <th>种子</th>
                  <th>{def.name}成绩</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((record, i) => (
                  <tr key={record.id}>
                    <td>
                      <span className={`rank-number ${i < 3 ? 'top' : ''}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td>
                      <b>{record.name}</b>
                      <small className="table-secondary">{MAJORS[record.major].short}</small>
                    </td>
                    <td>{record.titles.slice(0, 2).join(' · ')}</td>
                    <td>
                      <code>{record.seed}</code>
                    </td>
                    <td>
                      <strong>{record.ranking[kind]}</strong> {def.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <Empty
            icon="trophy"
            title="你的第一个秋天，还在进行中。"
            text={
              sameSeed
                ? '这个种子还没有完整学期记录。完成学期后，就能比较同一个起点的不同人生。'
                : '完成一个学期后，真实成绩会自动记录在这里。去过好今天，荣誉留给未来。'
            }
          />
        )}
        <div className="info-box">
          此榜单仅包含当前浏览器中已完成的学期，不是全网排名。六个榜单独立计分，同一个人可以出现在多个榜单。导出的游戏存档不包含其他局的历史排行榜。
        </div>
      </div>
    </>
  );
}

export function SettingsApp() {
  const { game: s, save, load, importSave, savedAt, error } = useGame();
  const [newGame, setNewGame] = useState(false);
  const [retry, setRetry] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  if (!s) return null;
  return (
    <>
      <div className="app-header">
        <div>
          <Icon name="settings" size={25} />
          <span>
            <h2>系统设置</h2>
            <p>把你的大学时光，好好保存下来。</p>
          </span>
        </div>
        <Tag color="green">v1.0 · 本地规则引擎</Tag>
      </div>
      <div className="scroll-area app-padding">
        <section className="settings-section">
          <h3>
            <Icon name="folder" size={18} />
            游戏存档
          </h3>
          <div className="save-status">
            <Icon name="shield" size={28} />
            <span>
              <b>自动存档已开启</b>
              <small>
                {savedAt
                  ? `最近保存：${new Date(savedAt).toLocaleTimeString('zh-CN', { hour12: false })}`
                  : '每次有效操作后自动保存到此浏览器'}
              </small>
            </span>
            <Button onClick={save}>立即保存</Button>
          </div>
          <div className="settings-buttons">
            <Button
              icon="file"
              onClick={() => downloadFile(`大学生桌面模拟器-${s.profile.name}-${s.seed}.json`, serialize(s))}
            >
              导出存档
            </Button>
            <Button icon="folder" onClick={() => input.current?.click()}>
              导入存档
            </Button>
            <Button onClick={load}>读取本地存档</Button>
            <Button
              onClick={() => {
                try {
                  const backup = localStorage.getItem(BACKUP_KEY);
                  if (backup) {
                    importSave(backup);
                  } else useGame.setState({ error: '还没有自动备份。开启新游戏或导入存档前会备份原进度。' });
                } catch {
                  useGame.setState({ error: '无法访问浏览器备份。' });
                }
              }}
            >
              恢复上次备份
            </Button>
            <input
              ref={input}
              className="hidden-input"
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  if (f.size > 5_000_000) useGame.setState({ error: '存档文件过大。' });
                  else importSave(await f.text());
                }
                e.target.value = '';
              }}
            />
          </div>
          <p className="muted">
            游戏存档只在当前浏览器中。清理网站数据可能丢失进度，请定期导出文件备份。导入会校验数据，失败时保留当前游戏。
          </p>
          {error && <div className="info-box warning">{error}</div>}
        </section>
        <section className="settings-section">
          <h3>
            <Icon name="leaf" size={18} />
            故事种子
          </h3>
          <div className="seed-display">
            <code>{s.seed}</code>
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(s.seed);
                  setCopied(true);
                } catch {
                  setCopied(false);
                  useGame.setState({ error: '浏览器未允许复制，请选中种子文本手动复制。' });
                }
              }}
            >
              {copied ? '已复制' : '复制种子'}
            </Button>
          </div>
          <p className="muted">
            相同种子与相同操作序列，会得到一致的核心结果。姓名不影响随机世界，专业和选择会改变你的生活。
          </p>
          <Button
            icon="leaf"
            onClick={() => {
              setRetry(true);
              setNewGame(true);
            }}
          >
            相同种子重新挑战
          </Button>
        </section>
        <section className="settings-section">
          <h3>
            <Icon name="help" size={18} />
            操作小贴士
          </h3>
          <ul className="help-list">
            <li>点击桌面图标打开应用；拖动标题栏移动窗口，双击标题栏最大化，拖动右下角调整大小。</li>
            <li>任务栏可以切换和最小化应用。Q聊支持双击联系人打开独立会话。</li>
            <li>
              现实时间不会推动游戏。所有活动共用游戏时钟；正式比赛会锁定其他活动，匹配等待期间可以聊天。
            </li>
            <li>使用“结束今天”推进学期，背景日按生活计划自动执行。生活计划在“我的校园”中设置。</li>
            <li>
              精力不足时吃饭或午休；每天有基本生活费，每 28 天收到一次生活费。学习、关系与工作都存在边际递减。
            </li>
            <li>Ctrl + S 手动存档。所有 NPC 由本地规则驱动，无需任何 API 或联网账号。</li>
          </ul>
        </section>
        <section className="settings-section">
          <h3>
            <Icon name="monitor" size={18} />
            开始另一段大学时光
          </h3>
          {confirm ? (
            <div className="confirm-new">
              <p>新建会替换当前进度，并自动保留一份备份。建议先导出存档。</p>
              <Button onClick={() => setConfirm(false)}>取消</Button>
              <Button
                className="primary"
                onClick={() => {
                  setRetry(false);
                  setNewGame(true);
                  setConfirm(false);
                }}
              >
                填写新的入学档案
              </Button>
            </div>
          ) : (
            <Button onClick={() => setConfirm(true)}>新建游戏</Button>
          )}
        </section>
        <div className="settings-footer">
          GameX · Campus Desktop Simulator
          <br />
          原创虚构校园与应用。首版开放 2012 秋季学期，四年模式留待后续扩展。
        </div>
      </div>
      {newGame &&
        createPortal(
          <NewGame retrySeed={retry ? s.seed : undefined} close={() => setNewGame(false)} />,
          document.body,
        )}
    </>
  );
}
