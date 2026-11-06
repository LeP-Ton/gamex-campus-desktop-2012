import { useState } from 'react';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { JOBS, MAJORS } from '../../content/world';
import { clockText } from '../../engine/helpers';
import { MATCH_CHOICES } from '../../systems/competition';
import { AppIcon, Button, Icon, Progress, ResourceBar, Tag } from '../ui';

export function Games() {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const [role, setRole] = useState('中路');
  const [hero, setHero] = useState('法师');
  const [party, setParty] = useState(true);
  const [tab, setTab] = useState('play');
  const match = s.match;
  const last = s.matches.at(-1);
  const rank = s.rating >= 1500 ? '铂金' : s.rating >= 1250 ? '黄金' : s.rating >= 1000 ? '白银' : '青铜';
  return (
    <>
      <div className="game-header">
        <span className="game-wordmark">
          <Icon name="shield" size={25} />
          <b>征途战场</b>
          <small>HEROES OF THE CAMPUS</small>
        </span>
        <nav>
          <button className={tab === 'play' ? 'selected' : ''} onClick={() => setTab('play')}>
            开始游戏
          </button>
          <button className={tab === 'records' ? 'selected' : ''} onClick={() => setTab('records')}>
            对战记录
          </button>
          <button className={tab === 'help' ? 'selected' : ''} onClick={() => setTab('help')}>
            战术手册
          </button>
        </nav>
        <span className="game-online">
          <i />
          校园大区 · 在线
        </span>
      </div>
      <div className="game-content scroll-area">
        {tab === 'play' ? (
          <>
            <div className="game-hero">
              <div className="battle-art">
                <div className="battle-moon" />
                <div className="battle-mountains one" />
                <div className="battle-mountains two" />
                <div className="battle-sword" />
                <div className="battle-ring" />
              </div>
              <div className="game-hero-copy">
                <span className="eyebrow">SEASON 2012 · OUR JOURNEY</span>
                <h1>少年，征途正当时。</h1>
                <p>一起上场的，是队友。一起走过的，是青春。</p>
                <Tag>原创策略对局 · 不是第三方游戏复刻</Tag>
              </div>
              <div className="rank-medal">
                <Icon name="shield" size={47} />
                <b>{rank}</b>
                <small>{s.rating} 排位分</small>
              </div>
            </div>
            <div className="game-player-stats">
              <span>
                <small>竞技能力</small>
                <b>
                  {Math.round(s.gaming)} <em>/ 100</em>
                </b>
              </span>
              <span>
                <small>本学期战绩</small>
                <b>
                  {s.stats.wins} <em>胜 / {s.stats.matches} 场</em>
                </b>
              </span>
              <span>
                <small>当前精力</small>
                <b>
                  {Math.round(s.energy)} <em>/ 100</em>
                </b>
              </span>
              <span>
                <small>校园赛事</small>
                <b>{s.stats.tournament ? '冠军' : s.lastTournamentDay >= 0 ? '已参赛' : '未参赛'}</b>
              </span>
            </div>
            {!match ? (
              <div className="match-setup">
                <div>
                  <h3>
                    <Icon name="flag" size={16} />
                    选择你的位置
                  </h3>
                  <div className="role-options">
                    {['上路', '打野', '中路', '射手', '辅助'].map((r) => (
                      <button key={r} className={role === r ? 'selected' : ''} onClick={() => setRole(r)}>
                        <Icon
                          name={
                            r === '打野'
                              ? 'leaf'
                              : r === '辅助'
                                ? 'heart'
                                : r === '射手'
                                  ? 'target'
                                  : r === '上路'
                                    ? 'shield'
                                    : 'sparkles'
                          }
                          size={23}
                        />
                        {r}
                      </button>
                    ))}
                  </div>
                  <h3>
                    <Icon name="users" size={16} />
                    英雄定位
                  </h3>
                  <div className="hero-options">
                    {['战士', '法师', '射手', '坦克', '辅助'].map((h) => (
                      <button key={h} className={hero === h ? 'selected' : ''} onClick={() => setHero(h)}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
                <aside>
                  <h3>今晚，一起吗？</h3>
                  <button
                    className={`party-card ${party ? 'selected' : ''}`}
                    onClick={() => setParty(!party)}
                  >
                    <span className="party-avatar">浩</span>
                    <span>
                      <b>张浩然</b>
                      <small>室友 · 信任 {Math.round(s.npcs[0].trust)}</small>
                    </span>
                    <span className="radio-circle">{party && <i />}</span>
                  </button>
                  <p>组队默契会影响战局，输赢也会留下共同经历。</p>
                  <Button className="gold-button" onClick={() => send({ type: 'queue', role, hero, party })}>
                    寻找对局 <Icon name="arrow" size={18} />
                  </Button>
                  <small>匹配 20 分钟 · 对局约 80 分钟</small>
                </aside>
              </div>
            ) : (
              <div className="active-match">
                {match.phase === 'queue' ? (
                  <>
                    <div className="matching-symbol">
                      <Icon name="target" size={40} />
                    </div>
                    <h2>正在寻找势均力敌的对手</h2>
                    <p>预计 {clockText(match.readyAt)} 找到对局。等待时可以切换到 Q聊回复消息。</p>
                    <div className="match-tags">
                      <Tag>
                        {match.role} · {match.hero}
                      </Tag>
                      <Tag>{match.party ? '室友双排' : '单人排位'}</Tag>
                    </div>
                    <Button
                      className="gold-button"
                      icon="clock"
                      onClick={() => send({ type: 'wait', minutes: Math.max(1, match.readyAt - s.minute) })}
                    >
                      等待匹配完成
                    </Button>
                  </>
                ) : match.phase === 'ready' ? (
                  <>
                    <Icon name="flag" size={39} />
                    <h2>对局已找到！</h2>
                    <p>正式进入战场后，需要持续关注比赛。其他需要注意力的活动将暂时不可执行。</p>
                    <Button className="gold-button" onClick={() => send({ type: 'match', choice: 'join' })}>
                      接受对局，准备上场
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="battle-phase">
                      <span className={match.phase === 'lane' ? 'active' : ''}>01 对线</span>
                      <i />
                      <span className={match.phase === 'objective' ? 'active' : ''}>02 资源</span>
                      <i />
                      <span className={match.phase === 'fight' ? 'active' : ''}>03 团战</span>
                    </div>
                    <h2>
                      {match.phase === 'lane'
                        ? '开局十分钟，你打算怎么打？'
                        : match.phase === 'objective'
                          ? '河道资源刷新，队友正在等你的信号。'
                          : '最后一波团战，做出你的决定。'}
                    </h2>
                    <p>
                      位置：{match.role} · 英雄：{match.hero} · 当前战局优势{' '}
                      <b>
                        {match.advantage >= 0 ? '+' : ''}
                        {match.advantage}
                      </b>
                    </p>
                    <div className="tactic-options">
                      {MATCH_CHOICES[match.phase].map((choice) => (
                        <button key={choice.id} onClick={() => send({ type: 'match', choice: choice.id })}>
                          <Icon
                            name={
                              choice.id === 'vision'
                                ? 'search'
                                : choice.id === 'protect'
                                  ? 'shield'
                                  : 'target'
                            }
                            size={26}
                          />
                          <strong>{choice.name}</strong>
                          <span>{choice.desc}</span>
                          <small>25 分钟 · 精力 -9</small>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <button className="cancel-match" onClick={() => send({ type: 'cancelMatch' })}>
                  {['queue', 'ready'].includes(match.phase) ? '取消匹配' : '中途退出（排位分 -30）'}
                </button>
              </div>
            )}
            {!match && last && (
              <div className={`last-match ${last.win ? 'won' : ''}`}>
                <span>
                  <Icon name={last.win ? 'trophy' : 'flag'} size={23} />
                  <b>{last.win ? 'VICTORY · 胜利' : 'DEFEAT · 失利'}</b>
                </span>
                <p>{last.reason}</p>
                <strong>
                  {last.change > 0 ? '+' : ''}
                  {last.change} 分
                </strong>
              </div>
            )}
          </>
        ) : tab === 'records' ? (
          <div className="match-records">
            <h2>每一局，都有自己的故事。</h2>
            {s.matches.length ? (
              [...s.matches].reverse().map((m, i) => (
                <div className={`match-record ${m.win ? 'won' : ''}`} key={i}>
                  <div>
                    <Icon name={m.win ? 'trophy' : 'flag'} size={25} />
                    <b>{m.win ? '胜利' : '失利'}</b>
                    <small>第 {Math.floor(m.day / 7) + 1} 周</small>
                    <strong>
                      {m.change > 0 ? '+' : ''}
                      {m.change}
                    </strong>
                  </div>
                  <p>{m.decisions.join(' → ')}</p>
                  <small>{m.reason}</small>
                </div>
              ))
            ) : (
              <p>还没有完成手动对局。背景日的训练赛会计入总战绩，详细战术记录仅保存亲自指挥的对局。</p>
            )}
          </div>
        ) : (
          <div className="game-manual">
            <h2>把选择，变成优势。</h2>
            <p>
              胜率共同取决于竞技能力、精力、前期策略、室友默契与对手水平。随机因素会带来不确定性，但合理决策可以显著提高机会。
            </p>
            <div>
              <h3>01 · 对线</h3>
              <p>
                射手与法师适合稳健发育。技术达到 38、精力至少 35
                时，主动压制更有机会。打野、辅助和组队玩家更善于通过支援建立优势。
              </p>
              <h3>02 · 资源争夺</h3>
              <p>
                视野始终提供稳定的信息。已有优势且技术高于 32 时，可以考虑入侵；发育型英雄也可以交换资源。
              </p>
              <h3>03 · 团战</h3>
              <p>
                坦克、辅助和射手适合保护核心。开团需要技术、体力和前期优势；上路战士可以分带，其他位置分带需要更多沟通。
              </p>
              <h3>和生活放在一起考虑</h3>
              <p>
                正式对局不能同时上课或约会。错过匹配扣 5 分，中途退出扣 30
                分；疲劳既降低胜率，也会拖累明天的学习。
              </p>
            </div>
            <Progress value={s.gaming} color="#c7ad78" />
          </div>
        )}
      </div>
      <div className="game-status">
        <i className="online-dot" />
        校园网连接正常<span>游戏时间 {clockText(s.minute)} · 青春没有挂机键</span>
      </div>
    </>
  );
}

export function Browser() {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const open = useDesktop((x) => x.open);
  const [page, setPage] = useState('home');
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const jobs = JOBS.filter((job) => !job.major || job.major === s.profile.major);
  return (
    <>
      <div className="browser-tab">
        <Icon name="globe" size={15} />
        <span>{page === 'jobs' ? '南川大学 · 勤工助学' : '南川校园导航'}</span>
        <span>×</span>
        <button onClick={() => setPage(page === 'home' ? 'jobs' : 'home')} title="打开校园导航">
          ＋
        </button>
      </div>
      <div className="browser-toolbar">
        <button onClick={() => setPage('home')} title="返回校园导航">
          ←
        </button>
        <button onClick={() => setPage('jobs')} title="前往勤工助学">
          →
        </button>
        <div>
          <Icon name="globe" size={14} />
          <span>campus.nanchuan.edu.cn/{page === 'jobs' ? 'student-jobs' : 'welcome'}</span>
          <Tag>校园离线镜像</Tag>
        </div>
        <button onClick={() => setPage('home')} title="主页">
          <Icon name="home" size={18} />
        </button>
      </div>
      <div className="browser-page scroll-area">
        {page === 'home' ? (
          <>
            <header className="portal-header">
              <Icon name="globe" size={38} />
              <span>
                <h1>
                  南川校园导航<span>2012</span>
                </h1>
                <p>你的校园生活，从这里出发。</p>
              </span>
            </header>
            <form
              className="portal-search"
              onSubmit={(e) => {
                e.preventDefault();
                const q = search.trim();
                if (q.includes('兼职') || q.includes('钱') || q.includes('工作')) {
                  setPage('jobs');
                } else {
                  setSearchResult(
                    q.includes('课') || q.includes('学习')
                      ? '学习中心和课程表已经为你准备好了。点击下面的校园服务前往。'
                      : q
                        ? `“${q}”的校内信息可通过下方导航查看。这是校园离线镜像，网页不会连接真实搜索引擎。`
                        : '先输入想找的校园服务吧。',
                  );
                }
              }}
            >
              <input
                aria-label="搜索校园服务"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索课程、兼职、社团……"
              />
              <button type="submit">校园一下</button>
            </form>
            {searchResult && <div className="info-box">{searchResult}</div>}
            <div className="portal-divider">
              <span>校园服务</span>
              <small>常用的，都在这里</small>
            </div>
            <div className="portal-links">
              {(['schedule', 'study', 'grades', 'forum', 'chat', 'rankings'] as const).map((app) => (
                <button key={app} onClick={() => open(app)}>
                  <AppIcon app={app} />
                  <span>
                    {app === 'schedule'
                      ? '课程查询'
                      : app === 'study'
                        ? '学习中心'
                        : app === 'grades'
                          ? '教务系统'
                          : app === 'forum'
                            ? '南川 BBS'
                            : app === 'chat'
                              ? 'Q聊空间'
                              : '校园风云榜'}
                  </span>
                  <Icon name="arrow" size={14} />
                </button>
              ))}
            </div>
            <button className="portal-job-banner" onClick={() => setPage('jobs')}>
              <Icon name="work" size={37} />
              <span>
                <b>用自己的双手，攒下第一笔生活费。</b>
                <small>南川大学勤工助学中心 · 校内正规岗位</small>
              </span>
              <span>查看岗位 ›</span>
            </button>
            <div className="portal-news">
              <h3>
                <Icon name="bell" size={17} />
                校园新鲜事
              </h3>
              <p>· 2012 级新生入学指南：一张课表，一次新的开始。</p>
              <p>· 秋季百团大战即将开始，社团联合会欢迎你来。</p>
              <p>· 本学期共 16 周，日常出勤和作业计入课程总评。</p>
            </div>
            <footer className="portal-footer">© 2012 南川大学校园信息中心 · 原创虚构校园</footer>
          </>
        ) : (
          <>
            <div className="jobs-header">
              <Icon name="work" size={32} />
              <div>
                <h1>南川大学勤工助学中心</h1>
                <p>劳动有价值，学业也重要。合理安排你的时间。</p>
              </div>
              <Button onClick={() => setPage('home')}>返回导航</Button>
            </div>
            <ResourceBar />
            <div className="job-list">
              {jobs.map((job) => {
                const locked = s.professional < job.ability;
                return (
                  <div className={`job-card ${locked ? 'locked' : ''}`} key={job.id}>
                    <span className={`stat-icon ${job.major ? 'green' : 'gold'}`}>
                      <Icon name={job.icon} size={25} />
                    </span>
                    <div>
                      <h3>
                        {job.name}
                        {job.major && <Tag color="green">{MAJORS[s.profile.major].short}特色</Tag>}
                      </h3>
                      <p>{job.subtitle}</p>
                      <small>
                        <Icon name="clock" size={12} />
                        {job.minutes} 分钟 · 精力 -{job.energy}
                        {job.ability ? ` · 专业能力 ≥${job.ability}` : ' · 无经验要求'}
                      </small>
                    </div>
                    <aside>
                      <strong>
                        ¥{job.pay}
                        <small>/ 次起</small>
                      </strong>
                      <Button
                        className={locked ? '' : 'primary'}
                        disabled={locked}
                        onClick={() => send({ type: 'work', job: job.id })}
                      >
                        {locked ? '能力待提升' : '去做这份工作'}
                      </Button>
                    </aside>
                  </div>
                );
              })}
            </div>
            <div className="info-box">
              每个关键日最多接受两份兼职。实际收入根据专业能力与工作时的精力结算。兼职不是免费的钱，它会占用你上课、训练和与朋友见面的时间。
            </div>
          </>
        )}
      </div>
    </>
  );
}
