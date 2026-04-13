import { checkAuth, getProfile, logout } from "./auth.js";
import { initTabs } from "./tabs.js";

document.addEventListener("DOMContentLoaded", async () => {
    let timeout;
    let isLoggingOut = false;
    const INACTIVITY = 15 * 60 * 1000;

    const user = await checkAuth();
    if (!user) return;

    const profile = await getProfile();

    document.getElementById("userAvatar").innerHTML = profile.nome.substring(0,2);
    document.getElementById("userName").innerText = profile.nome;
    document.getElementById("userRole").innerText = profile.role;

    initTabs();

    const dashboardModule = await import("./modules/dashboard.js");
    dashboardModule.initDashboard();

    document.getElementById("logoutBtn").addEventListener("click", safeLogout);

    resetTimer();

    ['click', 'mousemove', 'keydown', 'scroll'].forEach(event => {
        window.addEventListener(event, resetTimer);
    });
    
    function safeLogout() {
        if (isLoggingOut) return;
        isLoggingOut = true;
        logout();
    }

    function resetTimer() {
        clearTimeout(timeout);
        timeout = setTimeout(safeLogout, INACTIVITY);
    }
});