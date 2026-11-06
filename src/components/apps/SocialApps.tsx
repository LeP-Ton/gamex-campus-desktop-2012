import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { NPCS } from '../../content/world';
import { absoluteTime, clockText, dateOf, npcDef, relationValue } from '../../engine/helpers';
import { Avatar, Button, Empty, Icon, Progress, Tag } from '../ui';

export function Chat({ npc }: { npc?: string }) {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const open = useDesktop((x) => x.open);
  const [selected, setSelected] = useState(npc ?? 'haoran');
  const [text, setText] = useState('');
  const [info, setInfo] = useState(false);
  const [search, setSearch] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const group = selected === 'class-group';
  const person = s.npcs.find((n) => n.id === selected);
  const def = person ? npcDef(person.id) : null;
  const messages = group
    ? s.messages.filter((m) => ['zhou', 'xiaoyu', 'zichen'].includes(m.npc) && m.from === 'npc')
    : s.messages.filter((m) => m.npc === selected);
  useEffect(() => {
    if (!group) send({ type: 'read', npc: selected });
  }, [selected]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, selected]);
  return (
    <>
      <div className="chat-top">
        <span className="qchat-logo">
          <Icon name="chat" size={25} />Q<span>聊</span>
          <small>2012</small>
        </span>
        <span className="chat-motto">总有一个人，等你上线。</span>
        <span className="push-right">
          <i className="online-dot" />
          在线 · 校园网
        </span>
      </div>
      <div className="chat-layout">
        <aside className="contacts">
          <div className="chat-self">
            <Avatar id="player" name={s.profile.name} size={41} />
            <span>
              <b>{s.profile.name}</b>
              <small>我的大学，刚刚开始。</small>
            </span>
          </div>
          <div className="contact-search">
            <Icon name="search" size={14} />
            <input
              aria-label="搜索联系人"
              placeholder="搜索同学 / 室友"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="contact-group-title">⌄　我的校园好友 ({NPCS.length})</div>
          <div className="contacts-scroll">
            {NPCS.filter((n) => n.name.includes(search) || n.role.includes(search)).map((n) => {
              const last = [...s.messages].reverse().find((m) => m.npc === n.id);
              const unread = s.messages.filter((m) => m.npc === n.id && !m.read && m.from === 'npc').length;
              const state = s.npcs.find((p) => p.id === n.id)!;
              return (
                <button
                  className={`contact ${selected === n.id ? 'selected' : ''}`}
                  key={n.id}
                  onClick={() => {
                    setSelected(n.id);
                    setInfo(false);
                  }}
                  onDoubleClick={() => open('chat', n.id)}
                >
                  <span className="contact-avatar">
                    <Avatar id={n.id} size={38} />
                    <i className={`presence ${state.activity === '补觉' ? 'offline' : ''}`} />
                  </span>
                  <span>
                    <b>
                      {n.name}
                      {state.stage === '交往' && <Icon name="heart" size={11} />}
                    </b>
                    <small>{last?.text ?? n.role}</small>
                  </span>
                  {unread > 0 && <em>{unread}</em>}
                </button>
              );
            })}
            <div className="contact-group-title">⌄　我的群聊 (1)</div>
            <button
              className={`contact ${group ? 'selected' : ''}`}
              onClick={() => setSelected('class-group')}
            >
              <span className="group-avatar">
                <Icon name="users" size={23} />
              </span>
              <span>
                <b>2012 级新生班</b>
                <small>课程通知 · 班级消息</small>
              </span>
            </button>
          </div>
          <div className="contacts-footer">
            <Icon name="users" size={15} />
            <span>好友都有自己的生活</span>
          </div>
        </aside>
        <div className="conversation">
          <div className="conversation-header">
            <span>
              <h3>{group ? '2012 级新生班' : def?.name}</h3>
              <small>{group ? '班级通知与同学分享 · 只读公告' : `${person?.activity} · ${def?.role}`}</small>
            </span>
            {person && (
              <>
                <Tag color={person.stage === '交往' ? 'pink' : 'green'}>{person.stage}</Tag>
                <button className="icon-button" onClick={() => setInfo(!info)} title="人物关系与邀约">
                  <Icon name="users" size={19} />
                </button>
                <button className="icon-button" title="独立聊天窗口" onClick={() => open('chat', selected)}>
                  <Icon name="external" size={18} />
                </button>
              </>
            )}
          </div>
          <div className="chat-body scroll-area">
            {messages.map((m, i) => (
              <div key={m.id} className={`message ${m.from === 'player' ? 'outgoing' : ''}`}>
                {(i === 0 || messages[i - 1].day !== m.day) && (
                  <div className="message-date">{dateOf(m.day, true)}</div>
                )}
                <div className="message-meta">
                  <span>{m.from === 'player' ? s.profile.name : group ? npcDef(m.npc).name : def?.name}</span>
                  <small>{clockText(m.minute)}</small>
                </div>
                <div className="message-bubble">{m.text}</div>
                {m.intent && m.expires && m.from === 'npc' && (
                  <small className="message-expiry">
                    {absoluteTime(s) > m.expires
                      ? '这次邀请的时间已过，仍可正常聊天'
                      : `这次安排还可回复 ${Math.ceil((m.expires - absoluteTime(s)) / 60)} 小时`}
                  </small>
                )}
              </div>
            ))}
            <div ref={end} />
          </div>
          {!group && (
            <>
              <div className="quick-replies">
                <button onClick={() => send({ type: 'chat', npc: selected, reply: 'support' })}>
                  <Icon name="chat" size={13} />
                  认真回应
                </button>
                <button onClick={() => send({ type: 'chat', npc: selected, reply: 'promise' })}>
                  <Icon name="calendar" size={13} />
                  约好一起
                </button>
                <button onClick={() => send({ type: 'chat', npc: selected, reply: 'decline' })}>
                  这次有安排
                </button>
                <button onClick={() => setInfo(!info)}>
                  <Icon name="leaf" size={13} />
                  见面聊聊
                </button>
              </div>
              <form
                className="chat-compose"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim()) {
                    send({ type: 'chat', npc: selected, reply: 'custom', text });
                    setText('');
                  }
                }}
              >
                <textarea
                  value={text}
                  maxLength={200}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="想说些什么？真诚一点就好。"
                  aria-label="聊天消息"
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter' && text.trim()) {
                      send({ type: 'chat', npc: selected, reply: 'custom', text });
                      setText('');
                    }
                  }}
                />
                <div>
                  <small>每次交流 15 分钟 · 精力 -2 · Ctrl + Enter 发送</small>
                  <Button className="primary" type="submit" disabled={!text.trim()}>
                    发送 <Icon name="arrow" size={14} />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
        {info && person && def && (
          <aside className="relationship-panel scroll-area">
            <Avatar id={selected} size={58} />
            <h3>
              {def.name}
              <small>{def.age} 岁</small>
            </h3>
            <p>{def.role}</p>
            <div className="interest-tags">
              {def.interests.map((i) => (
                <Tag key={i}>{i}</Tag>
              ))}
            </div>
            <h4>我们的关系 · {person.stage}</h4>
            {[
              { label: '熟悉', value: person.familiar, color: '#6299b9' },
              { label: '信任', value: person.trust, color: '#6c9f8b' },
              { label: '共同经历', value: person.shared, color: '#c2937f' },
            ].map((r) => (
              <div className="relation-meter" key={r.label}>
                <label>
                  {r.label}
                  <b>{Math.round(r.value)}</b>
                </label>
                <Progress value={r.value} color={r.color} />
              </div>
            ))}
            <p className="relationship-need">
              <b>现在的心情</b>
              {person.need}
              <small>长期目标：{def.goal}</small>
            </p>
            <div className="social-buttons">
              <Button icon="leaf" onClick={() => send({ type: 'social', npc: selected, kind: 'walk' })}>
                校园散步 <small>60min · 免费</small>
              </Button>
              <Button icon="coffee" onClick={() => send({ type: 'social', npc: selected, kind: 'coffee' })}>
                喝杯热饮 <small>75min · ¥16</small>
              </Button>
              {def.romance && (
                <>
                  <Button icon="heart" onClick={() => send({ type: 'social', npc: selected, kind: 'date' })}>
                    安排约会 <small>120min · ¥35</small>
                  </Button>
                  <Button
                    icon="mail"
                    onClick={() =>
                      send({
                        type: 'social',
                        npc: selected,
                        kind: person.stage === '交往' ? 'breakup' : 'confess',
                      })
                    }
                  >
                    {person.stage === '交往' ? '认真谈谈，结束关系' : '认真表达心意'}
                  </Button>
                </>
              )}
            </div>
            <h4>记得的那些小事</h4>
            {[...person.longMemories, ...person.memories]
              .slice(-3)
              .reverse()
              .map((m, i) => (
                <p className="relation-memory" key={i}>
                  <small>{dateOf(m.day, true)}</small>
                  {m.text}
                </p>
              ))}
            <p className="muted relation-note">
              关系取决于信任、契合、承诺和共同经历。尊重对方的日程与想法。
            </p>
          </aside>
        )}
      </div>
    </>
  );
}

