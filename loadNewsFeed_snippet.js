// ══════════════════════════════════════════════════════════════════════════════
//  INCOLLA QUESTO BLOCCO NEL TUO common.js ESISTENTE
//  Popola #news-feed in index.html leggendo news.json
// ══════════════════════════════════════════════════════════════════════════════

const LI_ICON_SMALL = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle">
  <path d="M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.98 1.98 0 0 1-1.98-1.98c0-1.093.887-1.98 1.98-1.98 1.094 0 1.98.887 1.98 1.98a1.98 1.98 0 0 1-1.98 1.98zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
</svg>`;

const NEWS_MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const NEWS_PAGE_SIZE = 4; // 2 colonne × 2 righe

function loadNewsFeed() {
  const feed = document.getElementById('news-feed');
  if (!feed) return;

  fetch('news.json')
    .then(r => r.json())
    .then(data => {
      const news = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      let page = 0;
      const totalPages = Math.ceil(news.length / NEWS_PAGE_SIZE);

      const tagColors = {
        'Research':     ['#d1fae5', '#065f46'],
        'Conference':   ['#ede9fe', '#4c1d95'],
        'Award':        ['#fef9c3', '#854d0e'],
        'BioHackathon': ['#fee2e2', '#991b1b'],
        'Training':     ['#e0f2fe', '#0c4a6e'],
        'Lab News':     ['#f3f4f6', '#374151'],
      };

      function renderPage(p) {
        const slice = news.slice(p * NEWS_PAGE_SIZE, (p + 1) * NEWS_PAGE_SIZE);
        feed.innerHTML = `
          <div class="news-header">
            <div class="news-nav">
              <button class="news-btn" id="news-prev" ${p === 0 ? 'disabled' : ''}>&#8249;</button>
              <span class="news-counter">${p + 1} / ${totalPages}</span>
              <button class="news-btn" id="news-next" ${p >= totalPages - 1 ? 'disabled' : ''}>&#8250;</button>
            </div>
          </div>
          <div class="news-grid">
            ${slice.map(item => {
              const d = new Date(item.date);
              const dateStr = `${d.getDate()} ${NEWS_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
              const [bg, fg] = tagColors[item.tag] || ['#eff6ff', '#1d4ed8'];
              const text = item.summary.length > 160 ? item.summary.slice(0, 157) + '…' : item.summary;
              return `
                <div class="news-card">
                  <div class="news-card-header">
                    <div class="news-meta">
                      <div class="news-author">${item.author || ''}</div>
                    </div>
                    <div class="news-date">${dateStr}</div>
                  </div>
                  <p class="news-text">${text}</p>
                  <div class="news-card-footer">
                    <span class="news-tag" style="background:${bg};color:${fg}">${item.tag}</span>
                    ${item.linkedin ? `<a class="news-li-link" href="${item.linkedin}" target="_blank" rel="noopener">${LI_ICON_SMALL} LinkedIn</a>` : ''}
                  </div>
                </div>`;
            }).join('')}
          </div>
          <div style="text-align:right;margin-top:.8rem">
            <a href="news.html" style="font-size:.82rem;color:#2563a8;text-decoration:none;font-weight:500">All news →</a>
          </div>`;

        document.getElementById('news-prev')?.addEventListener('click', () => { page--; renderPage(page); });
        document.getElementById('news-next')?.addEventListener('click', () => { page++; renderPage(page); });
      }

      renderPage(0);
    })
    .catch(() => {
      if (feed) feed.innerHTML = '<p class="small-muted">News not available.</p>';
    });
}
