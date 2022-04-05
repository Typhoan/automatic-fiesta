/**
 * This script starts up all scripts needed for BitNode1. There should be minor interactions needed after.
 * 
 */
/** @param {NS} ns **/
export async function main(ns) {
    let startedExplorer = false;
    let startedBranchingHack = false;
    let startedPurchasePrograms = false;
    let startedExpandHomeComputer = false;
    let startedBuyServer = false;
    let startedStock = false;

    while (true) {
        var currentMoney = ns.getPlayer().money;
        var homeRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");

        if (currentMoney < 250000000 && startedStock === false) {
            if (homeRam > ns.getScriptRam("/BitNode8/SuperStockTrader.js")) {
                ns.kill("/BitNode8/SuperStockTrader.js", "home", 0);
                await ns.exec("/BitNode8/SuperStockTrader.js", "home", 1, 0);
                homeRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
                startedStock = true;
            }
        }

        if (homeRam > ns.getScriptRam("explore.js") && startedExplorer === false) {
            ns.kill("explore.js", "home");
            await ns.exec("explore.js", "home", 1);
            homeRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
            startedExplorer = true;
            await ns.sleep(1000);
        }

        if (homeRam > ns.getScriptRam("/BitNode8/BranchHack.js") && startedBranchingHack === false) {
            ns.kill("/BitNode8/BranchHack.js", "home");
            await ns.exec("/BitNode8/BranchHack.js", "home", 1);
            homeRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
            startedBranchingHack = true;
            await ns.sleep(1000);
        }

        currentMoney = ns.getPlayer().money;
        if (homeRam > ns.getScriptRam("expandHomeComputer.js") && startedExpandHomeComputer === false && currentMoney - 500000000 > 0) {
            ns.kill("expandHomeComputer.js", "home");
            await ns.exec("expandHomeComputer.js", "home", 1);
            startedExpandHomeComputer = true;
            await ns.sleep(1000);
        }

        currentMoney = ns.getPlayer().money;
        if (homeRam > ns.getScriptRam("purchasePrograms.js") && startedPurchasePrograms === false && currentMoney - 500000000 > 0) {
            ns.kill("purchasePrograms.js", "home");
            await ns.exec("purchasePrograms.js", "home", 1);
            startedPurchasePrograms = true;
            await ns.sleep(1000);
        }

        currentMoney = ns.getPlayer().money;
        if (homeRam > ns.getScriptRam("buyServer.js") && startedBuyServer === false && currentMoney - 10000000000 > 0) {
            ns.kill("buyServer.js", "home");
            await ns.exec("buyServer.js", "home", 1);
            startedBuyServer = true;
            await ns.sleep(1000);
        }

        if(startedExplorer && startedBranchingHack && startedPurchasePrograms && startedExpandHomeComputer && startedBuyServer && startedStock) {
            break;
        }
        await ns.sleep(1000*60*5)
    }
}