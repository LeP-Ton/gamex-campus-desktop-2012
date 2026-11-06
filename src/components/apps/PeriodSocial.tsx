import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { NPCS } from '../../content/world';
import { absoluteTime, clockText, dateOf, npcDef, relationValue } from '../../engine/helpers';
import { AppIcon, Avatar, Button, Empty, Icon, Progress } from '../ui';
import { BrowserChrome } from './BrowserChrome';

function RelationPanel({ id }: { id: string }) {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const n = s.npcs.find((n) => n.id === id)!;
  const def = npcDef(id);
  return (
    <div className="qq-relation-details">
      <h4>{def.name}的个人资料</h4>
      <p>
        {def.age} 岁 · {def.role}
      </p>
      <p>兴趣：{def.interests.join('、')}</p>
      <p>心情：{n.need}</p>
      {[
        { name: '熟悉', value: n.familiar },
        { name: '信任', value: n.trust },
        { name: '共同经历', value: n.shared },
      ].map((r) => (
        <div className="relation-meter" key={r.name}>
          <label>
            {r.name}
            <b>{Math.round(r.value)}</b>
          </label>
          <Progress value={r.value} color="#48a1cb" />
        </div>
      ))}
      <div className="social-buttons">
        <Button onClick={() => send({ type: 'social', npc: id, kind: 'walk' })}>
          校园散步 <small>60 分钟</small>
        </Button>
        <Button onClick={() => send({ type: 'social', npc: id, kind: 'coffee' })}>
          喝杯热饮 <small>¥16</small>
        </Button>
        {def.romance && (
          <>
            <Button onClick={() => send({ type: 'social', npc: id, kind: 'date' })}>
              安排约会 <small>¥35</small>
            </Button>
            <Button
              onClick={() =>
                send({ type: 'social', npc: id, kind: n.stage === '交往' ? 'breakup' : 'confess' })
              }
            >
              {n.stage === '交往' ? '认真谈谈，结束关系' : '认真表达心意'}
            </Button>
          </>
        )}
      </div>
      <h4>最近记得的事</h4>
      {[...n.longMemories, ...n.memories].slice(-2).map((m, i) => (
        <p className="qq-memory" key={i}>
          {dateOf(m.day, true)}　{m.text}
        </p>
      ))}
      {s.promises
        .filter((p) => p.npc === id && !p.fulfilled)
        .map((p, i) => (
          <p className="qq-promise" key={i}>
            约定：{dateOf(p.due, true)}前一起
            {p.activity === 'study' ? '学习' : p.activity === 'gaming' ? '打游戏' : '活动'}
          </p>
        ))}
    </div>
  );
}

