import type { AppId } from '../../engine/types';
import { Campus } from './Campus';
import { Schedule, Study, Grades } from './AcademicApps';
import { Chat, Forum } from './SocialApps';
import { Games, Browser } from './LeisureApps';
import { Files, Diary, Rankings, SettingsApp } from './UtilityApps';
import { ActionFeedback } from '../ui';

export function Apps({ app, npc }: { app: AppId; npc?: string }) {
  const content = {
    campus: <Campus />,
    chat: <Chat npc={npc} />,
    forum: <Forum />,
    browser: <Browser />,
    schedule: <Schedule />,
    study: <Study />,
    games: <Games />,
    files: <Files />,
    diary: <Diary />,
    grades: <Grades />,
    rankings: <Rankings />,
    settings: <SettingsApp />,
  }[app];
  return (
    <div className={`app app-${app}`}>
      {content}
      <ActionFeedback />
    </div>
  );
}
