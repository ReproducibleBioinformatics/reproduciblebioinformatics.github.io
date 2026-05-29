// ─── Config ───────────────────────────────────────────────────────────────────
const GITHUB_OWNER = 'ReproducibleBioinformatics';
const GITHUB_REPO  = 'reproduciblebioinformatics.github.io';
const TEAM_API     = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Team/Descriptions`;
const TEAM_RAW     = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/Team/Descriptions`;
const PHOTOS_BASE  = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/Team`;

// ─── loadTeamData: returns sorted array of all member objects ─────────────────
async function loadTeamData() {
    const res = await fetch(TEAM_API);
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const entries = await res.json();
    const files = entries
        .filter(e => e.type === 'file' && e.name.endsWith('.json'))
        .map(e => e.name);

    const members = await Promise.all(
        files.map(async (file, idx) => {
            try {
                const r = await fetch(`${TEAM_RAW}/${file}`);
                if (!r.ok) return null;
                const d = await r.json();
                d._colorIdx = idx;
                return d;
            } catch (e) { return null; }
        })
    );

    return members
        .filter(Boolean)
        .sort((a, b) => {
            // 1. Se entrambi hanno order esplicito
            if (a.order != null && b.order != null) return a.order - b.order;
            // 2. Chi ha order esplicito viene prima
            if (a.order != null) return -1;
            if (b.order != null) return 1;
            // 3. Altrimenti per startDate (chi è nel lab da più tempo prima)
            const da = a.startDate ? new Date(a.startDate.length === 4 ? a.startDate + '-01-01' : a.startDate + '-01') : new Date(0);
            const db = b.startDate ? new Date(b.startDate.length === 4 ? b.startDate + '-01-01' : b.startDate + '-01') : new Date(0);
            return da - db;
        });
}

// ─── Resolve photo path (tutte le foto stanno in Team/) ───────────────────────
function resolvePhoto(member) {
    if (!member.photo) return '';
    return `${PHOTOS_BASE}/${member.photo}`;
}

// ─── Team page ────────────────────────────────────────────────────────────────
async function loadTeam() {
    const currentMembers = document.getElementById('current-members');
    const formerMembers  = document.getElementById('former-members');

    let members;
    try {
        members = await loadTeamData();
    } catch (err) {
        console.error('Could not load team:', err);
        return;
    }

    members.forEach(member => {
        const card = createTeamCard(member);
        if (member.endDate === 'current') {
            currentMembers.appendChild(card);
        } else {
            formerMembers.appendChild(card);
        }
    });
}

function createTeamCard(member) {
    const card = document.createElement('div');
    card.className = 'team-card';

    const photoPath = resolvePhoto(member);
    const socials   = member.socials || {};

    const socialLinks = [
        socials.linkedin ? `<a href="${socials.linkedin}" target="_blank" rel="noopener" title="LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg></a>` : '',
        socials.github ? `<a href="${socials.github}" target="_blank" rel="noopener" title="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg></a>` : '',
    ].filter(Boolean).join('');

    card.innerHTML = `
        ${photoPath ? `<img src="${photoPath}" alt="${member.firstName} ${member.lastName}">` : ''}
        <h4>${member.firstName} ${member.lastName}</h4>
        <div class="position">${member.position}</div>
        ${member.email ? `<div class="email"><a href="mailto:${member.email}">${member.email}</a></div>` : ''}
        ${socialLinks ? `<div class="social-links">${socialLinks}</div>` : ''}
    `;
    return card;
}