export function Forum() {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const [tab, setTab] = useState('全部动态');
  const [text, setText] = useState('');
  const [commenting, setCommenting] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const tabs = ['全部动态', '校园日常', '游戏专区', '社团活动', '我的动态'];
  const posts = s.posts
    .filter((p) => tab === '全部动态' || (tab === '我的动态' ? p.author === 'player' : p.category === tab))
    .slice()
    .reverse();
  return (
    <>
      <div className="bbs-header">
        <div>
          <span className="bbs-mark">
            <Icon name="users" size={30} />
          </span>
          <span>
            <h1>
              南川 BBS<span>我们的校园，我们的故事。</span>
            </h1>
            <p>NANCHUAN CAMPUS COMMUNITY · 始于 2012</p>
          </span>
        </div>
        <span>
          欢迎，{s.profile.name}
          <i className="online-dot" />
        </span>
      </div>
      <div className="bbs-tabs">
        {tabs.map((t) => (
          <button key={t} className={tab === t ? 'selected' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
        <span className="push-right">校内社区 · 本地世界</span>
      </div>
      <div className="forum-layout scroll-area">
        <div className="forum-feed">
          <div className="post-compose">
            <div>
              <Avatar id="player" name={s.profile.name} size={35} />
              <textarea
                aria-label="发布校园动态"
                value={text}
                maxLength={300}
                onChange={(e) => setText(e.target.value)}
                placeholder="今天，有什么值得记住的小事？"
              />
            </div>
            <footer>
              <span>
                <Icon name="camera" size={14} />
                记录此刻 · 15 分钟
              </span>
              <Button
                className="primary"
                disabled={!text.trim()}
                onClick={() => {
                  send({
                    type: 'post',
                    text,
                    category: tab === '游戏专区' || tab === '社团活动' ? tab : '校园日常',
                  });
                  setText('');
                }}
              >
                发布动态
              </Button>
            </footer>
          </div>
          {posts.map((p) => {
            const name = p.author === 'player' ? s.profile.name : (npcDef(p.author)?.name ?? '校园广播');
            return (
              <article className="forum-post" key={p.id}>
                <header>
                  <Avatar id={p.author} name={p.author === 'player' ? s.profile.name : undefined} size={39} />
                  <span>
                    <strong>{name}</strong>
                    <small>
                      {dateOf(p.day, true)} ·{' '}
                      {p.author === 'player' ? `${p.audience?.length ?? 0} 位熟人可见` : '来自校园生活'}
                    </small>
                  </span>
                  <Tag>{p.category}</Tag>
                </header>
                <p>{p.text}</p>
                {p.category === '社团活动' && p.day === 0 && (
                  <div className="forum-poster">
                    <span>HELLO, FRESHMEN.</span>
                    <strong>热爱，让我们相遇。</strong>
                    <small>2012 秋季百团大战　|　食堂广场</small>
                    <Icon name="flag" size={48} />
                  </div>
                )}
                <div className="post-actions">
                  <button
                    className={p.liked ? 'liked' : ''}
                    onClick={() => send({ type: 'like', post: p.id })}
                  >
                    <Icon name="heart" size={14} />
                    {p.likes} 人赞过
                  </button>
                  <button
                    onClick={() => {
                      setCommenting(commenting === p.id ? null : p.id);
                      setComment('');
                    }}
                  >
                    <Icon name="chat" size={14} />
                    评论 {p.comments.length}
                  </button>
                  <span>只有熟悉的人，才会知道你的故事</span>
                </div>
                {p.comments.length > 0 && (
                  <div className="post-comments">
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
                    className="comment-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      send({ type: 'comment', post: p.id, text: comment });
                      setCommenting(null);
                      setComment('');
                    }}
                  >
                    <input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={120}
                      placeholder="说点什么吧（10 分钟）"
                      autoFocus
                    />
                    <Button type="submit" disabled={!comment.trim()}>
                      回复
                    </Button>
                  </form>
                )}
              </article>
            );
          })}
          {!posts.length && <Empty title="这里还很安静" text="你可以写下这个分类的第一条校园动态。" />}
        </div>
        <aside className="forum-aside">
          <div className="bbs-notice">
            <span>
              <Icon name="bell" size={17} />
              校园公告栏
            </span>
            <h3>你好，2012 级！</h3>
            <p>先认识世界，再认识自己。欢迎来到南川，愿你的大学生活有热爱，也有朋友。</p>
            <small>南川大学学生工作处</small>
          </div>
          <div className="bbs-connections">
            <h3>你身边的人</h3>
            {s.npcs
              .filter((n) => n.id !== 'zhou')
              .sort((a, b) => relationValue(b) - relationValue(a))
              .slice(0, 4)
              .map((n) => (
                <div key={n.id}>
                  <Avatar id={n.id} size={31} />
                  <span>
                    <b>{npcDef(n.id).name}</b>
                    <small>{n.activity}</small>
                  </span>
                  <Tag color="green">{n.stage}</Tag>
                </div>
              ))}
          </div>
          <div className="forum-rules">
            <Icon name="leaf" size={22} />
            <p>
              这里的每一条动态，
              <br />
              都来自正在发生的校园生活。
            </p>
            <small>
              友善交流，尊重彼此。
              <br />
              你的小世界，也很精彩。
            </small>
          </div>
        </aside>
      </div>
    </>
  );
}
