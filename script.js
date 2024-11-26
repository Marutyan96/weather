const apiKey = 'af3ecc6fa96af2b8a7cce8492f9213fa';

document.getElementById('cityInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});

async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) {
        document.getElementById('errorMessage').textContent = 'Пожалуйста, введите название города.';
        return;
    }

    document.getElementById('errorMessage').textContent = '';
    document.getElementById('cityName').textContent = 'Загрузка...';

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=ru&appid=${apiKey}`;
    const dailyUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=ru&appid=${apiKey}`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) throw new Error('Город не найден');

        const weatherData = await weatherResponse.json();
        updateWeather(weatherData);

        const dailyResponse = await fetch(dailyUrl);
        const dailyData = await dailyResponse.json();
        updateDailyWeather(dailyData); // Обновление дневной погоды
    } catch (error) {
        console.error(error);
        document.getElementById('errorMessage').textContent = error.message;
        document.getElementById('cityName').textContent = '';
    }
}

// Добавьте функцию updateDailyWeather здесь
function updateDailyWeather(data) {
    const dailyWeatherContainer = document.getElementById('dailyWeather');
    dailyWeatherContainer.innerHTML = ''; // Очистить предыдущие данные

    // Предположим, что вы хотите отображать данные на 7 дней
    const dailyData = data.list.filter((entry, index) => index % 8 === 0); // Получаем данные на каждый день

    dailyData.forEach(entry => {
        const date = new Date(entry.dt * 1000).toLocaleDateString(); // Преобразуем время в дату
        const temp = `Температура: ${entry.main.temp}°C`;
        const description = entry.weather[0].description;
        const icon = `<img src="https://openweathermap.org/img/wn/${entry.weather[0].icon}.png" alt="Иконка погоды">`;

        const dailyItem = document.createElement('div');
        dailyItem.className = 'daily-weather';
        dailyItem.innerHTML = `<strong>${date}</strong><br>${description}, ${icon}<br>${temp}`;

        dailyWeatherContainer.appendChild(dailyItem);
    });
}



function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation не поддерживается этим браузером.");
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeatherByCoordinates(lat, lon);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Пользователь отклонил запрос на получение геолокации.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Информация о местоположении недоступна.");
            break;
        case error.TIMEOUT:
            alert("Запрос на получение местоположения превысил время ожидания.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Произошла неизвестная ошибка.");
            break;
    }
}

async function fetchWeatherByCoordinates(lat, lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${apiKey}`;
    const hourlyUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${apiKey}`;

    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) throw new Error('Ошибка при получении данных о погоде');

        const weatherData = await response.json();
        updateWeather(weatherData);

        // Запрос почасовой погоды
        const hourlyResponse = await fetch(hourlyUrl);
        if (!hourlyResponse.ok) throw new Error('Ошибка при получении почасовой погоды');

        const hourlyData = await hourlyResponse.json();
        updateHourlyWeather(hourlyData);
    } catch (error) {
        document.getElementById('errorMessage').textContent = error.message;
    }
}

function updateWeather(data) {
    // Проверяем, что данные существуют и имеют нужную структуру
    if (data) {
        document.getElementById('cityName').innerText = data.name || 'Город не найден';
        document.getElementById('date').innerText = new Date().toLocaleDateString();
        document.getElementById('description').innerText = data.weather[0].description;
        document.getElementById('icon').innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Иконка погоды">`;
        document.getElementById('temp').innerText = `Температура: ${data.main.temp}°C`;
        document.getElementById('tempMin').innerText = `Минимальная: ${data.main.temp_min}°C`;
        document.getElementById('tempMax').innerText = `Максимальная: ${data.main.temp_max}°C`;
        document.getElementById('windSpeed').innerText = `Скорость ветра: ${data.wind.speed} м/с`;
    } else {
        console.error('Данные не получены:', data);
        document.getElementById('cityName').innerText = 'Город не найден';
    }
}

function updateHourlyWeather(data) {
    const hourlyWeatherContainer = document.getElementById('hourlyWeather');
    hourlyWeatherContainer.innerHTML = '';

    // Предположим, что вы хотите отображать первые 5 часов прогноза
    const hourlyData = data.list.slice(0, 5); // Измените количество по своему усмотрению

    hourlyData.forEach(entry => {
        const time = new Date(entry.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const description = entry.weather[0].description;
        const icon = `<img src="https://openweathermap.org/img/wn/${entry.weather[0].icon}.png" alt="Иконка погоды">`;
        const temp = `Температура: ${entry.main.temp}°C`;

        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-weather';
        hourlyItem.innerHTML = `<strong>${time}</strong><br>${description}, ${icon}<br>${temp}`;

        hourlyWeatherContainer.appendChild(hourlyItem);
    });
}

function resetWeather() {
    document.getElementById('cityInput').value = ''; // Очищаем поле ввода
    document.getElementById('cityName').textContent = ''; // Очищаем информацию о городе
    document.getElementById('date').textContent = '';
    document.getElementById('description').textContent = '';
    document.getElementById('icon').innerHTML = '';
    document.getElementById('temp').textContent = '';
    document.getElementById('tempMin').textContent = '';
    document.getElementById('tempMax').textContent = '';
    document.getElementById('windSpeed').textContent = '';
    document.getElementById('errorMessage').textContent = '';
    document.getElementById('hourlyWeather').innerHTML = ''; // Очищаем почасовую погоду
}
