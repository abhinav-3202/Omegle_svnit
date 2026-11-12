import { useState } from 'react';

// Chips input: Enter or comma adds a tag, Backspace on empty removes the last one.
// Tags are lower-cased because the backend matches interests/skills case-sensitively.
export default function TagInput({ label, tags, onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const value = draft.trim().toLowerCase();
    if (value && !tags.includes(value)) onChange([...tags, value]);
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <label className="field">
      <span>{label}</span>
      <div className="tag-box">
        {tags.map((t) => (
          <span key={t} className="tag">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={tags.length ? '' : placeholder}
        />
      </div>
    </label>
  );
}
