// Admin controls for content management

// Function to initialize the admin panel
function initAdminPanel() {
    // Check if user is admin
    if (!isAdmin) {
        // Redirect non-admin users
        loadPage('home');
        showAlert('Access denied. Admin privileges required.', 'error');
        return;
    }
    
    // Set up the admin tabs
    setupAdminTabs();
    
    // Load blogs by default
    loadAdminContent('blogs');
}

// Function to set up admin tabs
function setupAdminTabs() {
    const adminTabs = document.querySelectorAll('.admin-tab');
    
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            adminTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Load the selected content
            const contentType = tab.getAttribute('data-type');
            loadAdminContent(contentType);
        });
    });
}

// Function to load admin content based on type
function loadAdminContent(contentType) {
    const contentContainer = document.querySelector('.admin-content');
    
    if (contentType === 'blogs') {
        // Load blogs for admin
        fetchAdminBlogs(contentContainer);
    } else if (contentType === 'videos') {
        // Load videos for admin
        fetchAdminVideos(contentContainer);
    } else if (contentType === 'new-blog') {
        // Show form to create new blog
        showBlogForm(contentContainer);
    } else if (contentType === 'new-video') {
        // Show form to create new video
        showVideoForm(contentContainer);
    } else if (contentType === 'settings') {
        // Show website settings
        showSettingsForm(contentContainer);
    }
}

