#!/usr/bin/env node
import { installToProject, installGlobal } from "../src/install.js";

const [, , command, flag] = process.argv;

if (command === "init") {
    const global = flag === "--global";
    global ? installGlobal() : installToProject();
}
