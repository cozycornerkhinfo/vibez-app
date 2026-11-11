import React, { useMemo, useState } from 'react';
import { Search, MapPin, CalendarDays, Compass, Users, Bookmark, ArrowUpRight, SlidersHorizontal, Sparkles, Menu, X } from 'lucide-react';

const activities = [
  { id: 1, title: 'Weekend Market Walk', type: 'Markets', day: 'SAT, NOV 14', time: '9:00 AM', place: 'Central Market area', price: 'Free', tag: 'Local favourite', color: 'market', emoji: '🧺', description: 'Browse local finds, street food and independent makers.' },
  { id: 2, title: 'Rooftop Sunset Sessions', type: 'Music', day: 'FRI, NOV 13', time: '5:30 PM', place: 'BKK1', price: '$5+', tag: 'Tonight’s plan', color: 'music', emoji: '🎶', description: 'Good music, golden hour and a relaxed city crowd.' },
  { id: 3, title: 'Creative Coffee Meetup', type: 'Community', day: 'SUN, NOV 15', time: '10:00 AM', place: 'Toul Tom Poung', price: 'Buy a drink', tag: 'Meet people', color: 'coffee', emoji: '☕', description: 'A casual meet-up for makers, freelancers and curious minds.' },
  { id: 4, title: 'Open-Air Movie Night', type: 'Arts', day: 'SAT, NOV 14', time: '7:00 PM', place: 'Koh Pich', price: '$3', tag: 'Under the stars', color: 'movie', emoji: '🎬', description: 'Bring a friend and enjoy a film under the night sky.' },
  { id: 5, title: 'Sunday Social Run', type: 'Fitness', day: 'SUN, NOV 15', time: '6:30 AM', place: 'Riverside', price: 'Free', tag: 'Move together', color: 'run', emoji: '🏃', description: 'An easy-paced community run, open to all levels.' },
  { id: 6, title: 'Indie Makers Pop-up', type: 'Markets', day: 'SUN, NOV 15', time: '11:00 AM', place: 'Street  street  308', price: 'Free entry', tag: 'Discover local', color: 'makers', emoji: '🎨', description: 'Meet independent creators and discover something new.' }
];

const categories = ['All vibes', 'Music', 'Markets', 'Food & Drink', 'Arts', 'Fitness', 'Community'];

function App() {
  const [category, setCategory] = useState('All vibes');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState([]);
  const [activeTab, setActiveTab] = useState('Discover');
  const [mobileMenu, setMobileMenu] = useState(false);

  const filtered = useMemo(() => activities.filter((item) => {
    const matchesCategory = category === 'All vibes' || item.type === category || (category === 'Food & Drink' && item.type === 'Community');
    const haystack = [item.title, item.type, item.place, item.description].join(' ').toLowerCase();
    return matchesCategory && haystack.includes(search.toLowerCase());
  }), [category, search]);

  const toggleSave = (id) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const visible = activeTab === 'Saved' ? filtered.filter((item) => saved.includes(item.id)) : filtered;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => setActiveTab('Discover')} aria-label="VIBEZ home">
          <span className="brand-mark">V<span>•</span></span><span className="brand-name">VIBEZ</span>
        </a>
        <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
          {['Discover', 'Events', 'Community', 'Saved'].map((tab) => (
            <button key={tab} className={activeTab === tab ? 'nav-link active' : 'nav-link'} onClick={() => { setActiveTab(tab); setMobileMenu(false); }}>
              {tab}{tab === 'Saved' && saved.length > 0 && <span className="saved-count">{saved.length}</span>}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <span className="city-pill"><MapPin size={14} /> Phnom Penh <span className="chevron">⌄</span></span>
          <button className="submit-btn" onClick={() => alert('Community submissions are coming soon!')}>＋ <span>Submit an event</span></button>
          <button className="menu-btn" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> YOUR CITY, YOUR SCENE</div>
            <h1>Find your<br /><span>next vibe.</span></h1>
            <p className="hero-description">Less scrolling. More living. Discover events, hidden gems and people doing things around your city.</p>
            <div className="hero-search">
              <Search size={19} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="What are you in the mood for?" aria-label="Search activities" />
              <button onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}>Explore <ArrowUpRight size={16} /></button>
            </div>
            <div className="hero-meta"><span><span className="pulse-dot" /> Discovering Phnom Penh</span><span>Made for going out, not staying in.</span></div>
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
            <div><div className="eyebrow dark"><span className="eyebrow-dot" /> THE GOOD STUFF</div><h2>{activeTab === 'Saved' ? 'Your saved vibes.' : 'Make today interesting.'}</h2><p>Plans worth leaving the house for.</p></div>
            <button className="filter-btn" onClick={() => { setCategory('All vibes'); setSearch(''); }}><SlidersHorizontal size={16} /> Reset filters</button>
          </div>
          <div className="category-row">
            <div className="category-scroll">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? 'category-chip selected' : 'category-chip'}>{item}</button>)}</div>
            <span className="results-count">{visible.length} THINGS TO DO</span>
          </div>
          <div className="event-grid">
            {visible.map((item) => (
              <article className="event-card" key={item.id}>
                <div className={'event-visual ' + item.color}>
                  <span className="event-tag">{item.tag}</span><span className="event-emoji">{item.emoji}</span>
                  <button className={saved.includes(item.id) ? 'save-btn saved' : 'save-btn'} onClick={() => toggleSave(item.id)} aria-label={saved.includes(item.id) ? 'Remove saved event' : 'Save event'}><Bookmark size={17} fill={saved.includes(item.id) ? 'currentColor' : 'none'} /></button>
                  <span className="visual-index">VZ / 0{item.id}</span>
                </div>
                <div className="event-info"><div className="event-type">{item.type} <span>•</span> {item.day}</div><h3>{item.title}</h3><p>{item.description}</p><div className="event-footer"><span><MapPin size={14} />{item.place}</span><strong>{item.price}</strong></div><div className="event-time"><CalendarDays size={14} /> {item.time}</div></div>
              </article>
            ))}
          </div>
          {visible.length === 0 && <div className="empty-state"><span>✳</span><h3>No vibes found. Yet.</h3><p>Try another category or search term.</p><button onClick={() => { setCategory('All vibes'); setSearch(''); if(activeTab === 'Saved') setActiveTab('Discover'); }}>Show everything</button></div>}
          <div className="demo-note">PREVIEW CONTENT · Sample activities shown for design testing. Real event listings will be connected next.</div>
        </section>

        <section className="community-banner"><div className="community-icon"><Users size={25} /></div><div><div className="eyebrow">BUILT BY THE COMMUNITY</div><h2>Your city has a story.<br />Add to it.</h2><p>Know a cool event, a hidden spot or a community worth finding? Help make the city more discoverable.</p></div><button onClick={() => alert('Event and place submissions are coming soon!')}>Share a discovery <ArrowUpRight size={17} /></button><span className="banner-star">✳</span></section>
      </main>
      <footer><a className="brand footer-brand" href="#"><span className="brand-mark">V<span>•</span></span><span className="brand-name">VIBEZ</span></a><span>BE OUT THERE. FIND YOUR PEOPLE.</span><span>© 2026 VIBEZ</span></footer>
    </div>
  );
}

export default App;