import type { GameState } from '../engine/types';
import { clamp, random } from '../engine/random';
import { log, notice, remember } from '../engine/helpers';
import { fulfillPromises } from './npcs';

export const MATCH_CHOICES = {
  lane: [
    { id: 'safe', name: '稳健补刀', desc: '控制兵线，保持发育；适合射手和法师。' },
    { id: 'aggressive', name: '主动压制', desc: '寻找击杀，技术不足时容易被反打。' },
    { id: 'roam', name: '支援队友', desc: '牺牲个人资源，帮助其他位置。' },
  ],
  objective: [
    { id: 'vision', name: '布置视野，再争资源', desc: '稳健控制信息，适合团队协作。' },
    { id: 'farm', name: '放掉资源，换取发育', desc: '阵容后期较强时，可以交换收益。' },
    { id: 'invade', name: '主动入侵野区', desc: '领先时扩大优势，落后时风险很高。' },
  ],
  fight: [
    { id: 'protect', name: '保护核心，等待机会', desc: '稳住阵型，适合坦克、辅助与射手。' },
    { id: 'engage', name: '抓住机会，果断开团', desc: '需要足够的技术、精力与前期优势。' },
    { id: 'split', name: '分带牵制，交换防御塔', desc: '适合上路战士，依赖沟通与兵线。' },
  ],
};

export function decideMatch(s: GameState, choice: string) {
  const m = s.match!;
  let gain = 0;
  if (m.phase === 'lane') {
    gain =
      choice === 'safe'
        ? m.hero === '射手' || m.hero === '法师'
          ? 3
          : 2
        : choice === 'aggressive'
          ? s.gaming >= 38 && s.energy >= 35
            ? 5
            : -4
          : m.party || m.role === '打野' || m.role === '辅助'
            ? 4
            : 0;
  } else if (m.phase === 'objective') {
    gain =
      choice === 'vision'
        ? m.party
          ? 4
          : 3
        : choice === 'farm'
          ? m.hero === '射手' || m.hero === '法师'
            ? 3
            : 0
          : m.advantage > 2 && s.gaming > 32
            ? 5
            : -4;
  } else if (m.phase === 'fight') {
    gain =
      choice === 'protect'
        ? ['坦克', '辅助', '射手'].includes(m.hero)
          ? 4
          : 2
        : choice === 'engage'
          ? s.energy >= 35 && s.gaming >= 35 && m.advantage >= 3
            ? 6
            : -3
          : m.role === '上路' && m.hero === '战士'
            ? 5
            : m.party
              ? 2
              : -2;
  }
  const phase = m.phase;
  const option =
    phase in MATCH_CHOICES
      ? MATCH_CHOICES[phase as keyof typeof MATCH_CHOICES].find((c) => c.id === choice)
      : undefined;
  m.advantage += gain;
  m.choices.push(`${option?.name ?? choice}（${gain >= 0 ? '+' : ''}${gain} 战局优势）`);
  if (phase === 'lane') m.phase = 'objective';
  else if (phase === 'objective') m.phase = 'fight';
  else finishMatch(s);
}

export function finishMatch(s: GameState) {
  const m = s.match!;
  const teammate = s.npcs.find((n) => n.id === 'haoran')!;
  const probability = clamp(
    0.28 +
      s.gaming / 195 +
      s.energy / 650 +
      m.advantage * 0.022 +
      (m.party ? teammate.trust / 800 : 0) -
      Math.max(0, s.rating - 1000) / 2200,
    0.15,
    0.9,
  );
  const win = random(s) < probability;
  const change = win ? 22 + Math.floor(m.advantage / 3) : -15;
  s.rating = Math.max(0, s.rating + change);
  s.gaming = clamp(s.gaming + (win ? 2.2 : 1.6) * (1 - s.gaming / 115));
  s.stats.matches++;
  if (win) s.stats.wins++;
  const reason = `战局优势 ${m.advantage}；竞技能力 ${Math.round(s.gaming)}；剩余精力 ${Math.round(s.energy)}。${m.party ? '室友默契参与了胜率计算。' : '单人匹配受到队友状态影响。'}`;
  s.matches.push({ day: s.day, win, change, decisions: m.choices, reason });
  s.matches = s.matches.slice(-60);
  if (m.party) {
    teammate.shared = clamp(teammate.shared + 3);
    teammate.trust = clamp(
      teammate.trust + (win ? 2 : m.choices.some((c) => c.includes('支援') || c.includes('保护')) ? 1 : -1),
    );
    remember(s, teammate, `与玩家一起${win ? '赢得' : '输掉'}排位；${m.choices.join('，')}`, win ? 3 : 2);
    fulfillPromises(s, 'haoran', 'gaming');
  }
  const text = `${win ? '取得胜利' : '遗憾落败'}，排位分 ${change > 0 ? '+' : ''}${change}。${win ? '每一个选择，都在影响战局。' : '复盘一下，下一局还有机会。'}`;
  log(s, `征途战场：${text}`, '竞技');
  notice(s, win ? 'VICTORY · 胜利' : 'DEFEAT · 失利', text, 'games');
  s.lastAction = text;
  s.match = null;
}
