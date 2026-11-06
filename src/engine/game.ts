import { CHALLENGES } from '../content/challenges';
import { EVENTS } from '../content/events';
import { JOBS, KEY_DAYS, NPCS, PLANS, TOTAL_DAYS } from '../content/world';
import { closeCourses, learn, currentScore } from '../systems/academics';
import { decideMatch, MATCH_CHOICES } from '../systems/competition';
import { checkEvents, completeEvent } from '../systems/events';
import { fulfillPromises, npcDay, refreshSchedules } from '../systems/npcs';
import { buildResult, settleSemester } from '../systems/settlement';
import {
  absoluteTime,
  clockText,
  courseDefs,
  log,
  message,
  normalize,
  notice,
  npcDef,
  relationValue,
  remember,
} from './helpers';
import { clamp, hashSeed, random } from './random';
import type { Command, DailyState, GameState, Profile } from './types';

const newDaily = (background = false): DailyState => ({
  studied: {},
  chatted: {},
  worked: 0,
  challenges: 0,
  rested: 0,
  social: {},
  background,
});

export function createGame(profile: Profile, seed: string): GameState {
  const actualSeed = seed.trim().slice(0, 60) || 'campus-2012';
  const s: GameState = {
    version: 1,
    seed: actualSeed,
    rng: hashSeed(actualSeed),
    profile: { ...profile, name: profile.name.trim().slice(0, 16) || '林一' },
    semester: 1,
    day: 0,
    minute: 480,
    phase: 'playing',
    energy: 88,
    money: 800,
    professional: 12,
    gaming: 16,
    influence: 5,
    rating: 800,
    courses: [],
    npcs: [],
    messages: [],
    posts: [],
    history: [],
    notices: [],
    plan: { ...PLANS.balanced.plan },
    stats: {
      study: 0,
      gaming: 0,
      social: 0,
      work: 0,
      rest: 0,
      lateNights: 0,
      classesMissed: 0,
      matches: 0,
      wins: 0,
      jobs: 0,
      earned: 0,
      dates: 0,
      events: 0,
      challenges: 0,
      challengeCorrect: 0,
      clubs: 0,
      tournament: false,
    },
    daily: newDaily(),
    match: null,
    matches: [],
    activeEvents: [],
    eventHistory: {},
    flags: [],
    inventory: ['2012 级新生入学通知书', '一本空白的大学日记'],
    promises: [],
    diary: [],
    challengeCursor: 0,
    result: null,
    nextId: 1,
    lastReport: [],
    lastAction: '欢迎来到南川大学。这个秋天，由你自己安排。',
    criticalDay: true,
    lastTournamentDay: -1,
  };
  s.courses = courseDefs(s).map((c) => ({
    id: c.id,
    knowledge: 13 + random(s) * 9,
    attended: 0,
    scheduled: 0,
    homework: 0,
    assignments: 0,
    lastStudy: -10,
    lastHomework: -10,
    lastClass: -1,
    exam: null,
    makeup: null,
  }));
  s.npcs = NPCS.map((n) => ({
    id: n.id,
    mood: 55 + random(s) * 25,
    energy: 85,
    need: '适应新的学期',
    activity: n.schedule[0],
    familiar: n.role.includes('室友') ? 20 : 8,
    trust: 16 + random(s) * 10,
    compatibility: 35 + random(s) * 35,
    shared: n.role.includes('室友') ? 5 : 0,
    promisesKept: 0,
    conflicts: 0,
    stage: '初识',
    lastTalk: -1,
    lastSocial: -1,
    lastGift: -10,
    lastConfess: -20,
    memories: [],
    longMemories: [],
    bonds: {},
    skill: 15 + random(s) * 20,
  }));
  log(s, `${s.profile.name}拖着行李来到南川大学，搬进了 302 寝室。大学生活，从这台电脑开始。`, '入学');
  message(
    s,
    'haoran',
    '新室友你好！我是张浩然，就住你对床。电脑装好了？晚上一起熟悉熟悉校园吧。',
    'npc',
    'social',
  );
  message(
    s,
    'xiaoyu',
    `欢迎加入 2012 级新生班！我是学习委员林晓雨，课程表和作业都在教务系统里，记得看看～`,
    'npc',
    'study',
  );
  message(s, 'wei', '我把寝室卫生表贴在门后啦。食堂饭卡别忘了办，吃饭的时候叫你！');
  s.posts.push(
    {
      id: s.nextId++,
      author: 'siyuan',
      category: '社团活动',
      text: '欢迎 2012 级新同学！百团大战这周在食堂门口见。大学不止课堂，找一件想认真做的事吧。',
      day: 0,
      likes: 23,
      liked: false,
      comments: [],
    },
    {
      id: s.nextId++,
      author: 'haoran',
      category: '游戏专区',
      text: '302 寝室电脑全部就位！征途战场缺一位队友，新人也欢迎，一起从青铜打起。',
      day: 0,
      likes: 8,
      liked: false,
      comments: [],
    },
    {
      id: s.nextId++,
      author: 'muwan',
      category: '校园日常',
      text: '九月的南川。行李箱的轮子，树影里的光，还有一切刚刚开始的样子。',
      day: 0,
      likes: 16,
      liked: false,
      comments: [],
    },
  );
  checkEvents(s);
  s.notices = [];
  return s;
}

