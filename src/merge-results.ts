#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { cosmiconfig } from 'cosmiconfig';
import QualityWatcher from './qualitywatcher';

dotenv.config();

const resultsDir = path.join(process.cwd(), 'qualitywatcher-results');

async function mergeResults() {
    const files = await fs.readdir(resultsDir);
    const combinedResults = [];
    let payload;
    let suites = [];
    for (const file of files) {
        const filePath = path.join(resultsDir, file);
        const data = await fs.readFile(filePath, 'utf8');
        const { results, ...rest } = JSON.parse(data);
        combinedResults.push(...results);
        suites.push(...rest.suites);
        payload = rest;
    }

    // Read QualityWatcher options from cypress.json or cypress.config.js
    const explorer = cosmiconfig('cypress');
    const config = await explorer.search();
    const reporterOptions = config?.config?.reporterOptions?.qualitywatcher;

    const qualityWatcherOptions = {
        ...reporterOptions,
        password: process.env.QUALITYWATCHER_API_KEY,
        parallel: false,
    };

    const qualitywatcher = new QualityWatcher(qualityWatcherOptions);
    payload.results = combinedResults; // Update results in the last file's payload
    payload.suites = Array.from(new Set(suites)); // Ensure unique suites
    const response = await qualitywatcher.publishResults(payload);

    if (response?.data) {
        console.log('Results merged and published successfully');
        await fs.rm(resultsDir, { recursive: true }); // Clean up results directory
    } else {
        await fs.rm(resultsDir, { recursive: true }); // Clean up results directory
        // write the payload to a file for debugging
        await qualitywatcher.saveResults(payload);
        throw new Error('Failed to merge and publish results');
    }
}

mergeResults().catch(err => {
    console.error(err);
    process.exit(1);
});