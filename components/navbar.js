// Shared Navbar Component
// Include this in all pages: <script src="components/navbar.js"></script>

function createNavbar(options = {}) {
    const { theme = 'default', activePage = '' } = options;
    const useRootPaths = theme === 'default';
    const isFranchise = theme === 'franchise';

    return `
    <nav class="navbar">
        <div class="container">
            <div class="nav-wrapper">
                <div class="logo">
                    <a href="${useRootPaths ? 'index.html' : '../index.html'}" class="logo-main">devret link</a>
                    <span class="logo-divider">|</span>
                    <div class="logo-channel">
                        <a href="${useRootPaths ? 'franchise.html' : '../franchise.html'}" class="logo-sub logo-sub-desktop">fr.</a>
                        <button type="button" class="logo-sub logo-sub-mobile-trigger" aria-expanded="false" aria-haspopup="true" aria-label="Franchise veya Emlak seçin">fr.</button>
                        <div class="logo-channel-dropdown" role="menu">
                            <a href="${useRootPaths ? 'franchise.html' : '../franchise.html'}" class="logo-channel-link" role="menuitem">fr.</a>
                            <a href="${useRootPaths ? 'emlak.html' : '../emlak.html'}" class="logo-channel-link" role="menuitem">Emlak</a>
                        </div>
                    </div>
                </div>
                
                <ul class="nav-menu">
                    ${isFranchise ? `
                        <li><a href="franchise.html" class="nav-link ${activePage === 'markalar' ? 'active' : ''}">Markalar İçin</a></li>
                        <li><a href="franchise.html" class="nav-link ${activePage === 'isletmeler' ? 'active' : ''}">İşletmeler İçin</a></li>
                    ` : `
                        <li><a href="listings.html" class="nav-link ${activePage === 'devral' ? 'active' : ''}">İşletme Devral</a></li>
                        <li><a href="add-listing.html" class="nav-link ${activePage === 'devret' ? 'active' : ''}">İşletmeni Devret</a></li>
                        <li><a href="emlak.html" class="nav-link ${activePage === 'emlak' ? 'active' : ''}">Emlak</a></li>
                        <li id="panelLink" style="display: none;"><a href="panel/" class="nav-link ${activePage === 'panel' ? 'active' : ''}">Panel</a></li>
                    `}
                    <li><a href="blog.html" class="nav-link ${activePage === 'blog' ? 'active' : ''}">Blog</a></li>
                    ${!isFranchise ? `<li><a href="add-listing.html" class="create-listing-mobile" style="display:none;">Ücretsiz İlan Oluştur</a></li>` : ''}
                </ul>
                
                <div class="nav-actions">
                    <button class="nav-icon-btn search-btn" onclick="toggleSearch()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>
                    
                    <div class="auth-menu" id="authMenu">
                        <button class="auth-icon-btn" id="authBtn" onclick="toggleAuthDropdown()">
                            <svg id="authIconGuest" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span id="authIconUser" class="user-initials" style="display:none;">AE</span>
                        </button>
                        <div class="auth-dropdown" id="authDropdown">
                            <!-- Guest Menu -->
                            <div id="guestMenu">
                                <a href="login.html" class="dropdown-item">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                        <polyline points="10 17 15 12 10 7"></polyline>
                                        <line x1="15" y1="12" x2="3" y2="12"></line>
                                    </svg>
                                    Giriş Yap
                                </a>
                                <a href="login.html?register=true" class="dropdown-item">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="8.5" cy="7" r="4"></circle>
                                        <line x1="20" y1="8" x2="20" y2="14"></line>
                                        <line x1="23" y1="11" x2="17" y2="11"></line>
                                    </svg>
                                    Üye Ol
                                </a>
                            </div>
                            <!-- User Menu -->
                            <div id="userMenu" style="display:none;">
                                <div class="dropdown-header">
                                    <div class="dropdown-avatar" id="dropdownAvatar">AE</div>
                                    <span class="dropdown-name" id="dropdownName">Kullanıcı</span>
                                </div>
                                <a href="profile.html" class="dropdown-item">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    Profilim
                                </a>
                                <a href="panel/" class="dropdown-item">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="14" width="7" height="7"></rect>
                                        <rect x="3" y="14" width="7" height="7"></rect>
                                    </svg>
                                    İlanlarım
                                </a>
                                <div class="dropdown-divider"></div>
                                <button onclick="logoutUser()" class="dropdown-item logout">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Çıkış Yap
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    ${isFranchise ? `
                        <div class="lang-selector">
                            <span class="flag">🇹🇷</span>
                            <span>TR</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                        <a href="login.html?register=true" class="btn btn-primary-nav" id="ctaBtn">Üye Ol</a>
                    ` : `
                        <a href="add-listing.html" class="btn btn-primary-nav">Ücretsiz İlan Oluştur</a>
                    `}
                </div>
            </div>
        </div>
    </nav>
    `;
}

// Initialize navbar auth state
async function initNavbarAuth() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const guestMenu = document.getElementById('guestMenu');
        const userMenu = document.getElementById('userMenu');
        const authIconGuest = document.getElementById('authIconGuest');
        const authIconUser = document.getElementById('authIconUser');
        const panelLink = document.getElementById('panelLink');
        const ctaBtn = document.getElementById('ctaBtn');
        
        if (user) {
            // User is logged in
            if (guestMenu) guestMenu.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (authIconGuest) authIconGuest.style.display = 'none';
            if (authIconUser) authIconUser.style.display = 'flex';
            if (panelLink) panelLink.style.display = 'block';
            
            // Update CTA button text if on franchise page
            if (ctaBtn) {
                ctaBtn.textContent = 'İlan Oluştur';
                ctaBtn.href = 'add-listing.html';
            }
            
            // Get user profile for display
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
            } catch (e) {
                // Use email fallback
            }
            
            if (authIconUser) authIconUser.textContent = initials;
            const dropdownAvatar = document.getElementById('dropdownAvatar');
            const dropdownName = document.getElementById('dropdownName');
            if (dropdownAvatar) dropdownAvatar.textContent = initials;
            if (dropdownName) dropdownName.textContent = userName;
            
        } else {
            // User is not logged in
            if (guestMenu) guestMenu.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
            if (authIconGuest) authIconGuest.style.display = 'block';
            if (authIconUser) authIconUser.style.display = 'none';
            if (panelLink) panelLink.style.display = 'none';
        }
    } catch (e) {
        console.error('Auth check error:', e);
    }
}

// Toggle dropdown
function toggleAuthDropdown() {
    const dropdown = document.getElementById('authDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.auth-menu')) {
        const dropdown = document.getElementById('authDropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});

// Logout function
async function logoutUser() {
    try {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    } catch (e) {
        console.error('Logout error:', e);
    }
}

// Search toggle (placeholder)
function toggleSearch() {
    alert('Arama özelliği yakında eklenecek');
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for supabase to be available
    if (typeof supabase !== 'undefined') {
        initNavbarAuth();
    } else {
        // Retry after a short delay
        setTimeout(initNavbarAuth, 500);
    }
});