function fail(s: GameState, text: string) {
  s.lastAction = text;
  notice(s, '安排提醒', text);
  return false;
}

function advance(s: GameState, minutes: number, energy = 0) {
  s.minute += minutes;
  s.energy = clamp(s.energy - energy);
  if (s.match?.phase === 'queue' && s.minute >= s.match.readyAt) {
    s.match.phase = 'ready';
    notice(s, '找到对局了', '90 分钟内进入战场，正式比赛会独占你的注意力。', 'games');
  }
  if (s.match?.phase === 'ready' && s.minute > s.match.readyAt + 90) {
    s.match = null;
    s.rating = Math.max(0, s.rating - 5);
    notice(s, '错过了匹配', '你没有及时进入对局，本次排位分 -5。', 'games');
  }
  refreshSchedules(s);
  checkEvents(s);
}

function spend(s: GameState, minutes: number, energy: number, cost = 0, matchAction = false) {
  if (s.phase !== 'playing') return fail(s, '学期已经结束，可以查看档案、补考或用相同种子重开。');
  if (s.match && !['queue', 'ready'].includes(s.match.phase) && !matchAction)
    return fail(s, '正在正式对局中。请先完成比赛，或在游戏启动器中退出并承担损失。');
  if (s.minute + minutes > 1440) return fail(s, '今天的时间不够了。先结束今天，睡醒再安排吧。');
  if (energy > s.energy) return fail(s, '精力不足。先吃点东西、休息或结束今天。');
  if (cost > s.money) return fail(s, `这次安排需要 ¥${cost}，生活费不够了。可以考虑勤工助学。`);
  s.money -= cost;
  advance(s, minutes, energy);
  return true;
}

export function availableChallenge(s: GameState) {
  const list = CHALLENGES[s.profile.major];
  return list[(s.challengeCursor + (hashSeed(s.seed) % list.length)) % list.length];
}

function doBackground(s: GameState) {
  const p = s.plan;
  s.daily = newDaily(true);
  for (const def of courseDefs(s)) {
    const course = s.courses.find((c) => c.id === def.id)!;
    if (def.weekday === s.day % 7 && p.study >= 2) {
      course.attended++;
      course.lastClass = s.day;
      learn(s, course, 1.5, 'class');
      s.energy = clamp(s.energy - 14);
    }
  }
  if (p.study > 0) {
    const preferred = [...s.courses].sort((a, b) => a.knowledge - b.knowledge);
    const count = Math.min(preferred.length, Math.ceil(p.study / 1.5));
    for (const course of preferred.slice(0, count)) learn(s, course, p.study / count);
    if (p.study >= 2)
      s.courses.forEach((course, i) => {
        if (s.day % 5 === i) course.lastHomework = s.day;
      });
    s.energy = clamp(s.energy - p.study * 7);
  }
  if (p.gaming > 0) {
    s.stats.gaming += p.gaming;
    s.gaming = clamp(s.gaming + p.gaming * 0.85 * (1 - s.gaming / 110));
    if (p.gaming >= 2) {
      const win =
        random(s) <
        clamp(0.35 + s.gaming / 200 + s.energy / 650 - Math.max(0, s.rating - 1000) / 2200, 0.15, 0.85);
      s.rating = Math.max(0, s.rating + (win ? 20 : -14));
      s.stats.matches++;
      if (win) s.stats.wins++;
    }
    s.energy = clamp(s.energy - p.gaming * 8);
  }
  if (p.work > 0) {
    const hours = Math.min(5, p.work);
    const earned = Math.round(hours * (14 + s.professional * 0.08));
    s.money += earned;
    s.stats.earned += earned;
    s.stats.work += hours;
    s.stats.jobs++;
    s.professional = clamp(s.professional + hours * 0.12 * (1 - s.professional / 110));
    s.energy = clamp(s.energy - hours * 9);
  }
  if (p.social > 0) {
    const n = s.npcs[(s.day + Math.floor(random(s) * 3)) % s.npcs.length];
    const gain = p.social * 0.7 * (1 - n.shared / 120);
    n.familiar = clamp(n.familiar + gain);
    n.shared = clamp(n.shared + gain);
    n.trust = clamp(n.trust + gain * 0.4);
    n.lastTalk = s.day;
    s.influence = clamp(s.influence + p.social * 0.25 * (1 - s.influence / 120));
    s.stats.social += p.social;
    s.energy = clamp(s.energy - p.social * 5);
    for (const partner of s.npcs.filter((n) => n.stage === '交往')) {
      partner.lastSocial = s.day;
      partner.shared = clamp(partner.shared + p.social * 0.5);
    }
  }
  s.energy = clamp(s.energy + p.rest * 9);
  s.stats.rest += p.rest;
  s.minute = p.gaming >= 5 && p.rest < 2 ? 1410 : 1320;
  checkEvents(s);
}

