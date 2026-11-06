import { NPCS } from '../content/world';
import type { GameState } from '../engine/types';
import { clamp, random } from '../engine/random';
import { log, message, npcDef, remember } from '../engine/helpers';

export function refreshSchedules(s: GameState) {
  const slot = s.minute < 720 ? 0 : s.minute < 1080 ? 1 : 2;
  for (const n of s.npcs) {
    const def = npcDef(n.id);
    n.activity =
      s.day >= 94 && s.minute < 1260
        ? '考前复习'
        : s.day % 7 >= 5 && slot === 0
          ? def.personality === 'competitive'
            ? '补觉'
            : '自由活动'
          : def.schedule[slot];
  }
}

export function npcDay(s: GameState) {
  for (const n of s.npcs) {
    const def = npcDef(n.id);
    n.mood = clamp(n.mood + (random(s) - 0.48) * 12 - (s.day > 94 ? 1.5 : 0));
    n.energy = clamp(65 + random(s) * 30);
    n.skill = clamp(n.skill + (def.personality === 'dutiful' ? 0.45 : 0.25) + random(s) * 0.25);
    n.need =
      s.day >= 94
        ? '准备期末考试'
        : n.mood < 40
          ? '需要独处和休息'
          : def.personality === 'competitive'
            ? '希望得到队友支持'
            : def.personality === 'quiet'
              ? '需要有质量的相处'
              : '希望有人分享日常';
    const other = s.npcs[Math.floor(random(s) * s.npcs.length)];
    if (other.id !== n.id) {
      const affinity = def.interests.some((i) => npcDef(other.id).interests.includes(i));
      n.bonds[other.id] = clamp((n.bonds[other.id] ?? 8) + (affinity ? 1.2 : 0.45) + (random(s) - 0.4) * 2);
      other.bonds[n.id] = n.bonds[other.id];
      if (s.day % 14 === 0)
        remember(s, n, `与${npcDef(other.id).name}一起${def.interests[0]}，彼此更熟悉了。`);
    }
    if (s.day - n.lastTalk > 10) {
      n.familiar = clamp(n.familiar - 0.3);
      if (n.stage === '交往') n.trust = clamp(n.trust - 0.7);
    }
    if (n.stage === '交往' && s.day - n.lastSocial > 18) {
      n.trust = clamp(n.trust - 1.4);
      if (n.trust < 20) {
        n.stage = '分手';
        n.conflicts++;
        remember(s, n, '因为长期缺少相处和沟通，选择结束关系。', 4);
        message(s, n.id, '我们最近好像一直没有真正聊过。想了很久，我觉得还是先各自好好生活吧。');
        log(s, `与${def.name}因长期缺少沟通而分手。`, '关系');
      }
    }
  }
  for (const p of s.promises) {
    if (!p.fulfilled && p.due < s.day) {
      const n = s.npcs.find((n) => n.id === p.npc)!;
      n.trust = clamp(n.trust - 7);
      n.conflicts++;
      remember(s, n, '玩家答应一起活动，但没有履行约定。', 3);
      message(s, n.id, '前几天说好一起的事，我等了一会儿。下次如果没空，提前说一声就好。');
      p.fulfilled = true;
    }
  }
  if (s.day > 0 && random(s) < 0.72) {
    const index = Math.floor(random(s) * s.npcs.length);
    const n = s.npcs[index];
    const def = npcDef(n.id);
    const intent =
      n.id === 'haoran' ? 'game' : ['xiaoyu', 'zichen', 'zhou'].includes(n.id) ? 'study' : 'social';
    const lines: Record<string, string> = {
      haoran:
        s.day > 94 ? '考完一起打两局？这几天我也得复习了。' : '晚上有空一起练练吗？最近版本节奏又变了。',
      wei: '刚从食堂回来。今天的糖醋里脊不错，记得按时吃饭啊。',
      xiaoyu:
        s.day > 84
          ? '我在整理期末错题，有不会的可以一起讨论。'
          : '这周的作业你开始了吗？有道题我想核对一下思路。',
      zichen: '今天在机房又遇到一个有意思的问题。等你有空聊聊。',
      muwan:
        n.trust > 35
          ? '今天走过图书馆，想起上次和你聊的那本书。最近还好吗？'
          : '窗边的银杏又落了几片叶子，今天很适合读书。',
      yuchen: '刚拍到一张很喜欢的照片。等你有空，想给你看看。',
      zhou: '提醒一下同学：作业要独立完成，带着问题来问比直接要答案更有收获。',
      siyuan:
        n.conflicts > 1
          ? '这次活动先安排给其他同学。以后有空再一起参与。'
          : '社团又有新活动了，有时间可以来办公室看看。',
    };
    if (def && n.mood > 25) message(s, n.id, lines[n.id], 'npc', intent);
  }
  if (s.day % 4 === 0) {
    const n = s.npcs[Math.floor(random(s) * s.npcs.length)];
    const def = npcDef(n.id);
    const bond = Object.entries(n.bonds).sort((a, b) => b[1] - a[1])[0];
    const text =
      s.day > 96
        ? '期末周到了。今天的计划：复习、吃饭、早点睡。'
        : bond && bond[1] > 30
          ? `和${npcDef(bond[0]).name}一起度过了一个忙碌的下午，${def.goal}又往前推进了一点。`
          : `${def.goal}。今天也在为这件事慢慢努力。`;
    s.posts.push({
      id: s.nextId++,
      author: n.id,
      category: s.day % 8 === 0 ? '空间说说' : '校园日常',
      text,
      day: s.day,
      likes: Math.floor(random(s) * 20),
      liked: false,
      comments: [],
    });
    s.posts = s.posts.slice(-100);
  }
  refreshSchedules(s);
}

export function fulfillPromises(s: GameState, npc: string, activity: 'study' | 'gaming' | 'social') {
  for (const p of s.promises) {
    if (!p.fulfilled && p.npc === npc && p.activity === activity && p.due >= s.day) {
      p.fulfilled = true;
      const n = s.npcs.find((n) => n.id === npc)!;
      n.promisesKept++;
      n.trust = clamp(n.trust + 6);
      remember(s, n, '玩家履行了一起活动的约定。', 3);
      log(s, `履行了与${npcDef(npc).name}的约定。`, '承诺');
    }
  }
}

export const NPC_PROVIDER_CONTRACT = {
  mode: 'local-rules',
  output: '仅文本表达，禁止修改游戏状态',
  validate: (text: unknown) => typeof text === 'string' && text.length <= 500,
};
export const mainNPCCount = NPCS.length;
