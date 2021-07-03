/**
 * Takes in duration in the form of milliseconds, then formats and outputs a string in the form of mm:ss.sss
 *
 * @param duration
 * @return {string}
 */
function timeFormat(duration) {
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    const milliseconds = ((duration % 1000)).toFixed(0);
    return (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds + '.' + (milliseconds >= 10 && milliseconds < 100 ? '0' : '') + (milliseconds < 10 ? '00' : '') + milliseconds;
}

window.addEventListener('DOMContentLoaded', function () {
    app = new Application();
    app.enableButtonControls();
});

class Application {
    constructor() {
        this.race = new Race();
        this.race.resetRace();
    }

    enableButtonControls() {
        const inputName = document.getElementById('inputName'),
            btnAdd = document.getElementById('addRunner'),
            btnStr = document.getElementById('startButton'),
            btnEnd = document.getElementById('endButton');

        inputName.addEventListener('keyup', function (evt) {
            evt.preventDefault();
            // Number 13 is the "Enter" key on the keyboard
            if (evt.keyCode === 13) this.addRunner();
        }.bind(this));

        btnAdd.addEventListener('click', function () {
            btnAdd.disabled = false;
            btnStr.disabled = false;
            btnEnd.disabled = true;
            this.addRunner();
        }.bind(this));

        btnStr.addEventListener('click', function () {
            inputName.readOnly = true;
            btnAdd.disabled = true;
            btnStr.disabled = true;
            btnEnd.disabled = false;
            this.disableRunnerBtns(false);
            this.startRace();
        }.bind(this));

        btnEnd.addEventListener('click', function () {
            inputName.readOnly = false;
            btnAdd.disabled = false;
            btnEnd.disabled = true;
            this.disableRunnerBtns(true);
            this.endRace();
        }.bind(this));
    }

    disableRunnerBtns(shouldDisable) {
        const runnerBtns = document.getElementsByClassName('runner-name-button');

        for (let i = 0; runnerBtns.length; i++) {
            runnerBtns[i].disabled = shouldDisable;
        }
    }

    updateDetails(runner) {
        const tablebodyEl = document.getElementById('tableBody');

        let runnerRow = document.createElement('tr'),
            runnerNameCell = document.createElement('td'),
            runnerNameBtn = document.createElement('button'),
            runnerLapCount = document.createElement('td'),
            runnerTotalTime = document.createElement('td'),
            runnerAverageTime = document.createElement('td'),
            runnerLastLapTime = document.createElement('td');

        runnerNameBtn.innerText = runner.name;
        runnerLapCount.innerText = runner.lapCount;
        runnerTotalTime.innerText = runner.totalDuration ? timeFormat(runner.totalDuration) : timeFormat(0);
        runnerAverageTime.innerText = runner.avgLapTime ? timeFormat(runner.avgLapTime) : timeFormat(0);
        runnerLastLapTime.innerText = runner.lastLapTime ? timeFormat(runner.lastLapTime) : timeFormat(0);

        runnerNameBtn.className = 'btn btn-warning';
        runnerNameBtn.disabled = true;
        runnerNameCell.appendChild(runnerNameBtn);
        runnerRow.appendChild(runnerNameCell);
        runnerRow.appendChild(runnerLapCount);
        runnerRow.appendChild(runnerTotalTime);
        runnerRow.appendChild(runnerAverageTime);
        runnerRow.appendChild(runnerLastLapTime);
        tablebodyEl.appendChild(runnerRow);

        runnerNameBtn.addEventListener('click', function () {
            if (app.race.racing) {
                runner.finishLap();
            }
        });
    }

    updateInfo() {
        const result = this.race.getFinalResults();

        document.getElementById('raceWinner').innerHTML = result.raceWinner.name;
        document.getElementById('winnerLaps').innerHTML = result.raceWinner.lapData.lapCount;
        document.getElementById('winnersRunDuration').innerHTML = timeFormat(result.raceWinner.lapData.runDuration);

        document.getElementById('fastestName').innerHTML = result.fastestLap.name;
        document.getElementById('fastestLap').innerHTML = result.fastestLap.fastestLap.lapData.lapNumber;
        document.getElementById('fastestTime').innerHTML = timeFormat(result.fastestLap.lapData.time);
    }

    addRunner() {
        const runnerInput = document.getElementById('inputName');
        const newRunner = new Runner(runnerInput.value);

        if (!this.race.Racing && runnerInput.value) {
            this.race.runners.push(newRunner);

            this.updateDetails(newRunner);
            document.getElementById('startButton').disabled = false;
        }

        // Clearing of the input field
        runnerInput.value = '';
        runnerInput.focus();
    }

    startRace() {
        this.race.startRace();
        this.updateInfo();
    }

    endRace() {
        this.race.endRace();
        this.updateInfo();
        this.race.resetRace();
    }
}

class Race {
    constructor(runners) {
        this.runners = runners;
        this.racing = false;
        this.raceWinner = {
            name: '',
            lapData: {
                lapCount: '',
                totalDuration: ''
            }
        }
    }

    startRace() {
        this.startTime = new Date();
        this.racing = true;
        this.runners.forEach((runner) => {
            runner.latestLapStartTime = this.startTime;
        });
    }

    endRace() {
        this.raceEndTime = new Date();
        this.totalDuration = this.raceEndTime - this.startTime;

    }

    resetRace() {
        this.runners = [];
        this.startTime = this.raceEndTime = null
    }

    /**
     * Compares all the best times of each runner and picks out the fastest lap
     */
    getFastestLap() {
        const runnerBestLaps = [];
        this.runners.forEach(runner => {
            runnerBestLaps.push({
                name: runner.name,
                lapData: runner.fastestLap
            });
        })

        const times = [];
        runnerBestLaps.forEach(runnerInfo => {
            times.push(runnerInfo.lapData.time)
        });

        this.fastestLap = runnerBestLaps.find(runnerInfo => {
            return runnerInfo.lapData.time === Math.max(...times);
        });
    }

    getRaceWinner() {
        this.runners.forEach(runner => {
            if (runner.lapCount > this.raceWinner.lapData.lapCount) {
                this.raceWinner = {
                    name: runner.name,
                    lapData: {
                        lapCount: runner.lapCount,
                        runDuration: runner.runDuration
                    }
                };
            } else if (runner.lapCount === this.raceWinner.lapData.lapCount) {
                if (runner.totalDuration < this.raceWinner.lapData.totalDuration) {
                    this.raceWinner = {
                        name: runner.name,
                        lapData: {
                            lapCount: runner.lapCount,
                            runDuration: runner.runDuration
                        }
                    };
                }
            }
        });
    }

    getFinalResults() {
        this.getRaceWinner();
        this.getFastestLap();
    }
}

class Runner {
    constructor(name) {
        this.name = name;
        this.lapCount = 1;
        this.totalRunDuration = 0;
        this.lapHistory = [];
        this.latestLapStartTime = null;
    }

    /**
     * Taking the total duration of the run divided by the number of completed laps
     */
    get avgLapTime() {
        return this.totalRunDuration / this.lapHistory.length;
    }

    /**
     * Calculates time taken to run the last lap
     * @return {number}
     */
    calculateLatestLaptime() {
        return new Date() - this.latestLapStartTime;
    }

    /**
     * Adding the most recent Lap to the runner's history and incrementing the lap.
     * Lap info includes the lap number and time taken to run it
     * Will also recalculate the the avg lap time
     */
    finishLap() {
        this.lapHistory.push({
            lapNumber: this.lapCount,
            time: this.calculateLatestLaptime()
        });

        this.lapCount++;
    }

    /**
     * The time taken for their last lap
     * @return {string}
     */
    get lastLapTime() {
        return this.lapHistory.length ? this.lapHistory[this.lapHistory.length - 1].time : 0;
    }

    /**
     * Finds the fastest lap ran
     * @return {object|undefined}
     */
    get fastestLap() {
        const times = [];
        this.lapHistory.forEach(lap => {
            times.push(lap.time);
        });

        return this.lapHistory.find(lap => {
            return lap.time === Math.max(...times)
        });
    }

    /**
     * Retrieves the total run time in milliseconds
     * @return {number}
     */
    get totalDuration() {
        this.lapHistory.forEach(lap => {
            this.totalRunDuration += lap.time;
        })

        return this.totalRunDuration;
    }
}
