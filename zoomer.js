class Zoomer {
    _minScale = 1
    _maxScale = 8

    _defaultZoomCoefficient = 1.5

    _moveWithoutZoom = false

    _onDoubleClick
    _onWheel

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
    setMoveWithoutZoom(moveWithoutZoom) {
        this._moveWithoutZoom = moveWithoutZoom
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

    setWheelToElement(handler = null) {
        this._onWheel = handler ? handler : this._defaultOnWheel.bind(this)
        this._element.onwheel = this._onWheel

        return this
    }
    removeWheelFromElement() {
        this._element.onwheel = null
    }
    toggleWheelAtElement() {
        if (this._element.onwheel) {
            this.removeWheelFromElement()
        } else {
            this.setWheelToElement(this._onWheel)
        }
    }

    zoomIn(zoomCoefficient = this._defaultZoomCoefficient) {
        this._zoom(zoomCoefficient)
    }
    zoomOut(zoomCoefficient = this._defaultZoomCoefficient) {
        this._zoom(this._invertZoomCoefficient(zoomCoefficient))
    }

    zoomInAt(atCoords, zoomCoefficient = this._defaultZoomCoefficient) {
        this._zoomAt(atCoords, zoomCoefficient)
    }
    zoomOutAt(atCoords, zoomCoefficient = this._defaultZoomCoefficient) {
        this._zoomAt(atCoords, this._invertZoomCoefficient(zoomCoefficient))
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

    //WIP
    isInsideParent(newTranslateX, newTranslateY) {
        const parentElement = this._element.parentNode

        const limitedLayer = {
            vertical: Math.round(parentElement.clientWidth * 0.1),
            horizontal: Math.round(parentElement.clientHeight * 0.1)
        }

        const bc1 = this._element.getBoundingClientRect()
        const bc2 = parentElement.getBoundingClientRect()

        const right = Math.round(bc1.right + newTranslateX - bc2.right)
        const left = bc1.left - bc2.left

        const isLeft = right <= Math.round(bc1.width - limitedLayer.vertical)

        console.log(right, Math.round(bc1.width - limitedLayer.vertical))

        // const isRight = right

        // const elementRealVerticalOffset = Math.round(this._element.offsetLeft + newTranslateX)
        // const elementRealHorizontalOffset = this._element.offsetTop + newTranslateY

        // const left = elementRealVerticalOffset <= Math.round(parentElement.clientWidth - limitedLayer.vertical)
        // const right = Math.round(elementRealVerticalOffset + this._element.clientWidth * this._matrix.scale) >= limitedLayer.vertical

        return true
    }

    getAtCoordsByEvent(event) {
        return {
            x: event.offsetX - this._element.clientWidth / 2,
            y: event.offsetY - this._element.clientHeight / 2,
        }
    }

    _onPointerDown(event) {
        event.preventDefault()

        if (this._moveWithoutZoom || this.isZoomed()) {
            this._updatePointerByEvent(event)
            this._element.setPointerCapture(event.pointerId)

            const onPointerMove = (event) => {
                event.preventDefault()

                this.isInsideParent()

                this._updatePointerByEvent(event)

                const newTranslateX = this._pointer.x - this._pointer.previousX
                const newTranslateY = this._matrix.translateY + (this._pointer.y - this._pointer.previousY)

                if (this.isInsideParent(newTranslateX, newTranslateY)) {
                    this._matrix.translateX += this._pointer.x - this._pointer.previousX
                    this._matrix.translateY = newTranslateY

                    this._applyMatrixToElement()
                }
            }

            const onPointerUp = (event) => {
                event.preventDefault()

                this._updatePointerByEvent(event)

                this._element.removeEventListener('pointermove', onPointerMove)
                this._element.removeEventListener('pointerup', onPointerUp)
            }

            this._element.addEventListener('pointermove', onPointerMove)
            this._element.addEventListener('pointerup', onPointerUp)
        }
    }
    _defaultOnDoubleClick(event) {
        if (this.isZoomed()) {
            this.resetAll()
        } else {
            this.zoomInAt(this.getAtCoordsByEvent(event), this._defaultZoomCoefficient * 2)
        }
    }
    _defaultOnWheel(event) {
        const atCoords = this.getAtCoordsByEvent(event)

        if (event.deltaY < 0) {
            this.zoomInAt(atCoords)
        } else {
            this.zoomOutAt(atCoords)
        }
    }

    _zoom(zoomCoefficient) {
        const newScale = this._matrix.scale * zoomCoefficient

        if (newScale < this._minScale) {
            this.resetAll()
        } else if (newScale > this._maxScale) {
            this._matrix.scale = this._maxScale
        } else {
            this._matrix.scale = newScale
        }

        this._applyMatrixToElement()
    }
    _zoomAt(atCoords, zoomCoefficient) {
        this._zoom(zoomCoefficient)

        if (this._matrix.scale === this._minScale) {
            this.resetMove()
        } else if (this._matrix.scale !== this._maxScale) {
            const newTranslateX = atCoords.x - (atCoords.x - this._matrix.translateX) * zoomCoefficient
            const newTranslateY = atCoords.y - (atCoords.y - this._matrix.translateY) * zoomCoefficient

            this._matrix.translateX = newTranslateX
            this._matrix.translateY = newTranslateY

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
