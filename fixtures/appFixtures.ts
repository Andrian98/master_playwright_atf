import {mergeTests} from "@playwright/test";
import {apiFixtures} from "./apiFixtures";
import {uiFixtures} from "./uiFixtures";
import {loggingFixtures} from "./loggingFixtures";


export const test = mergeTests(loggingFixtures, apiFixtures, uiFixtures);

export {expect} from "@playwright/test";
