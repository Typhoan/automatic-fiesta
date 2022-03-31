var servers;
var hacked;
const moneyThreshold = .95;
const securityThreshold = 1.05;



/** @param {NS} ns **/
export async function main(ns) {
	while (true) {
		servers = ns.getPurchasedServers();
		hacked = JSON.parse(ns.peek(1));
		var player = ns.getPlayer();
		var shouldShare = false;
			DispatchHome(ns);

		if(player.isWorking){
			shouldShare = true;
		}
		Dispatch(ns, shouldShare);
		await ns.sleep(500);
	}
}


function DispatchHome(ns) {
		var serverName = 'home';
		ns.print("-------" + serverName + "-------");
		var endedScripts = GetServerEndedScripts(ns, serverName);
		var numberServers = endedScripts.length;

		var availableRam = (ns.getServerMaxRam(serverName)*.95) - ns.getServerUsedRam(serverName);

		var totalThreads = Math.floor(availableRam / ns.getScriptRam("/HackScripts/Weaken.js"));
		var maxThreads = Math.floor(totalThreads / numberServers);

		for (var y = 0; y < endedScripts.length; y++) {
			var targetServer = endedScripts[y];
			ns.print("___________" + targetServer + "___________");
			DetermineActions(ns, serverName, targetServer, maxThreads, false)
		}
		ns.print(" ");
}

function Dispatch(ns, shouldShare) {
	for (var x = 0; x < servers.length; x++) {
		var serverName = servers[x];
		ns.print("-------" + serverName + "-------");
		var endedScripts = GetServerEndedScripts(ns, serverName);
		var numberServers = endedScripts.length;

		var availableRam = ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName);

		var totalThreads = Math.floor(availableRam / ns.getScriptRam("/HackScripts/Weaken.js"));
		var maxThreads = Math.floor(totalThreads / numberServers);

		for (var y = 0; y < endedScripts.length; y++) {
			var targetServer = endedScripts[y];
			ns.print("___________" + targetServer + "___________");
			DetermineActions(ns, serverName, targetServer, maxThreads, shouldShare)
		}
		ns.print(" ");
	}
}

function TargetServerScriptsRunning(ns, serverName, targetServer) {
	return ns.isRunning("/HackScripts/Weaken.js", serverName, targetServer) ||
		ns.isRunning("/HackScripts/Grow.js", serverName, targetServer) ||
		ns.isRunning("/HackScripts/Hack.js", serverName, targetServer) ||
		ns.isRunning("/HackScripts/Share.js", serverName, targetServer)
}

function GetServerEndedScripts(ns, serverName) {
	var endedScripts = []
	for (var x = 0; x < hacked.length; x++) {
		if (!TargetServerScriptsRunning(ns, serverName, hacked[x].name)) {
			endedScripts.push(hacked[x].name);
		}
	}
	return endedScripts;
}

function DetermineActions(ns, serverName, targetServer, numberOfThreads, shouldShare) {

	var totalActionsAvailable = numberOfThreads;

	var maxMoney = ns.getServerMaxMoney(targetServer);
	var currentMoney = ns.getServerMoneyAvailable(targetServer) + 1;
	var percentMoneyAvailable = currentMoney / maxMoney;

	var minSecurity = ns.getServerMinSecurityLevel(targetServer);
	var currentSecurity = ns.getServerSecurityLevel(targetServer);
	var securityRatio = currentSecurity / minSecurity;

	var isBelowSecurityThreshold = securityRatio >= (minSecurity * securityThreshold);
	var isBelowGrowthThreshold = percentMoneyAvailable < moneyThreshold;

	var weakenActions = 0;
	var growthActions = 0;
	var hackActions = 0;

	if (isBelowSecurityThreshold) {
		var executionsToWeaken = Math.ceil(((currentSecurity - (minSecurity * securityThreshold)) / .05) * 1.1);
		weakenActions += CalculateRemainingActions(totalActionsAvailable, executionsToWeaken);
		totalActionsAvailable -= weakenActions;
	}

	if (isBelowGrowthThreshold) {
		var targetMoney = 1 / percentMoneyAvailable;
		var executionsToGrow = Math.ceil((ns.growthAnalyze(targetServer, targetMoney)) * 1.1);
		var extraWeakensNeeded = Math.ceil(ns.growthAnalyzeSecurity(executionsToGrow));

		growthActions += CalculateRemainingActions(totalActionsAvailable, executionsToGrow);
		totalActionsAvailable -= growthActions;

		if (totalActionsAvailable > 0) {
			weakenActions += CalculateRemainingActions(totalActionsAvailable, extraWeakensNeeded);
			totalActionsAvailable -= weakenActions;
		}
	}

	if (!isBelowSecurityThreshold && !isBelowGrowthThreshold) {
		var maxAmountAllowedToHack = currentMoney * .1;
		var hackActionsNeededToDrain = Math.ceil(ns.hackAnalyzeThreads(targetServer, maxAmountAllowedToHack)) + 1;

		hackActions += CalculateRemainingActions(totalActionsAvailable, hackActionsNeededToDrain);
		totalActionsAvailable -= hackActions;
	}

	if (weakenActions > 0) {
		ns.exec("/HackScripts/Weaken.js", serverName, weakenActions, targetServer);
		ns.print("Started " + weakenActions + " Weaken.exe");
	}

	if (growthActions > 0) {
		ns.exec("/HackScripts/Grow.js", serverName, growthActions, targetServer);
		ns.print("Started " + growthActions + " Grow.exe");
	}

	if (hackActions > 0) {
		ns.exec("/HackScripts/Hack.js", serverName, hackActions, targetServer);
		ns.print("Started " + hackActions + " Hack.exe");
	}

	if (totalActionsAvailable > 0 && shouldShare) {
		var availableRamLeft = ns.getScriptRam("/HackScripts/Weaken.js") * totalActionsAvailable;
		var shareActions = Math.floor(availableRamLeft / ns.getScriptRam("/HackScripts/Share.js"));
		if (shareActions > 0) {
			ns.exec("/HackScripts/Share.js", serverName, shareActions, targetServer);
			ns.print("Started " + shareActions + " share.exe");
		}
	}
}

function CalculateRemainingActions(initialActions, modifier) {
	if (initialActions < modifier) {
		return initialActions;
	}
	else {
		return modifier;
	}
}