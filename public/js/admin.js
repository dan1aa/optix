document.addEventListener("DOMContentLoaded", () => {
    const create = document.querySelector('.create-button');

    if (!create) {
        console.error("Кнопка '.create-button' не знайдена!");
        return;
    }
    
    
    document.body.onclick = function(e) {
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


fetch('/en/admin/users')
.then(res => res.json())
.then(users => {

    let layout = ``
    users.forEach(user => {
        console.log(user)
        layout += `<div class="row" data-id="${user._id}">
            <div><input placeholder="Тг" value=""/></div>
            <div>${user.name} ${user.surname}</div>
            <div>${user.email}</div>
            <div>${user.pass}</div>
            <div><input class="demo-input" placeholder="Депозит" type="number" value="${user.demoBalance}"/><button class="update-demo">Обновить</button></div>
            <div><input class="real-input" placeholder="Депозит" type="number" value="${user.realBalance}"/><button class="update-real">Обновить</button></div>
           <div style="overflow-y: scroll; flex-direction: column !important; padding: 20px 0 20px 0;">
                ${user.ips.map(ip => `<div>${ip}</div>`).join('')}
            </div>

            <div><input type="checkbox"/></div>
        </div>`
    })

    document.querySelector('.container').innerHTML += layout;

    const updateDemos = document.querySelectorAll('.update-demo');
    Array.from(updateDemos).forEach(upd => {
        upd.onclick = function() {
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
        upd.onclick = function() {
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