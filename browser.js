const electron = require('electron')
const {ipcRenderer} = electron

const path = require('path')
const fs = require('fs')

const webview = document.querySelector('webview')
const addressbar = document.getElementById('addressbar')
const queryinput = document.getElementById('queryinput')
const go = document.getElementById('go')
const page = document.getElementById('page')
const resultslimit = document.getElementById('resultslimit')

let query                 // Список строк с запросами
let currentq              // Строка с текущим запросом
resultslimit.value = 200  // Максимальная позиция при поиске по умолчанию

const ya = 'https://www.yandex.ru/'
const search = 'search/?lr=213&text='

let data = []

let position = 0

let isSearching

webview.addEventListener('ipc-message', (event) => {
    if (query.length >= 0 && currentq != undefined) {
        if (event.channel == 'nextPage') {
            position += event.args[0]
            page.value = Number(page.value) + 1
            if (position < resultslimit.value - 1) {
                webview.loadURL(ya + search + currentq + '&p=' + page.value)
            } else {
                console.log(addressbar.value + ' :: NO :: ' + currentq)
                data.push('<TR><TD>' + addressbar.value + '</TD>' + '<TD>no</TD>' + '<TD>' + currentq + '</TD>' + '</TR>')
                nextQuery()
            }
        } else if (event.channel == 'done') {
            position += event.args[0]
            console.log(addressbar.value + ' :: ', position + 1,' :: ' + currentq)
            data.push('<TR><TD>' + addressbar.value + '</TD>' + '<TD>' + Number(position + 1) + '</TD>' + '<TD>' + currentq + '</TD>' + '</TR>')
            nextQuery()
        } else if (event.channel == 'noMatches') {
            console.log(addressbar.value + ' :: NO :: ' + currentq)
            data.push('<TR><TD>' + addressbar.value + '</TD>' + '<TD>no</TD>' + '<TD>' + currentq + '</TD>' + '</TR>')
            nextQuery()
        }
    } else {
        exportToCsv()
        resetSearch()
    }
    
})

nextQuery = () => {
    position = 0
    page.value = 0
    currentq = query.pop()
    webview.loadURL(ya + search + currentq + '&p=' + page.value)
}

resetSearch = () => {
    position = 0
    page.value = 0
    isSearching = false
}

webview.addEventListener('dom-ready', (event) => {
    //webview.openDevTools()
    if (isSearching) {
        webview.send('search', addressbar.value)
    }
})

startSearch = () => {
    isSearching = true

    query = queryinput.value.split('\n').reverse()
    currentq = query.pop()

    webview.loadURL(ya + search + currentq)
}

addressbar.onkeyup = (ev) => {
    if (ev.key == 'Enter') {
        startSearch()
    }
}

go.onclick = () => {
    startSearch()
}

exportToCsv = () => {
    const currentdate = new Date()
    let csvContent = '<body><TABLE>' + data.join('\n') + '</TABLE></body>'
    fs.writeFile(path.join(__dirname, 'xml/report-'
            + currentdate.getFullYear() + "-" 
            + ((currentdate.getMonth() + 1 < 10) ? '0' + Number(currentdate.getMonth() + 1) : Number(currentdate.getMonth() + 1)) + "-" 
            + ((currentdate.getDate() + 1 < 10) ? '0' + Number(currentdate.getDate()) : Number(currentdate.getDate())) + "-" 
            + ((currentdate.getHours() + 1 < 10) ? '0' + Number(currentdate.getHours()) : Number(currentdate.getHours())) + "-" 
            + ((currentdate.getMinutes() + 1 < 10) ? '0' + Number(currentdate.getMinutes()) : Number(currentdate.getMinutes())) + '.xml'),
        csvContent, (err) => {
        if(err) {
            return console.log(err)
        }
        console.log('The file was saved!')
    })
    data = []
}
