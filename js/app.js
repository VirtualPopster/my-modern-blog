let lastHash = "";

async function fetchPosts(isInitial = false) {
    const postsContainer = document.getElementById('posts');
    try {
        // ⚡ PUBLIC RAW URL: No token needed, no 401 errors, 100% stable
        const url = `https://raw.githubusercontent.com/VirtualPopster/my-modern-blog/main/data/posts.json?v=${Date.now()}`;
        const res = await fetch(url);
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
                <article class="post-card glass-card" style="animation: slideUp 0.6s ease-out forwards; margin-bottom: 3rem;">
                    <img src="${post.image}" alt="${post.title}" class="post-image" onerror="this.src='https://via.placeholder.com/800x400?text=No+Image'">
                    <div style="padding: 1rem 0;">
                        <div class="post-meta">${new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        <h2 class="post-title" style="font-size: 2.5rem; margin: 1rem 0; font-weight: 900;">${post.title}</h2>
                        <p style="color: var(--text-muted); line-height: 1.8; font-size: 1.15rem; white-space: pre-wrap;">${post.content}</p>
                    </div>
                </article>
            `).join('');
        }
    } catch (e) {
        // Silent recovery
    }
}

// 🚀 START THE HEARTBEAT (1 SECOND)
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts(true);
    setInterval(fetchPosts, 1000); 
});

const style = document.createElement('style');
style.innerHTML = `@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);
