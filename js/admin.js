// Preconnected Admin Logic
const githubRepo = 'VirtualPopster/my-modern-blog'; // HARDCODED FOR YOU
let githubToken = localStorage.getItem('blog-pat') || '';

const authSection = document.getElementById('auth-section');
const adminContent = document.getElementById('admin-content');
const statusDiv = document.getElementById('status');

// Helper: Convert File to Base64
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
});

// Helper: GitHub API Call
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

// 🛡️ SECRET ACTIVATION FEATURE
// If you visit with #token=ghp_... it saves it and cleans the URL
if (window.location.hash.includes('token=')) {
    const token = window.location.hash.split('token=')[1];
    localStorage.setItem('blog-pat', token);
    githubToken = token;
    window.location.hash = ''; // Clean the URL for security
}

// 2. Automatic Landing Logic
if (githubToken) {
    authSection.style.display = 'none';
    adminContent.style.display = 'block';
    loadAdminPosts();
}

// 3. Manual Login (Backup only)
document.getElementById('login-btn').onclick = async () => {
    githubToken = document.getElementById('github-token').value;
    if (!githubToken) return alert('Please enter your token.');
    localStorage.setItem('blog-pat', githubToken);
    location.reload();
};

// 4. Post Publishing Logic
document.getElementById('publish-btn').onclick = async () => {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const imageFile = document.getElementById('post-image').files[0];
    
    if (!title || !content) return alert('Please fill in all fields.');
    
    statusDiv.innerText = '🚀 Uploading images and text...';
    
    try {
        let imageUrl = 'https://picsum.photos/800/400';
        
        if (imageFile) {
            const b64Image = await fileToBase64(imageFile);
            const fileName = `assets/${Date.now()}-${imageFile.name}`;
            const uploadRes = await ghRequest(`/contents/${fileName}`, 'PUT', {
                message: `Upload image: ${imageFile.name}`,
                content: b64Image
            });
            imageUrl = uploadRes.content.download_url;
        }

        const fileData = await ghRequest('/contents/data/posts.json');
        const currentPosts = JSON.parse(atob(fileData.content));
        
        currentPosts.push({
            id: Date.now(),
            title,
            content,
            image: imageUrl,
            date: new Date().toISOString().split('T')[0]
        });
        
        await ghRequest('/contents/data/posts.json', 'PUT', {
            message: `New post: ${title}`,
            content: btoa(JSON.stringify(currentPosts, null, 2)),
            sha: fileData.sha
        });

        statusDiv.innerText = '✅ Success! Story is live.';
        setTimeout(() => location.reload(), 1500);

    } catch (e) {
        statusDiv.innerText = '❌ Error: ' + e.message;
    }
};

async function loadAdminPosts() {
    try {
        const response = await fetch(`../data/posts.json?v=${new Date().getTime()}`);
        const posts = await response.json();
        const container = document.getElementById('admin-posts');
        container.innerHTML = posts.reverse().map(post => `
            <div class="glass-card" style="padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">${post.title}</span>
                <button class="btn" style="background: #ef4444; font-size: 0.75rem; padding: 0.5rem 1rem;" onclick="deletePost(${post.id})">Delete</button>
            </div>
        `).join('');
    } catch (e) {}
}

window.deletePost = async (id) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
        const fileData = await ghRequest('/contents/data/posts.json');
        let posts = JSON.parse(atob(fileData.content));
        posts = posts.filter(p => p.id !== id);
        await ghRequest('/contents/data/posts.json', 'PUT', {
            message: `Delete post ${id}`,
            content: btoa(JSON.stringify(posts, null, 2)),
            sha: fileData.sha
        });
        location.reload();
    } catch (e) { alert('Failed: ' + e.message); }
};