// Function to fetch and display blogs for admin
function fetchAdminBlogs(container) {
    // Set the header content
    container.innerHTML = `
        <div class="admin-header">
            <h2>Manage Blogs</h2>
            <button class="btn btn-primary" id="new-blog-btn">
                <i class="fas fa-plus"></i> New Blog
            </button>
        </div>
        <div class="content-loading">
            <i class="fas fa-spinner fa-spin"></i> Loading blogs...
        </div>
    `;
    
    // Add event listener for new blog button
    document.getElementById('new-blog-btn').addEventListener('click', () => {
        loadAdminContent('new-blog');
    });
    
    // Fetch blogs from Firestore
    blogsCollection.orderBy('createdAt', 'desc').get()
        .then((querySnapshot) => {
            // Create table to display blogs
            let tableHTML = `
                <table class="content-list">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            if (querySnapshot.empty) {
                tableHTML += `
                    <tr>
                        <td colspan="4" class="text-center">No blogs found. Create your first blog!</td>
                    </tr>
                `;
            } else {
                querySnapshot.forEach((doc) => {
                    const blog = doc.data();
                    const date = formatDate(blog.createdAt);
                    const status = blog.published ? 'Published' : 'Draft';
                    
                    tableHTML += `
                        <tr>
                            <td>${blog.title}</td>
                            <td>${date}</td>
                            <td>${status}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-view" data-id="${doc.id}">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                    <button class="btn btn-edit" data-id="${doc.id}">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn btn-delete" data-id="${doc.id}">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }
            
            tableHTML += `
                    </tbody>
                </table>
            `;
            
            // Replace loading message with table
            container.querySelector('.content-loading').outerHTML = tableHTML;
            
            // Add event listeners for action buttons
            const viewButtons = container.querySelectorAll('.btn-view');
            const editButtons = container.querySelectorAll('.btn-edit');
            const deleteButtons = container.querySelectorAll('.btn-delete');
            
            viewButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const blogId = button.getAttribute('data-id');
                    viewBlog(blogId);
                });
            });
            
            editButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const blogId = button.getAttribute('data-id');
                    editBlog(blogId, container);
                });
            });
            
            deleteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const blogId = button.getAttribute('data-id');
                    deleteBlog(blogId, container);
                });
            });
        })
        .catch((error) => {
            console.error("Error fetching blogs:", error);
            container.querySelector('.content-loading').innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    Error loading blogs: ${error.message}
                </div>
            `;
        });
}

// Function to fetch and display videos for admin
function fetchAdminVideos(container) {
    // Set the header content
    container.innerHTML = `
        <div class="admin-header">
            <h2>Manage Videos</h2>
            <button class="btn btn-primary" id="new-video-btn">
                <i class="fas fa-plus"></i> New Video
            </button>
        </div>
        <div class="content-loading">
            <i class="fas fa-spinner fa-spin"></i> Loading videos...
        </div>
    `;
    
    // Add event listener for new video button
    document.getElementById('new-video-btn').addEventListener('click', () => {
        loadAdminContent('new-video');
    });
    
    // Fetch videos from Firestore
    videosCollection.orderBy('createdAt', 'desc').get()
        .then((querySnapshot) => {
            // Create table to display videos
            let tableHTML = `
                <table class="content-list">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            if (querySnapshot.empty) {
                tableHTML += `
                    <tr>
                        <td colspan="4" class="text-center">No videos found. Upload your first video!</td>
                    </tr>
                `;
            } else {
                querySnapshot.forEach((doc) => {
                    const video = doc.data();
                    const date = formatDate(video.createdAt);
                    const status = video.published ? 'Published' : 'Draft';
                    
                    tableHTML += `
                        <tr>
                            <td>${video.title}</td>
                            <td>${date}</td>
                            <td>${status}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-view" data-id="${doc.id}">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                    <button class="btn btn-edit" data-id="${doc.id}">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn btn-delete" data-id="${doc.id}">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            }
            
            tableHTML += `
                    </tbody>
                </table>
            `;
            
            // Replace loading message with table
            container.querySelector('.content-loading').outerHTML = tableHTML;
            
            // Add event listeners for action buttons
            const viewButtons = container.querySelectorAll('.btn-view');
            const editButtons = container.querySelectorAll('.btn-edit');
            const deleteButtons = container.querySelectorAll('.btn-delete');
            
            viewButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const videoId = button.getAttribute('data-id');
                    viewVideo(videoId);
                });
            });
            
            editButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const videoId = button.getAttribute('data-id');
                    editVideo(videoId, container);
                });
            });
            
            deleteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const videoId = button.getAttribute('data-id');
                    deleteVideo(videoId, container);
                });
            });
        })
        .catch((error) => {
            console.error("Error fetching videos:", error);
            container.querySelector('.content-loading').innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    Error loading videos: ${error.message}
                </div>
            `;
        });
}

// Function to show blog form (for creating or editing)
function showBlogForm(container, blogData = null) {
    const isEditing = blogData !== null;
    const title = isEditing ? 'Edit Blog Post' : 'Create New Blog Post';
    const submitLabel = isEditing ? 'Update Post' : 'Publish Post';
    
    container.innerHTML = `
        <div class="admin-header">
            <h2>${title}</h2>
            <button class="btn btn-secondary" id="back-to-blogs-btn">
                <i class="fas fa-arrow-left"></i> Back to Blogs
            </button>
        </div>
        <form id="blog-form" class="content-form">
            <div class="form-group">
                <label for="blog-title">Blog Title *</label>
                <input type="text" id="blog-title" required value="${isEditing ? blogData.title : ''}" placeholder="Enter a captivating title">
            </div>
            <div class="form-group">
                <label for="blog-summary">Summary</label>
                <textarea id="blog-summary" rows="3" placeholder="Write a brief summary">${isEditing ? blogData.summary || '' : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="blog-content">Content *</label>
                <textarea id="blog-content" rows="12" required placeholder="Write your blog post content here...">${isEditing ? blogData.content : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="blog-tags">Tags (comma separated)</label>
                <input type="text" id="blog-tags" value="${isEditing ? blogData.tags ? blogData.tags.join(', ') : '' : ''}" placeholder="e.g. technology, design, tutorial">
            </div>
            <div class="form-footer">
                ${isEditing ? `<input type="hidden" id="blog-id" value="${blogData.id}">` : ''}
                <button type="button" class="btn btn-secondary" id="save-draft-btn">Save as Draft</button>
                <button type="submit" class="btn btn-primary">${submitLabel}</button>
            </div>
        </form>
    `;
    
    // Add event listener for back button
    document.getElementById('back-to-blogs-btn').addEventListener('click', () => {
        loadAdminContent('blogs');
    });
    
    // Add event listener for form submission (publish)
    document.getElementById('blog-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveBlogPost(true, isEditing);
    });
    
    // Add event listener for save as draft button
    document.getElementById('save-draft-btn').addEventListener('click', () => {
        saveBlogPost(false, isEditing);
    });
}

// Function to save a blog post (create or update)
function saveBlogPost(publish, isEditing) {
    // Get form values
    const title = document.getElementById('blog-title').value;
    const summary = document.getElementById('blog-summary').value;
    const content = document.getElementById('blog-content').value;
    const tagsInput = document.getElementById('blog-tags').value;
    
    // Process tags
    const tags = tagsInput.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
    
    // Validate blog data
    const blogData = { title, content, summary, tags };
    const validation = validateContent('blog', blogData);
    
    if (!validation.valid) {
        showAlert(validation.message, 'error');
        return;
    }
    
    // Create blog object
    const blog = {
        title,
        summary,
        content,
        tags,
        published: publish,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (isEditing) {
        // Update existing blog
        const blogId = document.getElementById('blog-id').value;
        
        blogsCollection.doc(blogId).update(blog)
            .then(() => {
                showAlert(`Blog post ${publish ? 'published' : 'saved as draft'} successfully!`, 'success');
                loadAdminContent('blogs');
            })
            .catch((error) => {
                console.error("Error updating blog:", error);
                showAlert(`Error updating blog: ${error.message}`, 'error');
            });
    } else {
        // Add createdAt for new blog
        blog.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        blog.author = {
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email
        };
        
        // Create new blog
        blogsCollection.add(blog)
            .then(() => {
                showAlert(`Blog post ${publish ? 'published' : 'saved as draft'} successfully!`, 'success');
                loadAdminContent('blogs');
            })
            .catch((error) => {
                console.error("Error creating blog:", error);
                showAlert(`Error creating blog: ${error.message}`, 'error');
            });
    }
}

// Function to view a blog post
function viewBlog(blogId) {
    // Redirect to blog page with the selected ID
    loadPage('blogs', { id: blogId });
}

// Function to edit a blog post
function editBlog(blogId, container) {
    // Fetch the blog data and show edit form
    blogsCollection.doc(blogId).get()
        .then((doc) => {
            if (doc.exists) {
                const blogData = doc.data();
                blogData.id = doc.id;
                showBlogForm(container, blogData);
            } else {
                showAlert('Blog post not found!', 'error');
                loadAdminContent('blogs');
            }
        })
        .catch((error) => {
            console.error("Error fetching blog:", error);
            showAlert(`Error fetching blog: ${error.message}`, 'error');
        });
}

// Function to delete a blog post
function deleteBlog(blogId, container) {
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
        blogsCollection.doc(blogId).delete()
            .then(() => {
                showAlert('Blog post deleted successfully!', 'success');
                loadAdminContent('blogs');
            })
            .catch((error) => {
                console.error("Error deleting blog:", error);
                showAlert(`Error deleting blog: ${error.message}`, 'error');
            });
    }
}

// Function to show video form (for creating or editing)
function showVideoForm(container, videoData = null) {
    const isEditing = videoData !== null;
    const title = isEditing ? 'Edit Video' : 'Add New Video';
    const submitLabel = isEditing ? 'Update Video' : 'Publish Video';
    
    container.innerHTML = `
        <div class="admin-header">
            <h2>${title}</h2>
            <button class="btn btn-secondary" id="back-to-videos-btn">
                <i class="fas fa-arrow-left"></i> Back to Videos
            </button>
        </div>
        <form id="video-form" class="content-form">
            <div class="form-group">
                <label for="video-title">Video Title *</label>
                <input type="text" id="video-title" required value="${isEditing ? videoData.title : ''}" placeholder="Enter a descriptive title">
            </div>
            <div class="form-group">
                <label for="video-url">Video URL (YouTube or Vimeo) *</label>
                <input type="url" id="video-url" required value="${isEditing ? videoData.videoUrl : ''}" placeholder="e.g. https://www.youtube.com/watch?v=...">
                <small>Supports YouTube or Vimeo URLs</small>
            </div>
            <div class="form-group">
                <label for="video-description">Description *</label>
                <textarea id="video-description" rows="6" required placeholder="Describe your video">${isEditing ? videoData.description : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="video-category">Category</label>
                <select id="video-category">
                    <option value="">Select a category</option>
                    <option value="tutorial" ${isEditing && videoData.category === 'tutorial' ? 'selected' : ''}>Tutorial</option>
                    <option value="entertainment" ${isEditing && videoData.category === 'entertainment' ? 'selected' : ''}>Entertainment</option>
                    <option value="education" ${isEditing && videoData.category === 'education' ? 'selected' : ''}>Education</option>
                    <option value="technology" ${isEditing && videoData.category === 'technology' ? 'selected' : ''}>Technology</option>
                    <option value="lifestyle" ${isEditing && videoData.category === 'lifestyle' ? 'selected' : ''}>Lifestyle</option>
                    <option value="other" ${isEditing && videoData.category === 'other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="video-tags">Tags (comma separated)</label>
                <input type="text" id="video-tags" value="${isEditing ? videoData.tags ? videoData.tags.join(', ') : '' : ''}" placeholder="e.g. tutorial, coding, web development">
            </div>
            <div class="form-footer">
                ${isEditing ? `<input type="hidden" id="video-id" value="${videoData.id}">` : ''}
                <button type="button" class="btn btn-secondary" id="save-draft-btn">Save as Draft</button>
                <button type="submit" class="btn btn-primary">${submitLabel}</button>
            </div>
        </form>
    `;
    
    // Add event listener for back button
    document.getElementById('back-to-videos-btn').addEventListener('click', () => {
        loadAdminContent('videos');
    });
    
    // Add event listener for form submission (publish)
    document.getElementById('video-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveVideoPost(true, isEditing);
    });
    
    // Add event listener for save as draft button
    document.getElementById('save-draft-btn').addEventListener('click', () => {
        saveVideoPost(false, isEditing);
    });
}

