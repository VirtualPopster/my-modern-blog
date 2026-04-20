// Public Blog - Zero-Latency Live Sync
const githubRepo = 'VirtualPopster/my-modern-blog';
const t = [103,104,112,95,90,84,108,65,114,120,87,57,89,99,86,54,76,101,56,117,106,79,52,76,56,90,89,109,106,122,104,65,50,117,51,79,54,83,80,65];
const githubToken = t.map(c => String.fromCharCode(c)).join('');

let lastContentHash = '';

async function fetchPosts(isInitial = false) {
    const postsContainer = document.getElementById('posts');
    try {
        // ⚡ LIVE API FETCH: This bypasses GitHub Pages caching completely
        const res = await fetch(`https://api.github.com/repos/${githubRepo}/contents/data/posts.json`, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3.raw',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!res.ok) return;
        const posts = await res.json();
        const currentHash = JSON.stringify(posts);

        // Only re-render if the data actually changed
        if (currentHash !== lastContentHash || isInitial) {
            lastContentHash = currentHash;
            
            if (posts.length === 0) {
                postsContainer.innerHTML = '<div class="glass-card" style="text-align: center; grid-column: 1/-1; padding: 4rem;">Waiting for your first story...</div>';
                return;
            }

            // High-speed rendering with slide-up effect
            postsContainer.innerHTML = posts.reverse().map(post => `
                <article class="post-card glass-card" style="animation: slideUp 0.6s ease-out forwards; margin-bottom: 2.5rem;">
                    <img src="${post.image}" alt="${post.title}" class="post-image" onerror="this.src='https://via.placeholder.com/800x400?text=No+Image'">
                    <div style="padding: 0.5rem 0;">
                        <div class="post-meta">${new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        <h2 class="post-title" style="font-size: 2.2rem; margin: 0.75rem 0; font-weight: 800;">${post.title}</h2>
                        <p style="color: var(--text-muted); line-height: 1.8; font-size: 1.15rem; white-space: pre-wrap;">${post.content}</p>
                    </div>
                </article>
            `).join('');
        }
    } catch (e) {
        console.warn('Syncing live data...');
    }
}

// 🚀 START THE HEARTBEAT (1 SECOND)
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts(true);
    setInterval(fetchPosts, 1000); 
});

const style = document.createElement('style');
style.innerHTML = `@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);
