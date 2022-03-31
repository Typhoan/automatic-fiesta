var counter;
const basePower = 8;

/** @param {NS} ns **/
export async function main(ns) {

	while (true) {
		counter = ns.getPurchasedServers().length;
		var power = basePower + Math.floor(counter / 2);
		var ram = Math.pow(2, power);
		var server;
		if (ram > ns.getPurchasedServerMaxRam()) {
			server = ns.purchaseServer("HackBot", ns.getPurchasedServerMaxRam());
		} else {
			server = ns.purchaseServer("HackBot", ram);
		}
		if (server !== "") {
			ns.toast("Purchased server: " + server, "success", 2000);
			await CopyScriptsToServer(ns, server);
		}
		else {
			await ns.sleep(36000);
		}
	}
}

async function CopyScriptsToServer(ns, serverName) {
	await ns.scp("/HackScripts/Hack.js", "home", serverName);
	await ns.scp("/HackScripts/Grow.js", "home", serverName);
	await ns.scp("/HackScripts/Weaken.js", "home", serverName);
	await ns.scp("/HackScripts/Share.js", "home", serverName);
	ns.print("Successfully copied files");
}