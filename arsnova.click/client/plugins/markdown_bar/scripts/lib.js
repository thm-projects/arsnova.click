export function insertInQuestionText (textStart, textEnd) {
    textEnd = typeof textEnd !== 'undefined' ? textEnd : '';
    let textarea = document.getElementById('questionText');

    let scrollPos = textarea.scrollTop;

    let strPosBegin = textarea.selectionStart;
    let strPosEnd = textarea.selectionEnd;

    let frontText = (textarea.value).substring(0, strPosBegin);
    let backText = (textarea.value).substring(strPosEnd, textarea.value.length);
    let selectedText = (textarea.value).substring(strPosBegin, strPosEnd);

    textarea.value = frontText + textStart + selectedText + textEnd + backText;

    textarea.selectionStart = strPosBegin + textStart.length;
    textarea.selectionEnd = strPosEnd + textStart.length;
    textarea.focus();

    textarea.scrollTop = scrollPos;
}

export function markdownAlreadyExistsAndAutoRemove (textStart, textEnd) {
    let textarea = document.getElementById('questionText');
    let scrollPos = textarea.scrollTop;
    let strPosBegin = textarea.selectionStart;
    let strPosEnd = textarea.selectionEnd;

    textEnd = typeof textEnd !== 'undefined' ? textEnd : '';
    let textEndExists = false;
    let textStartExists = false;

    if (textEnd.length > 0) {
        if ((textarea.value).substring(strPosEnd, strPosEnd + textEnd.length) == textEnd) {
            textEndExists = true;
        }
    } else {
        textEndExists = true;
    }

    if ((textarea.value).substring(strPosBegin - textStart.length, strPosBegin) == textStart) {
        textStartExists = true;
    }

    if (textStartExists && textEndExists) {
        let frontText = (textarea.value).substring(0, strPosBegin - textStart.length);
        let middleText = (textarea.value).substring(strPosBegin, strPosEnd);
        let backText = (textarea.value).substring(strPosEnd + textEnd.length, textarea.value.length);
        textarea.value = frontText + middleText + backText;
        textarea.selectionStart = strPosBegin - textStart.length;
        textarea.selectionEnd = strPosEnd - (textEnd.length === 0 ? textStart.length : textEnd.length);
        textarea.focus();

        textarea.scrollTop = scrollPos;

        return true;
    }

    return false;
}