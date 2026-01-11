// Shared Auth Functions for all pages

// Quick auth check from localStorage (instant UI update)
function quickAuthCheck() {
    const cached = localStorage.getItem('devredin_user');
    if (cached) {
        try {
            const userData = JSON.parse(cached);
            applyAuthUI(true, userData.initials, userData.name);
        } catch (e) {}
    }
}

// Apply auth UI
function applyAuthUI(isLoggedIn, initials = 'AE', userName = 'Kullanıcı') {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const panelLink = document.getElementById('panelLink');
    const authIconGuest = document.getElementById('authIconGuest');
    const authIconUser = document.getElementById('authIconUser');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    const dropdownName = document.getElementById('dropdownName');
    
    if (isLoggedIn) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (panelLink) panelLink.style.display = 'block';
        if (authIconGuest) authIconGuest.style.display = 'none';
        if (authIconUser) authIconUser.style.display = 'flex';
        if (authIconUser) authIconUser.textContent = initials;
        if (dropdownAvatar) dropdownAvatar.textContent = initials;
        if (dropdownName) dropdownName.textContent = userName;
    } else {
        if (authButtons) authButtons.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
        if (panelLink) panelLink.style.display = 'none';
        if (authIconGuest) authIconGuest.style.display = 'block';
        if (authIconUser) authIconUser.style.display = 'none';
    }
}

// Check auth (with cache)
async function checkAuth() {
    // First, quick check from cache
    quickAuthCheck();
    
    // Then verify with Supabase
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            let userName = user.email.split('@')[0];
            let initials = userName.slice(0, 2).toUpperCase();
            
            try {
                const { data: profile } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                
                if (profile?.full_name) {
                    userName = profile.full_name;
                    initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                }
            } catch (e) {}
            
            // Cache user data
            localStorage.setItem('devredin_user', JSON.stringify({ initials, name: userName }));
            applyAuthUI(true, initials, userName);
        } else {
            // Clear cache
            localStorage.removeItem('devredin_user');
            applyAuthUI(false);
        }
    } catch (e) {
        console.error('Auth check error:', e);
    }
}

// Toggle auth dropdown
function toggleAuthDropdown() {
    const dropdown = document.getElementById('authDropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

// Logout
async function logout() {
    localStorage.removeItem('devredin_user');
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.auth-menu')) {
        const dropdown = document.getElementById('authDropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});

// Run quick check immediately when script loads
quickAuthCheck();

console.log('✅ Auth.js loaded');
