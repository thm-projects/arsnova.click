function componentToHex (c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

export function hexToRgb (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function rgbToHex (r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function transformForegroundColor (rgbObj) {
    var o = Math.round(((parseInt(rgbObj.r) * 299) + (parseInt(rgbObj.g) * 587) + (parseInt(rgbObj.b) * 114)) / 1000);
    return o < 125 ? "#ffffff" : "#000000";
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}