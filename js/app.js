// Main application script to handle navigation and page loading

// DOM elements
const contentContainer = document.getElementById('content-container');
const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

// Function to show alert messages
function showAlert(message, type) {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.innerHTML = `
        <span>${message}</span>
        <button class="alert-close">&times;</button>
    `;
    
    // Add alert to the DOM
    document.body.appendChild(alertElement);
    
    // Add active class to show the alert with animation
    setTimeout(() => {
        alertElement.classList.add('active');
    }, 10);
    
    // Set timeout to remove alert
    const timeout = setTimeout(() => {
        removeAlert(alertElement);
    }, 5000);
    
    // Add event listener for close button
    alertElement.querySelector('.alert-close').addEventListener('click', () => {
        clearTimeout(timeout);
        removeAlert(alertElement);
    });
}

// Function to remove alert
function removeAlert(alertElement) {
    alertElement.classList.remove('active');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.parentNode.removeChild(alertElement);
        }
    }, 300);
}

// Function to load a page
function loadPage(pageName, params = {}) {
    // Update active navigation link
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Close the mobile menu if it's open
    navMenu.classList.remove('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Show loading state
    contentContainer.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    
    // Load the appropriate page content
    switch (pageName) {
        case 'home':
            loadHomePage();
            document.title = 'Content Hub | Home';
            break;
        case 'blogs':
            loadBlogsPage(params);
            document.title = params.id ? 'Content Hub | Blog Post' : 'Content Hub | Blogs';
            break;
        case 'videos':
            loadVideosPage(params);
            document.title = params.id ? 'Content Hub | Video' : 'Content Hub | Videos';
            break;
        case 'auth':
            loadAuthPage();
            document.title = 'Content Hub | Sign In';
            break;
        case 'contact':
            loadContactPage();
            document.title = 'Content Hub | Contact Us';
            break;
        case 'terms':
            loadTermsPage();
            document.title = 'Content Hub | Terms & Policies';
            break;
        case 'admin':
            loadAdminPage();
            document.title = 'Content Hub | Admin Panel';
            break;
        default:
            loadHomePage();
            document.title = 'Content Hub | Home';
    }
    
    // Update URL without refreshing the page
    const url = pageName === 'home' ? '/' : `/${pageName}${params.id ? '/' + params.id : ''}`;
    window.history.pushState({ pageName, params }, document.title, url);
}

// Function to load the home page
function loadHomePage() {
    // Fetch HTML content for home page
    fetch('pages/home.html')
        .then(response => response.text())
        .then(html => {
            contentContainer.innerHTML = html;
            
            // Initialize home page stats
            initHomePageStats();
            
            // Load featured content
            loadFeaturedContent();
        })
        .catch(error => {
            console.error('Error loading home page:', error);
            contentContainer.innerHTML = `
                <div class="error-container">
                    <h2>Error Loading Page</h2>
                    <p>${error.message}</p>
                </div>
            `;
        });
}

// Function to initialize home page statistics
function initHomePageStats() {
    // Get stats elements
    const blogCountElement = document.getElementById('blog-count');
    const videoCountElement = document.getElementById('video-count');
    const userCountElement = document.getElementById('user-count');
    
    // Fetch blog count
    blogsCollection.where('published', '==', true).get()
        .then(snapshot => {
            blogCountElement.textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Error fetching blog count:', error);
            blogCountElement.textContent = '0';
        });
    
    // Fetch video count
    videosCollection.where('published', '==', true).get()
        .then(snapshot => {
            videoCountElement.textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Error fetching video count:', error);
            videoCountElement.textContent = '0';
        });
    
    // Fetch user count
    db.collection('users').get()
        .then(snapshot => {
            userCountElement.textContent = snapshot.size;
        })
        .catch(error => {
            console.error('Error fetching user count:', error);
            userCountElement.textContent = '0';
        });
}

// Function to load featured content on home page
function loadFeaturedContent() {
    // Get featured content containers
    const featuredBlogsContainer = document.getElementById('featured-blogs');
    const featuredVideosContainer = document.getElementById('featured-videos');
    
    // Fetch featured blogs (most recent 3)
    blogsCollection.where('published', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                featuredBlogsContainer.innerHTML = '<p>No blogs available yet.</p>';
                return;
            }
            
            let blogsHTML = '';
            snapshot.forEach(doc => {
                const blog = doc.data();
                const blogId = doc.id;
                const date = formatDate(blog.createdAt);
                
                blogsHTML += `
                    <div class="featured-card">
                        <div class="featured-img">
                            <i class="fas fa-newspaper"></i>
                        </div>
                        <div class="featured-info">
                            <h3>${blog.title}</h3>
                            <p>${blog.summary || blog.content.substring(0, 100)}${blog.content.length > 100 ? '...' : ''}</p>
                            <button class="btn btn-primary read-more-btn" data-id="${blogId}">Read More</button>
                        </div>
                    </div>
                `;
            });
            
            featuredBlogsContainer.innerHTML = blogsHTML;
            
            // Add event listeners for read more buttons
            const readMoreButtons = featuredBlogsContainer.querySelectorAll('.read-more-btn');
            readMoreButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const blogId = button.getAttribute('data-id');
                    loadPage('blogs', { id: blogId });
                });
            });
        })
        .catch(error => {
            console.error('Error fetching featured blogs:', error);
            featuredBlogsContainer.innerHTML = `<p>Error loading blogs: ${error.message}</p>`;
        });
    
    // Fetch featured videos (most recent 3)
    videosCollection.where('published', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                featuredVideosContainer.innerHTML = '<p>No videos available yet.</p>';
                return;
            }
            
            let videosHTML = '';
            snapshot.forEach(doc => {
                const video = doc.data();
                const videoId = doc.id;
                
                videosHTML += `
                    <div class="featured-card">
                        <div class="featured-img video-thumbnail">
                            <i class="fas fa-play-circle"></i>
                        </div>
                        <div class="featured-info">
                            <h3>${video.title}</h3>
                            <p>${video.description.substring(0, 100)}${video.description.length > 100 ? '...' : ''}</p>
                            <button class="btn btn-primary watch-video-btn" data-id="${videoId}">Watch Video</button>
                        </div>
                    </div>
                `;
            });
            
            featuredVideosContainer.innerHTML = videosHTML;
            
            // Add event listeners for watch video buttons
            const watchButtons = featuredVideosContainer.querySelectorAll('.watch-video-btn');
            watchButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const videoId = button.getAttribute('data-id');
                    loadPage('videos', { id: videoId });
                });
            });
        })
        .catch(error => {
            console.error('Error fetching featured videos:', error);
            featuredVideosContainer.innerHTML = `<p>Error loading videos: ${error.message}</p>`;
        });
}

