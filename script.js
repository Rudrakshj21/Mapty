'use strict';

class Workout {
  #id = crypto.randomUUID().slice(-10); // random id generator of 10 chars
  #date = new Date();
  #coords;
  #distance;
  #duration;
  #description;

  constructor(coords, distance, duration) {
    this.#coords = coords; // [latitude,longitude]
    this.#distance = distance; // in kms
    this.#duration = duration; // in
  }
  get _coords() {
    return this.#coords;
  }
  get _id() {
    return this.#id;
  }
  get _duration() {
    return this.#duration;
  }
  get _distance() {
    return this.#distance;
  }
  get _coords() {
    return this.#coords;
  }
  get _id() {
    return this.#id;
  }
  click() {}
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
     'September', 'October', 'November', 'December'];
    this.#description = `${this.type[0].toUpperCase()}${this.type.slice(
      1
    )} on ${months[this.#date.getMonth()]} ${this.#date.getDate()}`;
  }
  _getDescription() {
    return this.#description;
  }
}
class Running extends Workout {
  #cadence;
  #pace;
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.#cadence = cadence;
    this.#pace = this.calcPace();
    this._setDescription();
  }
  calcPace() {
    // min / km

    const pace = this._duration / this._distance;
    return pace;
  }
  get _pace() {
    return this.#pace;
  }
  get _cadence() {
    return this.#cadence;
  }
}

// console.log(new Running(1, 2, 10, 1, 1, 1));
class Cycling extends Workout {
  #elevationGain;
  #speed;
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.#elevationGain = elevationGain;
    this.#speed = this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    // km/h
    const speed = this._distance / this._duration / 60;
    return speed;
  }
  get _speed() {
    return this.#speed;
  }

  get _elevationGain() {
    return this.#elevationGain;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// APPLICATION ARCHITECTURE
class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 13;
  #workouts = [];
  constructor() {
    this._getPosition();
    // since _newWorkout's this == form element we need to change it to app's object
    form.addEventListener('submit', this._newWorkOut.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);

    // event delegation
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  // gets current position of user
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // success handler
        // note :- since we need the this keyword to access object to eventually access the private field #map we would need
        // to bind the this keyword of the success handler to the 'this' of our class as it is a regular function call hence it's this = undefined
        this._loadMap.bind(this),
        // failure handler
        function () {
          alert('Could not get your position');
        }
      );
    }
  }
  // loads map based on user location
  _loadMap(position) {
    // console.log(this); points to App after binding
    // console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(latitude, longitude);
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}?`);
    //   coordinates
    const coords = [latitude, longitude];
    //   browser is successful in getting coordinates
    // load map

    // console.log(this);
    // default map view
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    // console.log(map);
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // handling click on map
    // prettier-ignore
    this.#map.on( 'click',this._showForm.bind(this))
    // again binding as this pointed to map and not app
  }

  // displays the formxx
  _showForm(mapE) {
    // console.log(this);
    this.#mapEvent = mapE;
    // console.log(this);
    // on click the form is shown
    form.classList.remove('hidden');
    // focus is kept on input distance
    inputDistance.focus();
  }

  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputDistance.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    form.style.display = 'grid';
  }

  // toggles cadence or elevation gain field based on type being either running or cycling
  _toggleElevationField() {
    const selectedType = inputType.value;
    // console.log(selectedType);
    // console.log(inputCadence.parentElement);
    inputCadence.parentElement.classList.toggle('form__row--hidden');
    inputElevation.parentElement.classList.toggle('form__row--hidden');
  }

  _newWorkOut(event) {
    event.preventDefault();

    function checkValidInput(...inputs) {
      // even if one of inputs returns false final result will be returned as false
      return inputs.every(currentInput => {
        return Number.isFinite(currentInput);
      });
    }

    const allPositive = (...inputs) => inputs.every(input => input > 0);

    // Get data from form
    // common in both types
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;

    let workout;
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // check if data is valid
      // console.log(allPositive(cadence, distance, duration));
      if (
        // !Number.isFinite(distance) ||  !Number.isFinite(duration) || !Number.isFinite(cadence)
        // none of these 3 can be -ve;
        !checkValidInput(cadence, distance, duration) ||
        !allPositive(cadence, distance, duration)
      ) {
        return alert('invalid input value');
      }
      // if workout type is running create running object
      workout = new Running([lat, lng], distance, duration, cadence);
      // // add new running object to workout array
    }

    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;
      if (
        // elevation gain can be -ve but not distance and duration
        !checkValidInput(distance, duration, elevationGain) ||
        !allPositive(distance, duration)
      ) {
        return alert('invalid input value');
      }
      // if workout type is cycling create cycling object
      workout = new Cycling([lat, lng], distance, duration, elevationGain);
      // // add new cycling object to workout array
      // this.#workouts.push(workout);
    }
    // add new object to array
    this.#workouts.push(workout);

    // console.log('pushing', this.#workouts);
    // render the workout on the map as marker

    this._renderWorkoutMarker(workout);
    // console.log(this.#mapEvent);

    // render the workout on the list
    this._renderWorkout(workout);
    // hide the form and clear input fields

    this._hideForm(); // clearing fields after form is submitted

    // Set local storage to all workouts
    this._setLocalStorage();
  }
  _renderWorkoutMarker(workout) {
    const coords = workout._coords;
    // console.log(workout);
    // adding marker to the position where click happens
    L.marker(coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
        // can also use .setContent on pop()
      )
      .setPopupContent(
        `${
          workout.type === 'running' ? '🏃‍♂️' : '🚴'
        } ${workout._getDescription()}`
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    // console.log(workout);
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout._id
    }">
          <h2 class="workout__title">${workout._getDescription()}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴'
            }</span>
            <span class="workout__value">${workout._distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout._duration}</span>
            <span class="workout__unit">min</span>
          </div>
          `;
    if (workout.type === 'running') {
      html += ` <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout._pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout._cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }
    if (workout.type === 'cycling') {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout._speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout._elevationGain.toFixed(
              1
            )}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(e) {
    // console.log(e.target.closest('.workout'));

    const closestWorkoutParent = e.target.closest('.workout');
    if (!closestWorkoutParent) return;

    const targetId = closestWorkoutParent.getAttribute('data-id');
    // console.log(targetId);
    const targetObject = this._getTargetElementObject(targetId)[0];
    // console.log(targetObject);
    const targetCoords = targetObject._coords;
    // console.log(targetCoords);
    this.#map.setView(targetCoords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }
  _getTargetElementObject(id) {
    // console.log('in get target');
    // console.log(this.#workouts);
    const targetObject = this.#workouts.filter(workout => {
      return workout._id === id;
    });
    return targetObject;
  }

  _setLocalStorage() {
    // console.log(this.#workouts);
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    // console.log(typeof localStorage.getItem('workouts'));
  }
}

const app = new App();
