import {initializeLogger} from "./utils/logger";
import {stopResourceMonitor} from "./utils/resourceMonitor";

export default async function globalTeardown() {
    initializeLogger();
    stopResourceMonitor();
}
