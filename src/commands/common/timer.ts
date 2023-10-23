/**
 * Timer class. Used for sleep functionaity.
 */

export class Timer {
    /**
     * Sleep
     * @param ms
     * @param callback
     */
    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)

            return resolve;
        });
    }
}

export const timer = new Timer();