export function QQ({ npc }: { npc?: string }) {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const desktop = useDesktop();
  const [selected, setSelected] = useState('haoran');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('好友');
  const [expanded, setExpanded] = useState(true);
  const [text, setText] = useState('');
  const [info, setInfo] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const [font, setFont] = useState(false);
  const [records, setRecords] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const group = npc === 'class-group';
  const person = s.npcs.find((n) => n.id === (npc ?? selected));
  const def = person ? npcDef(person.id) : null;
  const messages = group
    ? s.messages.filter((m) => ['zhou', 'xiaoyu', 'zichen'].includes(m.npc) && m.from === 'npc')
    : s.messages.filter((m) => m.npc === npc);
  useEffect(() => {
    if (npc && !group) send({ type: 'read', npc });
  }, [npc]);
  useEffect(() => {
    if (npc) end.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, npc]);
  if (!npc)
    return (
      <div className="qq-main-panel">
        <div className="qq-profile">
          <Avatar id="player" name={s.profile.name} size={49} />
          <div>
            <strong>
              {s.profile.name} <span>▼</span>
            </strong>
            <span className="qq-level">
              ☀ <i>☆</i> <b>LV 1</b>
            </span>
            <small>这次，想把大学过得不一样。</small>
          </div>
          <span className="qq-weather">
            ☀<small>南川 28℃</small>
          </span>
        </div>
        <div className="qq-shortcuts">
          <button onClick={() => desktop.open('qzone')} title="QQ空间">
            <AppIcon app="qzone" size="small" />
          </button>
          <button onClick={() => desktop.open('forum')} title="人人网">
            <AppIcon app="forum" size="small" />
          </button>
          <button onClick={() => desktop.open('diary')} title="我的日记">
            ✉
          </button>
          <button onClick={() => desktop.open('games')} title="英雄联盟">
            ♟
          </button>
          <button onClick={() => desktop.open('files')} title="我的文件">
            ▣
          </button>
          <span>{s.profile.name.length + 20120903}</span>
        </div>
        <div className="qq-search">
          <input
            aria-label="搜索联系人"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索联系人、群、讨论组"
          />
          <Icon name="search" size={13} />
        </div>
        <nav className="qq-contact-tabs">
          {['好友', '群', '最近联系人'].map((t, i) => (
            <button aria-label={t} className={tab === t ? 'selected' : ''} key={t} onClick={() => setTab(t)}>
              <Icon name={i === 0 ? 'users' : i === 1 ? 'chat' : 'clock'} size={19} />
            </button>
          ))}
        </nav>
        <div className="qq-main-contacts">
          {tab === '群' ? (
            <>
              <button className="qq-group-heading" onClick={() => setExpanded(!expanded)}>
                {expanded ? '▼' : '▶'} 我的群 [1/1]
              </button>
              {expanded && (
                <button className="contact" onClick={() => desktop.open('chat', 'class-group')}>
                  <span className="qq-group-avatar">群</span>
                  <span>
                    <b>2012 级新生班</b>
                    <small>课程通知 · 班级公告</small>
                  </span>
                </button>
              )}
            </>
          ) : (
            <>
              <button className="qq-group-heading" onClick={() => setExpanded(!expanded)}>
                {expanded ? '▼' : '▶'} 我的大学 [{s.npcs.filter((n) => n.activity !== '补觉').length}/8]
              </button>
              {expanded &&
                NPCS.filter(
                  (n) =>
                    (n.name.includes(search) || n.role.includes(search)) &&
                    (tab !== '最近联系人' || s.messages.some((m) => m.npc === n.id)),
                ).map((n) => {
                  const state = s.npcs.find((p) => p.id === n.id)!;
                  const last = [...s.messages].reverse().find((m) => m.npc === n.id);
                  const count = s.messages.filter(
                    (m) => m.npc === n.id && !m.read && m.from === 'npc',
                  ).length;
                  return (
                    <button
                      aria-label={`与${n.name}聊天`}
                      className={`contact ${selected === n.id ? 'selected' : ''}`}
                      key={n.id}
                      onClick={() => {
                        setSelected(n.id);
                        if (window.innerWidth < 700) desktop.open('chat', n.id);
                      }}
                      onDoubleClick={() => desktop.open('chat', n.id)}
                    >
                      <span className="contact-avatar">
                        <Avatar id={n.id} size={36} />
                        <i className={`presence ${state.activity === '补觉' ? 'offline' : ''}`} />
                      </span>
                      <span>
                        <b>
                          {n.name} <i>({state.stage})</i>
                        </b>
                        <small>{last?.text ?? n.role}</small>
                      </span>
                      {count > 0 && <em>{count}</em>}
                    </button>
                  );
                })}
              <button className="qq-group-heading" onClick={() => desktop.open('chat', 'class-group')}>
                ▶ 同学群 [1/1]
              </button>
              <span className="qq-group-heading disabled">▶ 陌生人 [0/0]</span>
              <span className="qq-group-heading disabled">▶ 黑名单 [0/0]</span>
            </>
          )}
        </div>
        <div className="qq-service-icons">
          <AppIcon app="chat" size="small" />
          <button onClick={() => desktop.open('qzone')} title="QQ空间">
            ★
          </button>
          <button onClick={() => desktop.open('games')} title="QQ游戏">
            ♟
          </button>
          <button onClick={() => desktop.open('diary')} title="日记">
            ♫
          </button>
          <button onClick={() => desktop.open('browser')} title="网页">
            🌐
          </button>
          <button onClick={() => desktop.open('gamebox')} title="英雄联盟盒子">
            ▦
          </button>
        </div>
        <footer className="qq-main-footer">
          <button onClick={() => desktop.open('settings')}>☰　主菜单</button>
          <button onClick={() => desktop.open('settings')} title="系统设置">
            ⚙
          </button>
          <button onClick={() => desktop.open('chat', selected)}>发送消息</button>
        </footer>
      </div>
    );
  return (
    <div className="qq-chat-dialog">
      <header className="qq-dialog-profile">
        <Avatar id={npc} size={43} />
        <div>
          <h3>{group ? '2012 级新生班' : def?.name}</h3>
          <small>{group ? '大家来自不同的地方，在南川相遇。' : def?.goal}</small>
        </div>
        <span>{group ? '群公告' : person?.stage}</span>
      </header>
      <nav className="qq-chat-tools">
        <button title="视频（未连接摄像头）" disabled>
          ▣
        </button>
        <button title="语音（当前静音）" disabled>
          ♩
        </button>
        <button title="发送文件" onClick={() => desktop.open('files')}>
          ▤
        </button>
        <button title="访问QQ空间" onClick={() => desktop.open('qzone', group ? undefined : npc)}>
          ★
        </button>
        {!group && (
          <button title="人物关系与邀约" aria-label="人物关系与邀约" onClick={() => setInfo(!info)}>
            ☻
          </button>
        )}
        <button title="消息记录" onClick={() => setRecords(!records)}>
          ▣ <span>消息记录</span>
        </button>
        <button
          className="push-right"
          title="独立聊天窗口"
          aria-label="独立聊天窗口"
          onClick={() => desktop.focus(`chat-${npc}`)}
        >
          ↗
        </button>
      </nav>
      <div className="qq-chat-columns">
        <div className="qq-dialog-main">
          <div className="chat-body scroll-area">
            {messages.map((m, i) => (
              <div className={`message ${m.from === 'player' ? 'outgoing' : ''}`} key={m.id}>
                {(i === 0 || messages[i - 1].day !== m.day) && (
                  <div className="message-date">{dateOf(m.day)}</div>
                )}
                <div className="message-meta">
                  <span>{m.from === 'player' ? s.profile.name : npcDef(m.npc).name}</span>
                  <small>{clockText(m.minute)}:00</small>
                </div>
                <div className="message-bubble">{m.text}</div>
                {m.intent && m.expires && (
                  <small className="message-expiry">
                    {absoluteTime(s) > m.expires
                      ? '邀请时间已过，仍可继续聊天'
                      : `这次安排还有 ${Math.ceil((m.expires - absoluteTime(s)) / 60)} 小时`}
                  </small>
                )}
              </div>
            ))}
            <div ref={end} />
          </div>
          {records && (
            <div className="qq-records-strip">本地消息记录：共 {messages.length} 条，点击工具栏可收起。</div>
          )}
          {!group && (
            <>
              <div className="qq-format-toolbar">
                <button className={font ? 'selected' : ''} title="字体" onClick={() => setFont(!font)}>
                  <u>A</u>
                </button>
                <button title="表情" onClick={() => setEmoji(!emoji)}>
                  ☺
                </button>
                <button title="截图（当前环境不可用）" disabled>
                  ✂
                </button>
                <span />
                <button onClick={() => send({ type: 'chat', npc, reply: 'support' })}>认真回应</button>
                <button onClick={() => send({ type: 'chat', npc, reply: 'promise' })}>约好一起</button>
                <button onClick={() => send({ type: 'chat', npc, reply: 'decline' })}>这次有安排</button>
              </div>
              {emoji && (
                <div className="qq-emoticons">
                  {['微笑', '憨笑', '握手', '加油', '咖啡', '难过', '再见', '太阳'].map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        setText(text + `[${e}]`);
                        setEmoji(false);
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
              <form
                className="chat-compose"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim()) {
                    send({ type: 'chat', npc, reply: 'custom', text });
                    setText('');
                  }
                }}
              >
                <textarea
                  className={font ? 'qq-large-font' : ''}
                  aria-label="聊天消息"
                  value={text}
                  maxLength={200}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter' && text.trim()) {
                      send({ type: 'chat', npc, reply: 'custom', text });
                      setText('');
                    }
                  }}
                />
                <div>
                  <small>交流 15 分钟 · 精力 -2</small>
                  <Button type="button" onClick={() => desktop.close(`chat-${npc}`)}>
                    关闭(C)
                  </Button>
                  <Button type="submit" disabled={!text.trim()}>
                    发送(S)　⌄
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
        <aside className="qq-chat-aside scroll-area">
          {group ? (
            <>
              <h4>群公告</h4>
              <p>新生课程、作业与考试安排，请以教务系统为准。</p>
              <h4>群成员（8）</h4>
              {NPCS.map((n) => (
                <button key={n.id} onClick={() => desktop.open('chat', n.id)}>
                  <Avatar id={n.id} size={24} />
                  {n.name}
                </button>
              ))}
            </>
          ) : info ? (
            <RelationPanel id={npc} />
          ) : (
            <>
              <div className="qq-show">
                <Avatar id={npc} size={128} />
                <div className="qq-show-body" />
                <span>{def?.name}的 QQ秀</span>
              </div>
              <h4>好友动态</h4>
              <p>{person?.activity}</p>
              <p>{person?.need}</p>
              <button className="qq-profile-link" onClick={() => setInfo(true)}>
                查看资料与邀约 &gt;
              </button>
              <button className="qq-space-link" onClick={() => desktop.open('qzone', npc)}>
                <AppIcon app="qzone" size="small" />
                进入TA的QQ空间
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export function Renren() {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const open = useDesktop((x) => x.open);
  const [tab, setTab] = useState('新鲜事');
  const [text, setText] = useState('');
  const [commenting, setCommenting] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const posts = s.posts
    .filter(
      (p) =>
        !p.category.startsWith('空间') &&
        (tab === '我的状态' ? p.author === 'player' : tab === '游戏动态' ? p.category === '游戏专区' : true),
    )
    .slice()
    .reverse();
  return (
    <>
      <BrowserChrome app="forum" />
      <div className="renren-page scroll-area">
        <header className="renren-bluebar">
          <div className="renren-logo">
            <AppIcon app="forum" />
            人人网<span>renren.com</span>
          </div>
          <button onClick={() => setTab('新鲜事')}>首页</button>
          <button onClick={() => setTab('我的状态')}>个人主页</button>
          <button onClick={() => setTab('好友')}>好友</button>
          <div className="renren-top-search">
            <input
              aria-label="搜索校园好友"
              placeholder="找人、找公共主页"
              onChange={(e) => {
                if (NPCS.some((n) => n.name === e.target.value)) {
                  setTab('好友');
                }
              }}
            />
            <Icon name="search" size={12} />
          </div>
          <button onClick={() => open('chat')}>消息</button>
          <button onClick={() => open('settings')}>帐号 ▼</button>
        </header>
        <div className="renren-layout">
          <aside className="renren-left">
            <div className="renren-profile">
              <Avatar id="player" name={s.profile.name} size={50} />
              <span>
                <b>{s.profile.name}</b>
                <button onClick={() => open('grades')}>南川大学 2012级</button>
                <small>★ LV 1</small>
              </span>
            </div>
            <nav>
              {['新鲜事', '我的状态', '日志', '相册', '好友', '游戏动态'].map((t, i) => (
                <button
                  className={tab === t ? 'selected' : ''}
                  key={t}
                  onClick={() => {
                    if (t === '日志') open('diary');
                    else if (t === '相册') open('qzone');
                    else setTab(t);
                  }}
                >
                  <Icon name={['home', 'chat', 'diary', 'camera', 'users', 'game'][i]} size={15} />
                  {t}
                </button>
              ))}
            </nav>
            <h4>我的应用</h4>
            <button onClick={() => open('games')}>♟ 英雄联盟</button>
            <button onClick={() => open('schedule')}>▤ 课程表</button>
            <button onClick={() => open('browser')}>♧ 勤工助学</button>
            <h4>我的大学</h4>
            <p>
              南川大学
              <br />
              2012级新生班
              <br />
              302寝室
            </p>
            <div className="renren-radio">
              <Icon name="music" size={15} />
              <span>轻电台</span>
              <button title="打开音乐日志" onClick={() => open('diary')}>
                ▶
              </button>
            </div>
          </aside>
          <div className="renren-feed">
            {tab === '好友' ? (
              <>
                <h2>我的好友（8）</h2>
                <div className="renren-friends">
                  {s.npcs.map((n) => (
                    <button key={n.id} onClick={() => open('chat', n.id)}>
                      <Avatar id={n.id} size={55} />
                      <span>
                        <b>{npcDef(n.id).name}</b>
                        <small>{npcDef(n.id).role}</small>
                        <small>{n.activity}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="renren-welcome">
                  <b>Hi，{s.profile.name}！</b>
                  <span>你的大学生活，从今天开始。</span>
                </div>
                <section className="renren-publisher">
                  <div className="renren-publish-types">
                    <b>发布状态</b>
                    <button onClick={() => open('diary')}>写日志</button>
                    <button onClick={() => open('qzone')}>传照片</button>
                  </div>
                  <textarea
                    aria-label="发布校园动态"
                    maxLength={300}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="说点什么吧，和朋友们分享你的生活……"
                  />
                  <div>
                    <span>☺ 表情　▧ 照片　♬ 音乐　▱ 分享</span>
                    <Button
                      disabled={!text.trim()}
                      onClick={() => {
                        send({ type: 'post', text, category: '校园日常' });
                        setText('');
                      }}
                    >
                      发布状态
                    </Button>
                  </div>
                </section>
                <div className="renren-feed-tabs">
                  <button className={tab === '新鲜事' ? 'selected' : ''} onClick={() => setTab('新鲜事')}>
                    新鲜事
                  </button>
                  <button className={tab === '我的状态' ? 'selected' : ''} onClick={() => setTab('我的状态')}>
                    我的状态
                  </button>
                  <button className={tab === '游戏动态' ? 'selected' : ''} onClick={() => setTab('游戏动态')}>
                    游戏动态
                  </button>
                  <small>按时间排序 ▾</small>
                </div>
                {posts.map((p) => (
                  <article className="renren-post" key={p.id}>
                    <Avatar
                      id={p.author}
                      name={p.author === 'player' ? s.profile.name : undefined}
                      size={45}
                    />
                    <div>
                      <header>
                        <button
                          onClick={() =>
                            p.author === 'player' ? setTab('我的状态') : open('chat', p.author)
                          }
                        >
                          {p.author === 'player' ? s.profile.name : npcDef(p.author).name}
                        </button>
                        <span>更新了状态</span>
                      </header>
                      <p>{p.text}</p>
                      {p.category === '社团活动' && p.day === 0 && (
                        <div className="renren-campus-poster">
                          <b>南川大学 2012</b>
                          <strong>百 团 大 战</strong>
                          <span>新的学期，和热爱相遇。</span>
                          <small>9月 · 食堂广场</small>
                        </div>
                      )}
                      <footer>
                        <small>{dateOf(p.day, true)}　来自网页</small>
                        <button onClick={() => send({ type: 'like', post: p.id })}>
                          {p.liked ? '取消赞' : '赞'}({p.likes})
                        </button>
                        <button onClick={() => setCommenting(commenting === p.id ? null : p.id)}>
                          评论({p.comments.length})
                        </button>
                      </footer>
                      {p.comments.length > 0 && (
                        <div className="renren-comments">
                          {p.comments.map((c, i) => (
                            <p key={i}>
                              <b>{c.author === 'player' ? s.profile.name : npcDef(c.author)?.name}：</b>
                              {c.text}
                            </p>
                          ))}
                        </div>
                      )}
                      {commenting === p.id && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            send({ type: 'comment', post: p.id, text: comment });
                            setComment('');
                            setCommenting(null);
                          }}
                        >
                          <input
                            aria-label="动态评论"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="回复这条新鲜事"
                          />
                          <Button type="submit" disabled={!comment.trim()}>
                            回复
                          </Button>
                        </form>
                      )}
                    </div>
                  </article>
                ))}
                {!posts.length && <Empty title="还没有新鲜事" text="写下今天的第一条状态吧。" />}
              </>
            )}
          </div>
          <aside className="renren-right">
            <section>
              <h4>你可能认识的人</h4>
              {s.npcs
                .slice()
                .sort((a, b) => relationValue(b) - relationValue(a))
                .slice(0, 3)
                .map((n) => (
                  <button key={n.id} onClick={() => open('chat', n.id)}>
                    <Avatar id={n.id} size={35} />
                    <span>
                      <b>{npcDef(n.id).name}</b>
                      <small>南川大学</small>
                      <em>发消息</em>
                    </span>
                  </button>
                ))}
            </section>
            <section>
              <h4>最近来访</h4>
              <div className="renren-visitors">
                {s.npcs
                  .filter((n) => n.familiar > 15)
                  .slice(0, 3)
                  .map((n) => (
                    <button key={n.id} onClick={() => open('chat', n.id)}>
                      <Avatar id={n.id} size={39} />
                      <small>{npcDef(n.id).name}</small>
                    </button>
                  ))}
              </div>
              <small>与你相熟的同学正在关注你。</small>
            </section>
            <section className="renren-announcement">
              <h4>南川大学迎新季</h4>
              <p>
                在人人，找到同班的TA。
                <br />
                认识新同学，从说声你好开始。
              </p>
              <button onClick={() => open('campus')}>看看校园正在发生什么 &gt;</button>
            </section>
            <div className="renren-copyright">
              人人网 © 2012
              <br />
              大学生桌面模拟器 · 校园内的世界
            </div>
          </aside>
        </div>
        <div className="renren-bottom-chat">
          <button onClick={() => open('chat')}>
            ☻ 在线好友（{s.npcs.filter((n) => n.activity !== '补觉').length}）
          </button>
          <span>消息提醒　▣</span>
        </div>
      </div>
    </>
  );
}

export function Qzone({ npc }: { npc?: string }) {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const open = useDesktop((x) => x.open);
  const [tab, setTab] = useState('主页');
  const [text, setText] = useState('');
  const [skin, setSkin] = useState('blue');
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState<number | null>(null);
  const owner = npc && npcDef(npc) ? npcDef(npc).name : s.profile.name;
  const author = npc && npcDef(npc) ? npc : 'player';
  const posts = s.posts
    .filter((p) => p.author === author && p.category.startsWith('空间'))
    .slice()
    .reverse();
  const photos = (author === 'player' ? s.inventory : []).filter(
    (i) => i.includes('照') || i.includes('合影') || i.includes('纪念票'),
  );
  return (
    <>
      <BrowserChrome app="qzone" />
      <div className={`qzone-page skin-${skin} scroll-area`}>
        <header className="qzone-top">
          <AppIcon app="qzone" size="small" />
          <b>QQ空间</b>
          <button onClick={() => setTab('个人中心')}>个人中心</button>
          <button onClick={() => setTab('主页')}>我的主页</button>
          <button onClick={() => setTab('好友')}>好友</button>
          <button onClick={() => setSkin(skin === 'blue' ? 'green' : 'blue')}>装扮</button>
          <button className="push-right" onClick={() => open('chat')}>
            返回QQ
          </button>
        </header>
        <div className="qzone-cover">
          <span className="qzone-vine" />
          <h1>{owner}的空间</h1>
          <p>那些回不去的时光，写在这里。</p>
          <span className="qzone-url">http://user.qzone.qq.com/20120903</span>
          <button className="qzone-decorate" onClick={() => setSkin(skin === 'blue' ? 'green' : 'blue')}>
            ✿ 装扮空间
          </button>
          <div className="qzone-user">
            <Avatar id={author} name={author === 'player' ? s.profile.name : undefined} size={72} />
            <span>
              <b>{owner}</b>
              <small>★ 黄钻贵族　Lv.1</small>
              <p>2012，愿每一天都有值得记住的小事。</p>
            </span>
          </div>
        </div>
        <nav className="qzone-tabs">
          {['主页', '说说', '日志', '相册', '留言板', '个人档', '音乐'].map((t) => (
            <button className={tab === t ? 'selected' : ''} key={t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
        <div className="qzone-layout">
          <aside className="qzone-sidebar">
            <section>
              <h3>个人档</h3>
              <p>
                {owner}
                <br />
                南川大学 · 2012级
                <br />
                {npc ? npcDef(npc)?.role : '初来乍到，请多关照。'}
              </p>
              <small>空间成长值　{Math.min(999, s.day + 10)}</small>
              <Progress value={Math.min(100, s.day + 10)} color="#e4b123" />
            </section>
            <section>
              <h3>最近访客</h3>
              <div className="qzone-visitors">
                {s.npcs
                  .filter((n) => n.familiar > 15)
                  .slice(0, 6)
                  .map((n) => (
                    <button key={n.id} onClick={() => open('qzone', n.id)}>
                      <Avatar id={n.id} size={35} />
                      <small>{npcDef(n.id).name}</small>
                    </button>
                  ))}
              </div>
              <small>来自真实相处的校园好友</small>
            </section>
            <section className="qzone-music-player">
              <h3>音乐盒</h3>
              <div>♫ 我的青春纪念册</div>
              <button onClick={() => setTab('音乐')}>▶　打开音乐盒</button>
            </section>
          </aside>
          <div className="qzone-main">
            {tab === '日志' ? (
              <section className="qzone-module">
                <h3>日志</h3>
                {author === 'player' && s.diary.length ? (
                  s.diary.map((d) => (
                    <article className="qzone-blog" key={d.day}>
                      <h4>{dateOf(d.day)} 的手记</h4>
                      <p>{d.text}</p>
                    </article>
                  ))
                ) : (
                  <p className="qzone-empty">
                    {author === 'player' ? '还没有日志，写下大学生活的第一篇吧。' : 'TA还没有发表公开日志。'}
                  </p>
                )}
                {author === 'player' && <Button onClick={() => open('diary')}>写日志</Button>}
              </section>
            ) : tab === '相册' ? (
              <section className="qzone-module">
                <h3>我的相册</h3>
                <div className="qzone-photo-grid">
                  {photos.map((p, i) => (
                    <button key={p} onClick={() => open('files')}>
                      <span className={`qzone-photo-scene scene-${i % 3}`}>
                        <Icon name="camera" size={32} />
                      </span>
                      <b>{p}</b>
                      <small>来自真实校园经历</small>
                    </button>
                  ))}
                </div>
                {!photos.length && (
                  <p className="qzone-empty">
                    还没有照片。参与摄影、音乐会或生日活动后，真实纪念物会出现在这里。
                  </p>
                )}
              </section>
            ) : tab === '个人档' ? (
              <section className="qzone-module">
                <h3>个人资料</h3>
                <p>
                  姓名：{owner}
                  <br />
                  学校：南川大学
                  <br />
                  入学年份：2012
                  <br />
                  当前学期：大一上学期
                  <br />
                  个性签名：好好生活，慢慢长大。
                </p>
              </section>
            ) : tab === '好友' ? (
              <section className="qzone-module">
                <h3>我的好友</h3>
                <div className="qzone-friend-list">
                  {s.npcs.map((n) => (
                    <button key={n.id} onClick={() => open('qzone', n.id)}>
                      <Avatar id={n.id} size={42} />
                      {npcDef(n.id).name}
                      <span>{n.stage}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : tab === '音乐' ? (
              <section className="qzone-module">
                <h3>音乐盒</h3>
                <p>青春纪念册 · 我的大学歌单</p>
                {['同桌的你', '那些花儿', '稻香', '老男孩'].map((song) => (
                  <div className="qzone-song" key={song}>
                    <span>♫ {song}</span>
                    <button
                      onClick={() => {
                        setText(`今天想起了《${song}》。`);
                        setTab('说说');
                      }}
                    >
                      分享这首歌
                    </button>
                  </div>
                ))}
                <small>分享歌名到说说，声音随你的记忆响起。</small>
              </section>
            ) : (
              <>
                <section className="qzone-module qzone-publisher">
                  <h3>{tab === '留言板' ? '留言板' : '说说'}</h3>
                  <textarea
                    aria-label="QQ空间说说"
                    maxLength={300}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={tab === '留言板' ? `给${owner}留下一句话吧……` : '说点儿什么吧……'}
                  />
                  <div>
                    <span>☺ 表情　▧ 照片　♫ 音乐</span>
                    <Button
                      disabled={!text.trim()}
                      onClick={() => {
                        if (npc && tab === '留言板') {
                          send({ type: 'chat', npc, reply: 'custom', text: `[空间留言] ${text}` });
                        } else
                          send({ type: 'post', text, category: tab === '留言板' ? '空间留言' : '空间说说' });
                        setText('');
                      }}
                    >
                      发表{tab === '留言板' ? '留言' : '说说'}
                    </Button>
                  </div>
                </section>
                {(tab === '个人中心'
                  ? s.posts
                      .filter((p) => p.category.startsWith('空间'))
                      .slice()
                      .reverse()
                  : posts
                ).map((p) => (
                  <article className="qzone-module qzone-post" key={p.id}>
                    <header>
                      <Avatar
                        id={p.author}
                        name={p.author === 'player' ? s.profile.name : undefined}
                        size={40}
                      />
                      <span>
                        <b>{p.author === 'player' ? s.profile.name : npcDef(p.author).name}</b>
                        <small>{dateOf(p.day, true)}　来自QQ空间</small>
                      </span>
                    </header>
                    <p>{p.text}</p>
                    <footer>
                      <button onClick={() => send({ type: 'like', post: p.id })}>
                        {p.liked ? '取消赞' : '赞'}（{p.likes}）
                      </button>
                      <button onClick={() => setReply(reply === p.id ? null : p.id)}>
                        评论（{p.comments.length}）
                      </button>
                    </footer>
                    {p.comments.map((c, i) => (
                      <p className="qzone-comment" key={i}>
                        <b>{c.author === 'player' ? s.profile.name : npcDef(c.author)?.name}：</b>
                        {c.text}
                      </p>
                    ))}
                    {reply === p.id && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          send({ type: 'comment', post: p.id, text: comment });
                          setComment('');
                          setReply(null);
                        }}
                      >
                        <input
                          aria-label="QQ空间评论"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <Button type="submit" disabled={!comment.trim()}>
                          回复
                        </Button>
                      </form>
                    )}
                  </article>
                ))}
                {!posts.length && tab !== '个人中心' && (
                  <div className="qzone-module qzone-empty">踩踩，留下你的第一个脚印。</div>
                )}
              </>
            )}
          </div>
          <aside className="qzone-right">
            <section className="qzone-module">
              <h3>今天的心情</h3>
              <strong>{dateOf(s.day, true)}</strong>
              <p>
                {weekdaysForQzone(s.day)}
                <br />
                大学生活，第 {s.day + 1} 天。
              </p>
              <button onClick={() => open('diary')}>记下今天</button>
            </section>
            <section className="qzone-module">
              <h3>空间统计</h3>
              <p>
                说说：{posts.length}
                <br />
                日志：{s.diary.length}
                <br />
                相册：{photos.length}
              </p>
              <small>分享生活，留住感动</small>
            </section>
          </aside>
        </div>
        <footer className="qzone-bottom">QQ空间 · 分享生活，留住感动　|　2012</footer>
      </div>
    </>
  );
}
const weekdaysForQzone = (day: number) =>
  ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'][day % 7];
