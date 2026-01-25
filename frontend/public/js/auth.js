const bodyContainer = document.querySelector('.body-container')
const loginInfo = `<div class="in-clover-text">Clover</div>
                <div class="in-first-line">
                    <input type="email" name="" id="email-input" class="input-place" placeholder="Email">
                </div>
                <div class="in-second-line">
                    <input type="password" name="" id="password-input" class="input-place" placeholder="Password">
                </div>
                <p class="message"></p>
                <div class="in-third-line">
                    <button class="login-bttn">Login</button>
                </div>
                <p>Don't have an account? <span class="signup-switch">Signup</span></p>`
const signupInfo = `<div class="out-clover-text">Clover</div>
                <div class="out-first-line">
                    <input type="email" name="" id="email-input" class="input-place" placeholder="Email">
                </div>
                <div class="out-second-line">
                    <input type="password" name="" id="password-input" class="input-place" placeholder="Password">
                </div>
                <div class="out-third-line">
                    <input type="password" name="" id="confirm-password-input" class="input-place" placeholder="Confirm Password">
                </div>
                <div class="out-fourth-line">
                    <input type="number" name="" id="code-input" class="input-place code-input" placeholder="Code">
                    <button class="send-code-bttn">Send Code</button>
                </div>
                <p class="message"></p>
                <div class="out-fifth-line">
                    <button class="signup-bttn">Signup</button>
                </div>
                <p>Already have an account? <span class="login-switch">Login</span></p>`
const pathname = location.pathname
document.addEventListener('DOMContentLoaded', () => {
    if (pathname === '/login') {
        bodyContainer.innerHTML = loginInfo;
        logClicks()
    }else if (pathname === '/signup') {
        bodyContainer.innerHTML = signupInfo;
        signClicks()
    }
})


function logClicks() {
    const emailInput = document.getElementById('email-input')
    const message = document.querySelector('.message')
    const passwordInput = document.getElementById('password-input')
    document.querySelector('.signup-switch').addEventListener('click', () => {
        bodyContainer.innerHTML = signupInfo
        location.pathname = '/signup';
        // window.history.pushState({ }, '', '/signup');
        // signClicks()
    })
    document.querySelector('.login-bttn').addEventListener('click', async () => {
        const loginBttn = document.querySelector('.login-bttn')
        loginBttn.style.background = 'rgb(77, 77, 77)';
        loginBttn.innerHTML = '<div class="loading"></div>';
        emailInput.disabled = true;
            passwordInput.disabled = true;
        function off() {
            loginBttn.style.background = '#60b411';
            loginBttn.innerHTML = 'Login';
            emailInput.disabled = false;
            passwordInput.disabled = false;
        }
        emailInput.disabled = true;
        passwordInput.disabled = true;
        if (emailInput.value === '' || emailInput.value.indexOf('@') < 1 || emailInput.value.lastIndexOf('.') < emailInput.value.indexOf('@')) {
            wrongInfo('email')
            off()
            return;
        }if(passwordInput.value < 8) {
            wrongInfo('password')
            off()
            return;
        }
        const response = await fetch('/login', {
            method: 'Post',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value
            })
        })
        const result = await response.json();
        if (result.statuz) {
            window.location.href = result.redirect

        }else{
            wrongInfo(result.reason)
            off()
        }
    })
}


