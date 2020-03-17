const electron = require('electron')
const {ipcRenderer} = electron

const request = require('request')

const path = require('path')
const fs = require('fs')

const webview = document.querySelector('webview')
const addressbar = document.getElementById('addressbar')
const queryinput = document.getElementById('queryinput')
const go = document.getElementById('go')
const page = document.getElementById('page')
const resultslimit = document.getElementById('resultslimit')

let currentq              // Строка с текущим запросом
resultslimit.value = 20   // Максимальная страница

const ya = 'https://www.yandex.ru/'
const search = 'search/?lr=213&text='

let data = []
let resNum = 0

let isSearching

webview.addEventListener('ipc-message', (event) => {
    if (Number(page.value) < Number(resultslimit.value) && currentq != undefined) {
        if (event.channel == 'emptyPage') {
            
        } else if (event.channel == 'savePage') {
            data = data.concat(event.args[0])
            page.value = Number(page.value) + 1
        } else if (event.channel == 'saveResNum') {
            resNum = event.args[0]
        }
        webview.loadURL(ya + search + currentq + '&p=' + page.value)
    } else {
        console.log(data)
        isSearching = false
        page.value = 0
        // отправить данные на сервер
        if (data != []) {
            request.post('http://localhost:8000/results', {
                json: {
                    queryName: currentq,
                    date: getCurrentDate(),
                    results: resNum,
                    urls: data
                }
            },
            (error, res, body) => {
                if (error) {
                    console.log(error)
                    return
                }
                console.log(`statusCode: ${res.statusCode}`)
                console.log(body)
            })
        }        
        data = []
        resNum = 0
        currentq = null
    }
})

webview.addEventListener('dom-ready', (event) => {
    webview.openDevTools()
    if (page.value == 0) {
        webview.send('getResultsNumber')
    }
    if (isSearching) {
        webview.send('search')
    }
})

getCurrentDate = () => {
    return Number(new Date())
}

startSearch = () => {
    isSearching = true

    // Захват запроса из строки
    //currentq = queryinput.value

    request.get('http://localhost:8000/results/24', {}, 
    (error, res, body) => {
        if (error) {
            console.log(error)
            return
        }
        console.log(`statusCode: ${res.statusCode}`)
        if (!body.includes('{"err"')) {
            currentq = body
            webview.loadURL(ya + search + currentq)
        }
    })
}

queryinput.onkeyup = (ev) => {
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
