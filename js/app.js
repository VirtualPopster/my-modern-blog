document.addEventListener('DOMContentLoaded', async () => {
    const postsContainer = document.getElementById('posts');
    
    try {
        // We use a cache-busting timestamp to ensure we get the latest posts
        const response = await fetch(`data/posts.json?v=${new Date().getTime()}`);
        const posts = await response.json();

        if (posts.length === 0) {
            postsContainer.innerHTML = '<div style="text-align: center; grid-column: 1/-1;">No stories shared yet. Check back soon!</div>';
            return;
        }

        postsContainer.innerHTML = posts.reverse().map(post => `
            <article class="post-card glass-card">
                <img src="${post.image}" alt="${post.title}" class="post-image" onerror="this.src='https://via.placeholder.com/800x400?text=No+Image'">
                <div class="post-meta">${new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <h2 class="post-title">${post.title}</h2>
                <p style="color: var(--text-muted); line-height: 1.6;">${post.content}</p>
            </article>
        `).join('');

    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<div style="text-align: center; grid-column: 1/-1; color: #ef4444;">Unable to load stories. Please try again later.</div>';
    }
});
