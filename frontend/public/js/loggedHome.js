import {inputResizing, inputChecker } from './gen.js'
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.es.js";

const closeTabBttn = document.querySelector('.close-tab-bttn')
const asidePanel = document.querySelector('.aside-panel')
const uploadBttn = document.querySelector('.upload-bttn')
const inputArea = document.querySelector('.input-area')
const imgBttn = document.getElementById('img-bttn')
const asideStatus  = document.querySelector('.aside-status')
const buildModeRadio = document.querySelector('.build-mode-radio');
const chatModeRadio = document.querySelector('.chat-mode-radio')
const chatsDiv = document.querySelector('.chats-div')
let isRunning = false
let conversation = []
clickEnter()
inputResizing(inputArea)
inputChecker()
imgBttn.addEventListener('click', () => {
    if (!asideStatus.checked && window.matchMedia('(min-width: 600px)').matches) {
        asideStatus.checked = true
    }
})
document.querySelector('.menu-bttn').addEventListener('click', () => {
    asideStatus.checked = true
    document.querySelector('.aside-panel').style.display = 'flex'
    document.querySelector('.body-main').classList.add('shade')
    document.querySelector('.header').classList.add('shade')
    document.querySelector('.chat-fixed-div').classList.add('shade')
})
closeTabBttn.addEventListener('click', () => {
    if (asideStatus.checked && window.innerWidth >= '600') {
        asideStatus.checked = false
    }else{
        document.querySelector('.aside-panel').style.display = 'none'
        document.querySelector('.body-main').classList.remove('shade')
        document.querySelector('.header').classList.remove('shade')
        document.querySelector('.chat-fixed-div').classList.remove('shade')
        asideStatus.checked = false
    }
})
uploadBttn.addEventListener('click', () => {
    ask()
})


window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 600px)').matches) {
        document.querySelector('.aside-panel').style.display = 'flex'
    }else{
        document.querySelector('.aside-panel').style.display = 'none'
    }
})

async function ask() {
    if(inputArea.value !== '' && !isRunning) {
        const pathname = window.location.pathname
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
            let response;
            if (pathname === '/') {
                try {
                    response = await fetch('/c', {
                    method: 'Post',
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({question: question})
                    })
                    const result = await response.json();
                    const formattedHtml = DOMPurify.sanitize(marked.parse(result.cloverResponse));
                    const el = document.createElement("div");
                    el.innerHTML = formattedHtml;
                    el.classList.add("clover-response");
                    renderMathInElement(el);
                    document.querySelector('.fbi').appendChild(el);
                    document.querySelector('.upload-bttn > svg').style.animation = 'none';
                    isRunning = false;
                    document.querySelector('.upload-bttn').disabled = false;
                    window.scrollTo(0, document.body.scrollHeight);
                }catch{
                    alert('Unable to connect to the backend')
                }
            }else{
                try {
                    response = await fetch(pathname, {
                    method: 'Post',
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({question: question, conversation: conversation})
                    })
                    const result = await response.json();
                    const formattedHtml = DOMPurify.sanitize(marked.parse(result.cloverResponse));
                    const el = document.createElement("div");
                    el.innerHTML = formattedHtml;
                    el.classList.add("clover-response");
                    renderMathInElement(el);
                    document.querySelector('.fbi').appendChild(el);
                    document.querySelector('.upload-bttn > svg').style.animation = 'none';
                    isRunning = false;
                    document.querySelector('.upload-bttn').disabled = false;
                }catch{
                    alert('Unable to connect to server')
                }
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
    inputArea.addEventListener('keydown', (e) => {
        if (e.key == 'Enter') {
            e.preventDefault();
            ask()
        }
    })
}

window.addEventListener('DOMContentLoaded', async () => {
    const pathname = window.location.pathname
    let userInfoResponse;
    try {
        userInfoResponse = await fetch('/api/')
        userInfoResponse = await userInfoResponse.json()
    }catch{
        alert('Unable to connect to server')
    }
    if (userInfoResponse.statuz && userInfoResponse.chats) {
        chatsDiv.innerHTML = ''
        userInfoResponse.chats.forEach((uc, i) => {        
            chatsDiv.innerHTML += `<button class="chat-name" data-chat-id="${uc}">Untitled ${i + 1}</button>`
        })
        clickChatBttn()
    }
    loadContent()
})
    
async function loadContent() {
    const pathname = window.location.pathname
    let userInfoResponse;
    if (pathname !== '/') {
        try {
            const response = await fetch(`/api${pathname}`);
            const result = await response.json();   
            document.querySelector('.fbi').innerHTML = '';
            result.conversation.forEach((conver, i) => {
                conversation.push(conver)
                document.querySelector('.fbi').innerHTML += `<div class="user-question">${conver.userQuestion}</div>`;
                const formattedHtml = DOMPurify.sanitize(marked.parse(conver.cloverResponse));
                const el = document.createElement("div");
                el.innerHTML = formattedHtml;
                el.classList.add("clover-response");
                renderMathInElement(el);
                document.querySelector('.fbi').appendChild(el);
                document.querySelector('.upload-bttn > svg').style.animation = 'none';
                isRunning = false;
                document.querySelector('.upload-bttn').disabled = false;
        })
        }catch{
            alert('Unable to connect to server')
        }
        inputChecker()                                                                                              
    }
}

async function clickChatBttn() {
    document.querySelectorAll('.chat-name').forEach((cn) => {
        cn.addEventListener('click', () => {
            // window.location.href =  `/c/${cn.dataset.chatId}`
            history.pushState({}, '', `/c/${cn.dataset.chatId}`)
            loadContent();
        })
    })
}