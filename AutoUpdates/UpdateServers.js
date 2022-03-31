let servers;
let hacked;

/** @param {NS} ns **/
export async function main(ns) {
	servers = ns.getPurchasedServers();
	hacked = JSON.parse(ns.peek(2));
	ns.print("Got all hacked servers");
	await UpdateHackedServers(ns);
	await UpdatePurchasedServers(ns);
}

async function UpdateHackedServers(ns) {
	for (var x = 0; x < hacked.length; x++) {
		await ns.scp("Hack.script", "home", hacked[x].name);
		ns.exec("Hack.script", hacked[x].name, 1, hacked[x].name, 1);

		for (let y = 0; y < hacked.length; y++) {
			let server = hacked[y].name;
			let cost = GetTotalScriptRamCost(ns);

			StartScripts(ns, server, cost);

		}
	}
	ns.toast("Finished setting up hacked servers", "success", 2000);
}

async function UpdatePurchasedServers(ns){
	for(var x = 0; x < servers.length; x++){
		await CopyScriptsToServer(ns, servers[x]);
	}
}

function StartScripts(ns, serverName, ramCost) {
	var availableRam = ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName);

	var totalThreads = Math.floor(availableRam / ramCost);
	var maxThreads = Math.floor(totalThreads / hacked.length);
	
	var numberServers = hacked.length;

	while (maxThreads <= 0) {
		maxThreads = Math.floor(totalThreads / numberServers);
		numberServers--;
	}

	var remainder = totalThreads - (maxThreads * (numberServers));
	for (var x = 0; x < numberServers; x++) {
		if (availableRam >= ramCost && serverName !== hacked[x].name) {
			if(x === 0){
				ns.exec("Hack.script", serverName, maxThreads+remainder, hacked[x].name, 1);
			}
			else{
				ns.exec("Hack.script", serverName, maxThreads+remainder, hacked[x].name, 1);
			}
		}

		availableRam = ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName);
	}

}

function GetTotalScriptRamCost(ns) {
	return ns.getScriptRam("/HackScripts/Hack.js");
}

async function CopyScriptsToServer(ns, serverName) {
	await ns.scp("/HackScripts/Hack.js", "home", serverName);
	await ns.scp("/HackScripts/Grow.js", "home", serverName);
	await ns.scp("/HackScripts/Weaken.js", "home", serverName);
	await ns.scp("/HackScripts/Share.js", "home", serverName);
	ns.print("Successfully copied files");
}