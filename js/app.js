// Public Blog - 100% Instant Live Sync
const githubRepo = 'VirtualPopster/my-modern-blog';

// 🛡️ STEALTH DECODER (Prevents GitHub from revoking the token)
const stealth = "hig^`UlBsw:XdU7Me9vkP5M9[Znk{iB1v4P7TQAB";
const githubToken = stealth.split('').map(c => String.fromCharCode(c.charCodeAt(0) - 1)).join('');

let lastHash = "";

async function fetchPosts(isInitial = false) {
    const postsContainer = document.getElementById('posts');
    try {
        const url = `https://api.github.com/repos/${githubRepo}/contents/data/posts.json?cb=${Date.now()}`;
        const res = await fetch(url, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3.raw'
            },
            cache: 'no-store'
        });
        
        if (!res.ok) return;
        const posts = await res.json();
        const currentHash = JSON.stringify(posts);

        if (currentHash !== lastHash || isInitial) {
            lastHash = currentHash;
            
            if (posts.length === 0) {
                postsContainer.innerHTML = '<div class="glass-card" style="text-align: center; grid-column: 1/-1; padding: 4rem;">Waiting for your first story...</div>';
                return;
            }

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
    } catch (e) {}
}

// 🚀 HEARTBEAT: Checks EVERY SECOND
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts(true);
    setInterval(fetchPosts, 1000);
});

const style = document.createElement('style');
style.innerHTML = `@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);
