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
 * Formats a number.
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

/**
 * Calculates the available ram on the server.
 * @param {ns} ns
 * @param {Server} server to calculate ram for
 * @returns {number}
 */
export function getAvailableRam(ns, server){
  var availableRam;
  if (server.hostname == "home") {
    availableRam = (ns.getServerMaxRam(server.hostname) * .9) - ns.getServerUsedRam(server.hostname);
  } else {
    availableRam = ns.getServerMaxRam(server.hostname) - ns.getServerUsedRam(server.hostname);
  }

  return availableRam;
}

/**
 * Gets the max threads available to a server.
 * @param {Server} server - The server to get the max threads for.
 * @param {number} ramCost - The ram cost of the script.
 * @returns {Array<number>} - The max threads available to a server.
 */
export function getMaxThreads(ns, server, ...ramCosts) {
  if (ramCosts.length == 0) {
    throw new Error("No ram costs provided.");
  }

  var availableRam = GetAvailableRam(ns, server);

  var totalRam  = 0;
  for(let i = 0; i < ramCosts.length; i++) {
    totalRam += ramCosts[i];
  }

  return Math.floor(availableRam / totalRam);
}

/**
 * Checks if the target server is running scripts.
 * @param {Server} server - The server name the scripts are running on.
 * @param {Server} targetServer - The target server.
 * @param {Array<string>} scripts - The scripts to check for.
 * @returns {boolean} - True if the target server is running scripts, false if not.
 */
export function areServerScriptsRunning(ns, server, targetServer, ...scripts) {
  if (scripts.length == 0) {
    throw new Error("No arguments were passed to TargetServerScriptsRunning()");
  }

  var isRunning = false;
  for (var x = 0; x < scripts.length; x++) {
    isRunning = isRunning || ns.scriptRunning(scripts[x], server.hostname);
  }

  return isRunning;
}