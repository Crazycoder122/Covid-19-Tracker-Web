const countryData = document.querySelector('.country-data');
const basisOfSorting = document.querySelector('.basis-of-sorting');
const worldData = {
    infected: document.querySelector('.card-text-infected'),
    recovered: document.querySelector('.card-text-recovered'),
    deceased: document.querySelector('.card-text-deceased')
}
const countryStatsUrl = "https://disease.sh/v3/covid-19/countries";
const worldStatsUrl = "https://disease.sh/v3/covid-19/all";

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

    for(const key in cells)
        row.appendChild(cells[key]);

    countryData.children[0].appendChild(row);
}

function updateCountryData() {
    while(countryData.children[0].children.length != 1)
        countryData.children[0].removeChild(
            countryData.children[0].children[
                countryData.children[0].children.length - 1
            ]
        );
    
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

function updateWorldData() {
    fetch(worldStatsUrl)
    .then(response => response.json())
    .then(data => {
        worldData.infected.textContent = data.cases;
        worldData.recovered.textContent = data.recovered;
        worldData.deceased.textContent = data.deaths;
    });
}

updateCountryData();
updateWorldData();
