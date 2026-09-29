const API_KEY = "acfbf9b073702ac59886ec9675e02f89";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherContainer = document.getElementById("weatherContainer");
const message = document.getElementById("message");

let cities = JSON.parse(sessionStorage.getItem("cities")) || [];

let messageTimeout;

function showMessage(text, color){

    clearTimeout(messageTimeout);

    message.textContent = text;

    message.style.color = color;

    messageTimeout = setTimeout(() => {

        message.textContent = "";

    }, 3000);
}

function saveCities(){

    sessionStorage.setItem(
        "cities",
        JSON.stringify(cities)
    );
}

function getWeatherIcon(iconCode){

    if(iconCode === "01d"){

        return "☀️";
    }

    else if(iconCode === "01n"){

        return "🌙";
    }

    else if(iconCode === "02d"){

        return "⛅";
    }

    else if(iconCode === "02n"){

        return "☁️";
    }

    else if(
        iconCode === "03d"
        ||
        iconCode === "03n"
        ||
        iconCode === "04d"
        ||
        iconCode === "04n"
    ){

        return "☁️";
    }

    else if(
        iconCode === "09d"
        ||
        iconCode === "10d"
    ){

        return "🌦️";
    }

    else if(
        iconCode === "09n"
        ||
        iconCode === "10n"
    ){

        return "🌧️";
    }

    else if(
        iconCode === "11d"
        ||
        iconCode === "11n"
    ){

        return "⛈️";
    }

    else if(
        iconCode === "13d"
        ||
        iconCode === "13n"
    ){

        return "🌨️";
    }

    else if(
        iconCode === "50d"
        ||
        iconCode === "50n"
    ){

        return "🌫️";
    }

    return "🌤️";
}

function createWeatherCard(data){

    const description =
    data.weather[0].description;

    const icon =
    getWeatherIcon(
        data.weather[0].icon
    );

    return `

    <div class="weather-card">

        <button class="delete-btn">
            <i class="fa-solid fa-trash"></i>
        </button>

        <h2>${data.name}</h2>

        <div class="weather-icon">
            ${icon}
        </div>

        <div class="temp">
            ${Math.round(data.main.temp)}°C
        </div>

        <div class="condition">
            ${description}
        </div>

        <div class="card-buttons">

            <button class="move-btn up-btn">
                ↑
            </button>

            <button class="move-btn down-btn">
                ↓
            </button>

        </div>

    </div>
    `;
}

async function getWeather(city){

    const response = await fetch(

`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=fr`

    );

    if(!response.ok){

        throw new Error(
            "Ville introuvable"
        );
    }

    return await response.json();
}

async function renderCities(){

    weatherContainer.innerHTML = "";

    const fragment =
    document.createDocumentFragment();

    for(let city of cities){

        try{

            const data =
            await getWeather(city);

            const div =
            document.createElement("div");

            div.innerHTML =
            createWeatherCard(data);

            fragment.appendChild(
                div.firstElementChild
            );
        }

        catch(error){

            if(error.message === "Ville introuvable"){

                showMessage(
                    "Ville introuvable",
                    "#ff4d6d"
                );

            }else{

                showMessage(
                    "Problème de connexion",
                    "#ff4d6d"
                );
            }
        }
    }

    weatherContainer.appendChild(
        fragment
    );
}

async function addCity(){

    const city =
    cityInput.value.trim();

    if(city === ""){

        showMessage(
            "Entrez une ville",
            "#ff4d6d"
        );

        return;
    }

    if(
        cities.some(
            c => c.toLowerCase()
            === city.toLowerCase()
        )
    ){

        showMessage(
            "Ville déjà ajoutée",
            "#ffb703"
        );

        return;
    }

    try{

        showMessage(
            "Chargement...",
            "white"
        );

        await getWeather(city);

        cities.push(city);

        saveCities();

        renderCities();

        cityInput.value = "";

        showMessage(
            "Ville ajoutée",
            "#90ee90"
        );
    }

    catch(error){

        if(error.message === "Ville introuvable"){

            showMessage(
                "Ville introuvable",
                "#ff4d6d"
            );

        }else{

            showMessage(
                "Problème de connexion",
                "#ff4d6d"
            );
        }
    }
}

searchBtn.addEventListener(
    "click",
    addCity
);

cityInput.addEventListener(
    "keydown",
    function(e){

        if(e.key === "Enter"){

            addCity();
        }
    }
);

weatherContainer.addEventListener(
    "click",
    function(event){

        const card =
        event.target.closest(".weather-card");

        if(!card){

            return;
        }

        const cards =
        document.querySelectorAll(
            ".weather-card"
        );

        const index =
        Array.from(cards).indexOf(card);

        if(
            event.target.closest(".delete-btn")
        ){

            cities.splice(index, 1);

            saveCities();

            renderCities();

            showMessage(
                "Ville supprimée",
                "#ffb703"
            );
        }

        if(
            event.target.closest(".up-btn")
        ){

            if(index > 0){

                let temp =
                cities[index];

                cities[index] =
                cities[index - 1];

                cities[index - 1] =
                temp;

                saveCities();

                renderCities();
            }
        }

        if(
            event.target.closest(".down-btn")
        ){

            if(index < cities.length - 1){

                let temp =
                cities[index];

                cities[index] =
                cities[index + 1];

                cities[index + 1] =
                temp;

                saveCities();

                renderCities();
            }
        }
    }
);

renderCities();