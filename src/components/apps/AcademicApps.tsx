import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { availableChallenge } from '../../engine/game';
import { clockText, courseDefs, dateOf, weekOf, weekdays } from '../../engine/helpers';
import { currentScore } from '../../systems/academics';
import { MAJORS } from '../../content/world';
import { AppLink, Button, Empty, Icon, Progress, ResourceBar, Tag } from '../ui';
import { NewGame } from '../game/NewGame';

export function Schedule() {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const defs = courseDefs(s);
  const times = [480, 600, 840, 960];
  return (
    <>
      <div className="app-header">
        <div>
          <Icon name="calendar" size={23} />
          <span>
            <h2>我的课程表</h2>
            <p>2012—2013 学年第一学期 · 第 {weekOf(s.day)} 周</p>
          </span>
        </div>
        <Tag color="green">{MAJORS[s.profile.major].short} · 大一</Tag>
      </div>
      <ResourceBar />
      <div className="scroll-area app-padding">
        <div className="schedule-intro">
          <span>
            <b>{dateOf(s.day)}</b> {weekdays[s.day % 7]}
          </span>
          <AppLink app="study">作业与复习</AppLink>
        </div>
        <div className="timetable">
          <div className="timetable-head time-cell">时间</div>
          {weekdays.slice(0, 5).map((day, i) => (
            <div className={`timetable-head ${i === s.day % 7 ? 'today' : ''}`} key={day}>
              {day}
              <small>{i === s.day % 7 ? '今天' : ''}</small>
            </div>
          ))}
          {times.map((time) => (
            <div className="timetable-row" key={time}>
              <div className="time-cell">
                <b>{clockText(time)}</b>
                <span>{clockText(time + 90)}</span>
              </div>
              {weekdays.slice(0, 5).map((_, day) => {
                const course = defs.find((c) => c.weekday === day && c.start === time);
                const record = s.courses.find((c) => c.id === course?.id);
                return (
                  <div className={`course-cell ${day === s.day % 7 ? 'today' : ''}`} key={day}>
                    {course ? (
                      <button
                        style={{ '--course-color': course.color } as React.CSSProperties}
                        onClick={() => send({ type: 'study', course: course.id, mode: 'class' })}
                      >
                        <strong>{course.name}</strong>
                        <small>
                          A-{201 + day * 2} · {course.teacher}
                        </small>
                        <span>
                          {record?.lastClass === s.day
                            ? '✓ 今日已出勤'
                            : day === s.day % 7 && s.minute <= course.start + 15
                              ? '点击前往上课 →'
                              : `${course.credits} 学分 · 每周一次`}
                        </span>
                      </button>
                    ) : (
                      <span className="empty-course">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="schedule-note">
          <Icon name="bell" size={18} />
          <span>
            <b>给自己的小提醒</b>
            <p>
              上课需 90 分钟；提前前往会等待到开课时间。迟到超过 15 分钟不能记录出勤。背景日中，学习计划达到 2
              小时会自动出勤。周末没有固定课程。
            </p>
          </span>
        </div>
        <div className="info-box">
          期末总评 = 考试 60% + 出勤 20% + 作业
          20%。作业每周五结算一次，每门课每周一份。现在努力，考前就不用慌张。
        </div>
      </div>
    </>
  );
}

export function Study() {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const [tab, setTab] = useState('courses');
  const [selected, setSelected] = useState(s.courses[0].id);
  const [answer, setAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const defs = courseDefs(s);
  const course = s.courses.find((c) => c.id === selected)!;
  const def = defs.find((c) => c.id === selected)!;
  const question = availableChallenge(s);
  return (
    <>
      <div className="app-header">
        <div>
          <Icon name="book" size={24} />
          <span>
            <h2>学习中心</h2>
            <p>把每一点理解，变成真正属于自己的知识。</p>
          </span>
        </div>
        <span className="ability-badge">
          <Icon name={MAJORS[s.profile.major].icon} size={17} />
          {MAJORS[s.profile.major].ability} <b>{Math.round(s.professional)}</b>
        </span>
      </div>
      <div className="app-tabs">
        <button className={tab === 'courses' ? 'selected' : ''} onClick={() => setTab('courses')}>
          课程与作业
        </button>
        <button className={tab === 'challenge' ? 'selected' : ''} onClick={() => setTab('challenge')}>
          {s.profile.major === 'cs' ? '编程实验室' : '医学学习室'}
        </button>
        <span className="push-right">
          精力 {Math.round(s.energy)} · {clockText(s.minute)}
        </span>
      </div>
      {tab === 'courses' ? (
        <div className="study-layout">
          <aside className="course-list">
            {defs.map((c) => {
              const record = s.courses.find((x) => x.id === c.id)!;
              return (
                <button
                  key={c.id}
                  className={selected === c.id ? 'selected' : ''}
                  onClick={() => setSelected(c.id)}
                >
                  <span>
                    <i style={{ background: c.color }} />
                    <strong>{c.name}</strong>
                  </span>
                  <Progress value={record.knowledge} color={c.color} />
                  <small>
                    掌握度 {Math.round(record.knowledge)}%
                    <b>{record.lastHomework >= Math.floor(s.day / 7) * 7 ? '✓ 本周已交' : '作业待完成'}</b>
                  </small>
                </button>
              );
            })}
            <div className="study-tip">
              <Icon name="leaf" size={19} />
              <p>
                学会休息也是一门课。
                <br />
                精力越低，学习收益越少。
              </p>
            </div>
          </aside>
          <div className="course-detail scroll-area">
            <Tag color="blue">
              {def.credits} 学分 · 难度 {def.difficulty.toFixed(1)}
            </Tag>
            <h1>{def.name}</h1>
            <p className="muted">
              {def.teacher}老师 · {def.style}
            </p>
            <div className="mastery-block">
              <div>
                <span>知识掌握度</span>
                <strong>
                  {Math.round(course.knowledge)}
                  <small>/ 100</small>
                </strong>
              </div>
              <Progress value={course.knowledge} color={def.color} />
              <p>
                {course.knowledge < 35
                  ? '刚刚接触，很多概念还很陌生。慢慢理解，不急着背答案。'
                  : course.knowledge < 70
                    ? '已经搭起知识框架，结合题目和间隔复习会更扎实。'
                    : '理解已经相当扎实。保持间隔复习，照顾好薄弱的其他课程。'}
              </p>
            </div>
            <div className="course-facts">
              <span>
                <small>出勤记录</small>
                <b>
                  {course.attended} /{' '}
                  {course.scheduled + (def.weekday === s.day % 7 && course.lastClass === s.day ? 1 : 0)} 次
                </b>
              </span>
              <span>
                <small>已结算作业</small>
                <b>
                  {course.homework} / {course.assignments} 份
                </b>
              </span>
              <span>
                <small>上次学习</small>
                <b>
                  {course.lastStudy < 0
                    ? '还没开始'
                    : course.lastStudy === s.day
                      ? '今天'
                      : `${s.day - course.lastStudy} 天前`}
                </b>
              </span>
            </div>
            <div className="study-actions">
              <button onClick={() => send({ type: 'study', course: selected, mode: 'review' })}>
                <Icon name="book" size={26} />
                <span>
                  <strong>温故知新</strong>
                  <small>复习知识，厘清思路</small>
                </span>
                <b>60 分钟 · 精力 -15</b>
                <Icon name="arrow" size={17} />
              </button>
              <button
                onClick={() => send({ type: 'study', course: selected, mode: 'homework' })}
                disabled={course.lastHomework >= Math.floor(s.day / 7) * 7}
              >
                <Icon name="diary" size={26} />
                <span>
                  <strong>
                    {course.lastHomework >= Math.floor(s.day / 7) * 7 ? '本周作业已完成' : '完成本周作业'}
                  </strong>
                  <small>每周五计入平时成绩</small>
                </span>
                <b>90 分钟 · 精力 -20</b>
                <Icon name="arrow" size={17} />
              </button>
            </div>
            <div className="info-box">
              {s.profile.major === 'medicine'
                ? '医学课程更需要间隔记忆：相隔至少两天复习，效率加成 35%。'
                : '理解比机械重复更有效：相隔至少两天复习，效率加成 18%。'}
              同一天连续学同一门课会收益递减。
            </div>
          </div>
        </div>
      ) : (
        <div className="challenge-room scroll-area">
          <div className="challenge-heading">
            <span className="challenge-logo">
              <Icon name={s.profile.major === 'cs' ? 'code' : 'heart'} size={30} />
            </span>
            <div>
              <span className="eyebrow">
                {s.profile.major === 'cs' ? 'HELLO, WORLD.' : 'LEARN. RECALL. UNDERSTAND.'}
              </span>
              <h2>{s.profile.major === 'cs' ? '从一个小问题开始。' : '让知识在脑海里连成线。'}</h2>
            </div>
            <Tag>今日 {s.daily.challenges} / 3 题</Tag>
          </div>
          {feedback && (
            <div className={`quiz-feedback ${feedback.correct ? 'correct' : ''}`}>
              <Icon name={feedback.correct ? 'check' : 'help'} size={21} />
              <span>
                <b>{feedback.correct ? '这一次，你想对了。' : '把这次错误，也变成收获。'}</b>
                {feedback.text}
              </span>
              <button onClick={() => setFeedback(null)}>继续练习 ›</button>
            </div>
          )}
          <div className="challenge-card">
            <Tag color="blue">{question.type}</Tag>
            <h2>{question.title}</h2>
            <p>{question.prompt}</p>
            {question.code && (
              <pre>
                <code>{question.code}</code>
              </pre>
            )}
            <div className="quiz-options">
              {question.options.map((text, i) => (
                <button className={answer === i ? 'selected' : ''} key={text} onClick={() => setAnswer(i)}>
                  <span>{String.fromCharCode(65 + i)}</span>
                  {text}
                  <i className="radio-circle">{answer === i && <b />}</i>
                </button>
              ))}
            </div>
            <footer>
              <span>
                <Icon name="clock" size={14} />
                30 分钟 · 精力 -8
              </span>
              <Button
                className="primary"
                icon="check"
                disabled={answer === null || s.daily.challenges >= 3}
                onClick={() => {
                  if (answer === null) return;
                  const oldMinute = s.minute;
                  send({ type: 'challenge', question: question.id, answer });
                  if (useGame.getState().game!.minute !== oldMinute) {
                    setFeedback({ correct: answer === question.answer, text: question.explanation });
                    setAnswer(null);
                  }
                }}
              >
                提交答案
              </Button>
            </footer>
          </div>
          <p className="muted center">
            答对获得更多专业成长；答错也可以通过解析理解。题目以大一基础知识为主。
          </p>
        </div>
      )}
    </>
  );
}

export function Grades() {
  const s = useGame((x) => x.game)!;
  const send = useGame((x) => x.send);
  const [retry, setRetry] = useState(false);
  const open = useDesktop((x) => x.open);
  const result = s.result;
  const defs = courseDefs(s);
  const credits = defs.reduce((a, b) => a + b.credits, 0);
  const estimated =
    s.courses.reduce((a, c) => a + currentScore(c).score * defs.find((d) => d.id === c.id)!.credits, 0) /
    credits;
  return (
    <>
      <div className="academic-header">
        <Icon name="graduation" size={31} />
        <div>
          <h2>南川大学 · 教务管理系统</h2>
          <p>2012—2013 学年 第一学期</p>
        </div>
        <Tag color="green">{result ? '学期已归档' : '学期进行中'}</Tag>
      </div>
      <div className="scroll-area app-padding">
        <div className="grade-profile">
          <span>
            <b>{s.profile.name}</b>　{MAJORS[s.profile.major].name}　2012 级
          </span>
          <small>{result ? '期末总评 · 真实课程记录' : '当前数据 · 期末尚未考试'}</small>
        </div>
        {result && (
          <div className="semester-memo">
            <span className="eyebrow">OUR FIRST AUTUMN · 2012</span>
            <h1>
              这个秋天，你是<span>{result.titles[0]}</span>。
            </h1>
            <p>没有一种人生是标准答案。下面的每一个数字，都来自你真实度过的日子。</p>
            <div>
              {result.titles.map((title) => (
                <Tag key={title} color="gold">
                  {title}
                </Tag>
              ))}
            </div>
          </div>
        )}
        <div className="grade-metrics">
          <div>
            <small>{result ? '学期加权平均' : '当前总评估算'}</small>
            <strong>
              {(result?.average ?? estimated).toFixed(1)}
              <em>分</em>
            </strong>
          </div>
          <div>
            <small>{result ? '平均绩点' : '专业能力'}</small>
            <strong>
              {result?.gpa ?? Math.round(s.professional)}
              <em>{result ? '/ 4.0' : '/ 100'}</em>
            </strong>
          </div>
          <div>
            <small>已修得学分</small>
            <strong>
              {result?.credits ?? '—'}
              <em>/ {credits}</em>
            </strong>
          </div>
          <div>
            <small>未通过课程</small>
            <strong>
              {result?.failed ?? '—'}
              <em>门</em>
            </strong>
          </div>
        </div>
        <table className="data-table grade-table">
          <thead>
            <tr>
              <th>课程名称</th>
              <th>学分</th>
              <th>掌握度</th>
              <th>出勤</th>
              <th>作业</th>
              <th>考试</th>
              <th>{result ? '总评' : '估算'}</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {defs.map((def) => {
              const c = s.courses.find((c) => c.id === def.id)!;
              const score = currentScore(c);
              return (
                <tr key={c.id}>
                  <td>{def.name}</td>
                  <td>{def.credits}</td>
                  <td>{Math.round(c.knowledge)}%</td>
                  <td>{Math.round(score.attendance)}%</td>
                  <td>{Math.round(score.homework)}%</td>
                  <td>{c.exam ?? '未考'}</td>
                  <td>
                    <strong className={score.score < 60 ? 'text-red' : 'text-green'}>{score.score}</strong>
                  </td>
                  <td>
                    {result ? (
                      score.score >= 60 ? (
                        <Tag color="green">{c.makeup !== null ? '补考通过' : '通过'}</Tag>
                      ) : c.makeup !== null ? (
                        <Tag>补考未过</Tag>
                      ) : (
                        <Button onClick={() => send({ type: 'makeup', course: c.id })}>补考 ¥40</Button>
                      )
                    ) : (
                      <Tag>修读中</Tag>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="info-box">
          {result
            ? `考试 60% + 出勤 20% + 作业 20%。${result.scholarship ? `本学期获奖学金资格 ¥${result.scholarship}（下学期发放，未计入当前余额）。` : '挂科不会结束人生，可使用一次补考机会。补考成绩由原有基础与寒假复习计算，总评通过记为 60 分。'}`
            : '当前总评仅为估算，不能代表期末成绩。期末考试会综合知识掌握、专业能力、最近复习与精力单独计算。'}
        </div>
        {result && (
          <>
            <div className="section-heading lower">
              <h2>
                <Icon name="leaf" size={18} />
                这个学期，留下了什么
              </h2>
            </div>
            <div className="result-life">
              <div>
                <Icon name="game" size={20} />
                <b>竞技排位 {s.rating}</b>
                <small>
                  {s.stats.wins} 胜 / {s.stats.matches} 场{result.stats.tournament ? ' · 校园赛冠军' : ''}
                </small>
              </div>
              <div>
                <Icon name="heart" size={20} />
                <b>{result.romance.length ? `与${result.romance.join('、')}交往中` : '认真经营自己的生活'}</b>
                <small>约会 {s.stats.dates} 次 · 共同经历各不相同</small>
              </div>
              <div>
                <Icon name="money" size={20} />
                <b>生活结余 ¥{s.money}</b>
                <small>
                  兼职收入 ¥{s.stats.earned} · {s.stats.jobs} 份工作
                </small>
              </div>
            </div>
            <div className="result-actions">
              <Button icon="diary" onClick={() => open('diary')}>
                翻看校园回忆
              </Button>
              <Button icon="trophy" onClick={() => open('rankings')}>
                本地历史对比
              </Button>
              <Button className="primary" icon="leaf" onClick={() => setRetry(true)}>
                相同种子，再过一个秋天
              </Button>
            </div>
          </>
        )}
        {!result && (
          <Empty
            icon="leaf"
            title="故事正在发生，答案留给期末。"
            text="你仍然可以自由决定今天的生活。每次结束今天，都会向学期终点前进一步。"
          />
        )}
      </div>
      {retry && createPortal(<NewGame retrySeed={s.seed} close={() => setRetry(false)} />, document.body)}
    </>
  );
}
