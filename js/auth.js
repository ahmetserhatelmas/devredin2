// Shared Auth Functions for all pages

const DEVRETLINK_USER_STORAGE_KEY = 'devretlink_user';
/** Eski siteden kalan localStorage anahtarı (otomatik taşınır; taşıma tamamlandıktan sonra kaldırılabilir). */
const LEGACY_USER_STORAGE_KEY = 'devredin_user';

function migrateLegacyUserStorageKey() {
    try {
        const legacy = localStorage.getItem(LEGACY_USER_STORAGE_KEY);
        if (!legacy) return;
        if (!localStorage.getItem(DEVRETLINK_USER_STORAGE_KEY)) {
            localStorage.setItem(DEVRETLINK_USER_STORAGE_KEY, legacy);
        }
        localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
    } catch (e) {}
}

// Quick auth check from localStorage (instant UI update)
function quickAuthCheck() {
    migrateLegacyUserStorageKey();
    const cached = localStorage.getItem(DEVRETLINK_USER_STORAGE_KEY);
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
    
    document.querySelectorAll('.nav-auth-link').forEach((el) => {
        if (isLoggedIn) {
            el.style.display = 'none';
        } else {
            el.style.removeProperty('display');
        }
    });

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
    
    // Önce getSession: yerel oturum (signIn sonrası yönlendirmede anında gelir).
    // getUser() sunucuya gider; ilk yüklemede gecikince / hata verince navbar misafir kalabiliyordu.
    try {
        const { data: { session } } = await supabase.auth.getSession();
        let user = session && session.user ? session.user : null;

        if (!user) {
            const { data: { user: fetched } } = await supabase.auth.getUser();
            user = fetched;
        }

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
            localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
            localStorage.setItem(DEVRETLINK_USER_STORAGE_KEY, JSON.stringify({ initials, name: userName }));
            applyAuthUI(true, initials, userName);
        } else {
            // Clear cache
            localStorage.removeItem(DEVRETLINK_USER_STORAGE_KEY);
            localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
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
    localStorage.removeItem(DEVRETLINK_USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

// Close auth dropdown on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.auth-menu')) {
        const dropdown = document.getElementById('authDropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});

if (typeof window !== 'undefined') {
    window.devretlinkMigrateUserStorageKey = migrateLegacyUserStorageKey;
}

// Run quick check immediately when script loads
quickAuthCheck();

console.log('✅ Auth.js loaded');
