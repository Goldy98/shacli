const network = require("network");

export interface NetWorkInterface {
  name: string;
  ip_address: string;
  mac_address: string;
  type: string;
  netmask: string;
  gateway_ip: string;
}

export async function getActiveNetworkInterface(): Promise<
  NetWorkInterface | undefined
> {
  let activeInterface: NetWorkInterface | undefined;

  await network.get_active_interface(function(err: any, obj: NetWorkInterface) {
    console.log("obj:", obj);
    if (obj) {
      activeInterface = obj;
      return obj;
    }
  });

  return activeInterface;
}
