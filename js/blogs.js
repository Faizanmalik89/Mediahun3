// Blog-related functions

// Function to initialize blogs page
function initBlogsPage(params = {}) {
    const blogsContainer = document.querySelector('.blog-container');
    
    // Check if we need to show a specific blog
    if (params.id) {
        // Show single blog post
        fetchAndDisplaySingleBlog(params.id, blogsContainer);
    } else {
        // Show blog listing
        initBlogListing(blogsContainer);
    }
}

// Function to initialize blog listing
function initBlogListing(container) {
    // Set up blog listing container
    container.innerHTML = `
        <h2 class="section-title">Our Blog</h2>
        <div class="blog-filters">
            <div class="search-box">
                <input type="text" id="blog-search" placeholder="Search blogs...">
                <i class="fas fa-search"></i>
            </div>
            <select class="filter-dropdown" id="blog-category-filter">
                <option value="">All Categories</option>
                <option value="technology">Technology</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="health">Health</option>
            </select>
        </div>
        <div class="blog-grid" id="blog-grid">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> Loading blogs...
            </div>
        </div>
    `;
    
    // Add event listeners for search and filter
    const searchInput = document.getElementById('blog-search');
    const categoryFilter = document.getElementById('blog-category-filter');
    
    searchInput.addEventListener('input', debounce(() => {
        filterBlogs(searchInput.value, categoryFilter.value);
    }, 300));
    
    categoryFilter.addEventListener('change', () => {
        filterBlogs(searchInput.value, categoryFilter.value);
    });
    
    // Load blogs initially
    loadBlogs();
}

// Function to load blogs from Firestore
function loadBlogs() {
    const blogGrid = document.getElementById('blog-grid');
    
    // Only get published blogs
    blogsCollection.where('published', '==', true)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                blogGrid.innerHTML = `
                    <div class="no-content">
                        <i class="fas fa-newspaper"></i>
                        <p>No blog posts yet. Check back soon!</p>
                    </div>
                `;
                return;
            }
            
            let blogsHTML = '';
            querySnapshot.forEach((doc) => {
                const blog = doc.data();
                const blogId = doc.id;
                const date = formatDate(blog.createdAt);
                
                blogsHTML += `
                    <div class="blog-card" data-id="${blogId}" data-tags="${blog.tags ? blog.tags.join(' ').toLowerCase() : ''}">
                        <div class="blog-img">
                            <i class="fas fa-newspaper"></i>
                        </div>
                        <div class="blog-content">
                            <h3>${blog.title}</h3>
                            <div class="blog-meta">
                                <span><i class="fas fa-user"></i> ${blog.author ? blog.author.name : 'Admin'}</span>
                                <span><i class="fas fa-calendar-alt"></i> ${date}</span>
                            </div>
                            <p class="blog-excerpt">${blog.summary || blog.content.substring(0, 150)}${blog.content.length > 150 ? '...' : ''}</p>
                            <div class="blog-actions">
                                <button class="btn btn-primary read-more-btn" data-id="${blogId}">Read More</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            blogGrid.innerHTML = blogsHTML;
            
            // Add event listeners for read more buttons
            const readMoreButtons = document.querySelectorAll('.read-more-btn');
            readMoreButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const blogId = button.getAttribute('data-id');
                    loadPage('blogs', { id: blogId });
                });
            });
        })
        .catch((error) => {
            console.error("Error loading blogs:", error);
            blogGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading blogs: ${error.message}</p>
                </div>
            `;
        });
}

