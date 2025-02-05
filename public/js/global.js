
fetch('/en/me')
    .then(res => res.json())
    .then(response => {
        console.log(response)
        const personal = document.querySelector('#personal');
        const headers = document.querySelectorAll('#header');
        const submenu = document.querySelector('#submenu');
        console.log(headers)
        if (response.user) {
            if (submenu) submenu.style.display = 'block'
            if (headers[1]) headers[1].style.display = 'block'
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
                    window.location.reload();
                }
            })
    }
}