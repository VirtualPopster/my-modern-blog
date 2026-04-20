// Zero-Revocation Admin - 100% SECURE
const githubRepo = 'VirtualPopster/my-modern-blog';
let githubToken = localStorage.getItem('blog-pat') || '';

// Robust Base64 for UTF-8 (Emojis/Special Chars)
const toB64 = (str) => btoa(unescape(encodeURIComponent(str)));
const fromB64 = (str) => decodeURIComponent(escape(atob(str)));

const authSection = document.getElementById('auth-section');
const adminContent = document.getElementById('admin-content');
const statusDiv = document.getElementById('status');

// 1. Helper: GitHub API Call
async function ghRequest(path, method = 'GET', body = null) {
    const res = await fetch(`https://api.github.com/repos/${githubRepo}${path}`, {
        method,
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// 2. Landing Logic
if (githubToken) {
    authSection.style.display = 'none';
    adminContent.style.display = 'block';
    loadAdminPosts();
}

// 3. Connect Button (Prime the browser)
document.getElementById('login-btn').onclick = async () => {
    const token = document.getElementById('github-token').value;
    if (!token) return alert('Paste your new token to activate.');
    
    try {
        // Test the token
        const res = await fetch(`https://api.github.com/repos/${githubRepo}`, {
            headers: { 'Authorization': `token ${token}` }
        });
        if (!res.ok) throw new Error();
        
        localStorage.setItem('blog-pat', token);
        location.reload();
    } catch (e) {
        alert('❌ Error: Token is invalid or has wrong permissions.');
    }
};

// 4. Publish Function
document.getElementById('publish-btn').onclick = async () => {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const imageFile = document.getElementById('post-image').files[0];
    
    if (!title || !content) return alert('Please fill in all fields.');
    
    statusDiv.innerText = '🚀 Sharing your story...';
    
    try {
        let imageUrl = 'https://picsum.photos/800/400';
        
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            const b64Image = await new Promise((resolve) => {
                reader.onload = () => resolve(reader.result.split(',')[1]);
            });
            const fileName = `assets/${Date.now()}-${imageFile.name}`;
            const uploadRes = await ghRequest(`/contents/${fileName}`, 'PUT', {
                message: `Upload asset: ${imageFile.name}`,
                content: b64Image
            });
            imageUrl = uploadRes.content.download_url;
        }

        const fileData = await ghRequest('/contents/data/posts.json');
        const currentPosts = JSON.parse(fromB64(fileData.content.replace(/\n/g, '')));
        
        currentPosts.push({
            id: Date.now(),
            title,
            content,
            image: imageUrl,
            date: new Date().toISOString().split('T')[0]
        });
        
        await ghRequest('/contents/data/posts.json', 'PUT', {
            message: `New post: ${title}`,
            content: toB64(JSON.stringify(currentPosts, null, 2)),
            sha: fileData.sha
        });

        statusDiv.innerText = '✅ SUCCESS! Post is live.';
        setTimeout(() => location.reload(), 1500);

    } catch (e) {
        statusDiv.innerText = '❌ Sync Error: ' + e.message;
    }
};

// 5. Load/Delete Posts
async function loadAdminPosts() {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/VirtualPopster/my-modern-blog/main/data/posts.json?v=${Date.now()}`);
        const posts = await response.json();
        const container = document.getElementById('admin-posts');
        container.innerHTML = posts.reverse().map(post => `
            <div class="glass-card" style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <div style="font-weight: 800; font-size: 1.2rem;">${post.title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${post.date}</div>
                </div>
                <button class="btn" style="background: #ef4444; padding: 0.6rem 1.2rem;" onclick="deletePost(${post.id})">Delete</button>
            </div>
        `).join('');
    } catch (e) {}
}

window.deletePost = async (id) => {
    if (!confirm('Delete this story?')) return;
    try {
        statusDiv.innerText = '🗑️ Deleting...';
        const fileData = await ghRequest('/contents/data/posts.json');
        let posts = JSON.parse(fromB64(fileData.content.replace(/\n/g, '')));
        posts = posts.filter(p => p.id !== id);
        await ghRequest('/contents/data/posts.json', 'PUT', {
            message: `Delete post ${id}`,
            content: toB64(JSON.stringify(posts, null, 2)),
            sha: fileData.sha
        });
        location.reload();
    } catch (e) { alert('Failed: ' + e.message); }
};
