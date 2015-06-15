(function () {
    document.onmousedown = function (e) {
        if (e.button === 2) {
            return false;
        }
    };

    function setPixel(imageData, pos, color) {
        var x = pos[0];
        var y = pos[1];
        var rgba = color.toRgb();
        var r = rgba.r;
        var g = rgba.g;
        var b = rgba.b;
        var a = rgba.a * 255;
        var index = (x + y * imageData.width) * 4;
        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    }

    function drawLine(imageData, from, to, color) {
        var x0 = from[0];
        var y0 = from[1];
        var x1 = to[0];
        var y1 = to[1];
        var dx = x1 - x0;
        var dy = y1 - y0;
        var error = 0;
        var derror = Math.abs(dy / dx);
        var x;
        var y;
        if (dx) {
            y = y0;
            for (x = x0; dx * (x1 - x) > 0; x += Math.sign(dx)) {
                setPixel(imageData, [x, y], color);
                error += derror;
                while (error >= 0.5) {
                    setPixel(imageData, [x, y], color);
                    y += Math.sign(dy);
                    error -= 1;
                }
            }
        } else {
            var minY = Math.min(y0, y1);
            var maxY = Math.max(y0, y1);
            x = x1;
            for (y = minY; y <= maxY; y++) {
                setPixel(imageData, [x, y], color);
            }
        }
    }

    function redrawImage() {
        context.putImageData(imageData, 0, 0);
    }

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    // read the width and height of the canvas
    var width = canvas.width;
    var height = canvas.height;

    // create a new pixel array
    var imageData = context.createImageData(width, height);

    var pos = 0; // index position into imagedata array

    var xoff = width / 3; // offsets to "center"
    var yoff = height / 3;

    // walk left-to-right, top-to-bottom; it's the
    // same as the ordering in the imagedata array:

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var x2 = x - xoff;
            var y2 = y - yoff;
            var d = Math.sqrt(x2 * x2 + y2 * y2);
            var t = Math.sin(d / 6.0);

            var r = t * 200;
            var g = 125 + t * 80;
            var b = 235 + t * 20;

            imageData.data[pos++] = Math.max(0, Math.min(255, r));
            imageData.data[pos++] = Math.max(0, Math.min(255, g));
            imageData.data[pos++] = Math.max(0, Math.min(255, b));
            imageData.data[pos++] = 255; // opaque alpha
        }
    }

    var fgColor = [0, 0, 0, 255];
    var bgColor = [255, 255, 255, 255];
    var mousedown = {
        1: false,
        2: false,
        3: false
    };
    var lastPos = [0, 0];

    var $canvas = $('#canvas');
    $canvas
        .mousedown(function (e) {
            var btn = e.which;
            mousedown[btn] = true;
            var color;
            if (btn === 1) {
                color = fgColor;
            } else if (btn === 2) {
                return;
            } else if (btn === 3) {
                color = bgColor;
            } else {
                return;
            }
            var mousePos = getMousePos(canvas, e);
            setPixel(imageData, mousePos, color);
            redrawImage();
            lastPos = mousePos;
        })
        .mouseup(function (e) {
            var btn = e.which;
            mousedown[btn] = false;
        })
        .mousemove(function (e) {
            var mousePos = getMousePos(canvas, e);
            var color;
            if (mousedown[1]) {
                color = fgColor;
            } else if (mousedown[2]) {
                return;
            } else if (mousedown[3]) {
                color = bgColor;
            } else {
                return;
            }
            drawLine(imageData, lastPos, mousePos, color);
            redrawImage();
            lastPos = mousePos;
        });
    $('body').on('contextmenu', '#canvas', function () { return false; });

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return [
            evt.clientX - rect.left,
            evt.clientY - rect.top
        ];
    }

    $('#fgColor').spectrum({
        color: '#ff0000',
        showAlpha: true,
        change: function (color) {
            fgColor = color;
        }
    });
    $('#bgColor').spectrum({
        color: '#ff0000',
        showAlpha: true,
        change: function (color) {
            bgColor = color;
        }
    });

    redrawImage();
})();
