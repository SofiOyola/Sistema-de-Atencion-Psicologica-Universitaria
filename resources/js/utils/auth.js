import axios from 'axios';

export const AUTH_STORAGE_KEYS = [
    'sap_token',
    'sap_role',
    'studentId',
    'psychologistId',
    'adminId',
];

export const clearAuthSession = () => {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    delete axios.defaults.headers.common.Authorization;
};

export const logout = async () => {
    const token = localStorage.getItem('sap_token');

    try {
        if (token) {
            await axios.post('/api/auth/logout', null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
        }
    } catch {
        // The local session must still be cleared if the token is already invalid.
    } finally {
        clearAuthSession();
        window.location.assign('/login');
    }
};

export const isLogoutButton = (element) => {
    const button = element.closest('button');

    if (!button) {
        return false;
    }

    const text = button.textContent?.toLowerCase() || '';
    const isLogoutText = text.includes('cerrar ses') || text.includes('logout');

    return isLogoutText && (
        button.classList.contains('sd-nav-logout') ||
        button.classList.contains('pd-nav-logout') ||
        button.classList.contains('ad-nav-logout') ||
        button.classList.contains('as-nav-logout') ||
        button.classList.contains('ap-nav-logout') ||
        button.classList.contains('sd-user-menu-item--danger') ||
        button.classList.contains('pd-user-menu-item--danger') ||
        button.classList.contains('ad-user-menu-item--danger') ||
        button.classList.contains('as-user-menu-item--danger') ||
        button.classList.contains('ap-user-menu-item--danger') ||
        button.classList.contains('pd-user-menu-item')
    );
};
