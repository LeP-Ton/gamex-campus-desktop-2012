import { useState } from 'react';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { MAJORS } from '../../content/world';
import type { Major } from '../../engine/types';
import { Button, Icon } from '../ui';

export function NewGame({ close, retrySeed }: { close: () => void; retrySeed?: string }) {
  const game = useGame((s) => s.game);
  const start = useGame((s) => s.start);
  const [name, setName] = useState(game?.profile.name ?? '林一');
  const [gender, setGender] = useState(game?.profile.gender ?? '男');
  const [major, setMajor] = useState<Major>(game?.profile.major ?? 'cs');
  const [seed, setSeed] = useState(retrySeed ?? '我们的2012');
  return (
    <div className="modal-backdrop">
      <section className="enrollment" role="dialog" aria-modal="true" aria-label="新生入学登记">
        {game && (
          <button className="modal-close" onClick={close} aria-label="关闭入学登记">
            ×
          </button>
        )}
        <div className="enrollment-story">
          <div className="gamex-logo">
            Game<span>X</span>
            <small>记忆里的大学生活</small>
          </div>
          <div className="story-copy">
            <span className="eyebrow">CAMPUS DESKTOP SIMULATOR</span>
            <h1>
              那个秋天，
              <br />
              一切刚刚开始。
            </h1>
            <p>
              一台电脑，一间寝室。
              <br />
              有人等你上线，也有未来等你书写。
            </p>
          </div>
          <div className="retro-computer">
            <div className="computer-screen">
              <div className="mini-desktop">
                <span>2012</span>
                <small>你好，新同学。</small>
                <div className="mini-taskbar" />
              </div>
            </div>
            <div className="computer-neck" />
            <div className="computer-foot" />
            <div className="desk-line" />
            <div className="coffee-cup" />
            <div className="desk-book" />
          </div>
          <div className="story-footer">南川大学 · 二〇一二年秋</div>
        </div>
        <form
          className="enrollment-form"
          onSubmit={(e) => {
            e.preventDefault();
            start({ name, gender, major }, seed);
            useDesktop.getState().open('campus');
            close();
          }}
        >
          <div className="form-school">
            <Icon name="graduation" size={23} />
            <span>
              南川大学 <small>NANCHUAN UNIVERSITY</small>
            </span>
            <span className="school-stamp">2012</span>
          </div>
          <h2>你好，新同学。</h2>
          <p className="muted">请填写你的新生档案，开启属于你的大学生活。</p>
          {game && (
            <div className="info-box">
              开始新的学期将替换当前进度，原存档会自动备份。可先在系统设置中导出存档。
            </div>
          )}
          <div className="form-row">
            <label>
              你的姓名
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={16}
                required
                placeholder="怎么称呼你？"
              />
            </label>
            <label className="gender-label">
              性别
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option>男</option>
                <option>女</option>
                <option>其他</option>
              </select>
            </label>
          </div>
          <label className="field-label">选择你的专业</label>
          <div className="major-options">
            {(Object.keys(MAJORS) as Major[]).map((id) => (
              <button
                className={`major-option ${major === id ? 'selected' : ''}`}
                type="button"
                key={id}
                onClick={() => setMajor(id)}
              >
                <Icon name={MAJORS[id].icon} size={23} />
                <span>
                  <strong>{MAJORS[id].name}</strong>
                  <small>{id === 'cs' ? '编程 · 逻辑 · 创造' : '记忆 · 探索 · 生命'}</small>
                </span>
                <span className="radio-circle">{major === id && <i />}</span>
              </button>
            ))}
          </div>
          <label className="seed-label">
            故事种子 <span>相同种子，重逢同一个起点</span>
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              maxLength={60}
              placeholder="留空随机生成"
            />
          </label>
          <Button type="submit" className="primary enroll-button" disabled={!name.trim()}>
            开启我的大学生活
            <Icon name="arrow" size={18} />
          </Button>
          <div className="enroll-footnote">
            <Icon name="shield" size={13} />
            完全离线 · 自动存档 · 没有标准人生
          </div>
        </form>
      </section>
    </div>
  );
}
