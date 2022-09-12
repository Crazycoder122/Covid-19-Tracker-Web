const countryDataTable = document.querySelector('.country-data');
const worldDataCards = {
    infected: document.querySelector('.card-text-infected'),
    recovered: document.querySelector('.card-text-recovered'),
    deceased: document.querySelector('.card-text-deceased')
}
const countryStatsUrl = "https://disease.sh/v3/covid-19/countries";
const worldStatsUrl = "https://disease.sh/v3/covid-19/all";
const statusDiv = document.querySelector('.status');
const searchBar = document.querySelector('.search');
const searchClearButton = document.querySelector('.button-clear');
const tableHeaders = [...document.querySelectorAll('th')];

function getRows() {
    const tbody = countryDataTable.children[0];
    return [...tbody.children].slice(1)
}

function addRow(flagUrl, country, infected, recovered, deceased) {

    const row = document.createElement('tr');
    row.classList.add("data-row");

    const cells = {}

    cells.country = document.createElement('td');
    cells.country.classList.add('country');
    cells.country.style.backgroundImage = `url("${flagUrl}")`;
    cells.country.appendChild(document.createTextNode(country));

    cells.infected = document.createElement('td');
    cells.infected.classList.add('infected')
    cells.infected.textContent = infected

    cells.recovered = document.createElement('td');
    cells.recovered.classList.add('recovered')
    cells.recovered.textContent = recovered;

    cells.deceased = document.createElement('td');
    cells.deceased.classList.add('deceased')
    cells.deceased.textContent = deceased;

    for(const idx in cells)
        row.appendChild(cells[idx]);

    countryDataTable.children[0].appendChild(row);
}

function deleteAllRows() {
    while(countryDataTable.children[0].children.length != 1)
        countryDataTable.children[0].removeChild(
            countryDataTable.children[0].lastChild
        );
}

function fetchCountryData() {
    fetch(countryStatsUrl)
    .then(response => response.json())
    .then(data => {
        for(const record of data) {
            addRow(
                record.countryInfo["flag"],
                record.country,
                record.cases,
                record.recovered,
                record.deaths
            )
        }
    });
}

function fetchWorldData() {
    fetch(worldStatsUrl)
    .then(response => response.json())
    .then(data => {
        worldDataCards.infected.textContent = data.cases;
        worldDataCards.recovered.textContent = data.recovered;
        worldDataCards.deceased.textContent = data.deaths;
    });
}

function updateStatus() {
    const sortedHeader = document.querySelector('[data-sorted="true"]');

    const notFound = getRows().every(tr => tr.hidden);

    if(notFound) {
        statusDiv.textContent = "There are no countries matching your search query."
        return;
    }

    const sortingKey = sortedHeader.dataset.content;
    const isAscending = sortedHeader.dataset.asc === 'true';
    const isNumeric = sortingKey !== 'country';
    const hasFilter = searchBar.value !== '';

    statusDiv.textContent = "The list is sorted in";
    statusDiv.textContent += (isAscending ? " ascending" : " descending");
    statusDiv.textContent += (isNumeric ? " numeric" : " alphabetical");
    statusDiv.textContent += " order of";
    switch(sortingKey) {
        case 'country':
            statusDiv.textContent += " country names";
            break;
        case 'infected':
            statusDiv.textContent += " infected cases";
            break;
        case 'recovered':
            statusDiv.textContent += " recovered cases";
            break;
        case 'deceased':
            statusDiv.textContent += " deceased cases";
            break;
    }

    if(hasFilter)
        statusDiv.textContent += " and filtered according to your search query"

    statusDiv.textContent += ".";

}

fetchCountryData();
fetchWorldData();
updateStatus();

searchClearButton.addEventListener('click', _ev => {
    searchBar.value = '';
    trs = getRows();
    trs.forEach(tr => {
        tr.hidden = false
    });
});

searchBar.addEventListener('input', _ev => {
    trs = getRows();
    trs.forEach(tr => {
        lowerCaseCountryName = tr.children[0].textContent.toLowerCase();
        lowerCaseSearchQuery = searchBar.value.toLowerCase();
        tr.hidden = !lowerCaseCountryName.includes(lowerCaseSearchQuery)
    });
    updateStatus();
});

for(const idx in tableHeaders) {
    const th = tableHeaders[idx];
    th.addEventListener('click', _ev => {
        trs = getRows();
        const isNumeric = th.dataset.content != 'country';
        const isAscending = th.dataset.asc == 'true';
        const isSorted = th.dataset.sorted == 'true';
        trs.sort((a, b) => {
            if(isAscending && isSorted) [a, b] = [b, a];
            return a.children[idx].textContent.localeCompare(
                b.children[idx].textContent, undefined,
                { numeric: isNumeric }
            )
        });
        for(const tr of trs)
            countryDataTable.children[0].appendChild(tr);
        th.dataset.asc = String(!isAscending || !isSorted);
        tableHeaders.forEach(thElem => {
            thElem.dataset.sorted = String(thElem === th);
        });
        updateStatus();
    });
}
