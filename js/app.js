let lastHash = "";

async function fetchPosts(isInitial = false) {
    const postsContainer = document.getElementById('posts');
    try {
        // ⚡ REAL-TIME SYNC: Fetching the raw JSON with a timestamp to bypass all caching
        const res = await fetch(`https://raw.githubusercontent.com/VirtualPopster/my-modern-blog/main/data/posts.json?v=${Date.now()}`);
        if (!res.ok) return;
        
        const posts = await res.json();
        const currentHash = JSON.stringify(posts);

        if (currentHash !== lastHash || isInitial) {
            lastHash = currentHash;
            
            if (posts.length === 0) {
                postsContainer.innerHTML = '<div class="glass-card" style="text-align: center; grid-column: 1/-1; padding: 4rem;">Waiting for your first story...</div>';
                return;
            }

            // High-speed rendering with smooth animations
            postsContainer.innerHTML = posts.reverse().map(post => `
                <article class="post-card glass-card" style="animation: slideUp 0.6s ease-out forwards; margin-bottom: 2.5rem;">
                    <img src="${post.image}" alt="${post.title}" class="post-image" onerror="this.src='https://via.placeholder.com/800x400?text=No+Image'">
                    <div style="padding: 0.5rem 0;">
                        <div class="post-meta">${new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        <h2 class="post-title" style="font-size: 2.2rem; margin: 0.75rem 0; font-weight: 800; line-height: 1.2;">${post.title}</h2>
                        <p style="color: var(--text-muted); line-height: 1.8; font-size: 1.15rem; white-space: pre-wrap;">${post.content}</p>
                    </div>
                </article>
            `).join('');
        }
    } catch (e) {
        console.warn('Syncing...');
    }
}

// 🚀 HEARTBEAT: Checks every 1 second
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts(true);
    setInterval(fetchPosts, 1000); 
});

const style = document.createElement('style');
style.innerHTML = `@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);
