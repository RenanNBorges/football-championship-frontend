document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api';

    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutButton = document.getElementById('logout-button');

    const teamsContainer = document.getElementById('teams-container');
    const championshipsContainer = document.getElementById('championships-container');

    function getToken() {
        return localStorage.getItem('authToken');
    }

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        };
    }

    async function handleLogin(e) {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        loginError.style.display = 'none';

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Falha no login');
            }
            localStorage.setItem('authToken', data.token);
            init();
        } catch (error) {
            loginError.textContent = error.message;
            loginError.style.display = 'block';
        }
    }

    function handleLogout() {
        localStorage.removeItem('authToken');
        init();
    }

    async function loadDashboardData() {
        try {
            const [teams, championships] = await Promise.all([
                fetch(`${API_URL}/teams`, { headers: getHeaders() }),
                fetch(`${API_URL}/championships`, { headers: getHeaders() })
            ]);

            if (!teams.ok || !championships.ok) {
                throw new Error('Sessão inválida. Faça o login novamente.');
            }

            const teamsData = await teams.json();
            const championshipsData = await championships.json();

            renderTeams(teamsData.teams);
            renderChampionships(championshipsData.championships);

        } catch (error) {
            handleLogout();
        }
    }

    function renderTeams(teams) {
        if (teams.length === 0) {
            teamsContainer.innerHTML = '<p>Nenhuma equipe criada ainda.</p>';
            return;
        }
        const list = document.createElement('ul');
        list.className = 'details-list';
        teams.forEach(team => {
            const item = document.createElement('li');
            item.innerHTML = `<span>${team.name}</span><span>${team.country}</span>`;
            list.appendChild(item);
        });
        teamsContainer.innerHTML = '';
        teamsContainer.appendChild(list);
    }

    function renderChampionships(championships) {
        if (championships.length === 0) {
            championshipsContainer.innerHTML = '<p>Nenhum campeonato criado ainda.</p>';
            return;
        }
        const list = document.createElement('ul');
        list.className = 'details-list';
        championships.forEach(champ => {
            const item = document.createElement('li');
            item.innerHTML = `<span>${champ.name}</span><span>${champ._count.championshipTeams} / ${champ.maxTeams}</span>`;
            list.appendChild(item);
        });
        championshipsContainer.innerHTML = '';
        championshipsContainer.appendChild(list);
    }

    function init() {
        const token = getToken();
        if (token) {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            logoutButton.style.display = 'inline-flex';
            loadDashboardData();
        } else {
            loginSection.style.display = 'block';
            dashboardSection.style.display = 'none';
            logoutButton.style.display = 'none';
        }
    }

    loginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);

    init();
});
