import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../../lib/assets';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { clockText, dateOf } from '../../engine/helpers';
import { LEAGUE_HEROES, ITEM_NAMES, heroOf } from '../../content/league';
import { MATCH_CHOICES } from '../../systems/competition';
import { AppIcon, Avatar, Button, Icon } from '../ui';

export function LeagueLogo() {
  return (
    <span className="lol-wordmark">
      <b>LEAGUE</b>
      <small>OF</small>
      <b>LEGENDS</b>
      <em>英雄联盟</em>
    </span>
  );
}
function HeroPortrait({ id, className = '' }: { id: string; className?: string }) {
  return (
    <img
      className={`hero-portrait ${className}`}
      src={assetUrl(`period-assets/${id}.png`)}
      alt={heroOf(id).name}
      draggable={false}
    />
  );
}
function ItemRow({ ids }: { ids: readonly string[] }) {
  return (
    <div className="lol-items">
      {ids.map((id, i) => (
        <span key={i} title={ITEM_NAMES[id] ?? '装备'}>
          <img src={assetUrl(`period-assets/item-${id}.png`)} alt={ITEM_NAMES[id] ?? '装备'} />
        </span>
      ))}
    </div>
  );
}

export function League() {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const open = useDesktop((x) => x.open);
  const [tab, setTab] = useState('首页');
  const [setup, setSetup] = useState(false);
  const [hero, setHero] = useState('Ashe');
  const [role, setRole] = useState('射手');
  const [party, setParty] = useState(true);
  const [filter, setFilter] = useState('');
  const match = s.match;
  const hadMatch = useRef(!!match);
  const [boxHints, setBoxHints] = useState(() => localStorage.getItem('gamex-box-hints') !== 'false');
  useEffect(() => {
    if (hadMatch.current && !match) {
      setSetup(false);
      setTab('首页');
    }
    hadMatch.current = !!match;
  }, [match]);
  useEffect(() => {
    const refresh = () => setBoxHints(localStorage.getItem('gamex-box-hints') !== 'false');
    window.addEventListener('gamex-box-settings', refresh);
    return () => window.removeEventListener('gamex-box-settings', refresh);
  }, []);
  const champion = heroOf(match?.champion ?? hero);
  const last = s.matches.at(-1);
  const active = match && !['queue', 'ready'].includes(match.phase);
  return (
    <div className={`league-client ${active ? 'in-game' : ''}`}>
      <header className="lol-client-header">
        <button
          className="lol-home-logo"
          title="英雄联盟首页"
          onClick={() => {
            setTab('首页');
            setSetup(false);
          }}
        >
          <LeagueLogo />
        </button>
        <div className="lol-header-ornament" />
        <button
          className="lol-play"
          onClick={() => {
            setSetup(true);
            setTab('首页');
          }}
          disabled={!!match}
        >
          PLAY<span>开始游戏</span>
        </button>
        <div className="lol-summoner">
          <HeroPortrait id="Ezreal" />
          <div>
            <b>{s.profile.name}</b>
            <span>召唤师等级 {Math.min(30, 1 + Math.floor(s.stats.matches / 4))}</span>
            <i>
              <em style={{ width: `${((s.stats.matches % 4) / 4) * 100}%` }} />
            </i>
          </div>
        </div>
        <div className="lol-currency">
          <span>◆ {400 + s.stats.matches * 70 + s.stats.wins * 35}</span>
          <small>▣ 排位积分 {s.rating}</small>
        </div>
      </header>
      <nav className="lol-client-tabs">
        {['首页', '个人资料', '英雄资料', '战绩', '帮助'].map((t) => (
          <button
            className={tab === t ? 'selected' : ''}
            key={t}
            onClick={() => {
              setTab(t);
              setSetup(false);
            }}
          >
            {t}
          </button>
        ))}
        <span>艾欧尼亚　● 服务器正常</span>
        <button className="lol-box-shortcut" onClick={() => open('gamebox')}>
          打开盒子
        </button>
      </nav>
      <div className="lol-client-body scroll-area">
        {active ? (
          <div className="lol-battle-view">
            <div className="lol-match-score">
              <span>蓝色方</span>
              <b>VS</b>
              <span>紫色方</span>
              <small>
                战局优势 {match.advantage >= 0 ? '+' : ''}
                {match.advantage}
              </small>
              <time>{clockText(s.minute)}</time>
            </div>
            <div className="lol-tactical-map">
              <img src={assetUrl('period-assets/summoners-rift.svg')} alt="旧版召唤师峡谷地图" />
              {[...LEAGUE_HEROES.slice(0, 5), ...LEAGUE_HEROES.slice(5, 10)].map((h, i) => (
                <div
                  key={h.id}
                  className={`map-hero ${i < 5 ? 'blue-team' : 'purple-team'}`}
                  style={{
                    left: `${i < 5 ? 15 + i * 11 : 53 + (i - 5) * 8}%`,
                    top: `${i < 5 ? 75 - i * 12 : 17 + (i - 5) * 11}%`,
                  }}
                >
                  <HeroPortrait id={i === 0 ? champion.id : h.id} />
                </div>
              ))}
              <div className="lol-battle-message">
                {match.phase === 'lane'
                  ? '欢迎来到召唤师峡谷'
                  : match.phase === 'objective'
                    ? '资源刷新，请与队友沟通'
                    : '决定胜负的团战即将开始'}
              </div>
              {boxHints && (
                <div className="lol-box-hint">
                  盒子提示：
                  {match.phase === 'lane'
                    ? '稳定补刀，留意队友发出的支援信号。'
                    : match.phase === 'objective'
                      ? '争夺野区资源前，先检查视野和队伍状态。'
                      : '团战不要脱节，选择适合自己英雄的职责。'}
                </div>
              )}
              <section className="lol-decision-panel">
                <h3>
                  {match.phase === 'lane'
                    ? '对线阶段'
                    : match.phase === 'objective'
                      ? '资源争夺'
                      : '团队决战'}
                  <span>
                    {match.role} · {champion.name}
                  </span>
                </h3>
                <p>选择本阶段的打法。每次决策消耗 25 分钟与 9 点精力。</p>
                <div>
                  {MATCH_CHOICES[match.phase as keyof typeof MATCH_CHOICES].map((c) => (
                    <button key={c.id} onClick={() => send({ type: 'match', choice: c.id })}>
                      <strong>{c.name}</strong>
                      <small>{c.desc}</small>
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <div className="lol-game-hud">
              <div className="lol-hud-portrait">
                <HeroPortrait id={champion.id} />
                <span>
                  {Math.min(18, match.phase === 'lane' ? 3 : match.phase === 'objective' ? 10 : 16)}
                </span>
              </div>
              <div className="lol-hud-bars">
                <b>{champion.name}</b>
                <span>
                  <i style={{ width: `${s.energy}%` }} />
                </span>
                <span className="mana">
                  <i style={{ width: '82%' }} />
                </span>
                <small>
                  精力 {Math.round(s.energy)} / 100　　{champion.type}
                </small>
              </div>
              <div className="lol-abilities">
                {['Q', 'W', 'E', 'R'].map((k, i) => (
                  <div
                    key={k}
                    style={{ backgroundImage: `linear-gradient(${i * 60}deg,#0d4666,#87a8cb,#162d3c)` }}
                  >
                    <b>{k}</b>
                    <small>{i + 1}</small>
                  </div>
                ))}
                <div className="summoner-spells">
                  <span>D</span>
                  <span>F</span>
                </div>
              </div>
              <ItemRow ids={champion.build} />
              <div className="lol-mini-map">
                <img src={assetUrl('period-assets/summoners-rift.svg')} alt="小地图" />
              </div>
            </div>
            <button className="lol-leave" onClick={() => send({ type: 'cancelMatch' })}>
              退出对局（排位积分 -30）
            </button>
          </div>
        ) : match ? (
          <div className="lol-queue-screen">
            <div className="lol-rift-preview">
              <img src={assetUrl('period-assets/summoners-rift.svg')} alt="召唤师峡谷" />
              <span>召唤师峡谷 · 5v5</span>
            </div>
            <h2>{match.phase === 'queue' ? '正在寻找对局' : '找到一场对局！'}</h2>
            <p>
              {match.phase === 'queue'
                ? `预计 ${clockText(match.readyAt)} 匹配成功。可以切换 QQ 回复好友。`
                : '所有玩家已准备就绪。接受后需要持续关注比赛。'}
            </p>
            <div className="lol-queue-player">
              <HeroPortrait id={champion.id} />
              <span>
                {s.profile.name}
                <small>
                  {champion.name} · {match.role}
                </small>
              </span>
              {match.party && (
                <>
                  <Avatar id="haoran" size={48} />
                  <span>
                    张浩然<small>已加入队伍</small>
                  </span>
                </>
              )}
            </div>
            <Button
              className="lol-blue-button"
              onClick={() =>
                match.phase === 'queue'
                  ? send({ type: 'wait', minutes: Math.max(1, match.readyAt - s.minute) })
                  : send({ type: 'match', choice: 'join' })
              }
            >
              {match.phase === 'queue' ? '等待匹配完成' : '接受对局，准备上场'}
            </Button>
            <button className="lol-cancel" onClick={() => send({ type: 'cancelMatch' })}>
              取消匹配
            </button>
          </div>
        ) : setup ? (
          <div className="lol-champion-select">
            <h2>玩家对战　›　召唤师峡谷　›　选择你的英雄</h2>
            <div className="lol-select-columns">
              <div>
                <div className="lol-hero-search">
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    aria-label="搜索英雄"
                    placeholder="搜索英雄名称"
                  />
                  <span>本周免费英雄</span>
                </div>
                <div className="lol-hero-grid">
                  {LEAGUE_HEROES.filter((h) => (h.name + h.nickname).includes(filter)).map((h) => (
                    <button
                      className={hero === h.id ? 'selected' : ''}
                      key={h.id}
                      onClick={() => {
                        setHero(h.id);
                        setRole(h.role);
                      }}
                    >
                      <HeroPortrait id={h.id} />
                      <strong>{h.name}</strong>
                      <small>{h.nickname}</small>
                    </button>
                  ))}
                </div>
                <div className="lol-role-select">
                  <span>你准备打哪个位置？</span>
                  {['上路', '打野', '中路', '射手', '辅助'].map((r) => (
                    <button className={role === r ? 'selected' : ''} key={r} onClick={() => setRole(r)}>
                      {r}
                    </button>
                  ))}
                </div>
                <div className="lol-selected-hero">
                  <HeroPortrait id={hero} />
                  <div>
                    <h3>
                      {heroOf(hero).name}　{heroOf(hero).nickname}
                    </h3>
                    <p>{heroOf(hero).intro}</p>
                    <small>
                      类型：{heroOf(hero).type}　上手难度：{heroOf(hero).difficulty}
                    </small>
                  </div>
                </div>
              </div>
              <aside>
                <h3>邀请好友组队</h3>
                <button
                  className={`lol-party-member ${party ? 'selected' : ''}`}
                  onClick={() => setParty(!party)}
                >
                  <Avatar id="haoran" size={43} />
                  <span>
                    张浩然<small>室友 · 信任 {Math.round(s.npcs[0].trust)}</small>
                  </span>
                  <b>{party ? '✓' : '＋'}</b>
                </button>
                <p>一起赢，也一起面对失败。组队默契会影响战局和友情。</p>
                <div className="lol-match-resources">
                  <span>
                    当前时间 <b>{clockText(s.minute)}</b>
                  </span>
                  <span>
                    精力 <b>{Math.round(s.energy)} / 100</b>
                  </span>
                  <span>
                    竞技能力 <b>{Math.round(s.gaming)}</b>
                  </span>
                </div>
                <Button
                  className="lol-red-button"
                  onClick={() =>
                    send({ type: 'queue', role, hero: heroOf(hero).type, party, champion: hero })
                  }
                >
                  寻找对局
                </Button>
                <small>等待 20 分钟 · 正式对局约 80 分钟</small>
                <button className="lol-cancel" onClick={() => setSetup(false)}>
                  返回大厅
                </button>
              </aside>
            </div>
          </div>
        ) : tab === '首页' ? (
          <div className="lol-lobby">
            <aside className="lol-lobby-left">
              <h3>本周免费英雄</h3>
              <div className="lol-free-heroes">
                {LEAGUE_HEROES.map((h) => (
                  <button
                    key={h.id}
                    title={`${h.name} ${h.nickname}`}
                    onClick={() => {
                      setHero(h.id);
                      setRole(h.role);
                      setSetup(true);
                    }}
                  >
                    <HeroPortrait id={h.id} />
                  </button>
                ))}
              </div>
              <h3>游戏模式</h3>
              <button className="lol-mode active-mode" onClick={() => setSetup(true)}>
                <img src={assetUrl('period-assets/summoners-rift.svg')} alt="" />
                <b>召唤师峡谷</b>
                <small>经典模式 · 5v5</small>
              </button>
              <div className="lol-rank-panel">
                <Icon name="shield" size={42} />
                <strong>第二赛季</strong>
                <b>{s.rating}</b>
                <small>排位赛积分</small>
              </div>
            </aside>
            <main className="lol-lobby-main">
              <div className="lol-featured">
                <img src={assetUrl('period-assets/ashe-2012.jpg')} alt="2012年寒冰射手艾希原画" />
                <div>
                  <span>LEAGUE OF LEGENDS</span>
                  <h1>寒冰射手 · 艾希</h1>
                  <p>精准、耐心，与最后一支水晶箭。</p>
                  <button
                    onClick={() => {
                      setHero('Ashe');
                      setRole('射手');
                      setSetup(true);
                    }}
                  >
                    选择英雄　›
                  </button>
                </div>
              </div>
              <section className="lol-news">
                <h3>
                  游戏公告<span>2012 · 赛季二</span>
                </h3>
                <article>
                  <HeroPortrait id="Ezreal" />
                  <div>
                    <button onClick={() => setSetup(true)}>本周免费英雄轮换</button>
                    <p>艾希、盖伦、安妮、易、娑娜等英雄已加入免费阵容。和室友一起开始一局吧。</p>
                  </div>
                </article>
                <article>
                  <HeroPortrait id="LeeSin" />
                  <div>
                    <button onClick={() => open('campus')}>南川大学秋季校园电竞赛</button>
                    <p>
                      {s.stats.tournament
                        ? '302寝室战队已经拿到校园赛冠军！'
                        : s.flags.includes('team-created')
                          ? '你的寝室战队已组建。继续训练，留意校园来信。'
                          : '和室友组成自己的战队。报名机会将随校园事件推进。'}
                    </p>
                  </div>
                </article>
                <article>
                  <HeroPortrait id="Garen" />
                  <div>
                    <button onClick={() => open('gamebox')}>多玩盒子 · 查看战绩和出装</button>
                    <p>对线、资源争夺、团战，你的每次选择都有记录。用复盘准备下一场比赛。</p>
                  </div>
                </article>
              </section>
            </main>
            <aside className="lol-lobby-right">
              <section>
                <h3>召唤师资料</h3>
                <div className="lol-profile-summary">
                  <HeroPortrait id="Ezreal" />
                  <b>{s.profile.name}</b>
                  <small>艾欧尼亚</small>
                </div>
                <dl>
                  <dt>排位积分</dt>
                  <dd>{s.rating}</dd>
                  <dt>获胜场数</dt>
                  <dd>{s.stats.wins}</dd>
                  <dt>总对局</dt>
                  <dd>{s.stats.matches}</dd>
                  <dt>精力</dt>
                  <dd>{Math.round(s.energy)}</dd>
                </dl>
                <button className="lol-small-blue" onClick={() => setTab('个人资料')}>
                  查看个人资料
                </button>
              </section>
              <section className="lol-friends">
                <h3>好友列表　{party ? '●' : '○'}</h3>
                {['haoran', 'wei', 'zichen'].map((id) => (
                  <button key={id} onClick={() => open('chat', id)}>
                    <Avatar id={id} size={24} />
                    <span>
                      {s.npcs.find((n) => n.id === id) &&
                        { haoran: '张浩然', wei: '李维', zichen: '陈子辰' }[id]}
                      <small>在线</small>
                    </span>
                  </button>
                ))}
              </section>
              {last && (
                <div className={`lol-last-result last-match ${last.win ? 'won' : ''}`}>
                  <b>
                    {last.win ? '胜利' : '失败'}　{last.change > 0 ? '+' : ''}
                    {last.change}
                  </b>
                  <button onClick={() => setTab('战绩')}>查看上一场战绩 ›</button>
                </div>
              )}
            </aside>
          </div>
        ) : tab === '战绩' ? (
          <div className="lol-records">
            <h2>近期比赛记录</h2>
            <p>
              总战绩 {s.stats.wins} 胜 / {s.stats.matches} 场 · 背景训练计入总战绩，详细战术记录来自手动对局。
            </p>
            {s.matches.length ? (
              [...s.matches].reverse().map((m, i) => (
                <article className={`lol-match-record ${m.win ? 'victory' : 'defeat'}`} key={i}>
                  <HeroPortrait id={m.champion ?? 'Ashe'} />
                  <div>
                    <strong>{m.win ? '胜利' : '失败'}</strong>
                    <small>{dateOf(m.day, true)} · 召唤师峡谷</small>
                    <p>{m.decisions.join(' → ')}</p>
                    <small>{m.reason}</small>
                  </div>
                  <b>
                    {m.change > 0 ? '+' : ''}
                    {m.change}
                  </b>
                </article>
              ))
            ) : (
              <p className="lol-empty">还没有手动比赛记录。点击上方 PLAY 开始。</p>
            )}
          </div>
        ) : tab === '英雄资料' ? (
          <div className="lol-champions-page">
            <h2>英雄资料</h2>
            <div className="lol-hero-grid">
              {LEAGUE_HEROES.map((h) => (
                <button key={h.id} className={hero === h.id ? 'selected' : ''} onClick={() => setHero(h.id)}>
                  <HeroPortrait id={h.id} />
                  <strong>{h.name}</strong>
                  <small>{h.nickname}</small>
                </button>
              ))}
            </div>
            <div className="lol-hero-description">
              <HeroPortrait id={hero} />
              <span>
                <h2>
                  {heroOf(hero).name} · {heroOf(hero).nickname}
                </h2>
                <p>{heroOf(hero).intro}</p>
                <small>
                  {heroOf(hero).type} · 推荐位置 {heroOf(hero).role}
                </small>
              </span>
              <button onClick={() => setSetup(true)}>选择此英雄</button>
            </div>
            <h3>推荐出装</h3>
            <ItemRow ids={heroOf(hero).build} />
          </div>
        ) : tab === '个人资料' ? (
          <div className="lol-personal-profile">
            <h2>召唤师：{s.profile.name}</h2>
            <div className="lol-profile-main">
              <HeroPortrait id="Ezreal" />
              <span>
                <strong>艾欧尼亚</strong>
                <small>第二赛季 · 2012</small>
                <b>排位积分 {s.rating}</b>
              </span>
            </div>
            <div className="lol-profile-numbers">
              <div>
                <b>{s.stats.wins}</b>获胜场数
              </div>
              <div>
                <b>{s.stats.matches}</b>总对局
              </div>
              <div>
                <b>{Math.round(s.gaming)}</b>竞技能力
              </div>
              <div>
                <b>{s.stats.tournament ? '冠军' : '未夺冠'}</b>校园赛
              </div>
            </div>
            <Button className="lol-blue-button" onClick={() => setTab('战绩')}>
              查看详细战绩
            </Button>
          </div>
        ) : (
          <div className="lol-help">
            <h2>新手指南</h2>
            <h3>对线：补刀与支援</h3>
            <p>
              射手和法师适合稳健发育；竞技能力达到 38、精力至少 35
              时，主动压制更有机会。打野、辅助与组队玩家可以通过支援建立优势。
            </p>
            <h3>中期：地图资源与视野</h3>
            <p>
              视野提供稳定信息。已有优势且能力高于 32 时，可以考虑入侵野区；发育型英雄也可以选择交换资源。
            </p>
            <h3>团战：保护与开团</h3>
            <p>
              坦克、辅助与射手适合保护核心。开团需要足够的精力、技术和前期优势；上路战士可以通过分带牵制。
            </p>
            <h3>别忘了屏幕外的生活</h3>
            <p>
              匹配等待时可以回复 QQ；正式对局需要持续关注。错过匹配扣 5 分，中途退出扣 30
              分。打完也别忘了课程和作业。
            </p>
          </div>
        )}
      </div>
      <footer className="lol-client-status">
        <span>● PVP.net 已连接</span>
        <span>游戏时间 {clockText(s.minute)}　|　第二赛季</span>
        <button onClick={() => open('chat')}>
          好友 {s.npcs.filter((n) => n.activity !== '补觉').length}　▣
        </button>
      </footer>
    </div>
  );
}

export function LeagueBox() {
  const s = useGame((x) => x.game)!;
  const open = useDesktop((x) => x.open);
  const [tab, setTab] = useState('我的战绩');
  const [hero, setHero] = useState('Ashe');
  const [query, setQuery] = useState(s.profile.name);
  const [searched, setSearched] = useState(s.profile.name);
  const [hints, setHints] = useState(() => localStorage.getItem('gamex-box-hints') !== 'false');
  const valid = searched === s.profile.name;
  const champion = heroOf(hero);
  const winRate = s.stats.matches ? Math.round((s.stats.wins / s.stats.matches) * 100) : 0;
  return (
    <div className="league-box">
      <header className="box-header">
        <AppIcon app="gamebox" size="large" />
        <span>
          <b>多玩英雄联盟盒子</b>
          <small>LOL BOX　玩得更好，赢得更多</small>
        </span>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearched(query.trim());
            setTab('我的战绩');
          }}
        >
          <input
            aria-label="盒子战绩查询"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入召唤师名称"
          />
          <button>查询</button>
        </form>
      </header>
      <nav className="box-tabs">
        {['我的战绩', '英雄资料', '出装攻略', '工具设置'].map((t) => (
          <button key={t} className={tab === t ? 'selected' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
        <button className="box-launch" onClick={() => open('games')}>
          启动英雄联盟
        </button>
      </nav>
      <div className="box-body scroll-area">
        {tab === '我的战绩' ? (
          <>
            {valid ? (
              <>
                <div className="box-player">
                  <HeroPortrait id="Ezreal" />
                  <div>
                    <h2>
                      {s.profile.name}
                      <span>艾欧尼亚</span>
                    </h2>
                    <p>
                      排位积分 <b>{s.rating}</b>　　战斗力{' '}
                      <b>{Math.round(s.gaming * 30 + s.rating * 0.35)}</b>
                    </p>
                    <small>排位赛 / 经典对战 · 第二赛季</small>
                  </div>
                  <aside>
                    <strong>{winRate}%</strong>
                    <small>总胜率 / {s.stats.matches} 场</small>
                  </aside>
                </div>
                <div className="box-data-tabs">
                  <b>最近比赛</b>
                  <span>匹配赛 / 排位赛</span>
                  <button onClick={() => open('games')}>去打一局 ›</button>
                </div>
                {s.matches.length ? (
                  <div className="box-record-list">
                    {[...s.matches].reverse().map((m, i) => (
                      <article key={i} className={m.win ? 'win' : 'loss'}>
                        <span className="box-result">
                          {m.win ? '胜利' : '失败'}
                          <small>5v5</small>
                        </span>
                        <HeroPortrait id={m.champion ?? 'Ashe'} />
                        <div>
                          <b>{heroOf(m.champion).name}　·　召唤师峡谷</b>
                          <p>{m.decisions.join(' → ')}</p>
                          <small>
                            {dateOf(m.day, true)}　{m.reason}
                          </small>
                        </div>
                        <strong>
                          {m.change > 0 ? '+' : ''}
                          {m.change}
                        </strong>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="box-empty">
                    <AppIcon app="gamebox" size="large" />
                    <h3>还没有手动对局记录</h3>
                    <p>从桌面启动英雄联盟，和室友打完一局再来看看。</p>
                    <Button onClick={() => open('games')}>启动游戏</Button>
                  </div>
                )}
              </>
            ) : (
              <div className="box-empty">
                <h3>没有找到这位召唤师</h3>
                <p>请输入本局的召唤师名称：{s.profile.name}。</p>
                <Button
                  onClick={() => {
                    setQuery(s.profile.name);
                    setSearched(s.profile.name);
                  }}
                >
                  查看我的战绩
                </Button>
              </div>
            )}
          </>
        ) : tab === '英雄资料' || tab === '出装攻略' ? (
          <div className="box-guides">
            <aside>
              {LEAGUE_HEROES.map((h) => (
                <button className={hero === h.id ? 'selected' : ''} key={h.id} onClick={() => setHero(h.id)}>
                  <HeroPortrait id={h.id} />
                  {h.name}
                </button>
              ))}
            </aside>
            <section>
              <div className="box-hero-heading">
                <HeroPortrait id={hero} />
                <span>
                  <h2>
                    {champion.name}　{champion.nickname}
                  </h2>
                  <p>
                    {champion.type}　推荐位置：{champion.role}　难度：{champion.difficulty}
                  </p>
                </span>
              </div>
              <h3>{tab === '出装攻略' ? '经典推荐出装' : '英雄玩法'}</h3>
              <p>{champion.intro}</p>
              <ItemRow ids={champion.build} />
              <ol>
                {champion.build.map((id) => (
                  <li key={id}>{ITEM_NAMES[id] ?? '装备'}</li>
                ))}
              </ol>
              <h3>对线建议</h3>
              <p>
                {champion.type === '射手'
                  ? '先稳健补刀，注意走位。没有视野时不要贸然追击，团战优先保证自己的输出位置。'
                  : champion.type === '法师'
                    ? '留意技能冷却和法力，用控制创造机会。中期与队友一起争取地图资源。'
                    : champion.role === '打野'
                      ? '观察各路兵线，及时支援。领先时也要尊重视野，不要一个人深入未知野区。'
                      : '重视团队沟通，承担适合自己的职责。保护、支援与控制同样可以决定胜负。'}
              </p>
              <Button onClick={() => open('games')}>启动游戏，试试这个思路</Button>
            </section>
          </div>
        ) : (
          <section className="box-settings">
            <h2>游戏工具设置</h2>
            <label>
              <input
                type="checkbox"
                checked={hints}
                onChange={(e) => {
                  setHints(e.target.checked);
                  localStorage.setItem('gamex-box-hints', String(e.target.checked));
                  window.dispatchEvent(new Event('gamex-box-settings'));
                }}
              />
              显示野区与资源阶段提示
            </label>
            <p>选项保存在本机。开启后，可在对局中留意“资源争夺”阶段，按视野、发育或入侵作出选择。</p>
            <h3>本地数据</h3>
            <p>战绩直接来自当前游戏存档。盒子不会连接真实的 QQ、Riot 或多玩账号。</p>
            <Button onClick={() => open('settings')}>打开存档管理</Button>
          </section>
        )}
      </div>
      <footer className="box-footer">
        <span>● 英雄联盟已检测到　|　2012 秋季</span>
        <button onClick={() => open('games')}>启动游戏</button>
      </footer>
    </div>
  );
}
