/** 
 * returns list of servers that are in order of value;
 * @param {NS} ns
 * @param {string} serverName
 **/
export async function getMostProfitableServers(ns, hackedServers){
    let mostProfitableServers = [];

    for (let i = 0; i < hackedServers.length; i++) {
        mostProfitableServers.push({Server: hackedServers[i], EstimatedIncome:EstimateIncome(ns, hackedServers[i].name)});
    }


    return mostProfitableServers.sort((a, b) => { return b.EstimatedIncome - a.EstimatedIncome }).map(x => x.Server);
}


function EstimateIncome(ns, serverName) {
	let estimatedMaxCash = ns.getServerMaxMoney(serverName) * percentOfGrowth;
	let estimatedWeakenTime = ns.getWeakenTime(serverName);

	return estimatedMaxCash / (estimatedWeakenTime / 4000);
}