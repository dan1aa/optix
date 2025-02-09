fetch('/en/me')
.then(res => res.json())
.then(user => {
    if (!user.message) {
        const email = document.querySelector('body > div.container > div.row > div:nth-child(1) > div.well > form > div:nth-child(3) > div > div');
        const country = document.querySelector('select[name="country"]');
        country.value = user.country;
        email.innerHTML = `<strong>Email: </strong> ${user.email}`
        }
    })