// Is viso
const table = document.getElementById('table');
let sumVal = 0;
for (let i = 1; i < table.rows.length; i++) {
    if (i !== 5 && i !== 6 && i !== 7) {
        sumVal = sumVal + parseFloat(table.rows[i].cells[3].innerHTML);
    }
}
document.getElementById('val').innerHTML = 'Iš viso suprekiauta (šerbetas sirupais): ' + sumVal + ' &euro;';

const table1 = document.getElementById('table');
let sumVal1 = 0;
for (let i = 1; i < table.rows.length; i++) {
    if (i !== 4) {
        sumVal1 = sumVal1 + parseFloat(table.rows[i].cells[3].innerHTML);
    }
}
document.getElementById('val1').innerHTML = 'Iš viso suprekiauta (šerbetas stiklinėmis): ' + sumVal1 + ' &euro;';