// Function to save a video post (create or update)
function saveVideoPost(publish, isEditing) {
    // Get form values
    const title = document.getElementById('video-title').value;
    const videoUrl = document.getElementById('video-url').value;
    const description = document.getElementById('video-description').value;
    const category = document.getElementById('video-category').value;
    const tagsInput = document.getElementById('video-tags').value;
    
    // Process tags
    const tags = tagsInput.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
    
    // Validate video data
    const videoData = { title, videoUrl, content: description };
    const validation = validateContent('video', videoData);
    
    if (!validation.valid) {
        showAlert(validation.message, 'error');
        return;
    }
    
    // Extract video ID and type from URL
    const videoIdAndType = extractVideoIdAndType(videoUrl);
    if (!videoIdAndType) {
        showAlert('Invalid video URL. Please enter a valid YouTube or Vimeo URL.', 'error');
        return;
    }
    
    // Create video object
    const video = {
        title,
        videoUrl,
        videoId: videoIdAndType.id,
        videoType: videoIdAndType.type,
        description,
        category,
        tags,
        published: publish,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (isEditing) {
        // Update existing video
        const videoId = document.getElementById('video-id').value;
        
        videosCollection.doc(videoId).update(video)
            .then(() => {
                showAlert(`Video ${publish ? 'published' : 'saved as draft'} successfully!`, 'success');
                loadAdminContent('videos');
            })
            .catch((error) => {
                console.error("Error updating video:", error);
                showAlert(`Error updating video: ${error.message}`, 'error');
            });
    } else {
        // Add createdAt and author for new video
        video.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        video.author = {
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email
        };
        
        // Create new video
        videosCollection.add(video)
            .then(() => {
                showAlert(`Video ${publish ? 'published' : 'saved as draft'} successfully!`, 'success');
                loadAdminContent('videos');
            })
            .catch((error) => {
                console.error("Error creating video:", error);
                showAlert(`Error creating video: ${error.message}`, 'error');
            });
    }
}

// Function to extract video ID and type from URL
function extractVideoIdAndType(url) {
    let match;
    
    // YouTube - regular URL
    match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (match && match[1]) {
        return { id: match[1], type: 'youtube' };
    }
    
    // Vimeo
    match = url.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?))/i);
    if (match && match[1]) {
        return { id: match[1], type: 'vimeo' };
    }
    
    return null;
}

