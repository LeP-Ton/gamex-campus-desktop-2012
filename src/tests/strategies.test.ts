import { describe, it, expect } from 'vitest';
import { createGame, dispatch, availableChallenge } from '../engine/game';
import { PLANS } from '../content/world';
import { EVENTS } from '../content/events';
import { courseDefs } from '../engine/helpers';
import type { Command, GameState, Major, SemesterResult } from '../engine/types';

type Strategy = 'scholar' | 'gamer' | 'romance' | 'social' | 'worker' | 'balanced' | 'random';
function run(strategy: Strategy, major: Major): SemesterResult {
  let s = createGame({ name: strategy, gender: '女', major }, '策略对照-2012');
  s = dispatch(s, { type: 'plan', plan: PLANS[strategy === 'random' ? 'balanced' : strategy].plan });
  const act = (command: Command) => {
    s = dispatch(s, command);
  };
  let turns = 0;
  while (s.phase === 'playing' && turns++ < 80) {
    if (['scholar', 'balanced'].includes(strategy)) {
      const today = courseDefs(s).find((c) => c.weekday === s.day % 7 && c.start + 15 >= s.minute);
      if (today) act({ type: 'study', course: today.id, mode: 'class' });
      const weak = [...s.courses].sort((a, b) => a.knowledge - b.knowledge);
      for (const c of weak.slice(0, strategy === 'scholar' ? 3 : 1)) {
        if (s.energy < 25) act({ type: 'rest', kind: 'nap' });
        act({
          type: 'study',
          course: c.id,
          mode: c.lastHomework < Math.floor(s.day / 7) * 7 ? 'homework' : 'review',
        });
      }
      if (strategy === 'scholar') {
        const q = availableChallenge(s);
        act({ type: 'challenge', question: q.id, answer: q.answer });
      }
    }
    if (strategy === 'gamer' || (strategy === 'balanced' && turns % 2 === 0)) {
      act({ type: 'queue', role: '射手', hero: '射手', party: true });
      act({ type: 'wait', minutes: 20 });
      act({ type: 'match', choice: 'join' });
      act({ type: 'match', choice: 'safe' });
      act({ type: 'match', choice: 'vision' });
      act({ type: 'match', choice: 'protect' });
    }
    if (strategy === 'romance') {
      act({ type: 'chat', npc: 'muwan', reply: 'support' });
      const n = s.npcs.find((n) => n.id === 'muwan')!;
      if (n.stage !== '交往' && n.trust >= 53 && n.shared >= 30 && n.familiar >= 43)
        act({ type: 'social', npc: 'muwan', kind: 'confess' });
      else act({ type: 'social', npc: 'muwan', kind: n.stage === '交往' ? 'date' : 'walk' });
    }
    if (strategy === 'social')
      for (const npc of ['wei', 'siyuan', 'xiaoyu']) {
        if (s.energy < 20) act({ type: 'rest', kind: 'nap' });
        act({ type: 'social', npc, kind: 'walk' });
      }
    if (strategy === 'worker') {
      act({
        type: 'work',
        job:
          s.professional >= 40 ? (major === 'cs' ? 'website' : 'health') : major === 'cs' ? 'repair' : 'lab',
      });
      act({ type: 'work', job: 'cafe' });
    }
    if (strategy === 'balanced') act({ type: 'social', npc: turns % 2 ? 'wei' : 'yuchen', kind: 'walk' });
    if (strategy === 'random') {
      const options: Command[] = [
        { type: 'rest', kind: 'walk' },
        { type: 'work', job: 'cafe' },
        { type: 'study', course: s.courses[turns % 5].id, mode: 'review' },
        { type: 'social', npc: 'haoran', kind: 'walk' },
      ];
      act(options[(turns * 13 + 7) % options.length]);
    }
    for (const a of [...s.activeEvents]) {
      const e = EVENTS.find((e) => e.id === a.id)!;
      const suitable =
        strategy === 'gamer'
          ? e.chain === '寝室战队' || e.category === '游戏'
          : strategy === 'romance'
            ? e.npc === 'muwan'
            : strategy === 'social'
              ? ['校园', '社团'].includes(e.category)
              : strategy === 'scholar'
                ? ['学业', '专业'].includes(e.category)
                : strategy === 'worker'
                  ? e.category === '创业'
                  : turns % 3 === 0;
      if (suitable) {
        if (s.energy < 35) act({ type: 'rest', kind: 'nap' });
        act({ type: 'event', id: e.id, choice: e.choices[0].id });
      }
    }
    if (s.match) act({ type: 'cancelMatch' });
    act({ type: 'endDay' });
  }
  expect(s.phase).toBe('ended');
  expect(turns).toBeLessThan(80);
  expect(s.energy).toBeGreaterThanOrEqual(0);
  expect(s.result?.scores.every((c) => c.score >= 0 && c.score <= 100)).toBe(true);
  expect(s.result?.memories.every((m) => s.history.some((h) => h.id === m.id))).toBe(true);
  return s.result!;
}

describe.each(['cs', 'medicine'] as Major[])('完整学期的七种策略 · %s', (major) => {
  const results: Partial<Record<Strategy, SemesterResult>> = {};
  for (const strategy of [
    'scholar',
    'gamer',
    'romance',
    'social',
    'worker',
    'balanced',
    'random',
  ] as Strategy[]) {
    it(`${strategy} 可以完成学期并生成真实档案`, () => {
      const r = run(strategy, major);
      results[strategy] = r;
      console.log(
        `${major} / ${strategy}: 均分 ${r.average}，电竞 ${r.rating}，结余 ${r.money}，社交 ${r.ranking.social}，恋爱 ${r.romance.join(',') || '无'}，称号 ${r.titles.join(',')}`,
      );
    });
  }
  it('策略具有可解释的机会成本与明显结果差异', () => {
    expect(results.scholar!.average).toBeGreaterThan(results.gamer!.average + 12);
    expect(results.gamer!.stats.gaming).toBeGreaterThan(results.scholar!.stats.gaming + 150);
    expect(results.worker!.money).toBeGreaterThan(results.balanced!.money + 1500);
    expect(results.social!.ranking.social).toBeGreaterThan(results.gamer!.ranking.social);
    expect(results.romance!.romance).toContain('许慕晚');
    expect(results.romance!.stats.dates).toBeGreaterThan(3);
    expect(
      new Set(Object.values(results).map((r) => `${r!.average}:${r!.money}:${r!.titles.join('/')}`)).size,
    ).toBe(7);
  });
});
