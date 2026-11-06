import { EVENTS } from '../content/events';
import type { EventEffect, GameState } from '../engine/types';
import { absoluteTime, log, message, notice, npcDef, remember } from '../engine/helpers';
import { clamp, hashSeed } from '../engine/random';

export function checkEvents(s: GameState) {
  const now = absoluteTime(s);
  for (const active of [...s.activeEvents]) {
    if (active.expires < now) {
      s.eventHistory[active.id] = { day: s.day, choice: 'expired', outcome: '时间窗口已过' };
      s.activeEvents = s.activeEvents.filter((e) => e.id !== active.id);
    }
  }
  if (s.phase !== 'playing') return;
  for (const def of EVENTS) {
    if (s.activeEvents.length >= 3) break;
    const old = s.eventHistory[def.id];
    if (old && s.day - old.day < def.cooldown) continue;
    if (s.activeEvents.some((e) => e.id === def.id)) continue;
    const seedOffset = def.earliest === 0 ? 0 : hashSeed(`${s.seed}:${def.id}`) % 3;
    if (s.day < def.earliest + seedOffset || s.day > def.latest || s.minute < def.hour) continue;
    if (def.major && def.major !== s.profile.major) continue;
    if (def.minInfluence && s.influence < def.minInfluence) continue;
    if (def.minTrust && s.npcs.find((n) => n.id === def.npc)!.trust < def.minTrust) continue;
    if (def.requires && !s.flags.includes(def.requires)) continue;
    if (def.previous && (!s.eventHistory[def.previous] || s.day - s.eventHistory[def.previous].day < 4))
      continue;
    s.activeEvents.push({ id: def.id, opened: now, expires: now + def.window });
    if (!s.daily.background) {
      notice(s, def.name, def.description, 'campus');
      message(s, def.npc, `【${def.name}】${def.description}`);
    }
  }
}

export function applyEffect(s: GameState, effect: EventEffect, npc: string) {
  s.money += effect.money ?? 0;
  s.energy = clamp(s.energy + (effect.energy ?? 0));
  for (const key of ['professional', 'gaming', 'influence'] as const)
    s[key] = clamp(s[key] + (effect[key] ?? 0) * (1 - s[key] / 150));
  if (effect.knowledge)
    s.courses.forEach((c) => {
      c.knowledge = clamp(c.knowledge + effect.knowledge! * (1 - c.knowledge / 125));
      c.lastStudy = s.day;
    });
  const n = s.npcs.find((n) => n.id === npc);
  if (n) {
    n.trust = clamp(n.trust + (effect.trust ?? 0));
    n.shared = clamp(n.shared + (effect.shared ?? 0));
    n.familiar = clamp(n.familiar + 3);
    n.mood = clamp(n.mood + (effect.mood ?? 0));
    if (effect.shared && effect.shared >= 4) remember(s, n, `与玩家完成了一次重要的共同活动。`, 3);
  }
  if (effect.flag && !s.flags.includes(effect.flag)) s.flags.push(effect.flag);
  if (effect.item && !s.inventory.includes(effect.item)) s.inventory.push(effect.item);
}

export function completeEvent(s: GameState, id: string, choiceId: string) {
  const def = EVENTS.find((e) => e.id === id)!;
  const choice = def.choices.find((c) => c.id === choiceId)!;
  applyEffect(s, choice.effect, def.npc);
  s.eventHistory[id] = { day: s.day, choice: choiceId, outcome: choice.description };
  s.activeEvents = s.activeEvents.filter((e) => e.id !== id);
  if (choiceId !== 'decline') {
    s.stats.events++;
    if (def.category === '社团' || def.category === '校园') s.stats.clubs++;
    log(s, `${def.name}：${choice.text}。`, def.category);
    const n = s.npcs.find((n) => n.id === def.npc)!;
    remember(s, n, `与玩家经历了“${def.name}”：${choice.text}。`, 4);
    message(
      s,
      def.npc,
      `今天的${def.name}，谢谢你认真对待。${choice.effect.flag ? '之后有进展，我再来找你。' : '有空再聊。'}`,
    );
    if (choice.effect.flag === 'tournament-entered') {
      const strength = s.gaming * 0.65 + s.energy * 0.15 + n.trust * 0.2;
      const champion = strength >= 55;
      s.stats.tournament = champion;
      s.lastTournamentDay = s.day;
      s.money += champion ? 180 : 40;
      s.rating += champion ? 65 : 15;
      const text = champion
        ? '寝室战队凭借训练与默契拿到了校园赛冠军！'
        : '寝室战队完成了校园赛，虽然没夺冠，但有了第一次正式比赛的经验。';
      log(s, text, '竞技');
      s.posts.push({
        id: s.nextId++,
        author: 'haoran',
        category: '游戏专区',
        text,
        day: s.day,
        likes: champion ? 36 : 12,
        liked: false,
        comments: [],
      });
      notice(s, '校园赛结果', text, 'games');
    }
    if (def.category === '冲突') {
      const witnesses = Object.entries(n.bonds)
        .filter(([, v]) => v > 25)
        .map(([id]) => id);
      for (const other of s.npcs.filter((o) => witnesses.includes(o.id)))
        other.trust = clamp(other.trust + (choice.effect.trust ?? 0) * 0.2);
    }
  } else message(s, def.npc, '好，知道啦。你先忙自己的安排，我们有机会再说。');
  s.lastAction =
    choiceId === 'decline'
      ? `已婉拒${def.name}`
      : `已完成${def.name}，${npcDef(def.npc).name}记住了这次经历。`;
}
