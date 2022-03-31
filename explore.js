/** @param {NS} ns **/
export async function main(ns) {
    const args = ns.flags([["help", false]]);
    if (args.help) {
        ns.tprint("This script will enhance your HUD (Heads up Display) with custom statistics.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }

    await displayStats(ns);
}

function format(value) {
    const prefixes = ["", "k", "m", "b", "t", "q"];
    for (let i = 0; i < prefixes.length; i++) {
        if (Math.abs(value) < 1000) {
            return `${Math.floor(value * 10) / 10}${prefixes[i]}`;
        } else {
            value /= 1000;
        }
    }
    return `${Math.floor(value * 10) / 10}${prefixes[prefixes.length - 1]}`;
}

function GetOwnedStockValue(ns) {
    var symbols = ns.stock.getSymbols();
    var totalValue = 0;

    for (var i = 0; i < symbols.length; i++) {
        var positions = ns.stock.getPosition(symbols[i]);
        const longShares = positions[0];
        const longPrice = positions[1];
        const shortShares = positions[2];
        const shortPrice = positions[3];
        const bidPrice = ns.stock.getBidPrice(symbols[i]);

        if (longShares > 0) {
            const cost = longShares * longPrice;
            const profit = longShares * (bidPrice - longPrice) - 200000;
            totalValue += cost + profit;
        }

        if (shortShares > 0) {
            const cost = shortShares * shortPrice;
            const profit = shortShares * (bidPrice - shortPrice) - 200000;
            totalValue += cost + profit;
        }
    }

    return format(totalValue);
}
/** @param {NS} ns **/
export async function displayStats(ns) {
    const doc = eval('document'); 
    const hook0 = doc.getElementById('overview-extra-hook-0'); 
    const hook1 = doc.getElementById('overview-extra-hook-1');

    while (true) {

        try {
            const headers = []
            const values = [];
            // Add script income per second
            headers.push("ScrInc");
            values.push(format(ns.getScriptIncome()[0]) + '/sec');
            // Add script exp gain rate per second
            headers.push("ScrExp");
            values.push(format(ns.getScriptExpGain()) + '/sec');
            // TODO: Add more neat stuff
            headers.push("StkVal");
            values.push(GetOwnedStockValue(ns));
            // Now drop it into the placeholder elements
            hook0.innerText = headers.join(" \n");
            hook1.innerText = values.join("\n");
        } catch (err) { // This might come in handy later
            ns.print("ERROR: Update Skipped: " + String(err));
        }
        await ns.sleep(1000);
    }

}