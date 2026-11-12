import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, CalendarDays, Compass, Users, Bookmark, ArrowUpRight, SlidersHorizontal, Sparkles, Menu, X } from 'lucide-react';

const categories = ['All vibes', 'Music', 'Markets', 'Food & Drink', 'Arts', 'Fitness', 'Community'];

const formatLocalTime = (value) => {
  if (!value) return '';
  const [hours, minutes] = String(value).slice(0, 5).split(':').map(Number);
  return new Date(Date.UTC(2020, 0, 1, hours, minutes)).toLocaleTimeString('en-US', {
    timeZone: 'UTC', hour: 'numeric', minute: '2-digit',
  });
};

function App() {
  const [telegramUser, setTelegramUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [telegramInitData, setTelegramInitData] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventImage, setEventImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [eventError, setEventError] = useState('');
  const [eventSuccess, setEventSuccess] = useState('');
  const [eventForm, setEventForm] = useState({ title: '', description: '', category: 'Community', city: 'Phnom Penh', event_date: '', start_time: '', end_time: '', location: '', location_map_url: '', price: '', organizer_name: '', organizer_contact: '', voucher_enabled: false, voucher_title: '', voucher_benefit: '', voucher_quantity: '25', voucher_expiry: '', voucher_instructions: '' });
  const [telegramStatus, setTelegramStatus] = useState('connecting');
  const [selectedCity, setSelectedCity] = useState(() => {
    const saved = window.localStorage.getItem('vibez-city');
    return saved === 'Yangon' ? 'Yangon' : 'Phnom Penh';
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [myVouchers, setMyVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [voucherBusy, setVoucherBusy] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  useEffect(() => { window.localStorage.setItem('vibez-city', selectedCity); }, [selectedCity]);
  const voucherApi = async (payload) => {
    const response = await fetch('https://ofxuiupsnvgnzammngeg.supabase.co/functions/v1/vibez-vouchers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, initData: telegramInitData }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'Voucher request failed.');
    return result;
  };
  const refreshMyVouchers = async () => {
    if (!telegramInitData || telegramStatus !== 'connected') return;
    setVouchersLoading(true);
    try { const result = await voucherApi({ action: 'list' }); setMyVouchers(result.vouchers || []); }
    catch (error) { setVoucherError(error.message || 'Could not load your vouchers.'); }
    finally { setVouchersLoading(false); }
  };
  useEffect(() => { if (telegramStatus === 'connected' && telegramInitData) refreshMyVouchers(); }, [telegramStatus, telegramInitData]);
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp?.initData) { setTelegramStatus('not-telegram'); return; }
    webApp.ready();
    webApp.expand();
    setTelegramInitData(webApp.initData);
    fetch('https://ofxuiupsnvgnzammngeg.supabase.co/functions/v1/vibez-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: webApp.initData })
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Verification failed');
      setTelegramUser(result.user);
      setTelegramStatus('connected');
    }).catch(() => setTelegramStatus('error'));
  }, []);
  const [category, setCategory] = useState('All vibes');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState([]);
  const [activeTab, setActiveTab] = useState('Discover');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [clockNow, setClockNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setEventsLoading(true);
    setEventsError('');
    fetch('https://ofxuiupsnvgnzammngeg.supabase.co/functions/v1/vibez-public-events?city=' + encodeURIComponent(selectedCity))
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || 'Could not load events');
        const items = (result.events || []).map((event) => {
          const utcOffset = event.city === 'Yangon' ? '+06:30' : '+07:00';
          const dateLabel = new Date(event.event_date + 'T12:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
          const time = formatLocalTime(event.start_time);
          const colors = { Music: 'music', Markets: 'market', 'Food & Drink': 'coffee', Arts: 'movie', Fitness: 'run', Community: 'makers', Other: 'market' };
          const emojis = { Music: '🎶', Markets: '🧺', 'Food & Drink': '☕', Arts: '🎨', Fitness: '🏃', Community: '✳', Other: '📍' };
          return {
            id: event.id,
            city: event.city || selectedCity,
            title: event.title,
            type: event.category,
            day: dateLabel,
            time,
            place: (event.location || '').split('\nGoogle Maps: ')[0],
            mapUrl: (event.location || '').split('\nGoogle Maps: ')[1] || '',
            price: event.price || 'See details',
            tag: 'VIBEZ approved',
            color: colors[event.category] || 'market',
            emoji: emojis[event.category] || '✳',
            description: event.description,
            endTime: event.end_time || '',
            startsAt: new Date(event.event_date + 'T' + (event.start_time || '00:00').slice(0, 5) + ':00' + utcOffset).getTime(),
            endsAt: (() => {
              const start = new Date(event.event_date + 'T' + (event.start_time || '00:00').slice(0, 5) + ':00' + utcOffset).getTime();
              if (!event.end_time) return new Date(event.event_date + 'T23:59:59' + utcOffset).getTime();
              let end = new Date(event.event_date + 'T' + event.end_time.slice(0, 5) + ':00' + utcOffset).getTime();
              if (end <= start) end += 24 * 60 * 60 * 1000;
              return end;
            })(),
            organizerName: event.organizer_name || '',
            organizerContact: event.organizer_contact || '',
            coverImageUrl: event.cover_image_url || null,
            voucher: event.voucher || null,
          };
        });
        if (!cancelled) setActivities(items);
      })
      .catch((error) => {
        if (!cancelled) setEventsError(error.message || 'Could not load events');
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedCity]);

  const filtered = useMemo(() => activities
    .filter((item) => {
      const matchesCategory = category === 'All vibes' || item.type === category || (category === 'Food & Drink' && item.type === 'Community');
      const haystack = [item.title, item.type, item.place, item.description].join(' ').toLowerCase();
      return matchesCategory && haystack.includes(search.toLowerCase()) && item.endsAt > clockNow;
    })
    .sort((a, b) => {
      const aLive = a.startsAt <= clockNow && clockNow < a.endsAt;
      const bLive = b.startsAt <= clockNow && clockNow < b.endsAt;
      if (aLive !== bLive) return aLive ? -1 : 1;
      return a.startsAt - b.startsAt;
    }), [activities, category, search, clockNow]);

  const openEventForm = () => { setEventError(''); setEventSuccess(''); setEventForm(current => ({ ...current, city: selectedCity })); setShowEventForm(true); };
  const claimVoucher = async (eventId) => {
    if (!telegramInitData || telegramStatus !== 'connected') { setVoucherError('Open VIBEZ from Telegram to claim a voucher.'); return; }
    setVoucherBusy(true); setVoucherError(''); setVoucherMessage('');
    try {
      const result = await voucherApi({ action: 'claim', eventId });
      setVoucherMessage('Your voucher is ready. Code: ' + result.voucher.code);
      await refreshMyVouchers();
    } catch (error) { setVoucherError(error.message || 'Could not claim this voucher.'); }
    finally { setVoucherBusy(false); }
  };
  const redeemVoucher = async (eventId) => {
    setVoucherBusy(true); setVoucherError(''); setVoucherMessage('');
    try {
      const result = await voucherApi({ action: 'redeem', eventId, code: redeemCode });
      setVoucherMessage('Voucher ' + result.redemption.code + ' successfully redeemed.');
      setRedeemCode('');
      await refreshMyVouchers();
    } catch (error) { setVoucherError(error.message || 'Could not redeem this voucher.'); }
    finally { setVoucherBusy(false); }
  };
  const copyVoucherCode = async (code) => {
    try { await navigator.clipboard.writeText(code); setVoucherMessage('Voucher code copied.'); }
    catch { setVoucherMessage('Your voucher code: ' + code); }
  };
  const detectCityWithGps = () => {
    if (!navigator.geolocation) { window.alert('GPS is not available on this device. Please choose a city manually.'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const inPhnomPenh = Math.abs(latitude - 11.5564) < 0.65 && Math.abs(longitude - 104.9282) < 0.75;
      const inYangon = Math.abs(latitude - 16.8661) < 0.65 && Math.abs(longitude - 96.1951) < 0.75;
      if (inPhnomPenh) setSelectedCity('Phnom Penh');
      else if (inYangon) setSelectedCity('Yangon');
      else window.alert('VIBEZ currently supports Phnom Penh and Yangon. Please choose one manually.');
      setGpsLoading(false);
    }, (error) => {
      setGpsLoading(false);
      window.alert(error.code === 1 ? 'Location permission was denied. You can still choose a city manually.' : 'Could not detect your location. Please choose a city manually.');
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  };
  const submitEvent = async (e) => {
    e.preventDefault();
    if (!telegramInitData || telegramStatus !== 'connected') { setEventError('Please reopen VIBEZ from Telegram and try again.'); return; }
    setEventSubmitting(true); setEventError('');
    try {
      const payload = new FormData();
      Object.entries(eventForm).forEach(([key, value]) => {
        if (key === 'location_map_url') return;
        if (key === 'location') {
          const mapUrl = eventForm.location_map_url.trim();
          payload.append('location', mapUrl ? `${value.trim()}\nGoogle Maps: ${mapUrl}` : value.trim());
          return;
        }
        payload.append(key, value);
      });
      payload.append('initData', telegramInitData);
      if (eventImage) payload.append('cover_image', eventImage);
      const response = await fetch('https://ofxuiupsnvgnzammngeg.supabase.co/functions/v1/vibez-submit-event', { method: 'POST', body: payload });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Could not submit your event.');
      setEventSuccess(result.event.title);
      setEventForm({ title: '', description: '', category: 'Community', city: selectedCity, event_date: '', start_time: '', end_time: '', location: '', location_map_url: '', price: '', organizer_name: '', organizer_contact: '', voucher_enabled: false, voucher_title: '', voucher_benefit: '', voucher_quantity: '25', voucher_expiry: '', voucher_instructions: '' });
      setEventImage(null);
    } catch (error) { setEventError(error.message || 'Submission failed. Please try again.'); }
    finally { setEventSubmitting(false); }
  };

  const openMap = (place, mapUrl = '') => {
    const url = mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
    const webApp = window.Telegram?.WebApp;
    if (webApp?.openLink) webApp.openLink(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  };

  const telegramContactUrl = (contact) => {
    const value = (contact || '').trim();
    if (!value) return '';
    const linkMatch = value.match(/t\.me\/([A-Za-z0-9_]{5,32})/i);
    if (linkMatch) return 'https://t.me/' + linkMatch[1];
    const username = value.replace(/^@/, '');
    return /^[A-Za-z0-9_]{5,32}$/.test(username) ? 'https://t.me/' + username : '';
  };

  const openTelegramContact = (contact) => {
    const url = telegramContactUrl(contact);
    if (!url) return;
    const webApp = window.Telegram?.WebApp;
    if (webApp?.openTelegramLink) webApp.openTelegramLink(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleSave = (id) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const visible = activeTab === 'Saved' ? filtered.filter((item) => saved.includes(item.id)) : activeTab === 'My Vouchers' ? [] : filtered;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => setActiveTab('Discover')} aria-label="VIBEZ home">
          <span className="brand-name">VIBEZ</span>
        </a>
        <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
          {['Discover', 'Events', 'Community', 'Saved', 'My Vouchers'].map((tab) => (
            <button key={tab} className={activeTab === tab ? 'nav-link active' : 'nav-link'} onClick={() => { setActiveTab(tab); setMobileMenu(false); }}>
              {tab}{tab === 'Saved' && saved.length > 0 && <span className="saved-count">{saved.length}</span>}{tab === 'My Vouchers' && myVouchers.length > 0 && <span className="saved-count">{myVouchers.length}</span>}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          {telegramStatus === 'connected' && telegramUser && <span className="telegram-user">👤 {telegramUser.first_name}{telegramUser.username ? ' @' + telegramUser.username : ''}</span>}
          {telegramStatus === 'error' && <span className="telegram-user telegram-error">Account verification failed</span>}
          <label className="city-picker-wrap" aria-label="Choose city"><MapPin size={14} /><select className="city-picker" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}><option value="Phnom Penh">Phnom Penh</option><option value="Yangon">Yangon</option></select></label><button type="button" className="gps-btn" onClick={detectCityWithGps} disabled={gpsLoading}>{gpsLoading ? "Locating…" : "⌖ GPS"}</button>
          <button className="submit-btn" onClick={openEventForm}>＋ <span>Submit an event</span></button>
          <button className="menu-btn" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      {selectedEvent && <div className="event-modal-backdrop event-details-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setSelectedEvent(null); }}>
        <section className="event-modal event-details-modal" role="dialog" aria-modal="true" aria-labelledby="event-details-title">
          <div className="event-modal-heading"><div><div className="eyebrow dark"><span className="eyebrow-dot" /> {selectedEvent.type} · {selectedEvent.day}</div><h2 id="event-details-title">{selectedEvent.title}</h2><p>{selectedEvent.time}{selectedEvent.endTime ? ` – ${formatLocalTime(selectedEvent.endTime)}` : ''} · {selectedEvent.price}</p></div><button type="button" className="event-modal-close" onClick={() => setSelectedEvent(null)} aria-label="Close">×</button></div>
          {selectedEvent.coverImageUrl && <img className="event-details-image" src={selectedEvent.coverImageUrl} alt={selectedEvent.title + ' poster'} />}
          <div className="event-details-description">{selectedEvent.description}</div>
          {selectedEvent.voucher && <div className="event-voucher-offer">
            <div className="eyebrow dark">VIBEZ VOUCHER</div>
            <h3>{selectedEvent.voucher.title}</h3>
            <strong>{selectedEvent.voucher.benefit}</strong>
            <p>{selectedEvent.voucher.remaining_count} of {selectedEvent.voucher.quantity} claims remaining</p>
            {selectedEvent.voucher.expires_at && <small>Claim by {new Date(selectedEvent.voucher.expires_at).toLocaleDateString()}</small>}
            {(() => {
              const claimed = myVouchers.find((voucher) => voucher.event_id === selectedEvent.id);
              return claimed ? <div className="voucher-claimed-code"><span>{claimed.redeemed_at ? 'ALREADY REDEEMED' : 'YOUR VOUCHER CODE'}</span><strong>{claimed.code}</strong><button type="button" onClick={() => copyVoucherCode(claimed.code)}>Copy code</button></div> : <button type="button" className="voucher-claim-btn" disabled={voucherBusy || selectedEvent.voucher.remaining_count < 1} onClick={() => claimVoucher(selectedEvent.id)}>{voucherBusy ? 'Claiming…' : 'Claim your voucher'}</button>;
            })()}
            {selectedEvent.voucher.instructions && <small>{selectedEvent.voucher.instructions}</small>}
          </div>}
          {telegramStatus === 'connected' && <details className="organizer-voucher-tools"><summary>Organizer? Redeem a visitor voucher</summary><p>Enter the visitor’s code. Only the event owner’s Telegram account can redeem it.</p><input value={redeemCode} onChange={(e) => setRedeemCode(e.target.value.toUpperCase())} placeholder="VZ-XXXXX-XXXXX" maxLength={15} /><button type="button" disabled={voucherBusy || !redeemCode.trim()} onClick={() => redeemVoucher(selectedEvent.id)}>{voucherBusy ? 'Checking…' : 'Verify & redeem'}</button></details>}
          {(voucherMessage || voucherError) && <p className={voucherError ? 'voucher-feedback error' : 'voucher-feedback'}>{voucherError || voucherMessage}</p>}
          <div className="event-details-meta"><strong><MapPin size={16}/> Location</strong><span>{selectedEvent.place || 'Location not provided'}</span><button type="button" className="location-map-search" onClick={() => openMap(selectedEvent.place, selectedEvent.mapUrl)}>Open in Google Maps ↗</button></div>
          <div className="event-details-meta"><strong>Organizer</strong><span>{selectedEvent.organizerName || 'Organizer'}</span>{selectedEvent.organizerContact && <><span className="event-contact-text">Contact: {selectedEvent.organizerContact}</span>{telegramContactUrl(selectedEvent.organizerContact) && <button type="button" className="telegram-contact-btn" onClick={() => openTelegramContact(selectedEvent.organizerContact)}>Contact on Telegram ↗</button>}</>}</div>
          <button type="button" className="event-form-submit" onClick={() => setSelectedEvent(null)}>Close details</button>
        </section>
      </div>}
      {selectedImage && <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Full-screen event poster" onClick={() => setSelectedImage(null)}>
        <button type="button" className="image-lightbox-close" onClick={() => setSelectedImage(null)} aria-label="Close image">×</button>
        <img src={selectedImage.src} alt={selectedImage.alt} onClick={(e) => e.stopPropagation()} />
      </div>}
      {showEventForm && <div className="event-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowEventForm(false); }}>
        <section className="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-form-title">
          <div className="event-modal-heading"><div><div className="eyebrow dark"><span className="eyebrow-dot" /> COMMUNITY SUBMISSION</div><h2 id="event-form-title">Share an event.</h2><p>Tell {selectedCity} what’s happening.</p></div><button type="button" className="event-modal-close" onClick={() => setShowEventForm(false)} aria-label="Close">×</button></div>
          {eventSuccess ? <div className="event-success"><div className="success-icon">✓</div><h3>Event submitted!</h3><p><strong>{eventSuccess}</strong> is now waiting for VIBEZ admin review. We'll publish it after approval.</p><button type="button" className="submit-btn" onClick={() => setShowEventForm(false)}>Done</button></div> :
          <form className="event-form" onSubmit={submitEvent}>
            <label>Event name *<input required minLength="3" maxLength="120" name="title" value={eventForm.title} onChange={(e) => setEventForm({...eventForm,title:e.target.value})} placeholder="e.g. Weekend Creative Market" /></label>
            <label>Description *<textarea required minLength="10" maxLength="3000" name="description" value={eventForm.description} onChange={(e) => setEventForm({...eventForm,description:e.target.value})} placeholder="What can people expect?" rows="4" /></label>
            <div className="event-form-row"><label>City *<select name="city" value={eventForm.city} onChange={(e) => setEventForm({...eventForm,city:e.target.value})}><option value="Phnom Penh">Phnom Penh</option><option value="Yangon">Yangon</option></select></label><label>Category *<select name="category" value={eventForm.category} onChange={(e) => setEventForm({...eventForm,category:e.target.value})}><option>Music</option><option>Markets</option><option>Food & Drink</option><option>Arts</option><option>Fitness</option><option>Community</option><option>Other</option></select></label><label>Ticket / price<input name="price" maxLength="60" value={eventForm.price} onChange={(e) => setEventForm({...eventForm,price:e.target.value})} placeholder="Free / $5 / Registration" /></label></div>
            <div className="event-form-row"><label>Date *<input required type="date" name="event_date" min={new Date().toISOString().slice(0,10)} value={eventForm.event_date} onChange={(e) => setEventForm({...eventForm,event_date:e.target.value})} /></label><label>Start time *<input required type="time" name="start_time" value={eventForm.start_time} onChange={(e) => setEventForm({...eventForm,start_time:e.target.value})} /></label></div>
            <div className="event-form-row"><label>End time<input type="time" name="end_time" value={eventForm.end_time} onChange={(e) => setEventForm({...eventForm,end_time:e.target.value})} /></label><label>Location *<input required maxLength="200" name="location" value={eventForm.location} onChange={(e) => setEventForm({...eventForm,location:e.target.value})} placeholder="Venue name or address" /></label></div>
            <div className="location-helper"><p>Want to pin the exact venue? Search for it on Google Maps, open the place and copy its Share link.</p><button type="button" className="location-map-search" onClick={() => openMap(eventForm.location || selectedCity)}>Find on Google Maps ↗</button></div>
            <label>Google Maps share link <span className="field-hint">Optional — paste the link copied from Google Maps. Visitors can open this exact pin using the Go button.</span><input type="url" maxLength="1000" name="location_map_url" value={eventForm.location_map_url} onChange={(e) => setEventForm({...eventForm,location_map_url:e.target.value})} placeholder="https://maps.app.goo.gl/..." /></label>
            <label>Cover photo <span className="field-hint">Recommended: 1200 × 675 px (16:9). Portrait posters are also welcome; VIBEZ will show the full image without cropping. JPG, PNG or WebP · maximum 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setEventImage(e.target.files?.[0] || null)} /></label>
            <div className="voucher-builder">
              <label className="voucher-toggle"><input type="checkbox" checked={eventForm.voucher_enabled} onChange={(e) => setEventForm({...eventForm,voucher_enabled:e.target.checked})} /><span><strong>Offer claimable vouchers</strong><small>Give visitors a unique one-time code when they claim this event offer.</small></span></label>
              {eventForm.voucher_enabled && <div className="voucher-fields">
                <label>Voucher title *<input required minLength="2" maxLength="100" value={eventForm.voucher_title} onChange={(e) => setEventForm({...eventForm,voucher_title:e.target.value})} placeholder="e.g. Welcome Drink" /></label>
                <label>Discount or benefit *<input required minLength="2" maxLength="160" value={eventForm.voucher_benefit} onChange={(e) => setEventForm({...eventForm,voucher_benefit:e.target.value})} placeholder="e.g. 20% OFF / Free drink" /></label>
                <div className="event-form-row"><label>Available claims *<input required type="number" min="1" max="100000" step="1" value={eventForm.voucher_quantity} onChange={(e) => setEventForm({...eventForm,voucher_quantity:e.target.value})} /></label><label>Claim expiry *<input required type="date" min={eventForm.event_date || new Date().toISOString().slice(0,10)} value={eventForm.voucher_expiry || eventForm.event_date} onChange={(e) => setEventForm({...eventForm,voucher_expiry:e.target.value})} /></label></div>
                <label>Redemption instructions<input maxLength="300" value={eventForm.voucher_instructions} onChange={(e) => setEventForm({...eventForm,voucher_instructions:e.target.value})} placeholder="Show your code at the counter." /></label>
                <p className="field-hint">Each Telegram user can claim once. Codes are unique and can only be redeemed once by the event organizer.</p>
              </div>}
            </div>
            <div className="event-form-row"><label>Organizer name<input maxLength="120" name="organizer_name" value={eventForm.organizer_name} onChange={(e) => setEventForm({...eventForm,organizer_name:e.target.value})} placeholder="Your name or organization" /></label><label>Telegram contact (recommended) <span className="field-hint">Enter your Telegram username, e.g. @yourusername, so visitors can message you directly.</span><input maxLength="120" name="organizer_contact" value={eventForm.organizer_contact} onChange={(e) => setEventForm({...eventForm,organizer_contact:e.target.value})} placeholder="@yourusername" /></label></div>
            {eventError && <p className="event-form-error">{eventError}</p>}
            <p className="event-review-note">Your event will be reviewed by VIBEZ before appearing publicly. Your Telegram account is attached automatically.</p>
            <button className="event-form-submit" type="submit" disabled={eventSubmitting || telegramStatus !== 'connected'}>{eventSubmitting ? 'Submitting…' : 'Submit event for review ↗'}</button>
          </form>}
        </section>
      </div>}
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> YOUR CITY, YOUR SCENE</div>
            <h1>Find your<br /><span>vibe.</span></h1>
            <p className="hero-description">Less scrolling. More living. Discover events, hidden gems and people doing things around your city.</p>
            <div className="hero-search">
              <Search size={19} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="What are you in the mood for?" aria-label="Search activities" />
              <button onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}>Explore <ArrowUpRight size={16} /></button>
            </div>
            <div className="hero-meta"><span><span className="pulse-dot" /> Discovering {selectedCity}</span><span>Made for going out, not staying in.</span></div>
          </div>
          <div className="hero-art" aria-label="Illustration of city activities">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="art-sticker sticker-top">GOOD<br />TIMES <Sparkles size={17} /></div>
            <div className="art-sun" />
            <div className="art-card card-back"><span>✳</span><small>MAKE<br />MEMORIES</small></div>
            <div className="art-main-card"><div className="art-card-top"><span>THE CITY IS YOURS</span><span>01 / 04</span></div><div className="art-illustration"><div className="building b1" /><div className="building b2" /><div className="building b3" /><div className="art-person">✦</div><div className="art-balloon">✳</div></div><div className="art-card-bottom"><strong>OUT THERE<br />IS BETTER.</strong><span>GO FIND IT ↗</span></div></div>
            <div className="art-sticker sticker-bottom">NO PLANS?<br />NO PROBLEM.</div>
            <div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div>
          </div>
          <div className="hero-index">01 — EXPLORE WHAT’S HAPPENING</div>
        </section>

        <section className="discover-section" id="discover">
          <div className="section-heading">
            <div><div className="eyebrow dark"><span className="eyebrow-dot" /> THE GOOD STUFF</div><h2>{activeTab === 'Saved' ? 'Your saved vibes.' : activeTab === 'My Vouchers' ? 'Your claimed vouchers.' : 'Make today interesting.'}</h2><p>{activeTab === 'My Vouchers' ? 'Your personal event rewards, all in one place.' : 'Plans worth leaving the house for.'}</p></div>
            <button className="filter-btn" onClick={() => { setCategory('All vibes'); setSearch(''); }}><SlidersHorizontal size={16} /> Reset filters</button>
          </div>
          <div className="category-row">
            <div className="category-scroll">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? 'category-chip selected' : 'category-chip'}>{item}</button>)}</div>
            <div className="category-actions"><span className="results-count">{visible.length} THINGS TO DO</span><button type="button" className="show-everything-btn" onClick={() => { setActiveTab('Discover'); setCategory('All vibes'); setSearch(''); }}>Show everything ↗</button></div>
          </div>
          {activeTab === 'My Vouchers' ? <div className="my-vouchers-panel">
            {vouchersLoading && <p className="voucher-empty">Loading your vouchers…</p>}
            {!vouchersLoading && myVouchers.length === 0 && <div className="voucher-empty"><h3>No vouchers claimed yet.</h3><p>Explore events with voucher offers and claim your first reward.</p><button type="button" onClick={() => setActiveTab('Discover')}>Explore events</button></div>}
            <div className="my-voucher-grid">
              {myVouchers.map((voucher) => <article className="my-voucher-card" key={voucher.id}>
                <div className="eyebrow dark">VIBEZ REWARD · {voucher.city}</div>
                <h3>{voucher.voucher_title}</h3>
                <strong>{voucher.benefit}</strong>
                <p>{voucher.event_title}</p>
                <div className="my-voucher-code"><span>{voucher.code}</span><button type="button" onClick={() => copyVoucherCode(voucher.code)}>Copy</button></div>
                <div className="my-voucher-foot"><span>{voucher.redeemed_at ? 'REDEEMED' : 'NOT REDEEMED'}</span><span>{voucher.expires_at ? 'Expires ' + new Date(voucher.expires_at).toLocaleDateString() : 'No expiry'}</span></div>
                {voucher.instructions && <small>{voucher.instructions}</small>}
              </article>)}
            </div>
            {(voucherMessage || voucherError) && <p className={voucherError ? 'voucher-feedback error' : 'voucher-feedback'}>{voucherError || voucherMessage}</p>}
          </div> : <>
          <div className="happening-heading">
            <div>
              <div className="eyebrow dark"><span className="eyebrow-dot" /> LIVE CITY GUIDE</div>
              <h3>Happening Soon</h3>
              <p>Live events first, followed by what’s starting next — automatically sorted by {selectedCity} local time.</p>
            </div>
            <span className="happening-count">{visible.length} {visible.length === 1 ? 'EVENT' : 'EVENTS'}</span>
          </div>
          <div className="event-grid">
            {visible.map((item) => (
              <article className="event-card" key={item.id}>
                <div className={'event-visual ' + item.color}>
                  {item.coverImageUrl && <button type="button" className="event-image-open" onClick={() => setSelectedImage({ src: item.coverImageUrl, alt: item.title + ' poster' })} aria-label={"View full poster for " + item.title}><img className="event-cover-img" src={item.coverImageUrl} alt="" /></button>}
                  <span className="event-tag">{item.voucher ? "VOUCHER AVAILABLE" : item.tag}</span>{!item.coverImageUrl && <span className="event-emoji">{item.emoji}</span>}
                  <button className={saved.includes(item.id) ? 'save-btn saved' : 'save-btn'} onClick={() => toggleSave(item.id)} aria-label={saved.includes(item.id) ? 'Remove saved event' : 'Save event'}><Bookmark size={17} fill={saved.includes(item.id) ? 'currentColor' : 'none'} /></button>
                  <span className="visual-index">VZ / 0{item.id}</span>
                </div>
                <div className="event-info"><div className="event-type">{item.startsAt <= clockNow && clockNow < item.endsAt ? <><span className="event-live-indicator">HAPPENING NOW</span> <span>•</span> </> : <><span className="event-upcoming-indicator">UPCOMING</span> <span>•</span> </>}{item.type} <span>•</span> {item.day}</div><h3>{item.title}</h3><p>{item.description}</p><div className="event-footer"><span><MapPin size={14} />{item.place}</span><strong>{item.price}</strong></div><div className="event-time"><span><CalendarDays size={14} /> {item.time}</span><button type="button" className="go-btn" onClick={() => openMap(item.place, item.mapUrl)}>Go <ArrowUpRight size={14} /></button></div><button type="button" className="event-details-btn" onClick={() => setSelectedEvent(item)}>View event details <ArrowUpRight size={14} /></button></div>
              </article>
            ))}
          </div>
          {visible.length === 0 && <div className="empty-state"><span>✳</span><h3>{eventsLoading ? 'Finding your next vibe…' : activeTab === 'Saved' ? 'No saved events yet.' : 'No upcoming approved events yet.'}</h3><p>{eventsLoading ? 'Loading approved events from ' + selectedCity + '.' : activeTab === 'Saved' ? 'Save an event and it will appear here.' : 'Check back soon. New events will appear here after VIBEZ approval.'}</p></div>}
          {eventsError && <div className="demo-note">{eventsError}. Please refresh to try again.</div>}
          </>}
        </section>

        <section className="community-banner"><div className="community-icon"><Users size={25} /></div><div><div className="eyebrow">BUILT BY THE COMMUNITY</div><h2>Your city has a story.<br />Add to it.</h2><p>Know a cool event, a hidden spot or a community worth finding? Help make the city more discoverable.</p></div><button onClick={openEventForm}>Share a discovery <ArrowUpRight size={17} /></button><span className="banner-star">✳</span></section>
      </main>
      <footer><a className="brand footer-brand" href="#"><span className="brand-name">VIBEZ</span></a><span>BE OUT THERE. FIND YOUR PEOPLE.</span><span>© 2026 VIBEZ</span></footer>
    </div>
  );
}

export default App;