// API URLs
const countryStatsUrl = "https://disease.sh/v3/covid-19/countries";
const worldStatsUrl = "https://disease.sh/v3/covid-19/all";

// Storing commonly used elements
const countryDataTable = document.querySelector('.country-data');
const worldDataCards = {
    infected: document.querySelector('.card-text-infected'),
    recovered: document.querySelector('.card-text-recovered'),
    deceased: document.querySelector('.card-text-deceased')
}
const statusDiv = document.querySelector('.status');
const searchBar = document.querySelector('.search');
const searchClearButton = document.querySelector('.button-clear');
const tableHeaders = [...document.querySelectorAll('th')];

/**
 * Returns all the rows in the
 * table except the header
 */
function getRows() {
    const tbody = countryDataTable.children[0];
    return [...tbody.children].slice(1);
}

/**
 * Adds a new row into the table
 */
function addRow(flagUrl, country, infected, recovered, deceased) {

    // Create a new row element
    const row = document.createElement('tr');
    row.classList.add("data-row");

    // To store the 4 tds
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

    // Append all the cells to the row element
    for(const idx in cells)
        row.appendChild(cells[idx]);

    // Append the row element to the tbody
    countryDataTable.children[0].appendChild(row);
}

/**
 * Removes all data rows
 * from the table
 */
function removeAllRows() {
    while(countryDataTable.children[0].children.length != 1)
        countryDataTable.children[0].removeChild(
            countryDataTable.children[0].lastChild
        );
}

/**
 * Fetches COVID-19 data
 * country-wise
 */
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

/**
 * Fetches COVID-19 data
 * of the whole world
 */
function fetchWorldData() {
    fetch(worldStatsUrl)
    .then(response => response.json())
    .then(data => {
        worldDataCards.infected.textContent = data.cases;
        worldDataCards.recovered.textContent = data.recovered;
        worldDataCards.deceased.textContent = data.deaths;
    });
}

/**
 * Updates the status text
 */
function updateStatus() {

    // Get the header of the currently sorted column
    const sortedHeader = document.querySelector('[data-sorted="true"]');

    const trs = getRows();

    // Check whether all rows are hidden
    const noVisibleRows = trs.length > 0 && trs.every(tr => tr.hidden);

    if(noVisibleRows) {
        statusDiv.textContent = "There are no countries matching your search query."
        return; // Nothing more to do
    }

    // Key by which the data is sorted
    const sortingKey = sortedHeader.dataset.content;
    // Whether the data is in ascending order
    const isAscending = sortedHeader.dataset.asc === 'true';
    // Whether the data is numeric
    // (all columns except 'country' are)
    const isNumeric = sortingKey !== 'country';
    // Whether the data has a search query filter
    const hasFilter = typeof trs.find(tr => tr.hidden) !== 'undefined';

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

/**
 * Adds all requisite event listeners
 */
function setupListeners() {

    // For when the 'clear' button is clicked
    searchClearButton.addEventListener('click', _ev => {
        // Empty the search bar's value
        searchBar.value = '';
        // Make all the rows visible
        getRows().forEach(tr => { tr.hidden = false });
        updateStatus();
    });

    // For when the search bar receives input
    searchBar.addEventListener('input', _ev => {
        // For every row
        getRows().forEach(tr => {
            // Convert the country name to lower case
            lowerCaseCountryName = tr.children[0].textContent.toLowerCase();
            // Convert the search query to lower case
            lowerCaseSearchQuery = searchBar.value.toLowerCase();
            // Check whether the search query is a substring of the
            // country name and hide the row if it isn't
            tr.hidden = !lowerCaseCountryName.includes(lowerCaseSearchQuery)
        });
        updateStatus();
    });

    // For all the table headers
    for(const idx in tableHeaders) {

        const th = tableHeaders[idx];
        // For when the table header is clicked
        th.addEventListener('click', _ev => {
            // Get all the data rows
            const trs = getRows();
            // Whether the column is numeric
            const isNumeric = th.dataset.content !== 'country';
            // Whether the column is ascending
            const isAscending = th.dataset.asc === 'true';
            // Whether the column is sorted
            const isSorted = th.dataset.sorted === 'true';
            // Sort the rows
            trs.sort((a, b) => {
                // When the clicked column is currently sorted
                // in ascending order, switch to descending sort
                if(isAscending && isSorted) [a, b] = [b, a];
                return a.children[idx].textContent.localeCompare(
                    b.children[idx].textContent, undefined,
                    { numeric: isNumeric }
                )
            });

            // Append all every tr to the tbody
            for(const tr of trs)
                countryDataTable.children[0].appendChild(tr);

            // Update 'data-asc'
            th.dataset.asc = String(!isAscending || !isSorted);

            // For all the headers
            tableHeaders.forEach(thElem => {
                // Set 'data-sorted' to true only
                // for the currently sorted th, and
                // false for all others
                thElem.dataset.sorted = String(thElem === th);
            });

            updateStatus();

        });

    }

}

fetchWorldData();
fetchCountryData();
setupListeners();
updateStatus();

