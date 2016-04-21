export let buzzsound1 = null;

export function setBuzzsound1 (fileName) {
    buzzsound1 = new buzz.sound('/sounds/' + fileName, {
        loop: true
    });
}