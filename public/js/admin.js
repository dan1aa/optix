fetch('/en/admin/users')
.then(res => res.json())
.then(users => {
    let layout = ``
    users.forEach(user => {
        console.log(user)
        layout += `<div class="row">
            <div>${user.name} ${user.surname}</div>
            <div>${user.email}</div>
            <div>${user.pass}</div>
            <div><input placeholder="Депозит" value="${user.demoBalance}"/></div>
        </div>`
    })

    document.querySelector('.container').innerHTML += layout;
})