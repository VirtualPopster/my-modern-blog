let lastPostCount = 0;

async function fetchPosts(isInitial = false) {
    const postsContainer = document.getElementById('posts');
    try {
        // Cache-busting URL to force GitHub to give us the freshest data
        const res = await fetch(`data/posts.json?v=${Date.now()}`);
        if (!res.ok) return;
        
        const posts = await res.json();

        // Only update if something actually changed
        if (posts.length !== lastPostCount || isInitial) {
            lastPostCount = posts.length;
            
            if (posts.length === 0) {
                postsContainer.innerHTML = '<div class="glass-card" style="text-align: center; grid-column: 1/-1;">No stories shared yet. Be the first to post!</div>';
                return;
            }

            // Render posts with smooth fade-in
            postsContainer.innerHTML = posts.reverse().map(post => `
                <article class="post-card glass-card" style="animation: fadeIn 0.8s ease-out forwards;">
                    <img src="${post.image}" alt="${post.title}" class="post-image" onerror="this.src='https://via.placeholder.com/800x400?text=No+Image'">
                    <div class="post-meta">${new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    <h2 class="post-title" style="margin: 1rem 0;">${post.title}</h2>
                    <p style="color: var(--text-muted); line-height: 1.8; font-size: 1.05rem;">${post.content}</p>
                </article>
            `).join('');
        }
    } catch (e) {
        console.warn('Syncing blog...');
    }
}

// 🟢 INITIAL LOAD & 5-SECOND HEARTBEAT
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts(true);
    setInterval(fetchPosts, 5000); // Check for new posts every 5 seconds!
});

// CSS Animation for new posts
const style = document.createElement('style');
style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`;
document.head.appendChild(style);
