/** @param {NS} ns **/
export async function main(ns) {
	var maxSpend = 400000000;
	var count = 1;
	while(ns.getPurchasedServerCost(Math.pow(2, count)) < maxSpend){
		count++;
	}

	ns.purchaseServer("HackBot",Math.pow(2, count-1));
}