/** @param {NS} ns **/
export async function main(ns) {
	let servers = ns.getPurchasedServers();
	let hacked = JSON.parse(ns.peek(1));

	for (let x = 0; x < servers.length; x++) {
		ns.killall(servers[x]);
	}

	for (let x = 0; x < hacked.length; x++) {
		if(!hacked[x].includes("home") && !hacked[x].includes("darkweb"))
		ns.killall(hacked[x]);
	}
}