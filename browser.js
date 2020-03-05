const electron = require('electron')
const {ipcRenderer} = electron

const webview = document.querySelector('webview')
const addressbar = document.getElementById('addressbar')
const queryinput = document.getElementById('queryinput')
const go = document.getElementById('go')
const page = document.getElementById('page')
const resultslimit = document.getElementById('resultslimit')

/*
queryinput.value = 'afgadg\nrgferg\nfsrgsrg'
let query = queryinput.value.split('\n')
*/

resultslimit.value = 200

const ya = 'https://www.yandex.ru/'
const search = 'search/?lr=213&text='

let position = 0

let isSearching

webview.addEventListener('ipc-message', (event) => {
    if (event.channel == 'nextPage') {
        position += event.args[0]
        page.value = Number(page.value) + 1
        if (position<resultslimit.value - 1) {
            webview.loadURL(ya + search + queryinput.value + '&p=' + page.value)
        } else {
            console.log(addressbar.value +' :: NO :: '+ queryinput.value)
            position = 0
            page.value = 0
            isSearching = false
        }
    } else if (event.channel == 'done') {
        position += event.args[0]
        console.log(addressbar.value + ' :: ', position + 1,' ::' + queryinput.value)
        /*navigator.clipboard.writeText(position + 1).then(() => {
            console.log('VALUE COPIED')
        })*/
        position = 0
        page.value = 0
        isSearching = false
    } else if (event.channel == 'noMatches') {
        console.log(addressbar.value +' :: NO :: '+ queryinput.value)
        position = 0
        page.value = 0
        isSearching = false
    }
})

webview.addEventListener('dom-ready', (event) => {
    //webview.openDevTools()
    if (isSearching) {
        webview.send('search', addressbar.value)
    }
})

startSearch = () => {
    isSearching = true
    webview.loadURL(ya + search + queryinput.value)
}

queryinput.onkeyup = (ev) => {
    if (ev.key == 'Enter') {
        startSearch()
    }
}

addressbar.onkeyup = (ev) => {
    if (ev.key == 'Enter') {
        startSearch()
    }
}

go.onclick = () => {
    startSearch()
}