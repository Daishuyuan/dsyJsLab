function PainterMatrix(id, row, col, size) {
    var _backColor = "#AAAAAA",
        _self = this,
        _canvas = document.getElementById(id),
        _context,
        _space = 5,
        _void = 0,
        _matrix = [],
        _special = [],
        _colorTable = [];

    ~ function () {
        if (_canvas != null) {
            // init canvas and context
            _canvas.width = parseInt(col * size + (col - 1) * _space);
            _canvas.height = parseInt(row * size + (row - 1) * _space);
            _context = _canvas.getContext("2d");

            // init params
            for (let i = 0; i < row; ++i) {
                _matrix.push(fillArray(_void));
                _colorTable.push(fillArray(_backColor));
            }

            // define functions
            function fillArray(value) {
                let cols = [];
                cols.length = col;
                cols.fill(value);
                return cols;
            }

            function _drawBlock(x, y, color) {
                _context.fillStyle = color;
                _context.fillRect(y * (size + _space), x * (size + _space), size, size);
            }

            Object.defineProperties(_self, {
                backColor: {
                    value: {
                        set: function (color) {
                            _backColor = color;
                            for (let i = 0; i < row; ++i) {
                                for (let j = 0; j < col; ++j) {
                                    if (_matrix[i][j] === _void) {
                                        _colorTable[i][j] = color;
                                    }
                                }
                            }
                            _self.repainter();
                        },
                        get: function () {
                            return _backColor;
                        }
                    }
                },
                step: {
                    value: function (x, y, action, color) {
                        let code = NaN;
                        _drawBlock(x, y, _backColor);
                        x += action.x;
                        y += action.y;
                        if (x >= 0 && x < row && y >= 0 && y < col) {
                            _drawBlock(x, y, color);
                            code = _matrix[x][y];
                        }
                        return [x, y, code];
                    }
                },
                getRC: {
                    value: function () {
                        return [row, col];
                    }
                },
                getMatrix: {
                    value: function () {
                        return _matrix;
                    }
                },
                repainter: {
                    value: function () {
                        for (let i = 0; i < row; ++i) {
                            for (let j = 0; j < col; ++j) {
                                _drawBlock(i, j, _colorTable[i][j]);
                            }
                        }
                    }
                },
                mouseConfigure: {
                    value: function (num, color, callback, multi) {
                        function tailCal() {
                            _canvas.onmousedown = null;
                            window.onkeydown = null;
                            callback && callback();
                        }

                        _canvas.onmousedown = function (e) {
                            if (e.buttons === 1) {
                                let y = parseInt(e.offsetX / (size + _space));
                                let x = parseInt(e.offsetY / (size + _space));
                                if (x >= 0 && x < row && y >= 0 && y < col && _matrix[x][y] === _void) {
                                    _matrix[x][y] = num;
                                    _drawBlock(x, y, color);
                                    _colorTable[x][y] = color;
                                    _special.push({
                                        x: x,
                                        y: y,
                                        num: num
                                    });
                                    !multi && tailCal();
                                }
                            }
                        }

                        if (multi) {
                            window.onkeydown = function (e) {
                                switch (e.code) {
                                    case "Enter":
                                        tailCal();
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                    }
                },
                getSpecial: {
                    value: function (num) {
                        let array = [];
                        for (let elem of _special) {
                            if (elem.num == num) {
                                array.push(elem);
                            }
                        }
                        return array;
                    }
                },
                drawBlock: {
                    value: function(x, y, color) {
                        _drawBlock(x, y, color);
                    }
                }
            });
        }

        // last ativate repaint function
        _self.repainter();
    }();
}