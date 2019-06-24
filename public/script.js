// Is viso
const table = document.getElementById('table');
let sumVal = 0;
for (let i = 1; i < table.rows.length; i++) {
    if (i !== 5 && i !== 6 && i !== 7) {
        sumVal = sumVal + parseFloat(table.rows[i].cells[2].innerHTML);
    }
}
document.getElementById('val').innerHTML = 'Iš viso suprekiauta (šerbetas sirupais): ' + sumVal + ' &euro;';

const table1 = document.getElementById('table');
let sumVal1 = 0;
for (let i = 1; i < table.rows.length; i++) {
    if (i !== 4) {
        sumVal1 = sumVal1 + parseFloat(table.rows[i].cells[2].innerHTML);
    }
}
document.getElementById('val1').innerHTML = 'Iš viso suprekiauta (šerbetas stiklinėmis): ' + sumVal1 + ' &euro;';

const tab = document.getElementsByClassName('apsk');
const val = document.getElementsByClassName('val');
const copy = [];
Object.entries(tab).forEach((el) => {
    const table = el[1];
    let sum = 0
    for (let i = 1; i < table.rows.length; i++) {
        sum = sum + parseFloat(table.rows[i].cells[2].innerHTML);
    }
    copy.push(sum);
});

const template = '<p class="font-weight-bold text-success"> Iš viso suprekiauta ~id~ &euro;';

for (i = 0; i < tab.length; i++) {
    tab[i].insertAdjacentHTML('afterend', template.replace(/~id~/g, copy[i]));
}