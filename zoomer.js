class Zoomer {
    _minScale = 1
    _maxScale = 8

    _defaultZoomCoefficient = 1.5

    _onDoubleClick

    _matrix = {
        scale: 0,
        translateX: 0,
        translateY: 0,
    }

    _pointer = {
        x: 0,
        y: 0,
        previousX: 0,
        previousY: 0
    }

    constructor(element) {
        this._element = element
        this._element.style.touchAction = 'none'

        this._element.addEventListener('pointerdown', this._onPointerDown.bind(this))

        this.resetAll()
    }

    setZoomLimit(min, max) {
        this._minScale = min
        this._maxScale = max

        this.resetZoom()

        return this
    }
    setDefaultZoomCoefficient(defaultZoomCoefficient) {
        this._defaultZoomCoefficient = defaultZoomCoefficient
        return this
    }

    setDoubleClickToElement(handler = null) {
        this._onDoubleClick = handler ? handler : this._defaultOnDoubleClick.bind(this)
        this._element.ondblclick = this._onDoubleClick

        return this
    }
    removeDoubleClickFromElement() {
        this._element.ondblclick = null
    }
    toggleDoubleClickAtElement() {
        if (this._element.ondblclick) {
            this.removeDoubleClickFromElement()
        } else {
            this.setDoubleClickToElement(this._onDoubleClick)
        }
    }

    zoomIn(zoomCoefficient = this._defaultZoomCoefficient) {
        this._zoom(zoomCoefficient)
    }
    zoomOut(zoomCoefficient = this._defaultZoomCoefficient) {
        this._zoom(this._invertZoomCoefficient(zoomCoefficient))
    }

    resetAll() {
        this.resetZoom()
        this.resetMove()
    }
    resetZoom() {
        this._matrix.scale = this._minScale
        this._applyMatrixToElement()
    }
    resetMove() {
        this._matrix.translateX = this._matrix.translateY = 0
        this._applyMatrixToElement()
    }

    isZoomed() {
        return this._matrix.scale > this._minScale
    }
    isMoved() {
        return (this._matrix.translateX !== 0) || (this._matrix.translateY !== 0)
    }

    _onPointerDown(event) {
        this._updatePointerByEvent(event)
        this._element.setPointerCapture(event.pointerId)

        event.preventDefault()

        const onPointerMove = (event) => {
            this._updatePointerByEvent(event)

            event.preventDefault()

            this._matrix.translateX += this._pointer.x - this._pointer.previousX
            this._matrix.translateY += this._pointer.y - this._pointer.previousY

            this._applyMatrixToElement()
        }

        const onPointerUp = (event) => {
            this._updatePointerByEvent(event)

            event.preventDefault()

            this._element.removeEventListener('pointermove', onPointerMove)
            this._element.removeEventListener('pointerup', onPointerUp)
        }

        this._element.addEventListener('pointermove', onPointerMove)
        this._element.addEventListener('pointerup', onPointerUp)
    }
    _defaultOnDoubleClick() {
        if (this.isZoomed()) {
            this.resetAll()
        } else {
            this.zoomIn(this._defaultZoomCoefficient * 2)
        }
    }

    _zoom(zoomCoefficient) {
        const newScale = this._matrix.scale * zoomCoefficient

        if (newScale >= this._minScale && newScale <= this._maxScale) {
            this._matrix.scale = newScale
            this._applyMatrixToElement()
        }
    }
    _updatePointerByEvent(event) {
        this._pointer.previousX = this._pointer.x
        this._pointer.previousY = this._pointer.y

        this._pointer.x = event.pageX
        this._pointer.y = event.pageY
    }
    _invertZoomCoefficient(zoomCoefficient) {
        return (1 / zoomCoefficient)
    }
    _applyMatrixToElement() {
        this._element.style.transform = `matrix(
            ${this._matrix.scale}, 
            0, 
            0, 
            ${this._matrix.scale},
            ${this._matrix.translateX},
            ${this._matrix.translateY}
        )`
    }
}
