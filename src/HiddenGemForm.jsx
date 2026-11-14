import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

const GEM_CATEGORIES = [
  'Cafe & Coffee',
  'Food & Drink',
  'Nature & Outdoors',
  'Art & Culture',
  'Shopping',
  'Activities',
  'Hidden Spots',
  'Other',
];

export default function HiddenGemForm({ open, onClose, selectedCity, telegramInitData, telegramStatus, onSubmitted }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Hidden Spots',
    city: selectedCity || 'Phnom Penh',
    location: '',
    map_url: '',
  });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ name: '', description: '', category: 'Hidden Spots', city: selectedCity || 'Phnom Penh', location: '', map_url: '' });
      setPhotos([]);
      setError('');
      setSuccess('');
    }
  }, [open]);

  if (!open) return null;

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const isTelegram = telegramStatus === 'connected' && !!telegramInitData;
      let accessToken = '';
      if (!isTelegram) {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        accessToken = data.session?.access_token || '';
        if (!accessToken) throw new Error('Please sign in with Google before submitting a hidden gem.');
      }

      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      photos.forEach(photo => payload.append('photos', photo));
      if (isTelegram) payload.append('initData', telegramInitData);

      const response = await fetch('https://ofxuiupsnvgnzammngeg.supabase.co/functions/v1/vibez-submit-gem', {
        method: 'POST',
        headers: accessToken ? { Authorization: 'Bearer ' + accessToken } : {},
        body: payload,
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Could not submit your hidden gem.');
      setSuccess(result.gem?.name || form.name);
      setForm({ name: '', description: '', category: 'Hidden Spots', city: selectedCity || 'Phnom Penh', location: '', map_url: '' });
      setPhotos([]);
      onSubmitted?.();
    } catch (submitError) {
      setError(submitError.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="event-modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <section className="event-modal hidden-gem-modal" role="dialog" aria-modal="true" aria-labelledby="gem-form-title">
        <div className="event-modal-heading">
          <div>
            <div className="eyebrow dark"><span className="eyebrow-dot" /> COMMUNITY DISCOVERY</div>
            <h2 id="gem-form-title">Drop a hidden gem.</h2>
            <p>Know a place worth discovering? Put it on the VIBEZ map.</p>
          </div>
          <button type="button" className="event-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {success ? (
          <div className="event-success">
            <div className="success-icon">✓</div>
            <h3>Gem submitted!</h3>
            <p><strong>{success}</strong> is now waiting for VIBEZ review. It will appear publicly after approval.</p>
            <button type="button" className="event-form-submit" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className="event-form" onSubmit={submit}>
            <label>Place name *
              <input required minLength="2" maxLength="120" value={form.name} onChange={event => update('name', event.target.value)} placeholder="e.g. A tiny garden café in the city" />
            </label>
            <label>What makes it special? *
              <textarea required minLength="10" maxLength="1000" rows="4" value={form.description} onChange={event => update('description', event.target.value)} placeholder="Share a little story, tip or reason people should check it out." />
            </label>
            <div className="event-form-row">
              <label>City *
                <select value={form.city} onChange={event => update('city', event.target.value)}>
                  <option value="Phnom Penh">Phnom Penh</option>
                  <option value="Yangon">Yangon</option>
                </select>
              </label>
              <label>Category *
                <select value={form.category} onChange={event => update('category', event.target.value)}>
                  {GEM_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
            </div>
            <label>Location / address *
              <input required maxLength="250" value={form.location} onChange={event => update('location', event.target.value)} placeholder="Street, neighbourhood or place address" />
            </label>
            <div className="location-helper">
              <p>Find the exact place on Google Maps, then copy its Share link.</p>
              <button type="button" className="location-map-search" onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(form.location || form.city), '_blank', 'noopener,noreferrer')}>Find on Google Maps ↗</button>
            </div>
            <label>Google Maps share link <span className="field-hint">Optional — helps people find the exact pin.</span>
              <input type="url" maxLength="1000" value={form.map_url} onChange={event => update('map_url', event.target.value)} placeholder="https://maps.app.goo.gl/..." />
            </label>
            <label>Photos * <span className="field-hint">Add 1–4 real photos. JPG, PNG or WebP · max 5 MB each.</span>
              <input required type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => setPhotos(Array.from(event.target.files || []).slice(0, 4))} />
            </label>
            {photos.length > 0 && <p className="gem-photo-count">{photos.length} photo{photos.length === 1 ? '' : 's'} selected: {photos.map(photo => photo.name).join(', ')}</p>}
            {error && <p className="event-form-error">{error}</p>}
            <p className="event-review-note">Your submission will be reviewed by VIBEZ before it appears publicly. Your account is attached automatically and won't be shown on the public listing.</p>
            <button className="event-form-submit" type="submit" disabled={submitting || photos.length < 1 || photos.length > 4}>
              {submitting ? 'Submitting…' : 'Submit hidden gem for review ↗'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
