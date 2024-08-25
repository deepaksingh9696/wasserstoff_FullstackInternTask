import React, { useState } from 'react';
import './Weatherapp.css'; 

// Import weather icons for different weather conditions
import search_icon from "../Assets/search.png";
import clear_icon from "../Assets/clear.png";
import cloud_icon from "../Assets/cloud.png";
import drizzle_icon from "../Assets/drizzle.png";
import rain_icon from "../Assets/rain.png";
import snow_icon from "../Assets/snow.png";
import humidity_icon from "../Assets/humidity.png";
import wind_icon from "../Assets/wind.png";

const Weatherapp = () => {
    // OpenWeatherMap API key
    const api_key = "ef204fc6ac3e7d488471caf5f9b5c423";

    // State variables to hold weather data and user preferences
    const [wicon, setWicon] = useState(cloud_icon);  // Current weather icon
    const [minTemp, setMinTemp] = useState('');  // Minimum temperature
    const [maxTemp, setMaxTemp] = useState('');  // Maximum temperature
    const [description, setDescription] = useState('');  // Weather description
    const [forecast, setForecast] = useState([]);  // 5-day weather forecast
    const [isCelsius, setIsCelsius] = useState(true);  // Temperature unit (Celsius/Fahrenheit)
    const [cityName, setCityName] = useState('');  // City name
    const [windSpeed, setWindSpeed] = useState('');  // Wind speed
    const [windDirection, setWindDirection] = useState('');  // Wind direction
    const [humidity, setHumidity] = useState('');  // Humidity level
    const [error, setError] = useState(null);  // Error message
    const [loading, setLoading] = useState(false);  // Loading state

    // Function to map weather condition codes to corresponding icons
    const getWeatherIcon = (icon) => {
        switch (icon) {
            case "01d":
            case "01n":
                return clear_icon;  // Clear sky
            case "02d":
            case "02n":
                return cloud_icon;  // Few clouds
            case "03d":
            case "03n":
            case "04d":
            case "04n":
                return drizzle_icon;  // Scattered clouds
            case "09d":
            case "09n":
            case "10d":
            case "10n":
                return rain_icon;  // Rain
            case "13d":
            case "13n":
                return snow_icon;  // Snow
            default:
                return clear_icon;  // Default to clear sky
        }
    };

    // Function to convert Fahrenheit to Celsius
    const convertToCelsius = (temp) => ((temp - 32) * 5 / 9).toFixed(1);

    // Function to convert Celsius to Fahrenheit
    const convertToFahrenheit = (temp) => ((temp * 9 / 5) + 32).toFixed(1);

    // Function to convert wind direction in degrees to compass direction
    const convertDegreeToDirection = (degree) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round((degree % 360) / 45);
        return directions[index % 8];
    };

    // Function to search for weather data based on the entered city name
    const search = async () => {
        const element = document.getElementsByClassName("cityinput");
        const cityName = element[0].value;

        if (cityName === "") {
            setError("Please enter a city name.");  // Show error if city name is empty
            return;
        }

        setLoading(true);  // Set loading state to true
        setError(null);  // Clear previous errors

        let url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${api_key}`;

        try {
            let response = await fetch(url);

            if (!response.ok) {
                throw new Error("City not found. Please enter a valid city.");  // Handle error if city is not found
            }

            let data = await response.json();
            const currentWeather = data.list[0];

            const tempMin = currentWeather.main.temp_min;
            const tempMax = currentWeather.main.temp_max;

            // Set weather data based on the fetched information
            setMinTemp(isCelsius ? tempMin + "°C" : convertToFahrenheit(tempMin) + "°F");
            setMaxTemp(isCelsius ? tempMax + "°C" : convertToFahrenheit(tempMax) + "°F");
            setDescription(currentWeather.weather[0].description);
            setWicon(getWeatherIcon(currentWeather.weather[0].icon));

            setCityName(data.city.name);
            setWindSpeed(currentWeather.wind.speed + " km/h");
            setWindDirection(convertDegreeToDirection(currentWeather.wind.deg));
            setHumidity(currentWeather.main.humidity + "%");

            // Prepare forecast data for the next 5 days
            const forecastData = [];
            for (let i = 0; i < data.list.length; i += 8) {
                const forecastItem = data.list[i];
                const avgTemp = forecastItem.main.temp;
                forecastData.push({
                    date: new Date(forecastItem.dt_txt).toLocaleDateString(),
                    avgTemp: isCelsius ? avgTemp + "°C" : convertToFahrenheit(avgTemp) + "°F",
                    description: forecastItem.weather[0].description,
                    icon: getWeatherIcon(forecastItem.weather[0].icon)
                });
            }
            setForecast(forecastData);  // Set the forecast data in state
        } catch (err) {
            setError(err.message);  // Handle any errors during the API call
        } finally {
            setLoading(false);  // Set loading state to false
        }
    };

    // Function to toggle between Celsius and Fahrenheit units
    const toggleTemperatureUnit = () => {
        setIsCelsius(!isCelsius);  // Toggle the unit state

        // Convert and update the min and max temperatures
        setMinTemp(prevTemp => {
            const temp = parseFloat(prevTemp);
            return isCelsius
                ? convertToFahrenheit(temp) + "°F"
                : convertToCelsius(temp) + "°C";
        });
        setMaxTemp(prevTemp => {
            const temp = parseFloat(prevTemp);
            return isCelsius
                ? convertToFahrenheit(temp) + "°F"
                : convertToCelsius(temp) + "°C";
        });

        // Convert and update the forecast temperatures
        setForecast(prevForecast => prevForecast.map(day => ({
            ...day,
            avgTemp: isCelsius
                ? convertToFahrenheit(parseFloat(day.avgTemp)) + "°F"
                : convertToCelsius(parseFloat(day.avgTemp)) + "°C"
        })));
    };

    return (
        <div className='container'>
            {/* Top bar with city search input */}
            <div className='top_bar'>
                <input type="text" className="cityinput" placeholder='Search for a city...' />
                <div className="search_icon" onClick={search}>
                    <img src={search_icon} alt="Search" />
                </div>
            </div>
            {/* Display error message if any */}
            {error && <div className='error_message'>{error}</div>}
            {/* Display loading message while data is being fetched */}
            {loading && <div className='loading_message'>Loading...</div>}
            {/* Toggle switch for Celsius/Fahrenheit */}
            <div className='toggle_unit'>
                <label className='switch'>
                    <input type="checkbox" onChange={toggleTemperatureUnit} checked={!isCelsius} />
                    <span className='slider'></span>
                </label>
                <span className={isCelsius ? "active" : ""}>Celsius</span>
                <span className={!isCelsius ? "active" : ""}>Fahrenheit</span>
            </div>
            {/* Weather icon */}
            <div className='weather_image'>
                <img src={wicon} alt="Weather Icon" />
            </div>
            {/* Display temperature */}
            <div className={`weather_temp ${!isCelsius ? 'fahrenheit' : ''}`}>
                {isCelsius ? minTemp : maxTemp}
            </div>
            {/* Display city name */}
            <div className='weather_location'>{cityName}</div>
            {/* Display min and max temperatures */}
            <div className='min_max_temp'>
                <div className='min_temp'>Min: {minTemp}</div>
                <div className='max_temp'>Max: {maxTemp}</div>
            </div>
            {/* Display weather description */}
            <div className='weather_description'>
                {description}
            </div>
            {/* Display additional weather data like humidity and wind */}
            <div className='data_container'>
                <div className='element'>
                    <img src={humidity_icon} alt="Humidity Icon" className='icon' />
                    <div className='data'>
                        <div className='humidity'>
                            Humidity : {humidity}
                        </div>
                    </div>
                </div>
                <div className='element'>
                    <img src={wind_icon} alt="Wind Icon" className='icon' />
                    <div className='data'>
                        <div className='wind_rate'>
                            Wind Speed: {windSpeed}
                        </div>
                        <div className='wind_direction'>Wind Direction: {windDirection}</div>
                    </div>
                </div>
            </div>
            {/* Display 5-day forecast */}
            <div className='forecast_container'>
                <h2>5-Day Forecast</h2>
                <div className='forecast'>
                    {forecast.map((day, index) => (
                        <div className='forecast_item' key={index}>
                            <div className='forecast_date'>{day.date}</div>
                            <img src={day.icon} alt="Weather Icon" className='forecast_icon' />
                            <div className='forecast_temp'>{day.avgTemp}</div>
                            <div className='forecast_description'>{day.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Weatherapp;

