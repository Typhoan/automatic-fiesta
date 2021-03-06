/**
 * This script starts up all scripts needed for BitNode1. There should be minor interactions needed after.
 * 
 */
/** @param {NS} ns **/
export async function main(ns) {
    ns.kill("/BitNode1/BranchingHack.js", "home");
	await ns.exec("/BitNode1/BranchingHack.js", "home", 1);
    ns.kill("expandHomeComputer.js", "home");
    await ns.exec("expandHomeComputer.js", "home", 1);
    ns.kill("explore.js", "home");
    await ns.exec("explore.js", "home", 1);
    ns.kill("purchasePrograms.js", "home");
    await ns.exec("purchasePrograms.js", "home", 1);
  }