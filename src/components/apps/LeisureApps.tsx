import { useState } from 'react';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { JOBS, MAJORS } from '../../content/world';
import { AppIcon, Button, Icon, ResourceBar, Tag } from '../ui';
import { BrowserChrome } from './BrowserChrome';

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
      <BrowserChrome app="browser" />
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
                            ? '人人网'
                            : app === 'chat'
                              ? '腾讯QQ'
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
