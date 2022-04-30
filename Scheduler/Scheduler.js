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
    let availableRam = getAvailableRam(ns, hostServer);
    let scriptCost = ns.getScriptRam("/SchedulerScripts/Hack.js");
    let currentSecurityLevel = ns.getServerSecurityLevel(targetServer.hostname);
    let minSecurityThreshhold = ns.getServerMinSecurityLevel(targetServer.hostname) * .9;
    let maxCashThreshhold = targetServer.moneyMax * .9;

    let growTime = ns.getGrowTime(targetServer.hostname);
    let hackTime = ns.getHackTime(targetServer.hostname);
    let weakenTime = ns.getWeakenTime(targetServer.hostname);

    var hackActions = 0;
    var hackWeakenActions = 0;
    var growthActions = 0;
    var growWeakenActions = 0;

    var amountMoneyHacked = ns.hackAnalyze(targetServer.hostname);
    hackActions = Math.ceil((targetServer.moneyAvailable - maxCashThreshhold) / amountMoneyHacked);

    if (targetServer.moneyAvailable - amountMoneyHacked < maxCashThreshhold) {
        var percentToGrowBy = targetServer.moneyMax / (targetServer.moneyAvailable - (amountMoneyHacked*hackActions));
        growthActions = Math.ceil(ns.growthAnalyze(targetServer.hostname, percentToGrowBy));
    }

    var hackSecurityIncrease = ns.hackAnalyzeSecurity(amountMoneyHacked*hackActions);
    if(currentSecurityLevel - hackSecurityIncrease < minSecurityThreshhold) {
        hackWeakenActions = Math.ceil(hackSecurityIncrease / .05);
    }

    var growSecurityIncrease = ns.growthAnalyzeSecurity(growthActions);
    if(currentSecurityLevel - hackSecurityIncrease - growSecurityIncrease < minSecurityThreshhold) {
        growWeakenActions = Math.ceil(growSecurityIncrease / .05);
    }

    var totalActionRamCost = scriptCost * (hackWeakenActions + growWeakenActions + 1);

    let offSetTime = 0;
    var startTime = new Date().getTime();

    if (LastScheduledTime > 0) {
        offSetTime = startTime - LastScheduledTime;
    }

    ns.tprint("Growth time: " + growTime);
    ns.tprint("Weaken time: " + weakenTime);
    ns.tprint("Hack time: " + hackTime);

    while (totalActionRamCost <= availableRam) {
        var schedule = calculateScheduleOffsets(ns, targetServer.hostname, growTime, hackTime, weakenTime, offSetTime);
        offSetTime = schedule.Offset;
        availableRam -= totalActionRamCost;
        if(hackActions > 0){
            await ns.exec("/SchedulerScripts/Hack.js", hostServer.hostname, hackActions, schedule.Target, schedule.HackSleep);
        }

        if(hackWeakenActions > 0)
        {
            await ns.exec("/SchedulerScripts/Weaken.js", hostServer.hostname, hackWeakenActions, schedule.Target, schedule.HackWeakenSleep);
        }

        if(growthActions > 0)
        {
            await ns.exec("/SchedulerScripts/Grow.js", hostServer.hostname, growthActions, schedule.Target, schedule.GrowSleep);
        }

        if(growWeakenActions > 0)
        {
            await ns.exec("/SchedulerScripts/Weaken.js", hostServer.hostname, growWeakenActions, schedule.Target, schedule.GrowWeakenSleep);
        }
        await ns.sleep(10000);
    }

    return startTime + offSetTime + weakenTime;
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

    return { Target: target, GrowSleep: growSleep, GrowWeakenSleep: growWeakenSleep, HackSleep: hackSleep, HackWeakenSleep: hackWeakenSleep, Offset: offset + 100 };
}