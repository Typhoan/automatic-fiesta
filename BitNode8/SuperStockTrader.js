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
    var maxSharePer = 1.00
    var stockBuyPer = 0.70
    var stockVolPer = 0.05
    var moneyKeep = 1000000000
    var minSharePer = 5

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
                if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePer, "Long")) {
                    var shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxShares);
                    ns.stock.buy(stock.symbol, shares);
                }
            }
            else if (stock.orderType === "short") {
                if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePer, "Short")) {
                    var shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxShares);
                    ns.stock.short(stock.symbol, shares);
                }
            }
        }
    }

    function sellPositions(stock) {
        if (stock.forecast < 0.5) {
            if(stock.orderType === "long") {
            ns.stock.sell(stock, stock.position);
            }
            else{
                ns.stock.sellShort(stock, stock.position);
            }
            //ns.print('Sold: '+ stock + '')
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
            let position = ns.stock.getPosition(symbols[i]);
            let forecast = ns.stock.getForecast(symbol);
            let volatility = ns.stock.getVolatility(symbol);
            var askPrice = ns.stock.getAskPrice(stock);

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
            else if (position[3] > 0) {
                stocks.push({
                    symbol: symbol,
                    position: position[3],
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
                        orderType: "long",
                        forecast: forecast,
                        volatility: volatility,
                        askPrice: askPrice
                    });
                } else {
                    stocks.push({
                        symbol: symbol,
                        position: 0,
                        orderType: "short",
                        forecast: 1 - forecast,
                        volatility: volatility,
                        askPrice: askPrice
                    });
                }
            }
        }

        return stocks.sort(function (a, b) { return a.forecast - b.forecast; });
    }
}
}

