/** @param {NS} ns **/
export async function main(ns) {

	var purchasedServers = ns.getPurchasedServers();

	for(var x = 0; x < 10; x++){
		ns.killall(purchasedServers[x]);
		ns.deleteServer(purchasedServers[x]);
	}


	while (true) {
		var maxSpend = 500000000000;
		var count = 1;
		while (ns.getPurchasedServerCost(Math.pow(2, count)) < maxSpend) {
			count++;
		}

		ns.purchaseServer("HackBot", Math.pow(2, count - 1));
		await ns.sleep(6000);
	}
}