const estimatedTimeDifference = 4;
const percentOfGrowth = .8;
const miliToSec = 1000;
const minValue = 1000;

let hackedServers;
let serverSet;
let network;
let hackingLevel;

/** @param {NS} ns **/
export async function main(ns) {
	hackedServers = [];
	serverSet = [];
	serverSet.push("home");
	serverSet.push("darkweb");
	hackingLevel = 0;


	while (true) {
		if (ns.getHackingLevel() < 10 || ns.getHackingLevel() - hackingLevel > 10) {
			await MapNetworkMap(ns);
			hackingLevel = ns.getHackingLevel();
		}
		await ns.sleep(1000 * 60 * 5);
	}
}

async function MapNetworkMap(ns) {
	network = ns.scan();
	while (network[network.length - 1] != null) {
		var server = network.pop();
		ns.print("processing: " + server);

		//remove owned servers and previously seen servers
		if (!server.includes("HackBot") && !serverSet.includes(server)) {

			// check if you already have root
			if (ns.hasRootAccess(server)) {
				if (ns.getServerMaxMoney(server) != 0) {
					hackedServers.push({ name: server, value: EstimateIncome(ns, server) });
				}
				
				serverSet.push(server);

				ns.print("Added " + server + " To existing hacked list");
				GetNearByNodes(ns, server);
			}
			else {
				//check if you can hack it
				if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) {
					ns.print("Attempting to hack: " + server);
					if (OpenPorts(ns, server)) {
						if (ns.getServerMaxMoney(server) != 0) {
							hackedServers.push({ name: server, value: EstimateIncome(ns, server) });
						}
						ns.print("Hacked: " + server);
						
					}
					GetNearByNodes(ns, server);
					serverSet.push(server);
				}
				else {
					GetNearByNodes(ns, server);
					serverSet.push(server);
					ns.print("Missing reqs to hack: " + server);
				}
			}
		}
	}

	await SaveData(ns);
	await RunScripts(ns);
}

async function RunScripts(ns) {
	ns.kill("/AutoUpdates/PurchaseServers.js", "home");
	ns.kill("/AutoUpdates/Dispatcher.js", "home");
	await ns.exec("/AutoUpdates/KillSwitch.js", "home", 1);
	await ns.exec("/AutoUpdates/PurchaseServers.js", "home", 1);
	await ns.exec("/AutoUpdates/UpdateServers.js", "home", 1);
	await ns.exec("/AutoUpdates/Dispatcher.js", "home", 1);
}

async function SaveData(ns) {

	let sorted = hackedServers.sort((a, b) => { return b.value - a.value })
	ns.clearPort(1);
	ns.clearPort(2);
	await ns.writePort(1, JSON.stringify(serverSet));
	await ns.writePort(2, JSON.stringify(sorted));
	ns.toast("Completed network scan", "success", 2000);
}

function GetNearByNodes(ns, serverName) {
	let nearByServers = ns.scan(serverName);
	for (var x = 0; x < nearByServers.length; x++) {
		if (!serverSet.includes(nearByServers[x])) {
			network.push(nearByServers[x]);
		}
	}
}


function OpenPorts(ns, serverName) {

	var server = ns.getServer(serverName);
	var openPorts = 0;
	if (ns.fileExists("BruteSSH.exe") && server.sshPortOpen == false) {
		ns.brutessh(serverName);
		openPorts++;
	}
	else if(server.sshPortOpen){
		openPorts++;
	}

	if (ns.fileExists("SQLInject.exe") && server.sqlPortOpen == false) {
		ns.sqlinject(serverName);
		openPorts++;
	}
	else if(server.sqlPortOpen){
		openPorts++;
	}

	if (ns.fileExists("relaySMTP.exe") && server.smtpPortOpen == false) {
		ns.relaysmtp(serverName);
		openPorts++;
	}
	else if(server.smtpPortOpen){
		openPorts++;
	}

	if (ns.fileExists("HTTPWorm.exe") && server.httpPortOpen == false) {
		ns.httpworm(serverName);
		openPorts++;
	}
	else if(server.httpPortOpen){
		openPorts++;
	}

	if (ns.fileExists("FTPCrack.exe") && server.ftpPortOpen == false) {
		ns.ftpcrack(serverName);
		openPorts++;
	}
	else if(server.ftpPortOpen){
		openPorts++;
	}

	if (server.numOpenPortsRequired <= openPorts) {
		ns.nuke(serverName);
		return true;
	}

	return false;
}

function EstimateIncome(ns, serverName) {
	let estimatedMaxCash = ns.getServerMaxMoney(serverName) * percentOfGrowth;
	let securityRatio = ns.getServerMinSecurityLevel(serverName) / ns.getServerSecurityLevel(serverName);
	let estimatedWeakenTime = ns.getWeakenTime(serverName) * (securityRatio);

	return estimatedMaxCash / (estimatedWeakenTime / (miliToSec * estimatedTimeDifference));
}