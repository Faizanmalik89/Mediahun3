// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC75h-GUxA2c2g9ny_W-f5FVmxP9WBCc9w",
    authDomain: "mediahub-cd301.firebaseapp.com",
    projectId: "mediahub-cd301",
    storageBucket: "mediahub-cd301.firebasestorage.app",
    messagingSenderId: "831120172632",
    appId: "1:831120172632:web:13bab08cb27a8e11568c2d",
    measurementId: "G-N5G5MFJZQJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Analytics
firebase.analytics();

// Firebase services
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Set persistence to local
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => {
        console.error("Firebase persistence error:", error.message);
    });

// Global variables to track authentication status and current user
let isLoggedIn = false;
let currentUser = null;
let isAdmin = false;

// Admin email (hardcoded as per requirement)
const ADMIN_EMAIL = 'faizanmaliks888@gmail.com';

// Function to check if a user is an admin
function checkAdminStatus(user) {
    if (user && user.email === ADMIN_EMAIL) {
        isAdmin = true;
        document.querySelector('.admin-link').classList.remove('hidden');
    } else {
        isAdmin = false;
        document.querySelector('.admin-link').classList.add('hidden');
    }
    return isAdmin;
}

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        isLoggedIn = true;
        currentUser = user;
        
        // Update UI for logged in user
        document.querySelector('.user-name').textContent = user.displayName || user.email;
        document.querySelector('.sign-out-btn').classList.remove('hidden');
        
        // Update navigation
        const authLink = document.querySelector('.nav-link[data-page="auth"]');
        authLink.textContent = 'Account';
        
        // Check if user is admin
        checkAdminStatus(user);
        
        console.log('User is logged in:', user.email);
    } else {
        // User is signed out
        isLoggedIn = false;
        currentUser = null;
        isAdmin = false;
        
        // Update UI for logged out user
        document.querySelector('.user-name').textContent = '';
        document.querySelector('.sign-out-btn').classList.add('hidden');
        document.querySelector('.admin-link').classList.add('hidden');
        
        // Update navigation
        const authLink = document.querySelector('.nav-link[data-page="auth"]');
        authLink.textContent = 'Sign In';
        
        console.log('User is logged out');
    }
});

// Initialize Firestore collections for blogs and videos
const blogsCollection = db.collection('blogs');
const videosCollection = db.collection('videos');

// Function to format dates
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown Date';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to create a unique ID for new content
function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Function to validate content
function validateContent(type, data) {
    if (!data.title || data.title.trim() === '') {
        return { valid: false, message: 'Title is required' };
    }
    
    if (!data.content || data.content.trim() === '') {
        return { valid: false, message: 'Content is required' };
    }
    
    if (type === 'video' && (!data.videoUrl || data.videoUrl.trim() === '')) {
        return { valid: false, message: 'Video URL is required' };
    }
    
    return { valid: true };
}
