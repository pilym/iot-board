/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import "semantic-ui-css/semantic.css";
import "semantic-ui-css/semantic";
import "c3css";
import "expose?$!expose?jQuery!jquery";
import "expose?React!react";
import "expose?_!lodash";
import "expose?c3!c3";
import "./pluginApi/freeboardPluginApi";
import "./pluginApi/pluginApi";
import "./app.css";
import "file?name=[name].[ext]!./index.html";
import "es6-promise";
import "react-grid-layout/css/styles.css";
import * as Renderer from "./renderer.js";
import * as Store from "./store";
import * as Persist from "./persistence.js";
import Dashboard from "./dashboard";
import * as $ from 'jquery'
import * as AppState from './appState'

const loadPredefinedState = $.get('./dashboard.json');

loadPredefinedState.then((data) => {
    runWithState(data);
}).fail((error) => {
    if (error.status === 404) {
        // When the file is not available just start the dashboard in devMode
        console.warn("There is no ./dashboard.json - The Dashboard will be loaded in Developer Mode and everything can be edited.\n" +
            "To run the board with a predefined configuration go to 'Board > Import / Export'\n" +
            "and save the exported content in a file named 'dashboard.json' next to the index.html (i.e. './dist/dashboard.json')")
        runWithState();
    }
    else if (confirm("Failed to load Dashboard from dashboard.json\n" +
            "\n" +
            "Try to load in developer mode instated?")) {
        runWithState();
    }
});


function runWithState(configuredState?: AppState.State) {
    let initialState = configuredState;
    let storeOptions = Store.defaultStoreOptions();
    if (!initialState) {
        initialState = <AppState.State>Persist.loadFromLocalStorage();
    } else {
        console.log("Starting with predefined state - no modifications possible.");
        console.log("To configure the dashboard, you have to remove the ./dashboard.json again.");
        storeOptions.persist = false;
        initialState.global = {
            isReadOnly: true,
            devMode: false
        };
    }

    const dashboardStore = Store.create(initialState, storeOptions);


    const appElement = document.getElementById('app');

    if (!appElement) {
        throw new Error("Can not get element '#app' from DOM. Okay for headless execution.");
    }

    function retryLoading(dashboard: Dashboard, error: Error) {
        console.warn("Failed to load dashboard. Asking user to wipe data and retry. The error will be printed below...");
        if (confirm("Failed to load dashboard. Reset all Data?\n\nPress cancel and check the browser console for more details.")) {
            dashboardStore.dispatch(Store.clearState());
            dashboard.dispose();
            start();
        }
        else {
            throw error;
        }
    }

    function start() {
        let dashboard = new Dashboard(dashboardStore);
        dashboard.init();

        try {
            renderDashboard(appElement, dashboardStore);
        }
        catch (error) {
            retryLoading(dashboard, error)
        }
    }

    start();


    function renderDashboard(element: Element, store: Store.DashboardStore) {
        Renderer.render(element, store);
    }

}
