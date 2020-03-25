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
        ipcRenderer.sendToHost('savePage', res)
    } else {
        ipcRenderer.sendToHost('noPositions', res)
    }

    function truncator(url) {
        return url.replace('https','')
                  .replace('http','')
                  .replace('://','')
                  .replace('www.','')
    }
})

ipcRenderer.on('getViewsNum', (event) => {
    // Забираем количество показов в месяц
    const viewsNumString = document.querySelector('.serp-adv__displayed').innerText
    let viewsNum = Number(viewsNumString.replace(/\D/g,''))
    if (viewsNumString.includes('тыс')) {
        viewsNum *= 1000
    } else if (viewsNumString.includes('млн')) {
        viewsNum *= 1000000
    }
    if (viewsNum) {
        ipcRenderer.sendToHost('saveViewsNum', viewsNum)
    } else {
        console.log('no views num')
        ipcRenderer.sendToHost('noViewsNum')
    }
})

ipcRenderer.on('getResNum', (event) => {
    // Забираем количество результатов выдачи
    const resNumString = document.querySelector('.serp-adv__found').innerHTML
    let resNum = Number(resNumString.replace(/\D/g,''))
    if (resNumString.includes('тыс')) {
        resNum *= 1000
    } else if (resNumString.includes('млн')) {
        resNum *= 1000000
    }
    if (resNum) {
        ipcRenderer.sendToHost('saveResNum', resNum)
    } else {
        console.log('no res num')
        ipcRenderer.sendToHost('noResNum')
    }
})