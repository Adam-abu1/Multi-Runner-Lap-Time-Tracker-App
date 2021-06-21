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

class Application {
    constructor() {
        this.race = new Race();
        this.race.resetRace();
    }

    controls() {
    }

    details() {
    }

    getFinalResults() {
    }

    addRunner() {
        const runnerInput = document.getElementById('inputName');

        if (!this.race.Racing && runnerInput.value) {
            this.race.runners.push(
                new Runner(runnerInput.value)
            );

            document.getElementById('startButton').disabled = false;
        }

        // Clearing of the input field
        runnerInput.value = '';
        runnerInput.focus();
    }

    startRace() {

    }

    endRace() {

    }
}

class Race {
    constructor(runners) {
        this.runners = runners;
        this.racing = false;
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

    finalResults() {
        this.getFastestLap();
    }
}

class Runner {
    constructor(name) {
        this.name = name;
        this.currentLap = 1;
        this.totalRunDuration = 0;
        this.avgLapTime = null;
        this.lapHistory = [];
        this.fastestLap = null;
        this.latestLapStartTime = null;
    }

    /**
     * Taking the total duration of the run divided by the number of completed laps
     */
    calculateAvgLapTime() {
        this.avgLapTime = this.totalRunDuration / this.lapHistory.length;
    }

    /**
     * Calculates time taken to run the lap
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
            lapNumber: this.currentLap,
            time: this.calculateLatestLaptime()
        });

        this.calculateAvgLapTime();
        this.currentLap++;
    }

    /**
     * The time taken for their last lap
     * @return {string}
     */
    get lastLapTime() {
        return this.lapHistory[this.lapHistory.length - 1].time;
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
     * Retrieves the total run time formatted in mm:ss.sss
     * @return {number}
     */
    get totalDuration() {
        this.lapHistory.forEach(lap => {
            this.totalRunDuration += lap.time;
        })

        return this.totalRunDuration;
    }
}
