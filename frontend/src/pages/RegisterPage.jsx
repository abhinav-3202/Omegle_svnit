import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TagInput from '../components/TagInput';

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/chat" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!interests.length && !skills.length) {
      setError('Add at least one interest or skill. Matching is based on what you have in common.');
      return;
    }
    setBusy(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        interests,
        skills,
      });
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="center-screen">
      <form className="card" onSubmit={onSubmit}>
        <h1>Create account</h1>
        <p className="muted">You're matched with people who share your interests or skills.</p>

        <label className="field">
          <span>Username</span>
          <input value={form.username} onChange={set('username')} required autoFocus />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={set('email')} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={form.password} onChange={set('password')} minLength={6} required />
        </label>

        <TagInput label="Interests" tags={interests} onChange={setInterests} placeholder="music, football… (Enter to add)" />
        <TagInput label="Skills" tags={skills} onChange={setSkills} placeholder="react, design… (Enter to add)" />

        {error && <div className="alert error">{error}</div>}
        <button className="btn primary wide" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        <p className="muted small">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
