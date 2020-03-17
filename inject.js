const {ipcRenderer} = require('electron')

ipcRenderer.on('search', (event, site) => {
    // Если содержимое страницы не загрузилось, отправляем сообщение
    if (document.body.innerHTML.includes('Если вы считаете, что страницы нет по нашей вине, ')) {
        ipcRenderer.sendToHost('emptyPage')
    }

    // Скрываем шапку с поисковой строкой
    //document.querySelector('div.serp-header__wrapper').innerHTML = ''

    // Выделяем все элементы выдачи
    const ul = document.querySelectorAll('li.serp-item')

    // Забираем все сайты с их позицией в выдаче
    let res = []
    let i = 0
    for (let node of ul) {
        if (node.attributes.length > 2 && node.attributes.length < 6
            && node.childNodes[0].className != 'composite composite_gap_s composite_separated_no' && node.querySelector('a>b') != undefined) {
            res.push(node.querySelector('h2>a').getAttribute('href'))
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
    
    // LEGACY CODE
    // Парсинг позиции для конкретного сайта
    /*
    let i = 0
    for (let node of res) {
        if (node.attributes.length > 2 && node.attributes.length < 6 && node.childNodes[0].className != 'composite composite_gap_s composite_separated_no') {
            if (node.querySelector('a>b') != undefined && node.querySelector('a>b').innerHTML.toLowerCase() == site.toLowerCase()) {
                ipcRenderer.sendToHost('done', i)
                break
            }
            i++
        }
        if (node == res[res.length-1]) {
            ipcRenderer.sendToHost('nextPage', i)
        }
    }*/
})
