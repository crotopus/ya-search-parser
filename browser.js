const electron = require('electron')
const {ipcRenderer} = electron

const request = require('request')

const path = require('path')
const fs = require('fs')

const webview = document.querySelector('webview')
const queryinput = document.getElementById('queryinput')
const go = document.getElementById('go')
const pause = document.getElementById('pause')
const addQuery = document.getElementById('addQuery')
const page = document.getElementById('page')
const resultslimit = document.getElementById('resultslimit')

let currentq                                 // Строка с текущим запросом
resultslimit.value = 15                      // Максимальная страница
const searchInterval = 1000 * 2              // Интервал опроса сервера при работа
const searchIntervalWaiting = 1000 * 60 * 60 // Интервал опроса сервера при простое

const ya = 'https://www.yandex.ru/'
const search = 'search/?lr=213&text='

let data = []
let resNum = 0
let viewsNum = 0

let isSearching
let onPause

let isEmptyQuery = false

webview.addEventListener('ipc-message', (event) => {
    if (Number(page.value) < Number(resultslimit.value) && currentq != undefined) {
        if (event.channel == 'emptyPage') {
            
        } else if (event.channel == 'noPositions') {
            console.log('no positions')
        } else if (event.channel == 'savePage') {
            data = data.concat(event.args[0])
            page.value = Number(page.value) + 1
            webview.loadURL(ya + search + currentq + '&p=' + page.value)
        } else if (event.channel == 'saveViewsNum') {
            viewsNum = event.args[0]
            webview.send('getResNum')
            console.log('views num recieved ', viewsNum)
        } else if (event.channel == 'saveResNum') {
            resNum = event.args[0]
            isSearching = true
            webview.send('search')
            console.log('res num recieved ', resNum)
        } else if (event.channel == 'noViewsNum') {
            sendEmptyQuery()
        } else if (event.channel == 'noResNum') {
            console.log('no res number')
        }
    } else {
        console.log(data)
        isSearching = false
        page.value = 0
        sendResults()
        data = []
        resNum = 0
        currentq = null
        setTimeout(startSearch, searchInterval)
    }
})

webview.addEventListener('dom-ready', (event) => {
    webview.openDevTools()
    if (page.value == 0) {
        webview.send('getViewsNum')
    }
    if (isSearching) {
        webview.send('search')
    }
})

getCurrentDate = () => {
    return Number(new Date())
}

getEmptyQuery = (toRun) => {
    request.get('http://localhost:8000/query/empty', {}, 
    (error, res, body) => {
        if (error) {
            console.log(error)
            return
        }
        console.log(`statusCode: ${res.statusCode}`)
        toRun(body)
    })
}

getQueryLatest = (toRun) => {
    request.get('http://localhost:8000/query/latest', {}, 
    (error, res, body) => {
        if (error) {
            console.log(error)
            return
        }
        console.log(`statusCode: ${res.statusCode}`)
        toRun(body)
    })
}

startSearch = () => {
    page.value = 0

    getQueryLatest(body => {
        if (!body.includes('{"err"')) {
            currentq = body
            webview.loadURL(ya + search + currentq)
        } else if (body.includes('No queries to process')) {
            getEmptyQuery(body2 => {
                currentq = body2
                webview.loadURL(ya + search + currentq)
                isEmptyQuery = true
            })
        } else if (!onPause) {
            setTimeout(startSearch, searchInterval)
        }
    })
}

sendQuery = () => {
    let jsonObj = []
    const queries = queryinput.value.split('\n')
    queries.forEach(q => {
        jsonObj.push({name: q.trim()})
    })
    queryinput.value = ''
    request.post('http://localhost:8000/queries', {json: jsonObj},
    (error, res, body) => {
        if (error) {
            console.log(error)
            return
        }
        console.log(`statusCode: ${res.statusCode}`)
    })
}

sendEmptyQuery = () => {
    const jsonObj = {
        name: currentq,
        lastDate: getCurrentDate()
    }
    request.put('http://localhost:8000/query/empty', {json: jsonObj},
    (error, res, body) => {
        if (error) {
            console.log(error)
            return
        }
        console.log(`statusCode: ${res.statusCode}`)
    })
}

sendResults = () => {
    if (isEmptyQuery) {
        const jsonObj = {
            name: currentq,
        }
        request.put('http://localhost:8000/query/non-empty', {json: jsonObj},
        (error, res, body) => {
            if (error) {
                console.log(error)
                return
            }
            console.log(`statusCode: ${res.statusCode}`)
        })
    }
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
}

stopSearch = () => {
    onPause = true
}

/*
startWordstat = () => {
    isWordstating = true
    getQueryLatest((body) => {
        if (!body.includes('{"err"')) {
            currentq = body
            webview.loadURL(ws + words + currentq)
        } else {
            setTimeout(startWordstat, searchInterval)
        }
    })
}
*/

/*
queryinput.onkeyup = (ev) => {
    if (ev.key == 'Enter') {
        startSearch()
    }
}
*/

go.onclick = () => {
    startSearch()
}

/*
wordstat.onclick = () => {
    startWordstat()
}
*/

pause.onclick = () => {
    stopSearch()
}

addQuery.onclick = () => {
    sendQuery()
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
