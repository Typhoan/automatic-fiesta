import { GetAvailableRam } from "helpers.js";

/** @param {NS} ns **/
export async function main(ns) {
    let growTime = ns.getGrowTime("home");
    let hackTime = ns.getHackTime("home");
    let weakenTime = ns.getWeakenTime("home");
    ns.tprint("Growth time: " + growTime);
    ns.tprint("Weaken time: " + weakenTime);
    ns.tprint("Hack time: " + hackTime);

    let growWeakenSleep = 0;
    let growSleep = 0;
    let hackSleep = 0;
    let hackWeakenSleep = 0;

    ns.tprint("------------------------------------------------------");
    ns.tprint("Grow Sleep: " + growSleep);
    ns.tprint("Grow-Weaken Sleep: " + growWeakenSleep);
    ns.tprint("Hack Sleep: " + hackSleep);
    ns.tprint("Hack-Weaken Sleep: " + hackWeakenSleep);
    ns.tprint(ns.hackAnalyzeSecurity(1));
    ns.tprint(ns.hackAnalyzeSecurity(2));
    var offset = 0;
    for(var i = 0; i < 5; i++) {
        var schedule = calculateScheduleOffsets(ns, "home", offset);
        offset = schedule.Offset;
        ns.tprint("------------------------------------------------------");
        ns.tprint("Hack Time:        " + (hackTime + schedule.hackSleep));
        ns.tprint("Hack-Weaken Time: " + (weakenTime + schedule.hackWeakenSleep));
        ns.tprint("Grow Time:        " + (growTime + schedule.growSleep));
        ns.tprint("Grow-Weaken Time: " + (weakenTime + schedule.growWeakenSleep));
    }


}


function schedule(ns, targetServer, hostServer, LastScheduledTime) {
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