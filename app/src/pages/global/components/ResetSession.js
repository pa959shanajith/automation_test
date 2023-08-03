import { keepSessionAlive } from "../api";

const ResetSession = {
    poll: function pollingCall() {
        keepSessionAlive()
        .then(data=> console.debug("User Session Extended"))
        .catch(error => console.error("Failed to extend User Session.\nCause:", error));
    },
    start: function startInterval() {
        this.poll();
        this.eventid = setInterval(function(pollCall){ pollCall(); }, 1200000, this.poll);
    },
    end: function endInterval() {
        clearInterval(this.eventid);
        this.poll();
    }
};

export default ResetSession;