export function inputResizing(inputArea) {
    inputArea.addEventListener("input", () => {
        inputArea.style.height = "25px";
        inputArea.style.height = inputArea.scrollHeight + "px";
    });
}

export function inputChecker() {
    const gfbi = document.querySelector('.fbi');
    const gchatInput = document.querySelector('.chat-input')
    // alert(gchatInput.offsetHeight)
    let calcnum  = window.innerHeight - gchatInput.offsetHeight
    calcnum  = calcnum/2
    calcnum = String(calcnum) + 'px'
    if (gfbi.innerHTML === '') {
        document.querySelector('.chat-fixed-div').style.bottom = calcnum;
    }else{
        document.querySelector('.chat-fixed-div').style.bottom = '0px';
    }
}