// Function to load the blogs page
function loadBlogsPage(params = {}) {
    // Fetch HTML content for blogs page
    fetch('pages/blogs.html')
        .then(response => response.text())
        .then(html => {
            contentContainer.innerHTML = html;
            
            // Initialize blogs page
            initBlogsPage(params);
        })
        .catch(error => {
            console.error('Error loading blogs page:', error);
            contentContainer.innerHTML = `
                <div class="error-container">
                    <h2>Error Loading Page</h2>
                    <p>${error.message}</p>
                </div>
            `;
        });
}

// Function to load the videos page
function loadVideosPage(params = {}) {
    // Fetch HTML content for videos page
    fetch('pages/videos.html')
        .then(response => response.text())
        .then(html => {
            contentContainer.innerHTML = html;
            
            // Initialize videos page
            initVideosPage(params);
        })
        .catch(error => {
            console.error('Error loading videos page:', error);
            contentContainer.innerHTML = `
                <div class="error-container">
                    <h2>Error Loading Page</h2>
                    <p>${error.message}</p>
                </div>
            `;
        });
}

// Function to load the authentication page
function loadAuthPage() {
    // Fetch HTML content for auth page
    fetch('pages/auth.html')
        .then(response => response.text())
        .then(html => {
            contentContainer.innerHTML = html;
            
            // Initialize auth page
            initAuthPage();
        })
        .catch(error => {
            console.error('Error loading auth page:', error);
            contentContainer.innerHTML = `
                <div class="error-container">
                    <h2>Error Loading Page</h2>
                    <p>${error.message}</p>
                </div>
            `;
        });
}

// Function to load the contact page
function loadContactPage() {
    // Fetch HTML content for contact page
    fetch('pages/contact.html')
        .then(response => response.text())
        .then(html => {
            contentContainer.innerHTML = html;
            
            // Initialize contact form
            initContactForm();
        })
        .catch(error => {
            console.error('Error loading contact page:', error);
            contentContainer.innerHTML = `
                <div class="error-container">
                    <h2>Error Loading Page</h2>
                    <p>${error.message}</p>
                </div>
            `;
        });
}

