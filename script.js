'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// We will never create an instance of the Workout class. Instead, we will create instances of the Running and Cycling classes
class Workout {
  date = new Date();
  // We need an ID. IRL we use libraries to create unique IDs, but in this case we can use the date
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    // this.date = ...
    // this.id = ...
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  // type is a property that represents the workout
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    // Setting properties using the Workout class
    super(coords, distance, duration);
    // Sets the cadence property since it's specific to Running
    this.cadence = cadence;
    // Sets the pace property as soon as an instance is created
    this.calcPace();
  }

  calcPace() {
    // minutes/kilometer
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    // Sets the speed property as soon as an instance is created
    this.calcSpeed();
  }

  calcSpeed() {
    // kilometers/hour
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

////////////////////////////////////////
// APPLICATION ARCHITECHTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  // Creating private instances of the map and mapEvent properties
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    // In an event handler, this points to the DOM element that it's being used on. So to fix this, I must use bind() to specify the correct object to point to (App in this case)
    form.addEventListener('submit', this._newWorkout.bind(this));

    // I want to change the cadence and elevation forms whenever the user switches from running to cycling
    inputType.addEventListener('change', this._toggleElevationField);
  }

  // GEOLOCATION
  _getPosition() {
    // IF the browser can fetch our location...
    if (navigator.geolocation) {
      // getCurrentPosition takes in two functions. The first one will run if it successfully gets our position, and the second one is for if it fails.
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position!');
        }
      );
    }
  }

  _loadMap(position) {
    // Used destructuring to pull out the latitude and longitude values from the GeolocationCoordinates object. These coordinates are going to be used to center the map on the given position
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    // Created an array that contains our coordinates
    const coords = [latitude, longitude];
    // Generates the map using our latitude and longitude
    this.#map = L.map('map').setView(coords, 13);
    // The map on the page is made of small tiles that come from the specified URL.
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot//{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // The on() method replaces the addEventListener() function. (Handling clicks on map)
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    // Rendering the workout form when the map is clicked on
    form.classList.remove('hidden');
    // focus() puts input priority onto the specified element
    inputDistance.focus();
  }

  _toggleElevationField() {
    // closest() looks for the parent element, and toggle() adds and removes the specified CSS class.
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // Helper functions
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    // Stops the page from reloading when clicked
    e.preventDefault();
    // GET DATA FROM FORM
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // IF WORKOUT IS 'RUNNING', CREATE RUNNING OBJ
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // CHECK IF DATA IS VALID
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        // The not '!' operator inverts the value of the expression. It flips true to false, and vice versa
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      // Here, we set the value of workout to be an instance of the 'Running' sub-class
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // IF WORKOUT IS CYCLING CREATE CYCLING OBJECT
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // ADD NEW OBJECT TO WORKOUT ARRAY
    this.#workouts.push(workout);
    console.log(workout);
    // RENDER WORKOUT ON MAP AS MARKER
    this.renderWorkoutMarker(workout);
    // We can destructure the latlng object to get the latitude and longitude of the point clicked

    // Render workout on list

    // Hide form + clear input fields
    // CLEAR INPUT FIELDS
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      '';

    // Display marker
    // The mapEvent object contains the longitude and longitude of the place clicked on the map
  }

  renderWorkoutMarker(workout) {
    // We use the coordinates from the workout object to place the marker in the correct position
    L.marker(workout.coords)
      .addTo(this.#map)
      // bindPopup takes in a popup object that we can customize using the given properties in the documentation.
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          // className allows us to use CSS styles on our popups
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.distance)
      .openPopup();
  }
}

const app = new App();
