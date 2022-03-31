/**
 * Stock Object
 * {
 *  symbol: string,
 *  position: number,
 *  orderType: "long"/"short",
 *  forecast: number (between 0 and 1),
 *  volatility: number (between 0 and 1),
 *  askPrice: number
 * }
 *  
 */

/** @param {NS} ns **/
export async function main(ns) {
    const args = ns.flags([["help", false]]);
    if (args.help) {
        ns.tprint("This script will find the best stock to buy long or short.");
        ns.tprint("Optional Arguments:");
        ns.tprint("  MoneyToReserve, The amount of money to keep on the player. 1B by default.");
        ns.tprint(`Usage: run ${ns.getScriptName()} [MoneyToReserve]`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} 1000000000`);
        return;
    }

    var maxSharePer = 1.00
    var stockBuyPer = 0.65
    var stockVolPer = 0.05
    var moneyKeep = 0
    var minSharePer = 5

    if(args[0] == null){
        moneyKeep = 1000000000
    }
    else if(typeof(args[0] != "number")){
        ns.tprint("Invalid option argument");
        return;
    } 
    else if(args[0]){
        moneyKeep = args[0];
    }

    while (true) {
        ns.disableLog('disableLog');
        ns.disableLog('sleep');
        ns.disableLog('getServerMoneyAvailable');
        var stocks = getStocks(ns.stock.getSymbols());

        for (const stock of stocks) {
            if (stock.position) {
                sellPositions(stock);
            }
            buyPositions(stock);
        }
        await ns.sleep(6000);
    }

    function buyPositions(stock) {
        var maxShares = (ns.stock.getMaxShares(stock.symbol) * maxSharePer) - stock.position;
        var askPrice = stock.askPrice;
        var forecast = stock.forecast;
        var volPer = stock.volatility;
        var playerMoney = ns.getServerMoneyAvailable('home');

        if (forecast >= stockBuyPer && volPer <= stockVolPer) {
            if (stock.orderType === "long") {
                if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock.symbol, minSharePer, "Long")) {
                    var shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxShares);
                    ns.stock.buy(stock.symbol, shares);
                }
            }
            else if (stock.orderType === "short") {
                if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock.symbol, minSharePer, "Short")) {
                    var shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxShares);
                    ns.stock.short(stock.symbol, shares);
                }
            }
        }
    }

    function sellPositions(stock) {
        if (stock.forecast < 0.5) {
            if (stock.orderType === "long") {
                ns.stock.sell(stock.symbol, stock.position);
            }
            else {
                ns.stock.sellShort(stock.symbol, stock.position);
            }
        }
    }

    /**
     * 
     * @param {Array} symbols
     * @returns {Array}
     */
    function getStocks(symbols) {
        let stocks = [];
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            let position = ns.stock.getPosition(symbol);
            let forecast = ns.stock.getForecast(symbol);
            let volatility = ns.stock.getVolatility(symbol);
            var askPrice = ns.stock.getAskPrice(symbol);

            if (position[0] > 0) {
                stocks.push({
                    symbol: symbol,
                    position: position[0],
                    orderType: "long",
                    forecast: forecast,
                    volatility: volatility,
                    askPrice: askPrice
                });
            }
            else if (position[2] > 0) {
                stocks.push({
                    symbol: symbol,
                    position: position[2],
                    orderType: "short",
                    forecast: 1 - forecast,
                    volatility: volatility,
                    askPrice: askPrice
                });
            }
            else {
                if (forecast >= .5) {
                    stocks.push({
                        symbol: symbol,
                        position: 0,
                        orderType: forecast >= .5 ? "long": "short",
                        forecast: forecast >= .5 ? forecast : 1 - forecast,
                        volatility: volatility,
                        askPrice: askPrice
                    });
                }
            }
        }

        return stocks.sort(function (a, b) { return b.forecast - a.forecast; });
    }
}