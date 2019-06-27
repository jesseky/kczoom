document.getElementById('btnB64En').onclick = function () {
    let times = parseInt(document.querySelector('input[name=times]').value);
    let text = document.querySelector('textarea').value;
    if (!isNaN(times) && times >= 1 && times <= 1000 && text) {
        for (let n = 0; n < times; n++) {
            text = btoa(text);
        }
        document.querySelector('textarea').value = text;
    }
};
document.getElementById('btnB64De').onclick = function () {
    let times = parseInt(document.querySelector('input[name=times]').value);
    let text = document.querySelector('textarea').value;
    if (!isNaN(times) && times >= 1 && times <= 1000 && text) {
        let n = 0;
        for (; n < times; n++) {
            try {
                let s = atob(text);
                text = s;
            } catch (e) {
                break;
            }
        }
        document.querySelector('textarea').value = text;
        document.querySelector('input[name=times]').value = n;
    }
};