// Function to view a video
function viewVideo(videoId) {
    // Redirect to video page with the selected ID
    loadPage('videos', { id: videoId });
}

// Function to edit a video
function editVideo(videoId, container) {
    // Fetch the video data and show edit form
    videosCollection.doc(videoId).get()
        .then((doc) => {
            if (doc.exists) {
                const videoData = doc.data();
                videoData.id = doc.id;
                showVideoForm(container, videoData);
            } else {
                showAlert('Video not found!', 'error');
                loadAdminContent('videos');
            }
        })
        .catch((error) => {
            console.error("Error fetching video:", error);
            showAlert(`Error fetching video: ${error.message}`, 'error');
        });
}

// Function to delete a video
function deleteVideo(videoId, container) {
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
        videosCollection.doc(videoId).delete()
            .then(() => {
                showAlert('Video deleted successfully!', 'success');
                loadAdminContent('videos');
            })
            .catch((error) => {
                console.error("Error deleting video:", error);
                showAlert(`Error deleting video: ${error.message}`, 'error');
            });
    }
}

// Function to show settings form
function showSettingsForm(container) {
    container.innerHTML = `
        <div class="admin-header">
            <h2>Website Settings</h2>
        </div>
        <div class="content-form">
            <div class="settings-section">
                <h3>General Settings</h3>
                <div class="form-group">
                    <label for="site-title">Website Title</label>
                    <input type="text" id="site-title" value="Content Hub" placeholder="Enter website title">
                </div>
                <div class="form-group">
                    <label for="site-description">Website Description</label>
                    <textarea id="site-description" rows="3" placeholder="Enter website description">A platform for blogs and videos</textarea>
                </div>
                <button class="btn btn-primary" id="save-settings-btn">Save Settings</button>
            </div>
            
            <div class="settings-section">
                <h3>Advanced Settings</h3>
                <p>These settings are coming soon. Check back later for more customization options.</p>
            </div>
        </div>
    `;
    
    // Add event listener for save settings button
    document.getElementById('save-settings-btn').addEventListener('click', () => {
        // This is a placeholder for future functionality
        showAlert('Settings saved successfully!', 'success');
    });
}
