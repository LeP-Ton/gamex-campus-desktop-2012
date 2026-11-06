import type { CourseState, GameState } from '../engine/types';
import { clamp, random } from '../engine/random';
import { courseDefs, log } from '../engine/helpers';

/** 疲劳、间隔与同日边际递减共同决定学习效率。 */
export function learn(
  s: GameState,
  course: CourseState,
  hours: number,
  mode: 'review' | 'homework' | 'class' = 'review',
) {
  const def = courseDefs(s).find((c) => c.id === course.id)!;
  const sameDay = s.daily.studied[course.id] ?? 0;
  const spacing = s.day - course.lastStudy >= 2 ? (s.profile.major === 'medicine' ? 1.35 : 1.18) : 1;
  const fatigue = 0.28 + s.energy / 140;
  const diminishing = 1 / (1 + sameDay * 0.7);
  const mastery = Math.max(0.08, 1 - course.knowledge / 100);
  const understanding = 1 + s.professional / 280;
  const gain =
    ((hours * 1.8 * fatigue * spacing * diminishing * mastery * understanding) / def.difficulty) *
    (mode === 'class' ? 1.18 : 1);
  course.knowledge = clamp(course.knowledge + gain);
  course.lastStudy = s.day;
  s.daily.studied[course.id] = sameDay + hours;
  s.stats.study += hours;
  s.professional = clamp(s.professional + hours * 0.65 * (1 - s.professional / 115));
  return gain;
}

export function closeCourses(s: GameState) {
  for (const def of courseDefs(s)) {
    const c = s.courses.find((c) => c.id === def.id)!;
    if (s.day % 7 === def.weekday) {
      c.scheduled++;
      if (c.lastClass !== s.day) s.stats.classesMissed++;
    }
    if (s.day % 7 === 4) {
      c.assignments++;
      if (c.lastHomework >= Math.floor(s.day / 7) * 7) c.homework++;
    }
    const decay = s.day - c.lastStudy > 4 ? (s.profile.major === 'medicine' ? 0.5 : 0.3) : 0.08;
    c.knowledge = clamp(c.knowledge - decay);
  }
}

export function currentScore(c: CourseState, exam?: number) {
  const attendance = c.scheduled ? Math.min(100, (c.attended / c.scheduled) * 100) : 100;
  const homework = c.assignments ? Math.min(100, (c.homework / c.assignments) * 100) : 0;
  const knowledge = exam ?? c.exam ?? Math.min(100, 15 + c.knowledge * 0.92);
  const original = Math.round(knowledge * 0.6 + attendance * 0.2 + homework * 0.2);
  return {
    score: c.makeup !== null && c.makeup >= 60 && original < 60 ? 60 : original,
    attendance,
    homework,
    exam: knowledge,
  };
}

export function takeExams(s: GameState) {
  for (const c of s.courses) {
    const mastery = c.knowledge * 0.93 + s.professional * 0.08;
    const fatigue = s.energy < 35 ? (35 - s.energy) * 0.32 : 0;
    const spacing = s.day - c.lastStudy > 12 ? 5 : 0;
    c.exam = Math.round(clamp(14 + mastery - fatigue - spacing + (random(s) - 0.5) * 8));
  }
  log(s, `参加了第一学期的期末考试。知识积累、平时出勤和作业共同计入总评。`, '考试');
}
