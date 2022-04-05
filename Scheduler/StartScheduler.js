import { getOwnedServers } from "/helpers.js";
import { makeHackedServersPristine } from "/Scheduler/MakeServersPristine.js";
import { getMostProfitableServers } from "/Scheduler/GetMostProfitableServers.js";
import { schedule } from "/Scheduler/Scheduler.js";

/** @param {NS} ns **/
export async function main(ns) {
    let ownedServers = getOwnedServers(ns);

    let hackedServers = ownedServers.filter(server => server.moneyMax > 0);
    let agentServers = ownedServers.filter(server => server.hostname.includes("HackBot") || server.hostname.includes("Home")).sort((a,b) => b.maxRam - a.maxRam);

    await makeHackedServersPristine(ns, hackedServers, agentServers);
    // find the most profitable hacked servers, and find agent server with most available ram. 

    let mostProfitableServers = await getMostProfitableServers(ns, hackedServers);

    // now that servers are pristine and ordered use a scheduler to schedule scripts to be exectuted on them.

    let numberServersToHack = Math.min(mostProfitableServers.length, agentServers.length);

    let LastScheduledTime = [];
    for (let i = 0; i < numberServersToHack; i++) {
        LastScheduledTime.push(0);
    }

    while(true){

        for (let i = 0; i < numberServersToHack; i++) {
            offsets[i] = await schedule(ns, mostProfitableServers[i], agentServers[i], LastScheduledTime[i]);
        }

        ns.sleep(4000);
    }

}