function closeDay(s: GameState) {
  closeCourses(s);
  const late = s.minute > 1380;
  if (late) s.stats.lateNights++;
  s.money -= 12;
  if (s.money < 0) s.energy = clamp(s.energy - 12);
  if (s.day === TOTAL_DAYS - 1) {
    settleSemester(s);
    return;
  }
  s.day++;
  s.minute = 480;
  s.energy = clamp(76 + Math.min(3, s.plan.rest) * 4 - (late ? 22 : 0) - (s.money < 0 ? 15 : 0));
  s.daily = newDaily();
  if (s.day % 28 === 0) {
    s.money += 650;
    log(s, '收到了本月生活费 ¥650。', '经济');
  }
  npcDay(s);
  checkEvents(s);
}

function endDay(s: GameState) {
  if (s.match && !['queue', 'ready'].includes(s.match.phase))
    return fail(s, '比赛还没有结束。先完成或退出当前对局。');
  if (s.match) {
    s.match = null;
    notice(s, '匹配已取消', '结束今天前，已退出等待队列。', 'games');
  }
  const before = {
    day: s.day,
    money: s.money,
    study: s.stats.study,
    game: s.stats.gaming,
    social: s.stats.social,
    work: s.stats.work,
  };
  closeDay(s);
  while (s.phase === 'playing' && !KEY_DAYS.includes(s.day)) {
    // 链的初次邀请与后续节点都会升级为关键日，避免快进吞掉入场机会。
    const important = s.activeEvents.some((a) => {
      const d = EVENTS.find((e) => e.id === a.id)!;
      return d.chain && Math.floor(a.opened / 1440) === s.day;
    });
    if (important) break;
    doBackground(s);
    closeDay(s);
  }
  s.criticalDay = true;
  const skipped = Math.max(0, s.day - before.day - 1);
  s.lastReport = [
    `结束了今天，${skipped ? `按生活计划模拟 ${skipped} 个背景日` : '迎来了新的关键日'}。`,
    `学习 ${(s.stats.study - before.study).toFixed(1)} 小时 · 游戏 ${(s.stats.gaming - before.game).toFixed(1)} 小时 · 社交 ${(s.stats.social - before.social).toFixed(1)} 小时 · 兼职 ${(s.stats.work - before.work).toFixed(1)} 小时`,
    `生活费变化 ${s.money - before.money >= 0 ? '+' : ''}¥${s.money - before.money}（每日基本生活费 ¥12，按月到账生活费 ¥650）。`,
  ];
  if (s.phase === 'playing') {
    s.lastAction = `新的一天开始了。${skipped ? `${skipped} 个背景日的生活计划已执行。` : '今天有值得留意的安排。'}`;
    notice(s, '早安，南川', s.lastReport[0]);
  }
  if (skipped)
    log(
      s,
      `按生活计划度过了 ${skipped} 个背景日，学习 ${(s.stats.study - before.study).toFixed(1)} 小时，游戏 ${(s.stats.gaming - before.game).toFixed(1)} 小时。`,
      '计划',
    );
  return true;
}

