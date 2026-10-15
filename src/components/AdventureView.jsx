import { TYPE_LABEL } from '../i18n.js';

export default function AdventureView({ t, lang, selected, level, rooms }) {
  const count = rooms.filter((r) => r.level === level).length;
  return (
    <div className="adventure">
      <div className="adv-hud">
        <span>{level} · {t.wingC}</span>
        <span>{t.steps}: 0 · {t.explored}: 0 / {count}</span>
      </div>
      <div className="adv-stage">
        <div>
          <h2>{t.adventureTitle}</h2>
          <p>{t.adventureSoon}</p>
          {selected && (
            <p>
              {lang === 'en' ? selected.name_en : selected.name_fr}
              {' · '}
              {TYPE_LABEL[lang][selected.type]}
            </p>
          )}
        </div>
      </div>
      <div className="adv-dialog">
        <div className="who">{t.dialog}</div>
        <div>{t.noDialog}</div>
      </div>
      <div className="adv-log">
        <div className="section-title">{t.quests}</div>
        {['Atteindre C53', 'Trouver le foyer', 'Repérer un amphi', 'Trouver l’accueil'].map((q) => (
          <div key={q} className="quest-item">☐ {q}</div>
        ))}
        <div className="section-title">{t.passport}</div>
        <div className="stamps">
          <div className="stamp" style={{ borderColor: 'var(--teaching)' }} />
          <div className="stamp" style={{ borderColor: 'var(--research)' }} />
          <div className="stamp" style={{ borderColor: 'var(--life)' }} />
          <div className="stamp" style={{ borderColor: 'var(--companies)' }} />
        </div>
      </div>
    </div>
  );
}