function signClicks() {
    const emailInput = document.getElementById('email-input')
    const message = document.querySelector('.message')
    const passwordInput = document.getElementById('password-input')
    const confirmPasswordInput = document.getElementById('confirm-password-input')
    const codeInput = document.getElementById('code-input')
    document.querySelector('.signup-bttn').addEventListener('click', async () => {
        const signupBttn = document.querySelector('.signup-bttn')
        signupBttn.style.background = 'rgb(77, 77, 77)';
        signupBttn.innerHTML = '<div class="loading"></div>';
        function off() {
            signupBttn.style.background = '#60b411';
            signupBttn.innerHTML = 'Signup';
            emailInput.disabled = false;
            passwordInput.disabled = false;
            confirmPasswordInput.disabled = false;
            codeInput.disabled = false;
        }
        emailInput.disabled = true;
        passwordInput.disabled = true;
        confirmPasswordInput.disabled = true;
        codeInput.disabled = true;
        if (emailInput.value === '' || emailInput.value.indexOf('@') < 1 || emailInput.value.lastIndexOf('.') < emailInput.value.indexOf('@')) {
            wrongInfo('email')
            off()
            return;
        }
        if(passwordInput.value < 8) {
            wrongInfo('password')
            off()
            return;
        }if (confirmPasswordInput.value !== passwordInput.value) {
            wrongInfo('confirmPassword')
            off()
            return;
        }if (codeInput.value === '' || codeInput.value.length > 4 || codeInput.value.length < 4) {
            wrongInfo('code')
            off()
            return;
        }
        const response = await fetch('/signup', {
            method: 'Post',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value,
                confirmPassword: confirmPasswordInput.value,
                code: codeInput.value
            })
        })
        const result = await response.json()
        if(result.statuz) {
            window.location.href = result.redirect
            off()
        }else{
            wrongInfo(result.reason)
            off()
        }
    })
    document.querySelector('.send-code-bttn').addEventListener('click', async () => {
        const sendCodeBttn = document.querySelector('.send-code-bttn')
        emailInput.disabled = true;
        passwordInput.disabled = true;
        confirmPasswordInput.disabled = true;
        codeInput.disabled = true;    
        sendCodeBttn.innerHTML = '<div class="loading"></div>'
        function off() {
            sendCodeBttn.innerHTML = 'Send Code';
        }
        if (emailInput.value === '' || emailInput.value.indexOf('@') < 1 || emailInput.value.lastIndexOf('.') < emailInput.value.indexOf('@')) {
            wrongInfo('email')
            off();
            return;
        }
        const response = await fetch('/auth/code', {
            method: 'Post',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                email: emailInput.value
            })
        })
        const result = await response.json() 
        if(!result.statuz) {
            wrongInfo(result.reason)
            off();
            return;
        }else{
            message.innerHTML = 'Code has been sent'
            message.style.color = '#60b411'
            setTimeout(() => {
                message.innerHTML = ''
                message.style.color = 'red'
            }, 2000)
            off();
        }
    })
    document.querySelector('.login-switch').addEventListener('click', () => {
        bodyContainer.innerHTML = loginInfo
        location.pathname = '/login';
        // logClicks()
    })
}

function wrongInfo(param) {
    const emailInput = document.getElementById('email-input')
    const message = document.querySelector('.message')
    const passwordInput = document.getElementById('password-input')
    const confirmPasswordInput = document.getElementById('confirm-password-input')
    const codeInput = document.getElementById('code-input')
    if(param === 'email') {
        emailInput.style.borderColor = 'red'
        message.innerHTML = 'Invalid Email'
        setTimeout(() => {
            emailInput.style.borderColor = '#60b411'
            message.innerHTML = ''
        }, 2000)
    }else if(param === 'password') {
        passwordInput.style.borderColor = 'red'
        message.innerHTML = 'Password is less than 8 Characters'
        setTimeout(() => {
            passwordInput.style.borderColor = '#60b411'
            message.innerHTML = ''
        }, 2000)
    }else if(param === 'confirmPassword') {
        confirmPasswordInput.style.borderColor = 'red'
        message.innerHTML = 'Password is incorrect'
        setTimeout(() => {
            confirmPasswordInput.style.borderColor = '#60b411'
            message.innerHTML = ''
        }, 2000)
    }else if (param === 'code') {
        codeInput.style.borderColor = 'red'
        message.innerHTML = 'Code must be 4 characters'
        setTimeout(() => {
            codeInput.style.borderColor = '#60b411'
            message.innerHTML = ''
        }, 2000)
    }else if(param === 'emailExists') {
        emailInput.style.borderColor = 'red'
        message.innerHTML = 'Email already Exists'
        setTimeout(() => {
            emailInput.style.borderColor = '#60b411'
            message.innerHTML = ''
        }, 2000)
    }else if (param === 'incorrectCode') {
        codeInput.style.borderColor = 'red'
        message.innerHTML = 'Code is Incorrect'
        setTimeout(() => {
            codeInput.style.borderColor = '#60b411'
            message.innerHTML = ''
        }, 2000)
    }else if (param === 'expiredCode') {
        codeInput.style.borderColor = 'red'
        message.innerHTML = 'Code has expired'
        setTimeout(() => {
            codeInput.style.borderColor = '#60b411'
            message.innerHTML = ''
        }, 2000)
        
    }else if(param === 'loggedPassword') {
        passwordInput.style.borderColor = 'red'
        message.innerHTML = 'Password is incorrect'
        setTimeout(() => {
            passwordInput.style.borderColor = '#60b411'
            message.innerHTML = ''
        }, 2000)
    }
}