import type { GameState, SemesterResult } from '../engine/types';
import { courseDefs, log, npcDef, relationValue } from '../engine/helpers';
import { currentScore, takeExams } from './academics';

export function buildResult(s: GameState): SemesterResult {
  const defs = courseDefs(s);
  const scores = s.courses.map((c) => ({
    id: c.id,
    name: defs.find((d) => d.id === c.id)!.name,
    ...currentScore(c),
    credits: defs.find((d) => d.id === c.id)!.credits,
    makeup: c.makeup,
  }));
  const totalCredits = scores.reduce((v, c) => v + c.credits, 0);
  const average = scores.reduce((v, c) => v + c.score * c.credits, 0) / totalCredits;
  const failed = scores.filter((c) => c.score < 60).length;
  const romance = s.npcs.filter((n) => n.stage === '交往').map((n) => npcDef(n.id).name);
  const social = s.npcs.reduce((v, n) => v + n.trust * 0.45 + n.shared * 0.3, 0) + s.influence * 2;
  const love =
    s.npcs
      .filter((n) => npcDef(n.id).romance)
      .reduce((v, n) => v + (n.stage === '交往' ? 60 : 0) + relationValue(n) * 0.5 + n.promisesKept * 3, 0) +
    s.stats.dates * 4;
  const dimensions = [
    average / 100,
    Math.min(1, s.gaming / 85),
    Math.min(1, Math.max(0, s.money) / 3500),
    Math.min(1, social / 550),
    Math.min(1, s.professional / 85),
    Math.min(1, s.influence / 80),
  ];
  const balance =
    Math.pow(
      dimensions.reduce((v, d) => v * Math.max(0.03, d), 1),
      1 / dimensions.length,
    ) * 100;
  const titles: string[] = [];
  if (average >= 85 && failed === 0) titles.push('学霸');
  else if (s.stats.classesMissed >= 35) titles.push('逃课之王');
  if (s.gaming >= 75 && s.rating >= 1250) titles.push('电竞大神');
  else if (s.stats.gaming > s.stats.study * 2 && s.stats.gaming > 120) titles.push('宿舍网瘾少年');
  if (s.influence >= 65 && s.stats.clubs >= 2) titles.push('校园风云人物');
  if (s.flags.includes('first-startup') && s.stats.earned > 500) titles.push('创业新星');
  if (romance.length && s.stats.dates >= 4) titles.push('恋爱达人');
  if (s.stats.lateNights >= 18) titles.push('熬夜冠军');
  if (s.stats.earned >= 2500) titles.push('勤工俭学之星');
  if (balance >= 60 && failed === 0) titles.push('全能大学生');
  if (s.stats.tournament) titles.push('校园赛冠军');
  if (!titles.length) titles.push('平凡而精彩');
  const scholarship = average >= 85 && failed === 0 ? 800 : average >= 78 && failed === 0 ? 300 : 0;
  return {
    id: `${s.runId ?? `${s.seed}:${s.profile.name}:${s.profile.major}`}:${s.semester}`,
    name: s.profile.name,
    major: s.profile.major,
    seed: s.seed,
    semester: s.semester,
    scores,
    average: Math.round(average * 10) / 10,
    gpa:
      Math.round(
        (scores.reduce((v, c) => v + (c.score < 60 ? 0 : Math.min(4, (c.score - 50) / 10)) * c.credits, 0) /
          totalCredits) *
          100,
      ) / 100,
    credits: scores.filter((c) => c.score >= 60).reduce((v, c) => v + c.credits, 0),
    failed,
    titles,
    ranking: {
      academic: Math.round(average * 10) / 10,
      gaming: s.rating + (s.stats.tournament ? 150 : 0),
      wealth: s.money,
      social: Math.round(social),
      romance: Math.round(love),
      balanced: Math.round(balance),
    },
    money: s.money,
    rating: s.rating,
    influence: Math.round(s.influence),
    romance,
    memories: s.history.filter((h) => !['日常', '学习'].includes(h.kind)),
    stats: { ...s.stats },
    scholarship,
  };
}

export function settleSemester(s: GameState) {
  takeExams(s);
  s.phase = 'ended';
  s.result = buildResult(s);
  log(
    s,
    `秋季学期结束：修得 ${s.result.credits} 学分，${s.result.failed ? `${s.result.failed} 门课程待补考` : '所有课程通过'}。`,
    '学期',
  );
  s.result.memories = s.history.filter((h) => !['日常', '学习'].includes(h.kind));
  s.lastAction = '这个秋天，已经成为你的回忆。学期档案已生成。';
}

export function sortLeaderboard(results: SemesterResult[], kind: string, seed?: string) {
  return results
    .filter((r) => !seed || r.seed === seed)
    .slice()
    .sort((a, b) => (b.ranking[kind] ?? 0) - (a.ranking[kind] ?? 0));
}

/** 未来联网榜单使用此协议；当前适配器仅操作本地数据。 */
export interface LeaderboardProvider {
  list: (kind: string, seed?: string) => Promise<SemesterResult[]>;
}
