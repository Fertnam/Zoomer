window.addEventListener('load', () => {
    const areaItem = document.querySelector('.area__item')

    const areaItemZoomer = new Zoomer(areaItem)
        .setDoubleClickToElement()
        .setWheelToElement()

    document.querySelector('.tooltips__zoom-in')
        .addEventListener('click', zoomInClickHandler)

    document.querySelector('.tooltips__zoom-out')
        .addEventListener('click', zoomOutClickHandler)

    function zoomInClickHandler() {
        areaItemZoomer.zoomIn()
    }

    function zoomOutClickHandler() {
        areaItemZoomer.zoomOut()
    }
})
