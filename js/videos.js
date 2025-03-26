// Video-related functions

// Function to initialize videos page
function initVideosPage(params = {}) {
    const videosContainer = document.querySelector('.video-container');
    
    // Check if we need to show a specific video
    if (params.id) {
        // Show single video
        fetchAndDisplaySingleVideo(params.id, videosContainer);
    } else {
        // Show video listing
        initVideoListing(videosContainer);
    }
}

// Function to initialize video listing
function initVideoListing(container) {
    // Set up video listing container
    container.innerHTML = `
        <h2 class="section-title">Our Videos</h2>
        <div class="video-filters">
            <div class="search-box">
                <input type="text" id="video-search" placeholder="Search videos...">
                <i class="fas fa-search"></i>
            </div>
            <select class="filter-dropdown" id="video-category-filter">
                <option value="">All Categories</option>
                <option value="tutorial">Tutorials</option>
                <option value="entertainment">Entertainment</option>
                <option value="education">Education</option>
                <option value="technology">Technology</option>
                <option value="lifestyle">Lifestyle</option>
            </select>
        </div>
        <div class="video-grid" id="video-grid">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> Loading videos...
            </div>
        </div>
    `;
    
    // Add event listeners for search and filter
    const searchInput = document.getElementById('video-search');
    const categoryFilter = document.getElementById('video-category-filter');
    
    searchInput.addEventListener('input', debounce(() => {
        filterVideos(searchInput.value, categoryFilter.value);
    }, 300));
    
    categoryFilter.addEventListener('change', () => {
        filterVideos(searchInput.value, categoryFilter.value);
    });
    
    // Load videos initially
    loadVideos();
}

// Function to load videos from Firestore
function loadVideos() {
    const videoGrid = document.getElementById('video-grid');
    
    // Only get published videos
    videosCollection.where('published', '==', true)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                videoGrid.innerHTML = `
                    <div class="no-content">
                        <i class="fas fa-video"></i>
                        <p>No videos yet. Check back soon!</p>
                    </div>
                `;
                return;
            }
            
            let videosHTML = '';
            querySnapshot.forEach((doc) => {
                const video = doc.data();
                const videoId = doc.id;
                const date = formatDate(video.createdAt);
                
                videosHTML += `
                    <div class="video-card" data-id="${videoId}" data-category="${video.category || ''}" data-tags="${video.tags ? video.tags.join(' ').toLowerCase() : ''}">
                        <div class="video-thumbnail">
                            ${getVideoThumbnail(video.videoType, video.videoId)}
                            <i class="fas fa-play-circle"></i>
                        </div>
                        <div class="video-info">
                            <h3>${video.title}</h3>
                            <div class="video-meta">
                                <span><i class="fas fa-user"></i> ${video.author ? video.author.name : 'Admin'}</span>
                                <span><i class="fas fa-calendar-alt"></i> ${date}</span>
                            </div>
                            <div class="video-actions">
                                <button class="btn btn-primary watch-video-btn" data-id="${videoId}">Watch Video</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            videoGrid.innerHTML = videosHTML;
            
            // Add event listeners for watch video buttons
            const watchButtons = document.querySelectorAll('.watch-video-btn');
            watchButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const videoId = button.getAttribute('data-id');
                    loadPage('videos', { id: videoId });
                });
            });
            
            // Add event listeners for video thumbnails
            const videoThumbnails = document.querySelectorAll('.video-thumbnail');
            videoThumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', () => {
                    const videoId = thumbnail.parentElement.getAttribute('data-id');
                    loadPage('videos', { id: videoId });
                });
            });
        })
        .catch((error) => {
            console.error("Error loading videos:", error);
            videoGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading videos: ${error.message}</p>
                </div>
            `;
        });
}

// Function to get video thumbnail HTML
function getVideoThumbnail(videoType, videoId) {
    // Use CSS background with a play button overlay instead of an actual image
    if (videoType === 'youtube') {
        return `<div class="video-thumbnail-bg" style="background-color: #202020;"></div>`;
    } else if (videoType === 'vimeo') {
        return `<div class="video-thumbnail-bg" style="background-color: #1ab7ea;"></div>`;
    } else {
        return `<div class="video-thumbnail-bg" style="background-color: #ddd;"></div>`;
    }
}

