import type { CSSProperties, ReactNode } from 'react';
import {
  BookOpen,
  CalendarDays,
  MessageCircle,
  Globe2,
  Gamepad2,
  FolderOpen,
  NotebookPen,
  GraduationCap,
  Trophy,
  Settings,
  Monitor,
  Coffee,
  Heart,
  Code2,
  Users,
  Sun,
  Moon,
  Bell,
  BriefcaseBusiness,
  Leaf,
  ChevronRight,
  Clock3,
  BatteryMedium,
  Wallet,
  Sparkles,
  Radio,
  Target,
  Flag,
  Mail,
  FileText,
  ArrowUpRight,
  CircleHelp,
  Home,
  Search,
  Music,
  Camera,
  Shield,
  Check,
  CircleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { AppId } from '../engine/types';
import { useGame } from '../stores/gameStore';
import { useDesktop } from '../stores/desktopStore';
import { clockText, npcDef } from '../engine/helpers';

export const ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  calendar: CalendarDays,
  chat: MessageCircle,
  globe: Globe2,
  game: Gamepad2,
  folder: FolderOpen,
  diary: NotebookPen,
  graduation: GraduationCap,
  trophy: Trophy,
  settings: Settings,
  monitor: Monitor,
  coffee: Coffee,
  heart: Heart,
  code: Code2,
  users: Users,
  sun: Sun,
  moon: Moon,
  bell: Bell,
  work: BriefcaseBusiness,
  leaf: Leaf,
  arrow: ChevronRight,
  clock: Clock3,
  energy: BatteryMedium,
  money: Wallet,
  sparkles: Sparkles,
  radio: Radio,
  target: Target,
  flag: Flag,
  mail: Mail,
  file: FileText,
  external: ArrowUpRight,
  help: CircleHelp,
  home: Home,
  search: Search,
  music: Music,
  camera: Camera,
  shield: Shield,
  check: Check,
  alert: CircleAlert,
};
export function Icon({
  name,
  size = 18,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const Component = ICONS[name] ?? Monitor;
  return <Component size={size} strokeWidth={1.7} {...props} />;
}

export const APPS: Record<
  AppId,
  { name: string; short: string; icon: string; color: string; subtitle: string }
> = {
  campus: {
    name: '我的校园',
    short: '我的校园',
    icon: 'home',
    color: 'teal',
    subtitle: '南川大学 · 个人主页',
  },
  chat: {
    name: 'Q聊 · 即时通讯',
    short: 'Q聊',
    icon: 'chat',
    color: 'blue',
    subtitle: '总有一个人，等你上线',
  },
  forum: {
    name: '南川 BBS',
    short: '校园论坛',
    icon: 'users',
    color: 'orange',
    subtitle: '有温度的校园，正在发生的故事',
  },
  browser: {
    name: '校园浏览器',
    short: '浏览器',
    icon: 'globe',
    color: 'blue',
    subtitle: '校园导航 · 勤工助学',
  },
  schedule: {
    name: '我的课程表',
    short: '课程表',
    icon: 'calendar',
    color: 'green',
    subtitle: '2012—2013 学年 · 第一学期',
  },
  study: {
    name: '学习中心',
    short: '学习中心',
    icon: 'book',
    color: 'blue',
    subtitle: '每天一点积累，未来无限可能',
  },
  games: {
    name: '征途战场 · 游戏中心',
    short: '游戏中心',
    icon: 'game',
    color: 'purple',
    subtitle: '属于我们的征途，现在开始',
  },
  files: {
    name: '计算机 · 我的文件',
    short: '计算机',
    icon: 'monitor',
    color: 'blue',
    subtitle: '我的大学，我的收藏',
  },
  diary: {
    name: '我的大学日记',
    short: '大学日记',
    icon: 'diary',
    color: 'brown',
    subtitle: '把平凡日子，写成独家记忆',
  },
  grades: {
    name: '教务系统 · 学期档案',
    short: '教务系统',
    icon: 'graduation',
    color: 'green',
    subtitle: '南川大学本科生教务管理系统',
  },
  rankings: {
    name: '校园风云榜',
    short: '风云榜',
    icon: 'trophy',
    color: 'gold',
    subtitle: '每一种大学生活，都值得被记录',
  },
  settings: {
    name: '系统设置',
    short: '系统设置',
    icon: 'settings',
    color: 'gray',
    subtitle: '存档、种子与游戏帮助',
  },
};

export function AppIcon({ app, size = 'medium' }: { app: AppId; size?: 'small' | 'medium' | 'large' }) {
  const a = APPS[app];
  return (
    <span className={`app-icon ${a.color} ${size}`}>
      <Icon name={a.icon} size={size === 'large' ? 31 : size === 'small' ? 17 : 23} />
    </span>
  );
}
export function Avatar({ id, size = 38, name }: { id: string; size?: number; name?: string }) {
  const def = npcDef(id);
  const text = name?.slice(0, 1) ?? def?.avatar ?? '我';
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.39, background: def?.color ?? '#5a8ba5' }}
    >
      {text}
    </span>
  );
}
export function Button({
  children,
  icon,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode; icon?: string }) {
  return (
    <button className={`button ${className}`} {...props}>
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}
export function Tag({ children, color = '' }: { children: ReactNode; color?: string }) {
  return <span className={`tag ${color}`}>{children}</span>;
}
export function Progress({
  value,
  color = '#559b87',
  label,
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}
export function Empty({ icon = 'leaf', title, text }: { icon?: string; title: string; text: string }) {
  return (
    <div className="empty">
      <Icon name={icon} size={38} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function ActionFeedback() {
  const text = useGame((s) => s.game?.lastAction);
  return (
    <div className="action-feedback" role="status">
      <Icon name="radio" size={14} />
      <span>{text}</span>
    </div>
  );
}
export function ResourceBar() {
  const s = useGame((x) => x.game)!;
  return (
    <div className="resource-bar">
      <span>
        <Icon name="clock" size={14} />
        {clockText(s.minute)}
      </span>
      <span>
        <Icon name="energy" size={14} />
        精力 {Math.round(s.energy)}
      </span>
      <span>
        <Icon name="money" size={14} />¥{s.money}
      </span>
      <span className="push-right">每个选择，都有自己的分量</span>
    </div>
  );
}
export function AppLink({ app, children }: { app: AppId; children?: ReactNode }) {
  const open = useDesktop((x) => x.open);
  return (
    <button className="text-link" onClick={() => open(app)}>
      {children ?? APPS[app].short}
      <Icon name="arrow" size={14} />
    </button>
  );
}
