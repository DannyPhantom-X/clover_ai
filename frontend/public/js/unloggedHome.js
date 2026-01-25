import { inputResizing, inputChecker } from './gen.js'
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.es.js";


const loginBttn = document.querySelector('.login-bttn');
const registerBttn = document.querySelector('.register-bttn');
const authAside = document.querySelector('.auth-aside');
const closeBttn = document.querySelector('.close-bttn');
const inputArea = document.querySelector('.input-area');
const uploadBttn = document.querySelector('.upload-bttn');
const buildModeRadio = document.querySelector('.build-mode-radio');
const chatModeRadio = document.querySelector('.chat-mode-radio');
let conversation = []
let isRunning = false;
clickEnter()
inputResizing(inputArea)
inputChecker()
closeBttn.addEventListener('click', () => {
    authAside.style.display = 'none';
})
loginBttn.addEventListener('click', () => {
    authAside.style.display = 'flex';
    document.querySelector('.email-bttn').addEventListener('click', () => {
        window.location.href = '/login'
    })
})
registerBttn.addEventListener('click', () => {
    authAside.style.display = 'flex';
    document.querySelector('.email-bttn').addEventListener('click', () => {
        window.location.href = '/signup'
    })
})
uploadBttn.addEventListener('click', ask)

async function ask() {
    if(inputArea.value !== '' && !isRunning) {
        isRunning = true;
        document.querySelector('.upload-bttn > svg').style.animation = 'upAnddown 1s normal 0s infinite';
        document.querySelector('.upload-bttn').disabled = true;
        const question = inputArea.value
        inputArea.value  = '';
        inputArea.style.height = "25px";
        inputArea.style.height = inputArea.scrollHeight + "px";
        if(chatModeRadio.checked) {
            document.querySelector('.fbi').innerHTML += `<div class="user-question">${question}</div>`;
            window.scrollTo(0, document.body.scrollHeight);
            inputChecker()
            try{
                const response = await fetch('/c', {
                    method: 'Post',
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({question: question, conversation: conversation})
                })
                const result = await response.json();
                const formattedHtml = DOMPurify.sanitize(marked.parse(result.cloverResponse))
                const el = document.createElement("div");
                el.innerHTML = formattedHtml;
                el.classList.add("clover-response");
                renderMathInElement(el)
                document.querySelector('.fbi').appendChild(el);
                document.querySelector('.upload-bttn > svg').style.animation = 'none';
                isRunning = false;
                document.querySelector('.upload-bttn').disabled = false;
                conversation.push({userQuestion: question, cloverResponse: result.cloverResponse})
                window.scrollTo(0, document.body.scrollHeight);

            }catch{
                alert('Unable to connect to server')
            }
        }else if(buildModeRadio.checked) {
            document.querySelector('.upload-bttn > svg').style.animation = 'none';
            isRunning = false;
            document.querySelector('.upload-bttn').disabled = false;
            alert('We are sorry Build Mode is not available right now')
        }
    }
}
function clickEnter() {
    inputArea.addEventListener('keyup', (e) => {
        if (e.key == 'Enter') {
            e.preventDefault()
            ask()
        }
    })
}