/** 所有游戏指令都通过此入口；复制输入后计算，便于回放与测试。 */
export function dispatch(input: GameState, command: Command): GameState {
  const s = structuredClone(input);
  if (command.type === 'dismiss') {
    s.notices = s.notices.filter((n) => n.id !== command.id);
    return s;
  }
  if (command.type === 'read') {
    s.messages
      .filter((m) => m.npc === command.npc)
      .forEach((m) => {
        m.read = true;
      });
    return s;
  }
  if (command.type === 'diary') {
    const text = command.text.trim().slice(0, 2000);
    const existing = s.diary.find((d) => d.day === s.day);
    if (existing) existing.text = text;
    else if (text) s.diary.push({ day: s.day, text });
    s.lastAction = '日记已保存。很多年后，你还会记得这个秋天。';
    return s;
  }
  if (command.type === 'makeup') {
    const course = s.courses.find((c) => c.id === command.course);
    if (s.phase !== 'ended' || !course || currentScore(course).score >= 60 || course.makeup !== null) {
      fail(s, '只有期末未通过、且尚未补考的课程可以补考。');
      return s;
    }
    if (s.money < 40) {
      fail(s, '补考复习资料需要 ¥40，可保留档案，下次重新挑战。');
      return s;
    }
    s.money -= 40;
    // 补考代表寒假额外复习，依然由原有知识与专业基础决定，不能反复刷成绩。
    course.makeup = Math.round(clamp(40 + course.knowledge * 0.6 + s.professional * 0.14, 0, 85));
    log(
      s,
      `${courseDefs(s).find((c) => c.id === course.id)!.name}补考 ${course.makeup} 分，${course.makeup >= 60 ? '通过，课程总评按 60 分记录' : '仍未通过，保留实际记录'}。`,
      '补考',
    );
    s.result = buildResult(s);
    s.lastAction = `补考结果：${course.makeup} 分。`;
    return s;
  }
  if (s.phase !== 'playing') {
    fail(s, '这个学期已结束。请查看档案或重新开始。');
    return s;
  }

  switch (command.type) {
    case 'plan': {
      const values = Object.values(command.plan);
      if (
        values.length !== 5 ||
        values.some((v) => !Number.isInteger(v) || v < 0 || v > 8) ||
        values.reduce((a, b) => a + b, 0) > 8
      ) {
        fail(s, '每天可分配的课余时间最多 8 小时，各项请使用非负整数。');
        break;
      }
      s.plan = { ...command.plan };
      s.lastAction = '生活计划已保存，将从接下来的背景日开始执行。';
      break;
    }
    case 'study': {
      const course = s.courses.find((c) => c.id === command.course);
      const def = courseDefs(s).find((c) => c.id === command.course);
      if (!course || !def) {
        fail(s, '这门课不在本学期课程中。');
        break;
      }
      if (command.mode === 'class') {
        if (s.day % 7 !== def.weekday || course.lastClass === s.day || s.minute > def.start + 15) {
          fail(s, '这节课当前不在可出勤时间内。请根据课程表安排上课。');
          break;
        }
        const duration = Math.max(0, def.start - s.minute) + 90;
        if (!spend(s, duration, 16)) break;
        course.lastClass = s.day;
        course.attended++;
        const gain = learn(s, course, 1.5, 'class');
        s.lastAction = `完成${def.name}课堂，掌握度 +${gain.toFixed(1)}，出勤已记录。`;
      } else {
        const homework = command.mode === 'homework';
        if (homework && course.lastHomework >= Math.floor(s.day / 7) * 7) {
          fail(s, '本周这门课的作业已经完成，可以选择间隔复习。');
          break;
        }
        if ((s.daily.studied[course.id] ?? 0) >= 5) {
          fail(s, '今天这门课已经学习很久了。换个任务或休息，明天复习效率更高。');
          break;
        }
        if (!spend(s, homework ? 90 : 60, homework ? 20 : 15)) break;
        const gain = learn(s, course, homework ? 1.5 : 1, homework ? 'homework' : 'review');
        if (homework) course.lastHomework = s.day;
        s.lastAction = `${homework ? '完成作业' : '完成复习'}：${def.name}掌握度 +${gain.toFixed(1)}。${s.energy < 35 ? '疲劳影响了学习效率。' : '跨日期复习能记得更牢。'}`;
        fulfillPromises(s, 'xiaoyu', 'study');
      }
      log(s, s.lastAction, '学习');
      break;
    }
    case 'challenge': {
      const question = availableChallenge(s);
      if (question.id !== command.question || s.daily.challenges >= 3) {
        fail(s, '今天最多完成 3 道专业练习，请使用当前题目。');
        break;
      }
      if (
        !Number.isInteger(command.answer) ||
        command.answer < 0 ||
        command.answer >= question.options.length
      )
        break;
      if (!spend(s, 30, 8)) break;
      const correct = command.answer === question.answer;
      const gain = ((correct ? 4.5 : 1.2) * (1 - s.professional / 115)) / (1 + s.daily.challenges * 0.3);
      s.professional = clamp(s.professional + gain);
      s.challengeCursor++;
      s.daily.challenges++;
      s.stats.challenges++;
      if (correct) s.stats.challengeCorrect++;
      learn(s, s.courses[0], correct ? 0.6 : 0.2);
      s.lastAction = `${correct ? '回答正确' : '这次答错了'}，专业能力 +${gain.toFixed(1)}。${question.explanation}`;
      log(s, `完成${question.type}“${question.title}”，${correct ? '回答正确' : '订正了错误'}。`, '专业');
      break;
    }
    case 'work': {
      const job = JOBS.find((j) => j.id === command.job);
      if (!job || (job.major && job.major !== s.profile.major)) {
        fail(s, '这份兼职不适合当前专业。');
        break;
      }
      if (s.professional < job.ability) {
        fail(s, `这份兼职需要专业能力达到 ${job.ability}。`);
        break;
      }
      if (s.daily.worked >= 2) {
        fail(s, '今天已经做过两份兼职，岗位和体力都有限。');
        break;
      }
      if (!spend(s, job.minutes, job.energy)) break;
      const pay = Math.round(job.pay * (0.8 + s.energy / 500 + s.professional / 500));
      s.money += pay;
      s.stats.earned += pay;
      s.stats.jobs++;
      s.daily.worked++;
      s.stats.work += job.minutes / 60;
      s.professional = clamp(s.professional + (job.major ? 2 : 0.6) * (1 - s.professional / 120));
      s.lastAction = `完成${job.name}，实际收入 ¥${pay}。工作质量受精力与专业能力影响。`;
      log(s, `完成${job.name}，赚到 ¥${pay}。`, '兼职');
      break;
    }
    case 'rest': {
      if (s.daily.rested >= 4) {
        fail(s, '今天已经休息了很多次，睡一晚才能更充分地恢复。');
        break;
      }
      const config = { nap: [60, 0, 26], meal: [35, 8, 17], walk: [45, 0, 14] }[command.kind];
      if (!config || !spend(s, config[0], 0, config[1])) break;
      const gain = config[2] / (1 + s.daily.rested * 0.35);
      s.energy = clamp(s.energy + gain);
      s.daily.rested++;
      s.stats.rest += config[0] / 60;
      s.lastAction = `休息了一会儿，精力恢复 ${Math.round(gain)} 点。日子很长，别一直绷着。`;
      break;
    }
    case 'chat': {
      const n = s.npcs.find((n) => n.id === command.npc);
      if (!n) break;
      const def = npcDef(n.id);
      const today = s.daily.chatted[n.id] ?? 0;
      if (today >= 3) {
        fail(s, '今天聊得已经不少了。关系需要真实相处，留点话题下次再聊。');
        break;
      }
      if (!spend(s, 15, 2)) break;
      const incoming = [...s.messages].reverse().find((m) => m.npc === n.id && m.from === 'npc');
      const expired = incoming?.expires !== undefined && incoming.expires < absoluteTime(s);
      const replies = {
        support: '听你说说。有什么我能帮上忙的？',
        invite: '有空一起出去走走吗？',
        decline: '我今天有安排，提前和你说一声。下次一起！',
        promise: '这两天我会安排时间，和你一起完成。',
        custom: command.text?.trim().slice(0, 200) || '最近怎么样？',
      };
      message(s, n.id, replies[command.reply], 'player');
      s.messages
        .filter((m) => m.npc === n.id)
        .forEach((m) => {
          m.read = true;
        });
      const meaningful = command.reply === 'support' || command.reply === 'custom';
      const personality = meaningful && ['quiet', 'warm'].includes(def.personality) ? 1.3 : 1;
      const gain =
        (((command.reply === 'decline' ? 1 : 2.8) * personality) / (today + 1)) * (1 - n.trust / 130);
      n.familiar = clamp(n.familiar + 3 / (today + 1));
      n.trust = clamp(n.trust + gain);
      n.lastTalk = s.day;
      s.daily.chatted[n.id] = today + 1;
      s.stats.social += 0.25;
      if (command.reply === 'promise' && !s.promises.some((p) => p.npc === n.id && !p.fulfilled))
        s.promises.push({
          npc: n.id,
          activity:
            incoming?.intent === 'game' ? 'gaming' : incoming?.intent === 'study' ? 'study' : 'social',
          due: s.day + 4,
          fulfilled: false,
        });
      const answer = expired
        ? '刚才的安排已经结束啦。不过没关系，我们也可以聊聊别的。'
        : command.reply === 'decline'
          ? '收到，谢谢你提前告诉我。先忙你的，之后再约。'
          : command.reply === 'promise'
            ? '好，那这几天等你。要是安排变了，记得跟我说。'
            : n.mood < 40
              ? '谢谢你听我说。最近有点累，等我缓一缓再一起出去吧。'
              : def.personality === 'quiet'
                ? '嗯，和你慢慢聊还挺舒服的。最近读到一段很喜欢的话，下次分享给你。'
                : def.personality === 'competitive'
                  ? '哈哈，有你这句话就够了。做事的时候一起，肯定更有劲！'
                  : '谢谢你记得。我最近一直在忙自己的计划，有进展再告诉你。';
      message(s, n.id, answer);
      remember(s, n, `玩家${command.reply === 'decline' ? '提前说明了自己的安排' : '认真回应了我的消息'}。`);
      s.lastAction = `${def.name}的信任 +${gain.toFixed(1)}。${command.reply === 'promise' ? '请在 4 天内通过相关活动履行承诺。' : '关系会记住你如何相处。'}`;
      if (n.stage === '初识' && n.familiar >= 30 && n.trust >= 28) n.stage = '朋友';
      break;
    }
    case 'social': {
      const n = s.npcs.find((n) => n.id === command.npc);
      if (!n) break;
      const def = npcDef(n.id);
      const kind = command.kind;
      if (kind === 'breakup') {
        if (n.stage !== '交往') break;
        if (!spend(s, 45, 5)) break;
        n.stage = '分手';
        n.trust = clamp(n.trust - 8);
        remember(s, n, '双方认真谈过后结束了恋爱关系。', 4);
        log(s, `与${def.name}平静地结束了恋爱关系。`, '关系');
        s.lastAction = '已经认真说清楚了彼此的想法。';
        break;
      }
      if ((s.daily.social[n.id] ?? 0) >= 1) {
        fail(s, '今天已经和这位同学一起活动过了，彼此也需要自己的生活。');
        break;
      }
      if (kind === 'date' && n.stage !== '交往' && n.stage !== '暧昧') {
        fail(s, '你们还需要更多了解，可以先从散步和共同活动开始。');
        break;
      }
      if ((kind === 'date' || kind === 'confess') && !def.romance) {
        fail(s, '这位角色适合发展友情或师生关系。');
        break;
      }
      if (kind === 'confess' && n.stage === '交往') {
        fail(s, '你们已经在交往了，好好维护关系吧。');
        break;
      }
      if (kind === 'confess' && s.day - n.lastConfess < 8) {
        fail(s, '请尊重对方的想法，留出相处和思考的时间。');
        break;
      }
      if (kind === 'confess' && s.npcs.some((other) => other.stage === '交往')) {
        fail(s, '请先认真处理现有关系，再考虑新的表白。');
        break;
      }
      if (s.day >= 94 && n.trust < 55) {
        fail(s, `${def.name}正在准备考试，暂时谢绝邀约。尊重对方的日程，也可以发消息问候。`);
        break;
      }
      if (n.mood < 28) {
        fail(s, `${def.name}今天想独处一会儿，可以先在聊天里关心一下。`);
        break;
      }
      const mins = kind === 'date' ? 120 : kind === 'coffee' ? 75 : kind === 'confess' ? 60 : 60;
      const cost = kind === 'date' ? 35 : kind === 'coffee' ? 16 : 0;
      if (!spend(s, mins, kind === 'date' ? 16 : 10, cost)) break;
      s.daily.social[n.id] = 1;
      s.stats.social += mins / 60;
      n.lastTalk = s.day;
      n.lastSocial = s.day;
      if (kind === 'confess') {
        n.lastConfess = s.day;
        const accepted =
          n.trust >= 52 && n.shared >= 28 && n.familiar >= 42 && n.compatibility >= 38 && n.conflicts < 4;
        n.stage = accepted ? '交往' : n.stage;
        s.lastAction = accepted
          ? `${def.name}接受了你的心意。关系需要两个人继续用心经营。`
          : `${def.name}说：“谢谢你认真告诉我。不过，我还想多了解你一些。”共同经历、信任和契合都需要时间。`;
        log(s, s.lastAction, '恋爱');
        remember(s, n, accepted ? '接受了玩家的表白，开始交往。' : '认真回应了玩家的表白，但暂未接受。', 5);
        message(
          s,
          n.id,
          accepted
            ? '那，以后也一起好好生活吧。别只顾着我，你自己的梦想也很重要。'
            : '希望你理解我的想法。我们都还有自己的生活，可以慢慢了解。',
        );
      } else {
        const quality = (0.6 + s.energy / 160) * (def.personality === 'quiet' && kind === 'walk' ? 1.2 : 1);
        n.familiar = clamp(n.familiar + 6 * quality);
        n.shared = clamp(n.shared + 5 * quality);
        n.trust = clamp(n.trust + 4 * quality * (1 - n.trust / 140));
        n.mood = clamp(n.mood + 6);
        // 契合会在真实相处中逐渐建立，不用开局的一次随机数永久否决一段关系。
        n.compatibility = clamp(
          n.compatibility + (kind === 'walk' && def.personality === 'quiet' ? 0.9 : 0.5) * quality,
        );
        if (kind === 'date') s.stats.dates++;
        if (n.stage === '初识' && n.familiar >= 28) n.stage = '朋友';
        if (def.romance && n.stage === '朋友' && n.trust >= 42 && n.shared >= 20) n.stage = '暧昧';
        s.influence = clamp(s.influence + 0.8);
        s.lastAction = `和${def.name}${kind === 'coffee' ? '喝了杯热饮' : kind === 'date' ? '度过了一次约会' : '一起在校园散步'}。多了一段共同回忆。`;
        log(s, s.lastAction, kind === 'date' ? '恋爱' : '社交');
        remember(s, n, s.lastAction, 3);
        fulfillPromises(s, n.id, 'social');
      }
      break;
    }
    case 'queue': {
      if (s.match) {
        fail(s, '已经有一场等待或进行中的对局。');
        break;
      }
      if (
        !['上路', '打野', '中路', '射手', '辅助'].includes(command.role) ||
        !['战士', '法师', '射手', '坦克', '辅助'].includes(command.hero)
      )
        break;
      if (s.minute > 1260) {
        fail(s, '完整比赛需要预留时间。今天太晚了，明天再战吧。');
        break;
      }
      if (!spend(s, 5, 2)) break;
      s.match = {
        phase: 'queue',
        readyAt: s.minute + 20,
        role: command.role,
        hero: command.hero,
        party: command.party,
        advantage: s.flags.includes('patch-studied') ? 2 : 0,
        choices: [],
      };
      s.lastAction = '已加入匹配队列。等待时可回复消息；20 分钟后再来看看。';
      break;
    }
    case 'match': {
      if (!s.match) {
        fail(s, '还没有匹配到对局。');
        break;
      }
      if (s.match.phase === 'queue') {
        fail(s, `队列还在等待，到 ${clockText(s.match.readyAt)} 会找到对局。`);
        break;
      }
      if (s.match.phase === 'ready') {
        if (command.choice !== 'join' || !spend(s, 5, 2, 0, true)) break;
        // 入场后到团战结束，所有需要注意力的其他活动均被规则引擎锁定。
        if (s.match) {
          s.match.phase = 'lane';
          s.lastAction = '比赛开始，先决定对线策略。';
        }
        break;
      }
      const phase = s.match.phase;
      if (!MATCH_CHOICES[phase].some((c) => c.id === command.choice)) break;
      if (!spend(s, 25, 9, 0, true)) break;
      s.stats.gaming += 25 / 60;
      decideMatch(s, command.choice);
      if (s.match) s.lastAction = '战局已经变化，接下来怎么做？';
      break;
    }
    case 'cancelMatch': {
      if (!s.match) break;
      const exclusive = !['queue', 'ready'].includes(s.match.phase);
      if (exclusive) {
        s.rating = Math.max(0, s.rating - 30);
        s.stats.matches++;
        log(s, '中途退出了正式对局，排位分 -30。', '竞技');
      }
      s.match = null;
      s.lastAction = exclusive ? '已退出对局，排位分 -30。队友会记住这次离场。' : '已退出匹配队列。';
      break;
    }
    case 'event': {
      const active = s.activeEvents.find((e) => e.id === command.id);
      const def = EVENTS.find((e) => e.id === command.id);
      const choice = def?.choices.find((c) => c.id === command.choice);
      if (!active || !def || !choice) {
        fail(s, '这个事件已经不在当前时间窗口。');
        break;
      }
      if (absoluteTime(s) + choice.minutes > active.expires) {
        fail(s, '剩余事件时间不足以完成这个选择。');
        break;
      }
      const n = s.npcs.find((n) => n.id === def.npc)!;
      if (
        choice.needs &&
        ((choice.needs.professional ?? 0) > s.professional ||
          (choice.needs.gaming ?? 0) > s.gaming ||
          (choice.needs.trust ?? 0) > n.trust)
      ) {
        fail(s, '当前能力或关系尚未满足这个选择的要求，可选择其他方式参与。');
        break;
      }
      if (!spend(s, choice.minutes, choice.energy, choice.cost)) break;
      completeEvent(s, command.id, command.choice);
      break;
    }
    case 'wait': {
      if (!Number.isFinite(command.minutes) || command.minutes < 1 || command.minutes > 120) break;
      if (spend(s, Math.round(command.minutes), 0))
        s.lastAction = `时间过去了 ${Math.round(command.minutes)} 分钟，世界仍在继续运转。`;
      break;
    }
    case 'post': {
      const text = command.text.trim().slice(0, 300);
      if (!text) break;
      if (s.posts.filter((p) => p.author === 'player' && p.day === s.day).length >= 2) {
        fail(s, '今天已经发过两条动态了，留一点时间去真正生活吧。');
        break;
      }
      if (!spend(s, 15, 2)) break;
      const audience = s.npcs.filter((n) => n.familiar > 20).map((n) => n.id);
      s.posts.push({
        id: s.nextId++,
        author: 'player',
        category: command.category.slice(0, 20),
        text,
        day: s.day,
        likes: Math.floor(audience.length / 2),
        liked: false,
        audience,
        comments: audience.slice(0, 1).map((id) => ({ author: id, text: '看到啦，下次一起！' })),
      });
      s.influence = clamp(s.influence + audience.length * 0.4);
      s.lastAction = '动态已发布，熟悉你的同学会看到。';
      log(s, `发布动态：${text}`, '论坛');
      break;
    }
    case 'like': {
      const post = s.posts.find((p) => p.id === command.post);
      if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
      }
      break;
    }
    case 'comment': {
      const post = s.posts.find((p) => p.id === command.post);
      const text = command.text.trim().slice(0, 120);
      if (!post || !text) break;
      if (post.comments.some((c) => c.author === 'player')) {
        fail(s, '你已经回复过这条动态了。');
        break;
      }
      if (!spend(s, 10, 1)) break;
      post.comments.push({ author: 'player', text });
      const n = s.npcs.find((n) => n.id === post.author);
      if (n) n.familiar = clamp(n.familiar + 1);
      s.lastAction = '评论已发送。';
      break;
    }
    case 'endDay':
      endDay(s);
      break;
  }
  normalize(s);
  return s;
}

export const gameSnapshot = (s: GameState) => ({
  day: s.day,
  time: clockText(s.minute),
  phase: s.phase,
  energy: Math.round(s.energy),
  money: s.money,
  courses: s.courses.map((c) => ({
    id: c.id,
    knowledge: Math.round(c.knowledge),
    score: currentScore(c).score,
  })),
  relationships: s.npcs.map((n) => ({
    name: npcDef(n.id).name,
    stage: n.stage,
    value: Math.round(relationValue(n)),
  })),
});
