// Admin Logic - GitHub API Integration
let githubToken = localStorage.getItem('blog-pat') || '';
let githubRepo = localStorage.getItem('blog-repo') || '';

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

// 1. Initial State
if (githubToken && githubRepo) {
    authSection.style.display = 'none';
    adminContent.style.display = 'block';
    loadAdminPosts();
}

// 2. Login Handler
document.getElementById('login-btn').onclick = async () => {
    githubToken = document.getElementById('github-token').value;
    githubRepo = document.getElementById('github-repo').value;
    
    try {
        await fetch(`https://api.github.com/repos/${githubRepo}`, {
            headers: { 'Authorization': `token ${githubToken}` }
        });
        localStorage.setItem('blog-pat', githubToken);
        localStorage.setItem('blog-repo', githubRepo);
        location.reload();
    } catch (e) {
        alert('Failed to connect. Check your Token and Repo path.');
    }
};

// 3. Post Publishing Logic
document.getElementById('publish-btn').onclick = async () => {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const imageFile = document.getElementById('post-image').files[0];
    
    if (!title || !content) return alert('Please fill in all fields.');
    
    statusDiv.innerText = 'Uploading assets...';
    
    try {
        let imageUrl = 'https://picsum.photos/800/400'; // Default
        
        // Upload Image to GitHub Assets folder
        if (imageFile) {
            const b64Image = await fileToBase64(imageFile);
            const fileName = `assets/${Date.now()}-${imageFile.name}`;
            const uploadRes = await ghRequest(`/contents/${fileName}`, 'PUT', {
                message: `Upload image: ${imageFile.name}`,
                content: b64Image
            });
            imageUrl = uploadRes.content.download_url;
        }

        // Update posts.json
        statusDiv.innerText = 'Updating database...';
        const fileData = await ghRequest('/contents/data/posts.json');
        const currentPosts = JSON.parse(atob(fileData.content));
        
        const newPost = {
            id: Date.now(),
            title,
            content,
            image: imageUrl,
            date: new Date().toISOString().split('T')[0]
        };
        
        currentPosts.push(newPost);
        
        await ghRequest('/contents/data/posts.json', 'PUT', {
            message: `New post: ${title}`,
            content: btoa(JSON.stringify(currentPosts, null, 2)),
            sha: fileData.sha
        });

        statusDiv.innerText = 'Success! Post published.';
        setTimeout(() => location.reload(), 2000);

    } catch (e) {
        console.error(e);
        statusDiv.innerText = 'Error: ' + e.message;
    }
};

async function loadAdminPosts() {
    try {
        const response = await fetch(`../data/posts.json?v=${new Date().getTime()}`);
        const posts = await response.json();
        const container = document.getElementById('admin-posts');
        
        container.innerHTML = posts.reverse().map(post => `
            <div class="glass-card" style="padding: 1rem;">
                <h4 style="margin-bottom: 0.5rem;">${post.title}</h4>
                <button class="btn" style="background: #ef4444; font-size: 0.75rem; padding: 0.5rem;" onclick="deletePost(${post.id})">Delete</button>
            </div>
        `).join('');
    } catch (e) {
        console.error('Admin load error:', e);
    }
}

// Global Delete Function
window.deletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
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
    } catch (e) {
        alert('Delete failed: ' + e.message);
    }
};