// Function to initialize contact form
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;
            
            // Validate form
            if (!name || !email || !message) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }
            
            // Save contact message to Firestore
            db.collection('contacts').add({
                name,
                email,
                message,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                showAlert('Your message has been sent successfully!', 'success');
                contactForm.reset();
            })
            .catch((error) => {
                console.error('Error sending message:', error);
                showAlert(`Error sending message: ${error.message}`, 'error');
            });
        });
    }
}

// Function to load the terms page
function loadTermsPage() {
    // Fetch HTML content for terms page
    fetch('pages/terms.html')
        .then(response => response.text())
        .then(html => {
            contentContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading terms page:', error);
            contentContainer.innerHTML = `
                <div class="error-container">
                    <h2>Error Loading Page</h2>
                    <p>${error.message}</p>
                </div>
            `;
        });
}

// Function to load the admin page
function loadAdminPage() {
    // Check if user is admin
    if (!isAdmin) {
        showAlert('Access denied. Admin privileges required.', 'error');
        loadPage('home');
        return;
    }
    
    // Fetch HTML content for admin page
    fetch('pages/admin.html')
        .then(response => response.text())
        .then(html => {
            contentContainer.innerHTML = html;
            
            // Initialize admin panel
            initAdminPanel();
        })
        .catch(error => {
            console.error('Error loading admin page:', error);
            contentContainer.innerHTML = `
                <div class="error-container">
                    <h2>Error Loading Page</h2>
                    <p>${error.message}</p>
                </div>
            `;
        });
}

// Add event listeners to navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = link.getAttribute('data-page');
        loadPage(pageName);
    });
});

// Add event listener for nav toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Add event listener for sign out button
document.querySelector('.sign-out-btn').addEventListener('click', () => {
    auth.signOut().then(() => {
        // User signed out
        loadPage('home');
        showAlert('You have been signed out successfully', 'success');
    }).catch((error) => {
        console.error('Sign out error:', error);
        showAlert(`Error signing out: ${error.message}`, 'error');
    });
});

// Handle popstate event (browser back/forward buttons)
window.addEventListener('popstate', (event) => {
    if (event.state) {
        loadPage(event.state.pageName, event.state.params);
    } else {
        loadPage('home');
    }
});

// Add CSS styles for alert messages
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: var(--radius);
        background-color: var(--white-color);
        box-shadow: var(--shadow);
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 2000;
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s, transform 0.3s;
        max-width: 400px;
    }
    
    .alert.active {
        opacity: 1;
        transform: translateY(0);
    }
    
    .alert-success {
        border-left: 4px solid var(--success-color);
    }
    
    .alert-error {
        border-left: 4px solid var(--danger-color);
    }
    
    .alert-info {
        border-left: 4px solid var(--primary-color);
    }
    
    .alert-close {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        color: var(--gray-color);
        padding: 0;
        margin-left: 10px;
    }
    
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 50px 0;
    }
    
    .loading-spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top: 4px solid var(--primary-color);
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .error-container {
        text-align: center;
        padding: 50px 20px;
    }
    
    .error-container h2 {
        color: var(--danger-color);
        margin-bottom: 20px;
    }
    
    .no-content, .no-results, .error-message {
        text-align: center;
        padding: 50px 20px;
        background-color: var(--white-color);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
    }
    
    .no-content i, .no-results i, .error-message i {
        font-size: 3rem;
        color: var(--gray-color);
        margin-bottom: 20px;
    }
    
    .error-message i {
        color: var(--danger-color);
    }
`;
document.head.appendChild(alertStyles);

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Get the current path and load the appropriate page
    const path = window.location.pathname;
    let pageName = 'home';
    let params = {};
    
    if (path.startsWith('/blogs')) {
        pageName = 'blogs';
        const blogId = path.split('/')[2];
        if (blogId) {
            params.id = blogId;
        }
    } else if (path.startsWith('/videos')) {
        pageName = 'videos';
        const videoId = path.split('/')[2];
        if (videoId) {
            params.id = videoId;
        }
    } else if (path.startsWith('/auth')) {
        pageName = 'auth';
    } else if (path.startsWith('/contact')) {
        pageName = 'contact';
    } else if (path.startsWith('/terms')) {
        pageName = 'terms';
    } else if (path.startsWith('/admin')) {
        pageName = 'admin';
    }
    
    // Load the initial page
    loadPage(pageName, params);
});
