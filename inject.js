const {ipcRenderer} = require('electron')

ipcRenderer.on('search', (event, site) => {
    if (document.body.innerHTML.includes('Если вы считаете, что страницы нет по нашей вине, ')) {
        ipcRenderer.sendToHost('noMatches')
    }
    document.querySelector('div.serp-header__wrapper').innerHTML = ''
    const res = document.querySelectorAll('li.serp-item')
    let i = 0
    for (let node of res) {
        if (node.attributes.length < 6 && node.childNodes[0].className != 'composite composite_gap_s composite_separated_no') {
            if (node.innerHTML.includes(site)) {
                ipcRenderer.sendToHost('done', i)
                break
            }
            i++
        }
        if (node == res[res.length-1]) {
            ipcRenderer.sendToHost('nextPage', i)
        }
    }
})