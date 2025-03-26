// Authentication related functions

// Function to toggle between sign in and sign up forms
function toggleAuthForm(mode) {
    const signInForm = document.getElementById('sign-in-form');
    const signUpForm = document.getElementById('sign-up-form');
    const signInTab = document.getElementById('sign-in-tab');
    const signUpTab = document.getElementById('sign-up-tab');
    
    if (mode === 'signin') {
        signInForm.classList.remove('hidden');
        signUpForm.classList.add('hidden');
        signInTab.classList.add('active');
        signUpTab.classList.remove('active');
    } else {
        signInForm.classList.add('hidden');
        signUpForm.classList.remove('hidden');
        signInTab.classList.remove('active');
        signUpTab.classList.add('active');
    }
}

// Function to sign in a user with email and password
function signInWithEmailPassword(email, password) {
    // Show loading state
    const submitButton = document.querySelector('#sign-in-form button');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in successfully
            const user = userCredential.user;
            console.log('User signed in:', user.email);
            
            // Special check for admin
            if (email === ADMIN_EMAIL) {
                checkAdminStatus(user);
            }
            
            // Redirect to home page
            loadPage('home');
            
            // Show success message
            showAlert('Signed in successfully!', 'success');
        })
        .catch((error) => {
            // Handle errors
            console.error('Sign in error:', error.code, error.message);
            showAlert(`Sign in failed: ${error.message}`, 'error');
        })
        .finally(() => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        });
}

// Function to sign up a new user with email and password
function signUpWithEmailPassword(username, email, password, confirmPassword) {
    // Validate passwords match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('#sign-up-form button');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Signing up...';
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up successfully
            const user = userCredential.user;
            
            // Update user profile with display name
            return user.updateProfile({
                displayName: username
            }).then(() => {
                console.log('User created and profile updated:', user.email);
                
                // Create a user document in Firestore
                return db.collection('users').doc(user.uid).set({
                    username: username,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    isAdmin: email === ADMIN_EMAIL
                });
            });
        })
        .then(() => {
            // Redirect to home page
            loadPage('home');
            
            // Show success message
            showAlert('Account created successfully!', 'success');
        })
        .catch((error) => {
            // Handle errors
            console.error('Sign up error:', error.code, error.message);
            showAlert(`Sign up failed: ${error.message}`, 'error');
        })
        .finally(() => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        });
}

// Function to sign out the current user
function signOut() {
    auth.signOut()
        .then(() => {
            // Sign-out successful
            console.log('User signed out');
            
            // Redirect to home page
            loadPage('home');
            
            // Show success message
            showAlert('Signed out successfully!', 'success');
        })
        .catch((error) => {
            // An error happened
            console.error('Sign out error:', error);
            showAlert(`Sign out failed: ${error.message}`, 'error');
        });
}

// Function to handle forgot password
function forgotPassword(email) {
    if (!email) {
        showAlert('Please enter your email address', 'error');
        return;
    }
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            // Email sent
            showAlert('Password reset email sent. Check your inbox.', 'success');
        })
        .catch((error) => {
            console.error('Forgot password error:', error);
            showAlert(`Failed to send reset email: ${error.message}`, 'error');
        });
}

// Function to initialize auth page
function initAuthPage() {
    // Get the auth container
    const authContainer = document.querySelector('.auth-container');
    
    // Check if auth container exists
    if (!authContainer) {
        console.error('Auth container not found');
        return;
    }
    
    // Check if user is already logged in
    if (isLoggedIn) {
        // Show account info instead of login/signup forms
        authContainer.innerHTML = `
            <div class="user-account">
                <h2>Your Account</h2>
                <div class="account-info">
                    <p><strong>Username:</strong> ${currentUser.displayName || 'Not set'}</p>
                    <p><strong>Email:</strong> ${currentUser.email}</p>
                    <p><strong>Account type:</strong> ${isAdmin ? 'Administrator' : 'Regular user'}</p>
                </div>
                <div class="account-actions">
                    <button class="btn btn-primary" id="update-profile-btn">Update Profile</button>
                    <button class="btn btn-secondary sign-out-btn">Sign Out</button>
                </div>
            </div>
        `;
        
        // Add event listener for sign out button
        const signOutBtnInAccount = authContainer.querySelector('.sign-out-btn');
        if (signOutBtnInAccount) {
            signOutBtnInAccount.addEventListener('click', signOut);
        }
        
        // Add event listener for update profile button (can be implemented later)
        const updateProfileBtn = document.getElementById('update-profile-btn');
        if (updateProfileBtn) {
            updateProfileBtn.addEventListener('click', () => {
                showAlert('Profile update feature coming soon!', 'info');
            });
        }
    } else {
        // Initialize auth forms
        const signInTab = document.getElementById('sign-in-tab');
        const signUpTab = document.getElementById('sign-up-tab');
        const signInForm = document.getElementById('sign-in-form');
        const signUpForm = document.getElementById('sign-up-form');
        const forgotPasswordLink = document.getElementById('forgot-password');
        
        // Add event listeners for auth tabs if they exist
        if (signInTab && signUpTab) {
            signInTab.addEventListener('click', () => toggleAuthForm('signin'));
            signUpTab.addEventListener('click', () => toggleAuthForm('signup'));
        }
        
        // Add event listener for sign in form if it exists
        if (signInForm) {
            signInForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('signin-email').value;
                const password = document.getElementById('signin-password').value;
                signInWithEmailPassword(email, password);
            });
        }
        
        // Add event listener for sign up form if it exists
        if (signUpForm) {
            signUpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('signup-username').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const confirmPassword = document.getElementById('signup-confirm-password').value;
                signUpWithEmailPassword(username, email, password, confirmPassword);
            });
        }
        
        // Add event listener for forgot password link
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                const email = document.getElementById('signin-email').value;
                forgotPassword(email);
            });
        }
    }
}

// Add event listener for the sign out button in the header when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const signOutBtn = document.querySelector('.sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOut);
    }
});
