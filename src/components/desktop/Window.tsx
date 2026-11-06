import { useRef } from 'react';
import { Maximize2, Minus, X, Copy } from 'lucide-react';
import { useDesktop, type WindowState } from '../../stores/desktopStore';
import { APPS, AppIcon } from '../ui';
import { npcDef } from '../../engine/helpers';
import { Apps } from '../apps/Apps';

export function Window({ win }: { win: WindowState }) {
  const desktop = useDesktop();
  const drag = useRef<{ x: number; y: number; wx: number; wy: number } | null>(null);
  if (win.minimized) return null;
  return (
    <section
      className={`aero-window window-${win.app} ${win.npc ? 'conversation-window' : ''} ${win.z !== desktop.topZ ? 'inactive' : ''} ${win.maximized ? 'maximized' : ''} ${win.app === 'games' ? 'game-window' : ''}`}
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z }}
      aria-label={APPS[win.app].name}
      onPointerDown={() => desktop.focus(win.key)}
    >
      <div
        className="window-titlebar"
        onDoubleClick={() => desktop.maximize(win.key)}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button') || win.maximized) return;
          drag.current = { x: e.clientX, y: e.clientY, wx: win.x, wy: win.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const d = drag.current;
          desktop.move(
            win.key,
            Math.max(0, Math.min(window.innerWidth - 170, d.wx + e.clientX - d.x)),
            Math.max(0, Math.min(window.innerHeight - 110, d.wy + e.clientY - d.y)),
          );
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <AppIcon app={win.app} size="small" />
        <span>
          {win.app === 'chat' && win.npc
            ? `${npcDef(win.npc)?.name ?? '2012 级新生班'} - 聊天中`
            : APPS[win.app].name}
        </span>
        <div className="window-controls">
          <button aria-label={`最小化${APPS[win.app].short}`} onClick={() => desktop.minimize(win.key)}>
            <Minus size={13} />
          </button>
          <button aria-label={`最大化${APPS[win.app].short}`} onClick={() => desktop.maximize(win.key)}>
            {win.maximized ? <Copy size={11} /> : <Maximize2 size={11} />}
          </button>
          <button
            className="window-close"
            aria-label={`关闭${APPS[win.app].short}`}
            onClick={() => desktop.close(win.key)}
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="window-surface">
        <Apps app={win.app} npc={win.npc} />
      </div>
      {!win.maximized && (
        <div
          className="resize-grip"
          role="separator"
          aria-label="调整窗口大小"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            const sx = e.clientX;
            const sy = e.clientY;
            const width = win.width;
            const height = win.height;
            const node = e.currentTarget;
            const move = (event: PointerEvent) =>
              desktop.resize(
                win.key,
                Math.max(
                  Math.min(win.app === 'chat' && !win.npc ? 260 : 540, window.innerWidth - 24),
                  Math.min(window.innerWidth - win.x, width + event.clientX - sx),
                ),
                Math.max(350, Math.min(window.innerHeight - win.y - 54, height + event.clientY - sy)),
              );
            const end = () => {
              node.removeEventListener('pointermove', move);
              node.removeEventListener('pointerup', end);
              node.removeEventListener('pointercancel', end);
            };
            node.addEventListener('pointermove', move);
            node.addEventListener('pointerup', end);
            node.addEventListener('pointercancel', end);
          }}
        />
      )}
    </section>
  );
}
