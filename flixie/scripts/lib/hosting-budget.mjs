// Leave headroom below Azure SWA Free's 20 KB config / 250 MB / 15,000 files.
export const freeTierBudget=Object.freeze({routingBytes:18_000,storageBytes:200_000_000,files:12_000});
export function assertHostingBudget({routingBytes,storageBytes=0,files=0}) {
  for(const [key,actual] of Object.entries({routingBytes,storageBytes,files})) {
    if(!Number.isSafeInteger(actual)||actual<0||actual>freeTierBudget[key])
      throw Error(`Azure Free budget exceeded: ${key}=${actual}, budget=${freeTierBudget[key]}. Reduce output before deploying; do not upgrade the plan automatically.`);
  }
}
