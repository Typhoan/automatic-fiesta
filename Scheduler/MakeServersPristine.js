import {getMaxThreads, areServerScriptsRunning} from "helpers.js"

let ns; 

/** 
 * Makes all hacked servers pristine.
 * @param {NS} NS - The namespace object.
 * @param {Array<Server>[]} hackedServers - The hacked servers.
 * @param {Array<Server>[]} agentServers - The agent servers.
 * **/
export async function makeHackedServersPristine(NS, hackedServers, agentServers) {
    ns = NS;;
    let pristineServers = [];

    while (pristineServers.length != hackedServers.length) {
        if (hackedServers.length <= agentServers.length) {
            for (var x = 0; x < hackedServers.length; x++) {
                processServer(hackedServers, x, agentServers, pristineServers, ns);
            }
        }
        else if(hackedServers.length > agentServers.length){
            for (var x = 0; x < agentServers.length; x++) {
                processServer(hackedServers, x, agentServers, pristineServers, ns);
            }
        }
        await ns.sleep(60000);
    }
}

/**
 * Processes a server.
 * @param {Array<Server>[]} hackedServers 
 * @param {number} x 
 * @param {Array<Server>[]} agentServers 
 * @param {Array<Server>[]} pristineServers 
 */
function processServer(hackedServers, x, agentServers, pristineServers) {
    var target = hackedServers[x];
    var server = agentServers[x];

    if (!pristineServers.includes(server)) {
        if (!areServerScriptsRunning(ns, server, target, "/HackScripts/Weaken.js","/HackScripts/Grow.js", "/HackScripts/Hack.js", "/HackScripts/Share.js")) {
            var totalThreads = getMaxThreads(server, ns.getScriptRam("/SchedulerScripts/Weaken.js"));

            if (weakenAndGrowServer(server.hostname, target.hostname, totalThreads, .9, .9)) {
                pristineServers.push(server);
            }
        }
    }
}

/**
 * Weakens a target server to min security level and grows to max cash. Returns true when server is meeting threshholds, else returns false.
 * @param {string} serverName - The server name to run the scripts on. 
 * @param {string} target - The target server to weaken.
 * @param {number} totalActionsAvailable - The total number of actions available to the server.
 * @param {number} securityThreshold - The minimum security level to weaken to.
 * @param {number} moneyThreshold - The maximum cash to grow to.
 * @returns {boolean} - Returns true when server is meeting threshholds, else returns false.
 */
function weakenAndGrowServer(serverName, targetServer, totalActionsAvailable, securityThreshold, moneyThreshold) {
    var maxMoney = ns.getServerMaxMoney(targetServer);
    var currentMoney = ns.getServerMoneyAvailable(targetServer) + 1;
    var percentMoneyAvailable = currentMoney / maxMoney;

    var minSecurity = ns.getServerMinSecurityLevel(targetServer);
    var currentSecurity = ns.getServerSecurityLevel(targetServer); S
    var securityRatio = currentSecurity / minSecurity;

    var isBelowSecurityThreshold = securityRatio >= (minSecurity * securityThreshold);
    var isBelowGrowthThreshold = percentMoneyAvailable < moneyThreshold;

    var weakenActions = 0;
    var growthActions = 0;

    if (isBelowSecurityThreshold) {
        var executionsToWeaken = Math.ceil(((currentSecurity - (minSecurity * securityThreshold)) / .05) * 1.1);
        weakenActions += Math.min(totalActionsAvailable, executionsToWeaken);
        totalActionsAvailable -= weakenActions;
    }

    if (isBelowGrowthThreshold) {
        var targetMoney = 1 / percentMoneyAvailable;
        var executionsToGrow = Math.ceil((ns.growthAnalyze(targetServer, targetMoney)) * 1.1);
        var extraWeakensNeeded = Math.ceil(ns.growthAnalyzeSecurity(executionsToGrow));

        growthActions += Math.min(totalActionsAvailable, executionsToGrow);
        totalActionsAvailable -= growthActions;

        if (totalActionsAvailable > 0) {
            weakenActions += Math.min(totalActionsAvailable, extraWeakensNeeded);
            totalActionsAvailable -= weakenActions;
        }
    }

    if (weakenActions > 0) {
        ns.exec("/HackScripts/Weaken.js", serverName, weakenActions, targetServer);
    }

    if (growthActions > 0) {
        ns.exec("/HackScripts/Grow.js", serverName, growthActions, targetServer);
    }

    if (weakenActions == 0 && growthActions == 0) {
        return true;
    }

    return false;
}