// ─── News feed ────────────────────────────────────────────────────────────────
async function loadNewsFeed() {
    const container = document.getElementById('news-feed');
    if (!container) return;

    let members;
    try {
        members = await loadTeamData();
    } catch (err) {
        console.error('Could not load team for news:', err);
        container.innerHTML = '<p class="small-muted">Could not load news.</p>';
        return;
    }

    const AVATAR_COLORS = [
        {bg:'#dbeafe',color:'#1e40af'},{bg:'#dcfce7',color:'#166534'},
        {bg:'#ede9fe',color:'#4c1d95'},{bg:'#fef9c3',color:'#713f12'},
        {bg:'#ffe4e6',color:'#881337'},{bg:'#ffedd5',color:'#7c2d12'}
    ];

    function toDate(str) {
        if (!str || str === 'current') return null;
        return new Date(str.length === 4 ? str+'-01-01' : str.length === 7 ? str+'-01' : str);
    }

    function inWindow(itemDate, startDate, endDate) {
        const d = toDate(itemDate);
        const s = toDate(startDate);
        const e = endDate === 'current' ? new Date() : toDate(endDate);
        if (!d) return false;
        if (s && d < s) return false;
        if (e && d > e) return false;
        return true;
    }

    let items = [];
    members.forEach(member => {
        const isCurrent = member.endDate === 'current';
        const news = Array.isArray(member.news) ? member.news : [];
        news.forEach(n => {
            if (!n.text && !n.title) return;
            if (!isCurrent && !inWindow(n.date, member.startDate, member.endDate)) return;
            items.push({
                name:           `${member.firstName} ${member.lastName}`,
                position:       member.position || '',
                linkedin:       member.socials?.linkedin || null,
                linkedin_post:  n.linkedin_post || null,
                date:           n.date || '',
                text:           n.text || n.title || '',
                tag:            n.tag || 'news',
                colorIdx:       member._colorIdx
            });
        });
    });

    items.sort((a, b) => {
        const da = toDate(a.date), db = toDate(b.date);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return db - da;
    });

    if (items.length === 0) {
        container.innerHTML = '<p class="small-muted">No news yet — add a <code>news</code> array to your team JSON.</p>';
        return;
    }

    const PER_PAGE = 2;
    let page = 0;

    function initials(name) {
        return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
    }
    function fmtDate(str) {
        if (!str) return '';
        const d = new Date(str.length === 4 ? str+'-01-01' : str.length === 7 ? str+'-01' : str);
        return isNaN(d) ? str : d.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'});
    }

    container.innerHTML = `
        <div class="news-header">
            <div class="news-nav">
                <button class="news-btn" id="news-prev" aria-label="Previous" disabled>&#8249;</button>
                <span class="news-counter" id="news-count"></span>
                <button class="news-btn" id="news-next" aria-label="Next">&#8250;</button>
            </div>
        </div>
        <div class="news-grid" id="news-grid"></div>
    `;

    const grid    = container.querySelector('#news-grid');
    const prevBtn = container.querySelector('#news-prev');
    const nextBtn = container.querySelector('#news-next');
    const counter = container.querySelector('#news-count');

    function render() {
        const total = items.length;
        const start = page * PER_PAGE;
        const end   = Math.min(start + PER_PAGE, total);
        const slice = items.slice(start, end);

        prevBtn.disabled = page === 0;
        nextBtn.disabled = end >= total;
        counter.textContent = `${start + 1}–${end} / ${total}`;

        grid.innerHTML = '';
        slice.forEach(item => {
            const c = AVATAR_COLORS[item.colorIdx % AVATAR_COLORS.length];

            // Footer: link al post LinkedIn se disponibile, altrimenti al profilo
            const linkUrl   = item.linkedin_post || item.linkedin;
            const linkLabel = item.linkedin_post ? 'View post' : 'LinkedIn';
            const liBtn = linkUrl
                ? `<a class="news-li-link" href="${linkUrl}" target="_blank" rel="noopener">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                       </svg> ${linkLabel}
                   </a>`
                : '';

            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <div class="news-card-header">
                    <div class="news-avatar" style="background:${c.bg};color:${c.color}">${initials(item.name)}</div>
                    <div class="news-meta">
                        <div class="news-author">${item.name}</div>
                        <div class="news-position">${item.position}</div>
                    </div>
                    <div class="news-date">${fmtDate(item.date)}</div>
                </div>
                <p class="news-text">${item.text}</p>
                <div class="news-card-footer">
                    <span class="news-tag">${item.tag}</span>
                    ${liBtn}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    prevBtn.addEventListener('click', () => { page--; render(); });
    nextBtn.addEventListener('click', () => { page++; render(); });
    render();
}
