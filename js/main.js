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
