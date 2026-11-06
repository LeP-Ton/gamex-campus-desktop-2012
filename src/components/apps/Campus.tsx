import { useState } from 'react';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { EVENTS } from '../../content/events';
import { MAJORS, PLANS } from '../../content/world';
import { absoluteTime, clockText, courseDefs, dateOf, npcDef, weekOf, weekdays } from '../../engine/helpers';
import type { AppId, Plan } from '../../engine/types';
import { AppIcon, AppLink, Avatar, Button, Empty, Icon, Progress, Tag } from '../ui';

export function Campus() {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const open = useDesktop((x) => x.open);
  const [tab, setTab] = useState<'today' | 'plan' | 'events'>('today');
  const [event, setEvent] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>({ ...s.plan });
  const active = s.activeEvents.map((a) => ({ ...a, def: EVENTS.find((e) => e.id === a.id)! }));
  const today = courseDefs(s).filter((c) => c.weekday === s.day % 7);
  const def = EVENTS.find((d) => d.id === event);
  const activeRecord = s.activeEvents.find((e) => e.id === event);
  const greeting = s.minute < 720 ? '早安' : s.minute < 1080 ? '下午好' : '晚上好';
  const latest = [...s.messages].reverse().find((m) => m.from === 'npc');
  return (
    <>
      <div className="explorer-toolbar">
        <span className="toolbar-nav">
          ‹ <b>›</b>
        </span>
        <div className="address-bar">
          <Icon name="home" size={14} />
          南川大学 <Icon name="arrow" size={12} />
          我的校园
          <Icon name="arrow" size={12} />
          {tab === 'plan' ? '生活计划' : tab === 'events' ? '校园来信' : '今日概览'}
        </div>
        <span className="toolbar-search">
          <Icon name="search" size={14} />
          在校园里发现生活
        </span>
      </div>
      <div className="campus-layout">
        <aside className="campus-sidebar">
          <div className="campus-profile">
            <Avatar id="player" size={48} name={s.profile.name} />
            <strong>{s.profile.name}</strong>
            <span>{MAJORS[s.profile.major].short} · 2012 级</span>
            <Tag color="green">我的大学 · 第一个秋天</Tag>
          </div>
          <nav>
            <button className={tab === 'today' ? 'selected' : ''} onClick={() => setTab('today')}>
              <Icon name="home" size={17} />
              今日概览
            </button>
            <button className={tab === 'plan' ? 'selected' : ''} onClick={() => setTab('plan')}>
              <Icon name="calendar" size={17} />
              生活计划
            </button>
            <button className={tab === 'events' ? 'selected' : ''} onClick={() => setTab('events')}>
              <Icon name="mail" size={17} />
              校园来信{active.length > 0 && <b>{active.length}</b>}
            </button>
            <div className="sidebar-divider" />
            <small>常用校园服务</small>
            {(['schedule', 'study', 'grades', 'rankings'] as AppId[]).map((app) => (
              <button key={app} onClick={() => open(app)}>
                <AppIcon app={app} size="small" />
                {app === 'grades'
                  ? '学期档案'
                  : app === 'rankings'
                    ? '校园风云榜'
                    : app === 'schedule'
                      ? '我的课程表'
                      : '学习中心'}
              </button>
            ))}
          </nav>
          <div className="semester-mini">
            <Icon name="leaf" size={20} />
            <span>2012 · 秋季学期</span>
            <Progress value={((s.day + 1) / 112) * 100} />
            <small>
              第 {weekOf(s.day)} 周，共 16 周<br />
              别急，慢慢成为你自己。
            </small>
          </div>
        </aside>
        <div className="campus-main scroll-area">
          {tab === 'today' && (
            <>
              <div className="welcome-banner">
                <div>
                  <span className="eyebrow">2012 · AUTUMN SEMESTER</span>
                  <h1>
                    {greeting}，{s.profile.name}。
                  </h1>
                  <p>
                    {s.day === 0
                      ? '新学期，新故事。你的大学生活从今天开始。'
                      : s.day >= 94
                        ? '考试周也要好好吃饭。努力过的每一天，都算数。'
                        : '课堂之外，还有许多值得期待的小事。'}
                  </p>
                  <span className="welcome-date">
                    <Icon name="sun" size={14} />
                    {dateOf(s.day)}，{weekdays[s.day % 7]}
                  </span>
                </div>
                <div className="banner-illustration">
                  <div className="banner-sun" />
                  <span className="banner-hill one" />
                  <span className="banner-hill two" />
                  <div className="banner-building">
                    <i />
                    <b>南 川 大 学</b>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="banner-tree t1" />
                  <div className="banner-tree t2" />
                  <div className="banner-tree t3" />
                </div>
                <span className="week-ticket">
                  WEEK<strong>{String(weekOf(s.day)).padStart(2, '0')}</strong>
                  <small>/ 16</small>
                </span>
              </div>
              <div className="campus-stats">
                <div>
                  <span className="stat-icon blue">
                    <Icon name="clock" size={22} />
                  </span>
                  <span>
                    <small>现在的时间</small>
                    <strong>
                      {clockText(s.minute)}
                      <em>{s.minute < 720 ? '上午' : s.minute < 1080 ? '下午' : '晚间'}</em>
                    </strong>
                  </span>
                </div>
                <div>
                  <span className="stat-icon green">
                    <Icon name="energy" size={22} />
                  </span>
                  <span>
                    <small>今日精力</small>
                    <strong>
                      {Math.round(s.energy)}
                      <em>/ 100</em>
                    </strong>
                  </span>
                </div>
                <div>
                  <span className="stat-icon gold">
                    <Icon name="money" size={22} />
                  </span>
                  <span>
                    <small>我的生活费</small>
                    <strong>
                      <em>¥</em>
                      {s.money.toLocaleString()}
                    </strong>
                  </span>
                </div>
                <div>
                  <span className="stat-icon purple">
                    <Icon name={MAJORS[s.profile.major].icon} size={22} />
                  </span>
                  <span>
                    <small>{MAJORS[s.profile.major].ability}</small>
                    <strong>
                      {Math.round(s.professional)}
                      <em>/ 100</em>
                    </strong>
                  </span>
                </div>
              </div>
              <div className="campus-columns">
                <section>
                  <div className="section-heading">
                    <h2>
                      <Icon name="calendar" size={17} />
                      今天的安排
                    </h2>
                    <AppLink app="schedule">完整课表</AppLink>
                  </div>
                  <div className="agenda-card">
                    {today.length ? (
                      today.map((c) => {
                        const state = s.courses.find((x) => x.id === c.id)!;
                        return (
                          <div className="agenda-entry" key={c.id}>
                            <div className="agenda-time">
                              <b>{clockText(c.start)}</b>
                              <small>{clockText(c.start + 90)}</small>
                            </div>
                            <i style={{ background: c.color }} />
                            <div>
                              <strong>{c.name}</strong>
                              <span>
                                教学楼 A-{201 + c.weekday * 2} · {c.teacher}老师
                              </span>
                            </div>
                            {state.lastClass === s.day ? (
                              <Tag color="green">已出勤</Tag>
                            ) : s.minute > c.start + 15 ? (
                              <Tag>已结束</Tag>
                            ) : (
                              <button
                                className="text-link"
                                onClick={() => send({ type: 'study', course: c.id, mode: 'class' })}
                              >
                                去上课 ›
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="free-day">
                        <Icon name="sun" size={24} />
                        <span>
                          <b>今天没有课</b>
                          <small>去走走，或做一件喜欢的事。</small>
                        </span>
                      </div>
                    )}
                    <div className="agenda-note">
                      <Icon name="book" size={14} />
                      每周五结算作业，记得提前完成。<AppLink app="study">去学习</AppLink>
                    </div>
                  </div>
                  <div className="section-heading lower">
                    <h2>
                      <Icon name="mail" size={17} />
                      校园正在发生
                    </h2>
                    <button className="text-link" onClick={() => setTab('events')}>
                      全部来信 ›
                    </button>
                  </div>
                  {active.slice(0, 2).map(({ def: d, expires }) => (
                    <button
                      className="event-preview"
                      key={d.id}
                      onClick={() => {
                        setTab('events');
                        setEvent(d.id);
                      }}
                    >
                      <span
                        className={`event-preview-icon ${d.category === '游戏' || d.category === '宿舍' ? 'purple' : 'green'}`}
                      >
                        <Icon
                          name={
                            d.category === '游戏' || d.id.startsWith('team')
                              ? 'game'
                              : d.category === '学业'
                                ? 'book'
                                : 'mail'
                          }
                          size={21}
                        />
                      </span>
                      <span>
                        <strong>
                          {d.name}
                          {d.chain && <i>故事进行中</i>}
                        </strong>
                        <small>
                          {npcDef(d.npc).name} · 还有{' '}
                          {Math.max(0, Math.floor((expires - absoluteTime(s)) / 60))} 小时
                        </small>
                      </span>
                      <Icon name="arrow" size={15} />
                    </button>
                  ))}
                  {!active.length && (
                    <div className="gentle-note">暂时没有新的邀请。按自己的节奏，过好今天吧。</div>
                  )}
                </section>
                <section>
                  <div className="section-heading">
                    <h2>
                      <Icon name="chat" size={17} />
                      有人等你上线
                    </h2>
                    <AppLink app="chat">打开 QQ</AppLink>
                  </div>
                  <div className="friend-note">
                    {latest && (
                      <>
                        <div>
                          <Avatar id={latest.npc} size={36} />
                          <span>
                            <strong>{npcDef(latest.npc).name}</strong>
                            <small>
                              <i className="online-dot" /> 在线 · {npcDef(latest.npc).role.split(' · ')[0]}
                            </small>
                          </span>
                          <small className="push-right">{clockText(latest.minute)}</small>
                        </div>
                        <p>{latest.text.length > 94 ? latest.text.slice(0, 94) + '…' : latest.text}</p>
                        <Button className="subtle" icon="chat" onClick={() => open('chat', latest.npc)}>
                          回复消息
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="life-card">
                    <Icon name="leaf" size={23} />
                    <h3>大学，不只有一种过法。</h3>
                    <p>
                      你可以在图书馆待一下午，也可以和室友打几局游戏。
                      <br />
                      你的时间，由你安排。
                    </p>
                    <button className="text-link" onClick={() => setTab('plan')}>
                      设定我的生活计划 <Icon name="arrow" size={13} />
                    </button>
                  </div>
                </section>
              </div>
              <div className="campus-bottom">
                <Icon name="shield" size={13} />
                <span>进度自动保存到本机</span>
                <span>随机种子：{s.seed}</span>
                <span className="push-right">南川大学校园信息中心</span>
              </div>
            </>
          )}
          {tab === 'plan' && (
            <>
              <div className="page-heading">
                <span className="eyebrow">MY EVERYDAY LIFE</span>
                <h1>把日子，过成自己的样子。</h1>
                <p>
                  关键日由你亲自操作；背景日会按这个计划真实模拟。每日最多分配 8
                  小时课余时间，课内出勤另外计算。
                </p>
              </div>
              <div className="plan-presets">
                {Object.entries(PLANS).map(([key, value]) => (
                  <button
                    key={key}
                    className={JSON.stringify(plan) === JSON.stringify(value.plan) ? 'selected' : ''}
                    onClick={() => setPlan({ ...value.plan })}
                  >
                    <Icon
                      name={
                        key === 'scholar'
                          ? 'book'
                          : key === 'gamer'
                            ? 'game'
                            : key === 'worker'
                              ? 'work'
                              : key === 'romance'
                                ? 'heart'
                                : key === 'social'
                                  ? 'users'
                                  : 'leaf'
                      }
                      size={19}
                    />
                    <strong>{value.name}</strong>
                    <small>{value.description}</small>
                  </button>
                ))}
              </div>
              <div className="plan-editor">
                {(
                  [
                    { id: 'study', name: '课余学习', color: '#5e8fb7' },
                    { id: 'gaming', name: '游戏训练', color: '#9882b6' },
                    { id: 'social', name: '社交相处', color: '#d0998a' },
                    { id: 'work', name: '勤工助学', color: '#bf9d69' },
                    { id: 'rest', name: '休息放松', color: '#78a689' },
                  ] as const
                ).map((item) => (
                  <label key={item.id}>
                    <span>
                      <i style={{ background: item.color }} />
                      {item.name}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="1"
                      value={plan[item.id]}
                      onChange={(e) => setPlan({ ...plan, [item.id]: Number(e.target.value) })}
                    />
                    <b>{plan[item.id]} 小时</b>
                  </label>
                ))}
                <div className="plan-total">
                  <span>
                    已分配 <b>{Object.values(plan).reduce((a, b) => a + b, 0)} / 8 小时</b>
                  </span>
                  <Button
                    className="primary"
                    icon="check"
                    disabled={Object.values(plan).reduce((a, b) => a + b, 0) > 8}
                    onClick={() => send({ type: 'plan', plan })}
                  >
                    保存生活计划
                  </Button>
                </div>
              </div>
              <div className="info-box">
                学习达到 2
                小时的计划会按课表出勤，并轮流完成作业。偏重游戏的安排可能缺课或熬夜；社交会维护共同经历；兼职根据专业能力实际结算收入。每天生活费
                ¥12。
              </div>
              {s.lastReport.length > 0 && (
                <div className="background-report">
                  <h3>上次背景日模拟</h3>
                  {s.lastReport.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </>
          )}
          {tab === 'events' && (
            <>
              <div className="page-heading">
                <span className="eyebrow">LETTERS FROM CAMPUS</span>
                <h1>校园来信</h1>
                <p>有人带来了机会，也有人只是想和你一起度过一个普通的下午。</p>
              </div>
              {active.length ? (
                <div className="events-list">
                  {active.map(({ def: d, expires }) => (
                    <button
                      key={d.id}
                      className={`event-letter ${event === d.id ? 'selected' : ''}`}
                      onClick={() => setEvent(d.id)}
                    >
                      <div>
                        <Tag color="green">{d.category}</Tag>
                        <small>{d.chain ? `${d.chain} · 第 ${d.stage} 幕` : '校园小事'}</small>
                        <span className="push-right">
                          <Icon name="clock" size={12} />
                          剩余 {Math.floor((expires - absoluteTime(s)) / 60)} 小时
                        </span>
                      </div>
                      <h3>{d.name}</h3>
                      <p>{d.description}</p>
                      <footer>
                        <Avatar id={d.npc} size={23} />
                        {npcDef(d.npc).name}
                        <span className="push-right">查看来信 ›</span>
                      </footer>
                    </button>
                  ))}
                </div>
              ) : (
                <Empty
                  icon="mail"
                  title="今天的来信都处理好了"
                  text="继续自己的日常，新故事会在合适的时间到来。"
                />
              )}
              {def && activeRecord && (
                <div className="event-detail">
                  <div className="section-heading">
                    <h2>{def.name}</h2>
                    <button className="text-link" onClick={() => setEvent(null)}>
                      收起
                    </button>
                  </div>
                  <p>{def.description}</p>
                  <div className="event-options">
                    {def.choices.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => {
                          send({ type: 'event', id: def.id, choice: choice.id });
                          setEvent(null);
                        }}
                      >
                        <strong>{choice.text}</strong>
                        <span>{choice.description}</span>
                        <small>
                          {choice.minutes ? `${choice.minutes} 分钟` : '不耗时'}
                          {choice.cost ? ` · ¥${choice.cost}` : ''}
                          {choice.energy ? ` · 精力 -${choice.energy}` : ''}
                          {choice.needs?.professional ? ` · 专业 ≥${choice.needs.professional}` : ''}
                          {choice.needs?.gaming ? ` · 竞技 ≥${choice.needs.gaming}` : ''}
                          {choice.needs?.trust ? ` · 信任 ≥${choice.needs.trust}` : ''}
                          <b>选择 ›</b>
                        </small>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="completed-events">
                <h3>
                  已经发生的故事 <span>{s.stats.events}</span>
                </h3>
                {Object.entries(s.eventHistory)
                  .filter(([, r]) => !['expired', 'decline'].includes(r.choice))
                  .slice(-5)
                  .reverse()
                  .map(([id, record]) => (
                    <p key={id}>
                      <Icon name="check" size={13} />
                      <span>{EVENTS.find((e) => e.id === id)?.name}</span>
                      <small>{dateOf(record.day, true)}</small>
                    </p>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
