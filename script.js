'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// GEOLOCATION
// IF the browser can fetch our location...
if (navigator.geolocation) {
  // getCurrentPosition takes in two functions. The first one will run if it successfully gets our position, and the second one is for if it fails
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log(position);
      // Used destructuring to pull out the latitude and longitude values from the GeolocationCoordinates object. These coordinates are going to be used to center the map on the given position
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      const coords = [latitude, longitude];
      // Generates the map using our latitude and longitude
      const map = L.map('map').setView(coords, 13);
      // The map on the page is made of small tiles that come from the specified URL.
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot//{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker(coords)
        .addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
    },
    function () {
      alert('Could not get your position!');
    }
  );
}
