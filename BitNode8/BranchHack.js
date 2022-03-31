let serverSet;
let hacked;
let network;
let hackingLevel;

/** @param {NS} ns **/
export async function main(ns) {
	serverSet = [];
	hacked =[];
	serverSet.push("home");
	serverSet.push("darkweb");
	hackingLevel = 0;
	ns.disableLog("ALL");

	while (true) {
		if (ns.getHackingLevel() < 10 || ns.getHackingLevel() - hackingLevel > 10) {
			await MapNetwork(ns);
			await SetUpPurchasedServers(ns);
			hackingLevel = ns.getHackingLevel();
		}
		
		await ns.sleep(1000 * 60 * 5);
	}
}

async function MapNetwork(ns) {
	network = ns.scan();
	while (network[network.length - 1] != null) {
		var server = network.pop();
		ns.print("processing: " + server);

		//remove owned servers and previously seen servers
		if (!server.includes("HackBot") && !serverSet.includes(server)) {

			// check if you already have root
			if (ns.hasRootAccess(server)) {
				hacked.push(server);
				serverSet.push(server);

				ns.print("Added " + server + " To existing hacked list");
				GetNearByNodes(ns, server);
				await CopyScriptsToServer(ns, server);
			}
			else {
				//check if you can hack it
				if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) {
					ns.print("Attempting to hack: " + server);
					if (OpenPorts(ns, server)) {
						hacked.push(server);
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
	ns.kill("/BitNode8/Dispatcher.js", "home");
	await ns.exec("/BitNode8/Dispatcher.js", "home", 1);
}


async function CopyScriptsToServer(ns, serverName) {
	await ns.scp("/HackScripts/Hack.js", "home", serverName);
	await ns.scp("/HackScripts/Grow.js", "home", serverName);
	await ns.scp("/HackScripts/Weaken.js", "home", serverName);
	await ns.scp("/HackScripts/Share.js", "home", serverName);
	ns.print("Successfully copied files");
}

async function SetUpPurchasedServers(ns){
	var purchased = ns.getPurchasedServers();
	for(var x =0; x < purchased.length; x++){
		await CopyScriptsToServer(ns, purchased[x]);
	}
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
		var sourceFiles = ns.getOwnedSourceFiles();
		if (sourceFiles.filter(e => e.n === 4).length > 0) {
			if (!server.backdoorInstalled && (server.hostname === 'avmnite-02h' || server.hostname === 'I.I.I.I' || server.hostname === 'run4theh111z' || server.hostname === 'CSEC' || server.hostname === 'w0r1d_d43m0n')){
				await ns.installBackdoor();
			}
		}
		return true;
	}

	return false;
}

async function SaveData(ns) {
	ns.clearPort(1);
	await ns.writePort(1, JSON.stringify(serverSet));
	ns.clearPort(2);
	await ns.writePort(2, JSON.stringify(hacked));
	ns.toast("Completed network scan", "success", 2000);
}