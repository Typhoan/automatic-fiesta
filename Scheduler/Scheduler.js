import { getAvailableRam } from "/helpers.js";

/**
 * 
 * @param {NS} ns - The namespace object.
 * @param {Server} targetServer - The target server.
 * @param {Server} hostServer - The server that is running the script.
 * @param {Number} LastScheduledTime - The last time the server was scheduled in milliseconds.
 * @returns {Number} - The time the last scheduled event the server will execute in milliseconds.
 */

 export async function schedule(ns, targetServer, hostServer, LastScheduledTime) {
    let availableRam = GetAvailableRam(ns, hostServer);
    let scriptCost = ns.getScriptCost("/SchedulerScripts/Hack.js");

    var hackWeakenActions = 0;
	var growthActions = 0;
    var growWeakenActions = 0;
	
    var amountMoneyHacked = hackAnalyze(targetServer.hostname);
    var percentToGrowBy =  targetServer.moneyMax / (targetServer.moneyAvailable - amountMoneyHacked);
    growthActions = ns.growthAnalyze(targetServer.hostname, percentToGrowBy);

    var hackSecurityIncrease = ns.hackAnalyzeSecurity(1);
    hackWeakenActions = hackSecurityIncrease / .05;

    var growSecurityIncrease = ns.growthAnalyzeSecurity(growthActions);
    growWeakenActions = growSecurityIncrease / .05;

    var totalActionRamCost = scriptCost * (hackWeakenActions + growWeakenActions +1);

    let offSetTime = 0;
    var startTime = new Date().getTime();

    if(LastScheduledTime > 0){
        offSetTime = startTime - LastScheduledTime;
    }

    while( totalActionCost <= availableRam){
        var schedule = calculateScheduleOffsets(ns, targetServer.hostname, growTime, hackTime, weakenTime, offSetTime);
        offSetTime = schedule.Offset;
        availableRam -= totalActionRamCost;
        await ns.runScript("/SchedulerScripts/Hack.js",   hostServer.hostname, 1,                   schedule.Target.hostname, schedule.HackSleep);
        await ns.runScript("/SchedulerScripts/Weaken.js", hostServer.hostname, hackWeakenActions,   schedule.Target.hostname, schedule.HackWeakenSleep);
        await ns.runScript("/SchedulerScripts/Grow.js",   hostServer.hostname, growthActions,       schedule.Target.hostname, schedule.GrowSleep);
        await ns.runScript("/SchedulerScripts/Weaken.js", hostServer.hostname, growWeakenActions,   schedule.Target.hostname, schedule.GrowWeakenSleep);
    }

    return startTime + offSetTime + schedule.weakenTime;
}

/**
 * Calculates the offset for hacking actions.
 * @param {string} target - The target server name.
 * @returns {{Target: target, GrowSleep: growSleep, GrowWeakenSleep: growWeakenSleep, HackSleep: hackSleep, HackWeakenSleep: hackWeakenSleep}} - Returns an object with the target server name, grow sleep, grow weaken sleep, hack sleep, and hack weaken sleep.
 */
function calculateScheduleOffsets(ns, target, growTime, hackTime, weakenTime, offset) {
    let hackSleep = offset;
    let hackWeakenSleep = offset;
    let growSleep = offset;
    let growWeakenSleep = offset;

    if (weakenTime > hackTime && weakenTime > growTime) {
        hackSleep += weakenTime - hackTime - 25;
        hackWeakenSleep += 0;
        growSleep += weakenTime - growTime + 25;
        growWeakenSleep += 50;
    }

    return { Target: target, growSleep: growSleep, growWeakenSleep: growWeakenSleep, hackSleep: hackSleep, hackWeakenSleep: hackWeakenSleep, Offset: offset + 100 };
}