import { describe, expect, it } from 'vitest';
import { createGame, dispatch, availableChallenge } from '../engine/game';
import { hashSeed, random } from '../engine/random';
import { deserialize, serialize } from '../engine/save';
import { courseDefs, absoluteTime, relationValue } from '../engine/helpers';
import { checkEvents } from '../systems/events';
import { currentScore, takeExams } from '../systems/academics';
import { buildResult, sortLeaderboard } from '../systems/settlement';
import { EVENTS, EVENT_CHAINS } from '../content/events';
import { NPCS, TOTAL_DAYS } from '../content/world';

const fresh = (seed = '测试秋天') => createGame({ name: '测试同学', gender: '女', major: 'cs' }, seed);

describe('统一随机数与存档', () => {
  it('新英雄元数据可保存，缺少英雄字段的旧版对局仍然可恢复', () => {
    const current = dispatch(fresh(), {
      type: 'queue',
      role: '中路',
      hero: '法师',
      party: true,
      champion: 'Annie',
    });
    expect(deserialize(serialize(current)).match?.champion).toBe('Annie');
    const legacy = structuredClone(current);
    delete legacy.match!.champion;
    delete legacy.runId;
    const restored = deserialize(serialize(legacy));
    expect(restored.match?.phase).toBe('queue');
    expect(restored.match?.hero).toBe('法师');
    expect(dispatch(restored, { type: 'wait', minutes: 20 }).match?.phase).toBe('ready');
  });
  it('同种子、同操作完整复现，包括人物与课程', () => {
    const a = fresh();
    const b = fresh();
    expect(a).toEqual(b);
    const commands = [
      { type: 'chat', npc: 'haoran', reply: 'support' },
      { type: 'study', course: 'program', mode: 'homework' },
      { type: 'endDay' },
    ] as const;
    let x = a;
    let y = b;
    for (const command of commands) {
      x = dispatch(x, command);
      y = dispatch(y, command);
    }
    expect(x).toEqual(y);
    expect(x.rng).not.toBe(a.rng);
    expect(fresh('另一个种子').npcs).not.toEqual(a.npcs);
  });
  it('随机数处于 [0,1)，可从状态恢复', () => {
    const s = { rng: hashSeed('2012') };
    const a = Array.from({ length: 200 }, () => random(s));
    expect(a.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(new Set(a).size).toBe(200);
    const r = { ...s };
    expect(random(s)).toBe(random(r));
  });
  it('导出再读入保持完整状态与后续随机结果', () => {
    const s = dispatch(dispatch(fresh(), { type: 'chat', npc: 'muwan', reply: 'promise' }), {
      type: 'endDay',
    });
    const loaded = deserialize(serialize(s, '2026-11-06T00:00:00Z'));
    expect(loaded).toEqual(s);
    expect(dispatch(loaded, { type: 'endDay' })).toEqual(dispatch(s, { type: 'endDay' }));
  });
  it('损坏、超范围及缺失字段的存档被拒绝', () => {
    expect(() => deserialize('{}')).toThrow();
    const s = fresh();
    s.energy = NaN;
    expect(() => deserialize(serialize(s))).toThrow();
    const t = fresh();
    t.day = 112;
    expect(() => deserialize(serialize(t))).toThrow();
    const r = fresh();
    (r.npcs[0] as unknown as Record<string, unknown>).bonds = null;
    expect(() => deserialize(serialize(r))).toThrow();
    const bad = fresh();
    (bad.inventory as unknown[]).push({ text: '不能作为文本渲染' });
    expect(() => deserialize(serialize(bad))).toThrow();
  });
});

describe('时间、成本与学习', () => {
  it('活动消耗统一时钟，拒绝不会改变资源', () => {
    const s = fresh();
    const t = dispatch(s, { type: 'study', course: 'program', mode: 'review' });
    expect(t.minute - s.minute).toBe(60);
    expect(s.minute).toBe(480);
    expect(t.energy).toBe(s.energy - 15);
    t.energy = 0;
    const f = dispatch(t, { type: 'work', job: 'cafe' });
    expect(f.minute).toBe(t.minute);
    expect(f.money).toBe(t.money);
    expect(f.lastAction).toContain('精力不足');
    t.minute = 1420;
    t.energy = 100;
    const late = dispatch(t, { type: 'study', course: 'program', mode: 'review' });
    expect(late.minute).toBe(1420);
  });
  it('同日重复收益递减，疲劳影响实际学习效率', () => {
    const s = fresh();
    const first = dispatch(s, { type: 'study', course: 'math', mode: 'review' });
    const second = dispatch(first, { type: 'study', course: 'math', mode: 'review' });
    expect(first.courses[0].knowledge - s.courses[0].knowledge).toBeGreaterThan(
      second.courses[0].knowledge - first.courses[0].knowledge,
    );
    const low = fresh();
    low.energy = 20;
    const tired = dispatch(low, { type: 'study', course: 'math', mode: 'review' });
    expect(tired.courses[0].knowledge - low.courses[0].knowledge).toBeLessThan(
      first.courses[0].knowledge - s.courses[0].knowledge,
    );
  });
  it('课程只在课表时间记录一次，作业每周一次', () => {
    let s = fresh();
    const def = courseDefs(s).find((c) => c.weekday === 0)!;
    s = dispatch(s, { type: 'study', course: def.id, mode: 'class' });
    expect(s.courses.find((c) => c.id === def.id)!.attended).toBe(1);
    expect(s.minute).toBe(def.start + 90);
    const repeated = dispatch(s, { type: 'study', course: def.id, mode: 'class' });
    expect(repeated.minute).toBe(s.minute);
    const h = dispatch(s, { type: 'study', course: 'program', mode: 'homework' });
    const h2 = dispatch(h, { type: 'study', course: 'program', mode: 'homework' });
    expect(h2.minute).toBe(h.minute);
  });
  it('专业题目校验真实答案，正确与订正收益不同', () => {
    const a = fresh();
    const q = availableChallenge(a);
    const good = dispatch(a, { type: 'challenge', question: q.id, answer: q.answer });
    const bad = dispatch(a, { type: 'challenge', question: q.id, answer: (q.answer + 1) % 3 });
    expect(good.professional).toBeGreaterThan(bad.professional);
    expect(good.challengeCursor).toBe(1);
    expect(bad.stats.challengeCorrect).toBe(0);
    expect(dispatch(a, { type: 'challenge', question: '伪造题目', answer: 0 }).minute).toBe(a.minute);
  });
  it('总评独立计算考试、出勤与作业，不能仅靠刷学习值', () => {
    const c = fresh().courses[0];
    Object.assign(c, { exam: 80, scheduled: 10, attended: 5, assignments: 10, homework: 10 });
    expect(currentScore(c).score).toBe(78);
    c.attended = 0;
    c.homework = 0;
    c.exam = 100;
    expect(currentScore(c).score).toBe(60);
    c.exam = 90;
    expect(currentScore(c).score).toBe(54);
  });
  it('睡觉会实际模拟背景日，而不是直接改日期', () => {
    const s = fresh();
    const t = dispatch(s, { type: 'endDay' });
    expect(t.day).toBeGreaterThan(1);
    expect(t.stats.study).toBeGreaterThan(0);
    expect(t.stats.earned).toBeGreaterThan(0);
    expect(t.npcs[0].bonds).not.toEqual(s.npcs[0].bonds);
    expect(t.money).not.toBe(s.money);
  });
  it('兼职有每日次数、专业和技能限制', () => {
    let s = fresh();
    const denied = dispatch(s, { type: 'work', job: 'website' });
    expect(denied.money).toBe(s.money);
    s = dispatch(s, { type: 'work', job: 'cafe' });
    s = dispatch(s, { type: 'work', job: 'cafe' });
    const third = dispatch(s, { type: 'work', job: 'cafe' });
    expect(third.money).toBe(s.money);
    expect(third.minute).toBe(s.minute);
    expect(dispatch(fresh(), { type: 'work', job: 'lab' }).stats.jobs).toBe(0);
  });
});

describe('自主 NPC、关系与事件', () => {
  it('内容满足八名人物、40+事件及十条事件链，无重复 ID', () => {
    expect(NPCS).toHaveLength(8);
    expect(EVENTS.length).toBeGreaterThanOrEqual(40);
    expect(EVENT_CHAINS).toHaveLength(10);
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(EVENTS.length);
    for (const e of EVENTS) {
      expect(e.choices.length).toBeGreaterThanOrEqual(2);
      if (e.previous) expect(EVENTS.some((p) => p.id === e.previous)).toBe(true);
    }
  });
  it('回应方式与真实相处影响多维关系，重复聊天有上限', () => {
    let s = fresh();
    const value = relationValue(s.npcs[4]);
    s = dispatch(s, { type: 'chat', npc: 'muwan', reply: 'support' });
    expect(relationValue(s.npcs[4])).toBeGreaterThan(value);
    expect(s.npcs[4].memories.length).toBe(1);
    s = dispatch(s, { type: 'chat', npc: 'muwan', reply: 'support' });
    s = dispatch(s, { type: 'chat', npc: 'muwan', reply: 'support' });
    const old = s.minute;
    s = dispatch(s, { type: 'chat', npc: 'muwan', reply: 'support' });
    expect(s.minute).toBe(old);
    const decline = dispatch(fresh(), { type: 'chat', npc: 'muwan', reply: 'decline' });
    expect(decline.npcs[4].trust).toBeGreaterThan(fresh().npcs[4].trust);
  });
  it('恋爱需要共同经历和双方条件，教师不能成为恋爱对象', () => {
    const s = fresh();
    const rejected = dispatch(s, { type: 'social', npc: 'muwan', kind: 'confess' });
    expect(rejected.npcs[4].stage).not.toBe('交往');
    const n = s.npcs[4];
    Object.assign(n, { trust: 65, shared: 40, familiar: 65, compatibility: 65 });
    const accepted = dispatch(s, { type: 'social', npc: 'muwan', kind: 'confess' });
    expect(accepted.npcs[4].stage).toBe('交往');
    expect(accepted.history.at(-1)!.kind).toBe('恋爱');
    expect(dispatch(s, { type: 'social', npc: 'zhou', kind: 'confess' }).minute).toBe(s.minute);
  });
  it('承诺需要履行，过期会失去信任', () => {
    let s = dispatch(fresh(), { type: 'chat', npc: 'haoran', reply: 'promise' });
    expect(s.promises).toHaveLength(1);
    for (let i = 0; i < 3; i++) s = dispatch(s, { type: 'endDay' });
    expect(s.npcs[0].conflicts).toBeGreaterThan(0);
    expect(s.promises[0].fulfilled).toBe(true);
  });
  it('事件链需要前置选择，不能提前直接触发结局', () => {
    let s = fresh();
    expect(s.activeEvents.some((e) => e.id === 'team-1')).toBe(true);
    const denied = dispatch(s, { type: 'event', id: 'team-3', choice: 'play' });
    expect(denied.flags).not.toContain('tournament-entered');
    s = dispatch(s, { type: 'event', id: 'team-1', choice: 'join' });
    expect(s.flags).toContain('team-created');
    s.day = 18;
    s.minute = 480;
    s.activeEvents = [];
    checkEvents(s);
    expect(s.activeEvents.some((e) => e.id === 'team-2')).toBe(true);
  });
  it('截止时间受统一时钟控制，活动无法越过事件窗口', () => {
    const s = fresh();
    const active = s.activeEvents.find((e) => e.id === 'team-1')!;
    active.expires = absoluteTime(s) + 10;
    const t = dispatch(s, { type: 'event', id: 'team-1', choice: 'join' });
    expect(t.flags).not.toContain('team-created');
    expect(t.minute).toBe(s.minute);
  });
  it('NPC 无需玩家联系也会成长、建立关系、发动态', () => {
    let s = fresh();
    for (let i = 0; i < 4; i++) s = dispatch(s, { type: 'endDay' });
    expect(s.npcs.every((n) => n.skill > fresh().npcs.find((x) => x.id === n.id)!.skill)).toBe(true);
    expect(s.posts.length).toBeGreaterThan(3);
    expect(s.messages.length).toBeGreaterThan(fresh().messages.length);
  });
});

describe('多任务竞技、结算与排行榜', () => {
  it('匹配等待可聊天，正式对局独占注意力，策略实际影响结果', () => {
    let s = dispatch(fresh(), { type: 'queue', role: '中路', hero: '法师', party: true });
    expect(s.match?.phase).toBe('queue');
    s = dispatch(s, { type: 'chat', npc: 'wei', reply: 'support' });
    expect(s.match?.phase).toBe('queue');
    s = dispatch(s, { type: 'wait', minutes: 5 });
    expect(s.match?.phase).toBe('ready');
    s = dispatch(s, { type: 'match', choice: 'join' });
    expect(s.match?.phase).toBe('lane');
    const busy = dispatch(s, { type: 'study', course: 'math', mode: 'review' });
    expect(busy.minute).toBe(s.minute);
    s = dispatch(s, { type: 'match', choice: 'safe' });
    expect(s.match?.advantage).toBe(3);
    s = dispatch(s, { type: 'match', choice: 'vision' });
    s = dispatch(s, { type: 'match', choice: 'protect' });
    expect(s.match).toBe(null);
    expect(s.stats.matches).toBe(1);
    expect(s.matches[0].decisions).toHaveLength(3);
  });
  it('错过匹配与主动退出有明确损失', () => {
    let s = dispatch(fresh(), { type: 'queue', role: '上路', hero: '战士', party: false });
    const rating = s.rating;
    s = dispatch(s, { type: 'wait', minutes: 120 });
    expect(s.match).toBe(null);
    expect(s.rating).toBe(rating - 5);
  });
  it('完整 112 天可结算，原始轨迹生成回忆，挂科可补考', () => {
    let s = fresh();
    let turns = 0;
    while (s.phase === 'playing' && turns++ < 80) s = dispatch(s, { type: 'endDay' });
    expect(s.phase).toBe('ended');
    expect(s.day).toBe(TOTAL_DAYS - 1);
    expect(s.result?.scores).toHaveLength(5);
    expect(s.result?.memories.every((m) => s.history.some((h) => h.id === m.id && h.text === m.text))).toBe(
      true,
    );
    const failed = s.courses.find((c) => currentScore(c).score < 60);
    if (failed) {
      const before = s.money;
      const t = dispatch(s, { type: 'makeup', course: failed.id });
      expect(t.money).toBe(before - 40);
      expect(t.courses.find((c) => c.id === failed.id)!.makeup).not.toBe(null);
    }
    expect(() => deserialize(serialize(s))).not.toThrow();
  });
  it('称号不矛盾，六榜独立排序并支持同种子过滤', () => {
    const a = fresh();
    a.courses.forEach((c) =>
      Object.assign(c, { knowledge: 95, attended: 16, scheduled: 16, homework: 16, assignments: 16 }),
    );
    takeExams(a);
    a.stats.classesMissed = 60;
    const r = buildResult(a);
    expect(r.titles).toContain('学霸');
    expect(r.titles).not.toContain('逃课之王');
    expect(Object.keys(r.ranking)).toHaveLength(6);
    const other = {
      ...r,
      id: 'other',
      seed: 'other',
      ranking: { ...r.ranking, wealth: r.ranking.wealth + 1000, academic: 20 },
    };
    expect(sortLeaderboard([r, other], 'wealth')[0].id).toBe('other');
    expect(sortLeaderboard([r, other], 'academic')[0].id).toBe(r.id);
    expect(sortLeaderboard([r, other], 'wealth', a.seed)).toHaveLength(1);
  });
});
