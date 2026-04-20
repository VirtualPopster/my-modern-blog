let lastPostCount = 0;

async function fetchPosts(isInitial = false) {
    const postsContainer = document.getElementById('posts');
    try {
        const response = await fetch(`data/posts.json?v=${new Date().getTime()}`);
        const posts = await response.json();

        // Only re-render if there are new posts
        if (posts.length !== lastPostCount || isInitial) {
            lastPostCount = posts.length;
            
            if (posts.length === 0) {
                postsContainer.innerHTML = '<div style="text-align: center; grid-column: 1/-1;">No stories shared yet.</div>';
                return;
            }

            // High-end rendering with smooth fade-in
            postsContainer.innerHTML = posts.reverse().map(post => `
                <article class="post-card glass-card" style="animation: fadeIn 0.5s ease forwards;">
                    <img src="${post.image}" alt="${post.title}" class="post-image" onerror="this.src='https://via.placeholder.com/800x400?text=No+Image'">
                    <div class="post-meta">${new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    <h2 class="post-title">${post.title}</h2>
                    <p style="color: var(--text-muted); line-height: 1.6;">${post.content}</p>
                </article>
            `).join('');
        }
    } catch (error) {
        console.error('Real-time sync error:', error);
    }
}

// Check for new posts every 5 seconds
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts(true);
    setInterval(fetchPosts, 5000);
});

// Add animation to CSS via JS
const style = document.createElement('style');
style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);
