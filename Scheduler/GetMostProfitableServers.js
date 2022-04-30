/** 
 * returns list of servers that are in order of value;
 * @param {NS} ns - namespace
 * @param {Array<Server>} serverName - list of servers to sort
 * @returns {Array<Server>} - list of servers in order of value
 **/
export async function getMostProfitableServers(ns, hackedServers){
    let mostProfitableServers = [];

    for (let i = 0; i < hackedServers.length; i++) {
        mostProfitableServers.push({Server: hackedServers[i], EstimatedIncome:EstimateIncome(ns, hackedServers[i].hostname)});
    }


    return mostProfitableServers.sort((a, b) => { return b.EstimatedIncome - a.EstimatedIncome }).map(x => x.Server);
}


function EstimateIncome(ns, serverName) {
	let estimatedMaxCash = ns.getServerMaxMoney(serverName) * .9;
	let estimatedWeakenTime = ns.getWeakenTime(serverName);

	return estimatedMaxCash / (estimatedWeakenTime / 4000);
}