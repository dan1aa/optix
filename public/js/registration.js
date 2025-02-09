window.onload = function() {
    const registrateBtn = document.querySelector('.registrate-input');
    const name =  document.querySelector('input[name="firstname"]');
    const surname =  document.querySelector('input[name="lastname"]')
    const year = document.querySelector('select[name="year"]')
    const month =  document.querySelector('select[name="month"]')
    const day =  document.querySelector('select[name="day"]')
    const country =  document.querySelector('select[name="country"]')
    const email =  document.querySelector('.registration-email')
    const telegram =  document.querySelector('input[name="telegram"]')
    const password =  document.querySelector('.register-pass')
    const repeatpassword =  document.querySelector('input[name="conf_password"]')
    const timezone =  document.querySelector('select[name="timezone"]')
    const termsCheck = document.querySelector('input[type="checkbox"]');
    const allFieldsMessage = document.querySelector('.all-fields-message');
    const passMatchMessage = document.querySelector('.pass-match-message');
    const alreadyExistMessage = document.querySelector('.user-exist-message');

    registrateBtn.onclick = function(e) {
        e.preventDefault()
        allFieldsMessage.style.display = 'none';
        passMatchMessage.style.display = 'none';
        alreadyExistMessage.style.display = 'none';
        const gender =  document.querySelector('input[name="gender"]:checked');
        if (
           name.value.trim() !== '' &&
            surname.value.trim() !== '' &&
            year.value.trim() !== '' &&
            month.value.trim() !== '' &&
            day.value.trim() !== '' &&
            country.value.trim() !== '' &&
            email.value.trim() !== '' &&
            telegram.value.trim() !== '' &&
            password.value.trim() !== '' &&
            repeatpassword.value.trim() !== '' &&
            timezone.value.trim() !== '' &&
            termsCheck.checked &&
            password.value.trim() == repeatpassword.value.trim()
          ) {
            fetch('/en/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstname: name.value,
                    lastname: surname.value,
                    year: year.value,
                    month: month.value,
                    day: day.value,
                    country: country.value,
                    email: email.value,
                    telegram: telegram.value,
                    password: password.value,
                    timezone: timezone.value,
                    gender: gender.value,
                })
            })
            .then(res => res.json())
            .then(response => {
                if (response.exist) {
                    alreadyExistMessage.style.display = 'inline'
                } else {
                    alert('Registration successful! Please, Log in')
                }
            })
          } else {
            if (password.value.trim() != repeatpassword.value.trim()) {
                passMatchMessage.style.display = 'inline'
            }
            if (           
                name.value.trim() == '' ||
                surname.value.trim() == '' ||
                year.value.trim() == '' ||
                month.value.trim() == '' ||
                day.value.trim() == '' ||
                country.value.trim() == '' ||
                email.value.trim() == '' ||
                telegram.value.trim() == '' ||
                password.value.trim() == '' ||
                repeatpassword.value.trim() == '' ||
                timezone.value.trim() == '' ||
                !termsCheck.checked) {
                    allFieldsMessage.style.display = 'inline'
                }
          }
    }
}