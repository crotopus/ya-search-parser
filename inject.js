const {ipcRenderer} = require('electron')

ipcRenderer.on('search', (event) => {
    // Если содержимое страницы не загрузилось, отправляем сообщение
    if (document.body.innerHTML.includes('Если вы считаете, что страницы нет по нашей вине, ')) {
        ipcRenderer.sendToHost('emptyPage')
    }

    // Выделяем все элементы выдачи
    const ul = document.querySelectorAll('li.serp-item')

    // Забираем все сайты с их позицией в выдаче
    let res = []
    let i = 0
    for (let node of ul) {
        if (node.attributes.length > 2 && node.attributes.length < 6
            && node.childNodes[0].className != 'composite composite_gap_s composite_separated_no' && node.querySelector('a>b') != undefined) {
            res.push(truncator(node.querySelector('h2>a').getAttribute('href')))
            i++
        }
    }

    // Сохраняем все позиции
    if (res.length > 0) {
        console.log('res sent')
        ipcRenderer.sendToHost('savePage', res)
    } else {
        console.log('err')
    }

    function truncator(url) {
        return url.replace('https','')
                .replace('http','')
                .replace('://','')
                .replace('www.','')
    }
})

ipcRenderer.on('getResultsNumber', (event) => {
    const numString = document.querySelector('.serp-adv__found').innerHTML
    let resNum = Number(numString.replace(/\D/g,''))
    if (numString.includes('тыс')) {
        resNum *= 1000
    } else if (numString.includes('млн')) {
        resNum *= 1000000
    }
    if (resNum) {
        ipcRenderer.sendToHost('saveResNum', resNum)
    } else {
        console.log('no res num')
    }
})
