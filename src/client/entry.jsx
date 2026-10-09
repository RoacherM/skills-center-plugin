import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { SkillsPage } from './SkillsPage.jsx';
import { withI18n, DICT } from './i18n.jsx';
import { CSS } from './styles.js';

const PKG_ID = '@local/dsh-skills';
const PANEL_ID = 'local-skills';
const NS = 'local-skills';

function SkillsIcon({ size = 18 }) {
  return _jsxs('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    children: [
      _jsx('path', { d: 'M12 2L2 7l10 5 10-5-10-5z' }),
      _jsx('path', { d: 'M2 17l10 5 10-5' }),
      _jsx('path', { d: 'M2 12l10 5 10-5' }),
    ],
  });
}

export const inject = ['slots', 'locale'];

export function apply(ctx) {
  // 1. Register dictionary
  ctx.effect(
    () =>
      ctx.locale.register(NS, {
        zh: { panel: DICT.zh.panel },
        en: { panel: DICT.en.panel },
      }),
    'dsh-skills: dictionary'
  );

  const t = ctx.locale.bind(NS);

  // 2. Inject styles
  ctx.effect(() => {
    const style = document.createElement('style');
    style.dataset.plugin = PKG_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, 'dsh-skills: styles');

  // 3. Register main page
  const LocalizedPage = withI18n(ctx.locale, SkillsPage);
  ctx.effect(
    () =>
      ctx.slots.inject('main', () =>
        ctx.slots.register(
          {
            name: 'main',
            key: PANEL_ID,
            locale: NS,
          },
          LocalizedPage
        )
      ),
    'dsh-skills: page'
  );

  // 4. Register sidebar icon
  ctx.effect(
    () =>
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 12,
            locale: NS,
            label: () => t('panel'),
          },
          SkillsIcon
        )
      ),
    'dsh-skills: sidebar entry'
  );
}
