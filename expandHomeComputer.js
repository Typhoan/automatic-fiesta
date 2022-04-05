/** @param {NS} ns **/
export async function main(ns) {
    var sourceFiles = ns.getOwnedSourceFiles();
    if (sourceFiles.filter(e => e.n === 4).length > 0) {
        if (ns.getPlayer().money > ns.getUpgradeHomeRamCost()) {
            if (ns.upgradeHomeRam()) {
                ns.toast("Upgrade home computer RAM!", 'success', null);
            }
        }
    }
}