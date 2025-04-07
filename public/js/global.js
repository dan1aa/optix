document.addEventListener('DOMContentLoaded', function() {
    const elements = Array.from(document.querySelectorAll('p'));
    const target = elements.find(el => el.textContent.includes('support@platformail.com')).querySelector('a');
    target.innerHTML = 'optigates@outlook.com'
})


fetch('/en/me')
    .then(res => res.json())
    .then(user => {
        const personal = document.querySelector('#personal');
        const headers = document.querySelectorAll('#header');
        const submenu = document.querySelector('#submenu');
        if (!user.message) {
            localStorage.setItem('account_type', 'real')
            const accountType = localStorage.getItem('account_type');
            if (submenu) submenu.style.display = 'block'
            if (headers[1]) headers[1].style.display = 'block'
            const username = document.querySelector('.username');
            const email = document.querySelector('.email');
            const balance = document.querySelector('.balance');
            username.textContent = `${user.name} ${user.surname}`
            email.textContent = user.email;
            const balanceModes = document.querySelectorAll('li.modes')
            
            function updateBalance() {
    const accountType = localStorage.getItem('account_type');
    balance.textContent = `$${accountType === 'demo' ? +user.demoBalance.toFixed(2) : +user.realBalance.toFixed(2)}`;

    balanceModes.forEach(mode => {
        mode.classList.remove('active');
        const modeText = mode.querySelector('a').textContent.trim().toLowerCase();
        if (accountType === modeText) {
            mode.classList.add('active');
        }
    });
}
updateBalance();
balanceModes.forEach(mode => {
    mode.onclick = function (event) {
        event.preventDefault(); // Запобігає перезавантаженню
        const val = this.querySelector('a').textContent.trim();
        localStorage.setItem('account_type', val === 'Real' ? 'real' : 'demo');
        updateBalance();
    };
});
        } else {
            if (personal) personal.style.display = 'none'
            if (headers[0]) headers[0].style.display = 'block'
        }
    })

const loginModal = document.querySelector('#loginModal');
const lang = window.location.pathname.split('/')[1];


if (loginModal) {
    const emailInput = loginModal.querySelector('input[name="email"]')
    const passwordInput = loginModal.querySelector('input[name="password"]')
    const loginButton = loginModal.querySelector('input[type="submit"]')
    const error = loginModal.querySelector('.error')

    loginButton.onclick = function (e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!password || !email) return;

        fetch('/en/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            }),
            credentials: 'include'
        })
            .then(res => res.json())
            .then(response => {
                if (response.notFound) {
                    error.textContent = lang == 'en' ? 'User not found' : 'Пользователь не найден';
                } else if (response.invalidPassword) {
                    error.textContent = lang == 'en' ? 'Invalid password' : 'Неверный пароль';
                } else {
                    localStorage.setItem('account_type', 'demo');
                    localStorage.setItem('token', response.token)
                    window.location.reload();
                }
            })
    }
}