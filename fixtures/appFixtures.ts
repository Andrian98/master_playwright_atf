import {mergeTests} from "@playwright/test";
import {apiFixtures} from "./apiFixtures";
import {uiFixtures} from "./uiFixtures";


export const test = mergeTests(apiFixtures, uiFixtures);

export {expect} from "@playwright/test";