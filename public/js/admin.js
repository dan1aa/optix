document.addEventListener("DOMContentLoaded", () => {
    const create = document.querySelector('.create-button');

    fetch('/en/admin-key')
        .then(res => res.json())
        .then(response => {
            const { key } = response;

            fetch('/en/me')
                .then(res => res.json())
                .then(user => {
                    if (localStorage.getItem('admin') == key) {
                        document.querySelector('.container').style.display = 'block'
                        document.querySelector('.pass_wrapper').style.display = 'none'
                    }

                    document.querySelector('.admin_login').onclick = function () {
                        const password = document.querySelector('.admin_password').value.trim();

                        fetch('/en/admin-login', {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                password
                            })
                        })
                            .then(res => res.json())
                            .then(response => {
                                if (response.success) {
                                    localStorage.setItem('admin', key);
                                    window.location.reload()
                                } else {
                                    alert("Пароль не подходит")
                                }
                            })
                    }
                })
        })

    if (!create) {
        console.error("Кнопка '.create-button' не знайдена!");
        return;
    }


    document.body.onclick = function (e) {
        const nameInput = document.querySelector('.create-name');
        const surnameInput = document.querySelector('.create-surname');
        const passwordInput = document.querySelector('.create-password');
        const demoInput = document.querySelector('.create-demo');
        const realInput = document.querySelector('.create-real');
        const emailInput = document.querySelector('.create-email');

        if (e.target.classList.contains('create-button')) {
            const name = nameInput.value.trim();
            const surname = surnameInput.value.trim();
            const password = passwordInput.value.trim();
            const demo = demoInput.value.trim();
            const real = realInput.value.trim();
            const email = emailInput.value.trim();

            if (!name || !surname || !password || !demo || !real || !email) {
                alert("Заполните все поля");
                return;
            }

            fetch('/en/create-user-admin', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, surname, password, demo, real, email })
            })
                .then(res => res.json())
                .then(response => {
                    alert(response.message);
                });
        }
    };
});
const isOurs = window.location.pathname === '/en/admin' ? 'false' : 'true';


fetch(`/en/admin/users?isOurs=${isOurs}`)
    .then(res => res.json())
    .then(users => {

        let layout = ``
        users.forEach(user => {
            layout += `<div class="row" data-id="${user._id}">
    <div>
        <input placeholder="Тг" value="${user.telegram ? user.telegram : ''}"/>
        <button class="tg-change">Изменить</button>
    </div>
    <div>${user.name} ${user.surname}</div>
    <div class="email-div">${user.email}</div>
    <div>
        <input class="password-input" placeholder="Пароль" type="text" value="${user.pass}"/>
        <button class="update-password">Обновить</button>
    </div>
    <div>
        <input class="demo-input" placeholder="Депозит" type="number" value="${user.demoBalance}"/>
        <button class="update-demo">Обновить</button>
    </div>
    <div>
        <input class="real-input" placeholder="Депозит" type="number" value="${user.realBalance}"/>
        <button class="update-real">Обновить</button>
    </div>
    <div style="overflow-y: scroll; flex-direction: column !important; padding: 40px 0 20px 0;">
        ${user.ips.map(ip => `<span>${ip}</span>`).join('')}
    </div>
      <div class="disabled-div">
        <input class="disabled" type="checkbox" ${user.disabled ? 'checked' : ''}/>
    </div>
     <div class="ourselves-div">
        <input class="is-our" type="checkbox" ${user.isOur ? 'checked' : ''}/>
    </div>
</div>`;

        })

        document.querySelector('.container').innerHTML += layout;

        document.querySelectorAll('.tg-change').forEach(b => {
            b.onclick = function () {
                fetch('/en/update-tg', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: this.parentElement.parentElement.getAttribute('data-id'),
                        tg: this.previousElementSibling.value.trim()
                    })

                }).then(() => {
                    window.location.reload();
                })
            }
        })

        const updatePassword = document.querySelectorAll('.update-password');
        Array.from(updatePassword).forEach(upd => {
            upd.onclick = function () {
                fetch('/en/update-password', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        new_password: this.parentElement.querySelector('.password-input').value.trim(),
                        id: this.parentElement.parentElement.getAttribute('data-id').trim()
                    })
                })
            }
        })

        document.querySelectorAll('.tg-change').forEach(b => {
            b.onclick = function () {
                fetch('/en/update-tg', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: this.parentElement.parentElement.getAttribute('data-id'),
                        tg: this.previousElementSibling.value.trim()
                    })

                }).then(() => {
                    window.location.reload();
                })
            }
        })

        document.querySelectorAll('.disabled').forEach(b => {
            b.onchange = function () {
                fetch('/en/update-disable', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: this.parentElement.parentElement.getAttribute('data-id'),
                        status: this.checked
                    })

                }).then(() => {
                    window.location.reload();
                })
            }
        })

        document.querySelectorAll('.is-our').forEach(b => {
            b.onchange = function () {
                fetch('/en/update-our', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: this.parentElement.parentElement.getAttribute('data-id'),
                        status: this.checked
                    })

                }).then(() => {
                    window.location.reload();
                })
            }
        })

        const updateDemos = document.querySelectorAll('.update-demo');
        Array.from(updateDemos).forEach(upd => {
            upd.onclick = function () {
                fetch('/en/update-demo', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: this.parentElement.querySelector('.demo-input').value.trim(),
                        id: this.parentElement.parentElement.getAttribute('data-id').trim()
                    })
                })
            }
        })

        const updateReal = document.querySelectorAll('.update-real');
        Array.from(updateReal).forEach(upd => {
            upd.onclick = function () {
                fetch('/en/update-real', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: this.parentElement.querySelector('.real-input').value.trim(),
                        id: this.parentElement.parentElement.getAttribute('data-id').trim()
                    })
                })
            }
        })
    })