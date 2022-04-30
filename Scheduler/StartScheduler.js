import { getOwnedServers } from "/helpers.js";
import { makeHackedServersPristine } from "/Scheduler/MakeServersPristine.js";
import { getMostProfitableServers } from "/Scheduler/GetMostProfitableServers.js";
import { schedule } from "/Scheduler/Scheduler.js";

/** @param {NS} ns **/
export async function main(ns) {

    let ownedServers = getOwnedServers(ns)

    let hackedServers = ownedServers.filter(server => server.moneyMax > 0);
    let agentServers = ownedServers.filter(server => server.hostname.includes("HackBot") || server.hostname.includes("Home")).sort((a,b) => b.maxRam - a.maxRam);

    await makeHackedServersPristine(ns, hackedServers, agentServers);

    for(let x =0; x< agentServers.length; x++) {
        await CopyScriptsToServer(ns, agentServers[x].hostname);
    }

    // find the most profitable hacked servers, and find agent server with most available ram. 
    let mostProfitableServers = await getMostProfitableServers(ns, hackedServers);

    // now that servers are pristine and ordered use a scheduler to schedule scripts to be exectuted on them.

    let numberServersToHack = Math.min(mostProfitableServers.length, agentServers.length);

    let LastScheduledTime = [];
    for (let i = 0; i < numberServersToHack; i++) {
        LastScheduledTime.push(0);
    }

    while(true){

        for (let i = 0; i < 1; i++) {
            LastScheduledTime[i] = await schedule(ns, mostProfitableServers[i], agentServers[i], LastScheduledTime[i]);
        }

        await ns.sleep(4000);
    }

}

async function CopyScriptsToServer(ns, serverName) {
	await ns.scp("/SchedulerScripts/Hack.js", "home", serverName);
	await ns.scp("/SchedulerScripts/Grow.js", "home", serverName);
	await ns.scp("/SchedulerScripts/Weaken.js", "home", serverName);
	ns.print("Successfully copied files");
}