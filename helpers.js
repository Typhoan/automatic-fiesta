/** 
 * @param {NS} ns
 * @returns {Server[]}
 * **/
 export function getOwnedServers(ns) {
    let targets = ['home']
    let scanned = []
    let hostList = []
  
    while (targets.length > 0) {
      let name = targets.pop();
      scanned.push(name);
  
      let server = ns.getServer(name);
      if (server.hasAdminRights) {
        hostList.push(server);
        let hosts = ns.scan(name);
        for (let i = 0; i < hosts.length; i++) {
          if (!scanned.includes(hosts[i])) {
            targets.push(hosts[i]);
          }
        }
      }
    }
  
    return hostList;
  }


/**
 * 
 * @param {number} value to format
 * @returns {string|string}
 */
export function format(value) {
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