import type { Major } from '../engine/types';

export interface Challenge {
  id: string;
  type: string;
  title: string;
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
}
export const CHALLENGES: Record<Major, Challenge[]> = {
  cs: [
    {
      id: 'cs-1',
      type: 'Debug 实验',
      title: '消失的最后一个数',
      prompt: '这个程序想计算 1 到 5 的和，却只输出 10。应该修改哪一处？',
      code: 'int sum = 0;\nfor (int i = 1; i < 5; i++) {\n    sum += i;\n}\nprintf("%d", sum);',
      options: ['把 sum 的初值改为 1', '将 i < 5 改为 i <= 5', '把 i++ 改为 ++i'],
      answer: 1,
      explanation: '循环边界必须包含 5。修改为 i <= 5 后，结果为 15。注意边界是程序员的基本功。',
    },
    {
      id: 'cs-2',
      type: '编程逻辑',
      title: '寝室里的排序问题',
      prompt: '用冒泡排序将 [3, 1, 4, 2] 从小到大排列。第一轮从左到右比较结束后，数组是什么？',
      options: ['[1, 2, 3, 4]', '[1, 3, 2, 4]', '[3, 1, 2, 4]'],
      answer: 1,
      explanation: '相邻比较依次交换 3/1、不交换 3/4、交换 4/2，最大值 4 被移动到末尾。',
    },
    {
      id: 'cs-3',
      type: '软件开发',
      title: '给班级写个点名器',
      prompt: '有 30 位同学，要按学号快速查找姓名。首版数据固定且学号连续，最简单直接的数据结构是什么？',
      options: ['按学号索引的数组', '每次遍历所有文件', '为每位同学创建一个进程'],
      answer: 0,
      explanation: '连续的小规模索引适合数组，查询直观且成本低。数据结构应服务实际需求。',
    },
    {
      id: 'cs-4',
      type: 'Debug 实验',
      title: '为什么一直循环？',
      prompt: '代码原本要判断 n 是否等于 0，却总进入错误分支。问题在哪里？',
      code: 'int n = 3;\nif (n = 0) {\n    printf("zero");\n} else {\n    printf("other");\n}',
      options: ['printf 少了换行', '赋值 = 应改为比较 ==', 'n 必须声明为浮点数'],
      answer: 1,
      explanation: '单个等号是赋值，双等号才是相等比较。这种错误有时可以通过编译警告发现。',
    },
    {
      id: 'cs-5',
      type: '编程逻辑',
      title: '二分查找的前提',
      prompt: '想在一本有 1000 条记录的电子通讯录中进行二分查找，首先需要什么？',
      options: ['保证所有记录按查找键排序', '把所有记录都复制三遍', '只保存最后一条记录'],
      answer: 0,
      explanation: '二分查找依赖有序性，每一步根据中间值排除一半搜索区间。',
    },
    {
      id: 'cs-6',
      type: '软件开发',
      title: '存档文件损坏了',
      prompt: '校园小工具读取 JSON 存档失败，怎样处理更稳妥？',
      options: ['直接覆盖原文件', '校验结构，保留原始文件并提示恢复', '忽略错误继续读取空对象'],
      answer: 1,
      explanation: '输入要校验，失败时保留用户数据。错误恢复也是软件设计的一部分。',
    },
  ],
  medicine: [
    {
      id: 'med-1',
      type: '结构匹配',
      title: '血液的第一站',
      prompt: '体循环的静脉血经上、下腔静脉，首先回到心脏的哪个腔？',
      options: ['左心房', '右心房', '左心室'],
      answer: 1,
      explanation: '体循环静脉血回流到右心房，再经右心室进入肺循环。这是理解循环路线的基础。',
    },
    {
      id: 'med-2',
      type: '间隔记忆',
      title: '记住解剖学方位',
      prompt: '在标准解剖学姿势下，前臂的桡骨位于哪一侧？',
      options: ['拇指侧（外侧）', '小指侧（内侧）', '位于肱骨内'],
      answer: 0,
      explanation: '桡骨在拇指侧，尺骨在小指侧。结合自己的手臂建立空间记忆，优于死记文字。',
    },
    {
      id: 'med-3',
      type: '基础病例',
      title: '运动后的呼吸',
      prompt: '健康同学跑完 800 米后呼吸加快，最主要的生理意义是什么？',
      options: ['减少氧气吸入', '满足代谢增加的气体交换需要', '立即降低心脏供血'],
      answer: 1,
      explanation: '运动时耗氧和二氧化碳生成增加，通气增强有助于气体交换。这是教学情境，不用于诊断。',
    },
    {
      id: 'med-4',
      type: '结构匹配',
      title: '人体的支架',
      prompt: '成人脊柱中，正常情况下胸椎共有多少块？',
      options: ['7 块', '12 块', '5 块'],
      answer: 1,
      explanation: '颈椎 7 块、胸椎 12 块、腰椎 5 块。用分区关系建立记忆。',
    },
    {
      id: 'med-5',
      type: '间隔记忆',
      title: '一张白纸的检验',
      prompt: '昨天记过的结构今天想不起来，哪种复习方式更有利于长期记忆？',
      options: ['一直看答案，不做回忆', '先主动回忆，再核对并间隔复习', '考前一晚一次性背完'],
      answer: 1,
      explanation: '主动提取和间隔复习有助于保留知识。本游戏也给予跨日期复习更高效率。',
    },
    {
      id: 'med-6',
      type: '基础病例',
      title: '实验室的第一课',
      prompt: '实验中接触过样本的手套，使用后应该怎样处理？',
      options: ['戴着手套使用公共键盘', '按实验室要求分类处理并清洁双手', '留给下一位同学重复使用'],
      answer: 1,
      explanation: '遵循实验室规范，避免污染公共表面。具体操作以学校培训和教师要求为准。',
    },
  ],
};
