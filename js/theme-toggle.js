document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        body.classList.add(savedTheme);
    } else if (systemPrefersDark) {
        body.classList.add('dark-theme');
    }

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light-theme');
        } else if (body.classList.contains('light-theme')) {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        } else {
            // No class yet, so we toggle based on current state (usually from system)
            const isDark = getComputedStyle(body).backgroundColor === 'rgb(18, 18, 18)';
            if (isDark) {
                body.classList.add('light-theme');
                localStorage.setItem('theme', 'light-theme');
            } else {
                body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark-theme');
            }
        }
    });
});
