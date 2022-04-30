/** @param {NS} ns **/
export async function main(ns) {
    let hasTor = ns.getPlayer().tor;
    let hasBrute = ns.fileExists('BruteSSH.exe', 'home');
    let hasFTPCrack = ns.fileExists('FTPCrack.exe', 'home');
    let hasRelaySMTP = ns.fileExists('relaySMTP.exe', 'home');
    let hasHTTPWorm = ns.fileExists('HTTPWorm.exe', 'home');
    let hasSQLInject = ns.fileExists('SQLInject.exe', 'home');

    var sourceFiles = ns.getOwnedSourceFiles();
    
   
        while (!hasTor || !hasBrute || !hasFTPCrack || !hasRelaySMTP || !hasHTTPWorm || !hasSQLInject) 
        {
            if(!hasTor && ns.getPlayer().money > 200000) {
                hasTor = ns.purchaseTor();
                if (hasTor) {
                    ns.toast("Purchased Tor");
                }
            }
            if (!hasBrute && ns.getPlayer().money > 250000) {
                hasBrute = ns.purchaseProgram('BruteSSH.exe');
                if (hasBrute) {
                    ns.toast("Purchased BruteSSH.exe");
                }
            }
            if (!hasFTPCrack && ns.getPlayer().money > 1500000) {
                hasFTPCrack = ns.purchaseProgram('FTPCrack.exe');
                ns.toast("Purchased FTPCrack.exe", 'info', 10000);
            }
            if (!hasRelaySMTP && ns.getPlayer().money > 5000000) {
                hasRelaySMTP = ns.purchaseProgram('relaySMTP.exe');
                ns.toast("Purchased relaySMTP.exe", 'info', 10000);
            }
            if (!hasHTTPWorm && ns.getPlayer().money > 30000000) {
                hasHTTPWorm = ns.purchaseProgram('HTTPWorm.exe');
                if (hasHTTPWorm) {
                    ns.toast("Purchased HTTPWorm.exe", 'info', 10000);
                }
            }
            if (hasSQLInject && ns.getPlayer().money > 250000000) {
                hasSQLInject = ns.purchaseProgram('SQLInject.exe');
                ns.toast("Purchased SQLInject.exe", 'info', 10000);
            }
            await ns.sleep(15000);
        }
    
}