// Function to filter videos based on search term and category
function filterVideos(searchTerm, category) {
    const videoCards = document.querySelectorAll('.video-card');
    const searchTermLower = searchTerm.toLowerCase();
    
    videoCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const cardCategory = card.getAttribute('data-category').toLowerCase();
        const tags = card.getAttribute('data-tags') || '';
        
        // Check if card matches search term
        const matchesSearch = searchTerm === '' || 
            title.includes(searchTermLower) || 
            tags.includes(searchTermLower);
        
        // Check if card matches category
        const matchesCategory = category === '' || cardCategory === category.toLowerCase();
        
        // Show or hide card based on filters
        if (matchesSearch && matchesCategory) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Check if any cards are visible
    const visibleCards = document.querySelectorAll('.video-card[style="display: block"]');
    if (visibleCards.length === 0) {
        const videoGrid = document.getElementById('video-grid');
        
        // If no cards match, show message
        if (!document.querySelector('.no-results')) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No videos found matching your criteria.</p>
            `;
            videoGrid.appendChild(noResultsDiv);
        }
    } else {
        // Remove no results message if it exists
        const noResults = document.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
    }
}

// Function to fetch and display a single video
function fetchAndDisplaySingleVideo(videoId, container) {
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading video...
        </div>
    `;
    
    videosCollection.doc(videoId).get()
        .then((doc) => {
            if (doc.exists) {
                const video = doc.data();
                const date = formatDate(video.createdAt);
                
                container.innerHTML = `
                    <div class="video-player-container">
                        <button class="btn btn-secondary back-btn">
                            <i class="fas fa-arrow-left"></i> Back to All Videos
                        </button>
                        <div class="video-player">
                            ${getEmbedCode(video.videoType, video.videoId)}
                        </div>
                        <div class="video-details">
                            <h2>${video.title}</h2>
                            <div class="video-meta">
                                <span><i class="fas fa-user"></i> ${video.author ? video.author.name : 'Admin'}</span>
                                <span><i class="fas fa-calendar-alt"></i> ${date}</span>
                                ${video.category ? `<span><i class="fas fa-folder"></i> ${video.category}</span>` : ''}
                                ${video.tags && video.tags.length > 0 ? 
                                    `<span><i class="fas fa-tags"></i> ${video.tags.join(', ')}</span>` : ''}
                            </div>
                            <div class="video-description">
                                ${formatVideoDescription(video.description)}
                            </div>
                            <div class="video-actions-large">
                                <button class="btn btn-primary back-btn">
                                    <i class="fas fa-arrow-left"></i> Back to All Videos
                                </button>
                                <div class="social-share">
                                    <button class="btn share-facebook"><i class="fab fa-facebook-f"></i> Share</button>
                                    <button class="btn share-twitter"><i class="fab fa-twitter"></i> Tweet</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add event listeners for back buttons
                const backButtons = document.querySelectorAll('.back-btn');
                backButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        loadPage('videos');
                    });
                });
                
                // Add event listeners for share buttons
                const shareButtons = container.querySelectorAll('.social-share button');
                shareButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        // Get the URL of the current video
                        const videoUrl = window.location.href;
                        const videoTitle = video.title;
                        
                        if (button.classList.contains('share-facebook')) {
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`, '_blank');
                        } else if (button.classList.contains('share-twitter')) {
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(videoTitle)}&url=${encodeURIComponent(videoUrl)}`, '_blank');
                        }
                    });
                });
            } else {
                // Video not found
                container.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Video not found! The video may have been removed or is not available.</p>
                        <button class="btn btn-primary back-btn">Back to All Videos</button>
                    </div>
                `;
                
                // Add event listener for back button
                container.querySelector('.back-btn').addEventListener('click', () => {
                    loadPage('videos');
                });
            }
        })
        .catch((error) => {
            console.error("Error fetching video:", error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading video: ${error.message}</p>
                    <button class="btn btn-primary back-btn">Back to All Videos</button>
                </div>
            `;
            
            // Add event listener for back button
            container.querySelector('.back-btn').addEventListener('click', () => {
                loadPage('videos');
            });
        });
}

// Function to get embed code for video
function getEmbedCode(videoType, videoId) {
    if (videoType === 'youtube') {
        return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else if (videoType === 'vimeo') {
        return `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    } else {
        return `<div class="video-error">Unsupported video type</div>`;
    }
}

// Function to format video description with proper HTML
function formatVideoDescription(description) {
    if (!description) return '';
    
    // Split description into paragraphs
    const paragraphs = description.split(/\n\n|\r\n\r\n/);
    
    // Process each paragraph
    return paragraphs.map(p => {
        p = p.trim();
        if (!p) return '';
        
        // Regular paragraph (more advanced formatting can be added if needed)
        return `<p>${p}</p>`;
    }).join('');
}