// Function to filter blogs based on search term and category
function filterBlogs(searchTerm, category) {
    const blogCards = document.querySelectorAll('.blog-card');
    const searchTermLower = searchTerm.toLowerCase();
    
    blogCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
        const tags = card.getAttribute('data-tags') || '';
        
        // Check if card matches search term
        const matchesSearch = searchTerm === '' || 
            title.includes(searchTermLower) || 
            excerpt.includes(searchTermLower) || 
            tags.includes(searchTermLower);
        
        // Check if card matches category
        const matchesCategory = category === '' || tags.includes(category.toLowerCase());
        
        // Show or hide card based on filters
        if (matchesSearch && matchesCategory) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Check if any cards are visible
    const visibleCards = document.querySelectorAll('.blog-card[style="display: flex"]');
    if (visibleCards.length === 0) {
        const blogGrid = document.getElementById('blog-grid');
        
        // If no cards match, show message
        if (!document.querySelector('.no-results')) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No blogs found matching your criteria.</p>
            `;
            blogGrid.appendChild(noResultsDiv);
        }
    } else {
        // Remove no results message if it exists
        const noResults = document.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
    }
}

// Function to fetch and display a single blog post
function fetchAndDisplaySingleBlog(blogId, container) {
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading blog post...
        </div>
    `;
    
    blogsCollection.doc(blogId).get()
        .then((doc) => {
            if (doc.exists) {
                const blog = doc.data();
                const date = formatDate(blog.createdAt);
                
                container.innerHTML = `
                    <div class="blog-post">
                        <div class="blog-post-header">
                            <button class="btn btn-secondary back-btn">
                                <i class="fas fa-arrow-left"></i> Back to All Blogs
                            </button>
                            <h2>${blog.title}</h2>
                            <div class="blog-post-meta">
                                <span><i class="fas fa-user"></i> ${blog.author ? blog.author.name : 'Admin'}</span>
                                <span><i class="fas fa-calendar-alt"></i> ${date}</span>
                                ${blog.tags && blog.tags.length > 0 ? 
                                    `<span><i class="fas fa-tags"></i> ${blog.tags.join(', ')}</span>` : ''}
                            </div>
                        </div>
                        <div class="blog-post-content">
                            ${formatBlogContent(blog.content)}
                        </div>
                        <div class="blog-post-actions">
                            <div class="social-share">
                                <button class="share-facebook"><i class="fab fa-facebook-f"></i></button>
                                <button class="share-twitter"><i class="fab fa-twitter"></i></button>
                                <button class="share-linkedin"><i class="fab fa-linkedin-in"></i></button>
                            </div>
                            <button class="btn btn-primary back-btn">Back to All Blogs</button>
                        </div>
                    </div>
                `;
                
                // Add event listeners for back buttons
                const backButtons = document.querySelectorAll('.back-btn');
                backButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        loadPage('blogs');
                    });
                });
                
                // Add event listeners for share buttons
                const shareButtons = container.querySelectorAll('.social-share button');
                shareButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        // Get the URL of the current blog post
                        const blogUrl = window.location.href;
                        const blogTitle = blog.title;
                        
                        if (button.classList.contains('share-facebook')) {
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`, '_blank');
                        } else if (button.classList.contains('share-twitter')) {
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blogTitle)}&url=${encodeURIComponent(blogUrl)}`, '_blank');
                        } else if (button.classList.contains('share-linkedin')) {
                            window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(blogUrl)}&title=${encodeURIComponent(blogTitle)}`, '_blank');
                        }
                    });
                });
            } else {
                // Blog not found
                container.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Blog post not found! The post may have been removed or is not available.</p>
                        <button class="btn btn-primary back-btn">Back to All Blogs</button>
                    </div>
                `;
                
                // Add event listener for back button
                container.querySelector('.back-btn').addEventListener('click', () => {
                    loadPage('blogs');
                });
            }
        })
        .catch((error) => {
            console.error("Error fetching blog:", error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading blog post: ${error.message}</p>
                    <button class="btn btn-primary back-btn">Back to All Blogs</button>
                </div>
            `;
            
            // Add event listener for back button
            container.querySelector('.back-btn').addEventListener('click', () => {
                loadPage('blogs');
            });
        });
}

// Function to format blog content with proper HTML
function formatBlogContent(content) {
    if (!content) return '';
    
    // Split content into paragraphs
    const paragraphs = content.split(/\n\n|\r\n\r\n/);
    
    // Process each paragraph
    return paragraphs.map(p => {
        p = p.trim();
        if (!p) return '';
        
        // Check if paragraph is a heading
        if (p.startsWith('# ')) {
            return `<h2>${p.substring(2)}</h2>`;
        } else if (p.startsWith('## ')) {
            return `<h3>${p.substring(3)}</h3>`;
        } else if (p.startsWith('### ')) {
            return `<h4>${p.substring(4)}</h4>`;
        }
        
        // Check if paragraph is a list
        if (p.includes('\n- ')) {
            const listItems = p.split('\n- ');
            const intro = listItems.shift();
            return `${intro ? `<p>${intro}</p>` : ''}<ul>${listItems.map(item => `<li>${item}</li>`).join('')}</ul>`;
        }
        
        // Regular paragraph
        return `<p>${p}</p>`;
    }).join('');
}

// Debounce function for search input
function debounce(func, delay) {
    let timeoutId;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}
