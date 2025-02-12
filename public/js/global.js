
window.krakenWS.setPair("ETH/USD");
window.krakenWS.onTradeUpdate((candle) => {
    console.log("🔥 Оновлення свічки:", candle);
});

fetch('/en/me')
    .then(res => res.json())
    .then(user => {
        const personal = document.querySelector('#personal');
        const headers = document.querySelectorAll('#header');
        const submenu = document.querySelector('#submenu');
        if (!user.message) {
            const accountType = localStorage.getItem('account_type');
            if (submenu) submenu.style.display = 'block'
            if (headers[1]) headers[1].style.display = 'block'
            const username = document.querySelector('.username');
            const email = document.querySelector('.email');
            const balance = document.querySelector('.balance');
            username.textContent = `${user.name} ${user.surname}`
            email.textContent = user.email;
            balance.textContent = `$${accountType == 'demo' ? user.demoBalance : user.realBalance}`;
            const balanceModes = document.querySelectorAll('li.modes');
            
            balanceModes.forEach(mode => {
                mode.classList.remove('active');
                if (accountType == 'demo') balanceModes[0].classList.add('active')
                    else balanceModes[1].classList.add('active')
            })
            
            const notActiveBalanceMode = document.querySelector('li.modes:not(.active)');
            notActiveBalanceMode.onclick = function () {
                const val = this.querySelector('a').textContent.trim();
                localStorage.setItem('account_type', val == 'Real' ? 'real' : 'demo')
                window.location.reload();
            }
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
                    window.location.reload();
                }
            })
    }
}