fetch('/en/me')
.then(res => res.json())
.then(user => {
    if (!user.message) {
        const email = document.querySelector('body > div.container > div.row > div:nth-child(1) > div.well > form > div:nth-child(3) > div > div');
        const country = document.querySelector('select[name="country"]');
        country.value = user.country;
        email.innerHTML = `<strong>Email: </strong> ${user.email}`
        const countrySelect = document.querySelector('select[name="country"]')
        const phoneInput = document.querySelector('.change-data-phone')
        const codeInput = document.querySelector('.change-data-code')
        countrySelect.value = user.country;
        phoneInput.value = user.phone.split(' ')[1];
        codeInput.value = user.phone.split(' ')[0];
        

        const changeDataInput = document.querySelector('.change-data-submit');
        const changePassInput = document.querySelector('.change-password-submit');

        changeDataInput.onclick = function(e) {
            e.preventDefault();

            const code = document.querySelector('.change-data-code').value;
            const phone = document.querySelector('.change-data-phone').value;
            const pass = document.querySelector('.change-data-pass').value;
            const country = countrySelect.value;

            fetch('/en/account/change-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone,
                    code,
                    pass,
                    id: user._id,
                    country
                })
 
            })
            .then(res => res.json())
            .then(response => {
                if (response.invalidPassword) {
                    alert('Invalid password!')
                } else {
                    window.location.reload()
                }
            })
        }

        changePassInput.onclick = function(e) {
            e.preventDefault();

            const currPass = document.querySelector('.curr-pass').value;
            const newPass = document.querySelector('.new-pass').value;
            const newPassSubmit = document.querySelector('.new-pass-submit').value;

            if (newPass != newPassSubmit) {
                alert("Passwords don`t match!");
                return;
            } else if (!newPass.trim()) {
                alert("Password can not be empty!")
            }

            fetch('/en/account/change-pass', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                }, 
                body: JSON.stringify({
                    currPass,
                    newPass,
                    id: user._id
                })
            })
            .then(res => res.json())
            .then(response => {
                if (response.invalidPassword) {
                    alert("Invalid password!");
                } else {
                    window.location.reload()
                }
               
            })
        }
        }
    })