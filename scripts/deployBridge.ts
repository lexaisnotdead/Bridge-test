import hre, { ethers } from "hardhat";
import { saveDeploymentAddress, loadDeploymentAddress } from "./utils/utils";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const [signer] = await ethers.getSigners();
    const netname = hre.network.name;

    console.log(`\nDeploying Bridge on ${netname}`);
    console.log("\nDeployer address:", signer.address);
    console.log("\nDeployer balance:", await ethers.provider.getBalance(signer.address));

    const eSTRAddress = loadDeploymentAddress(netname, "eSTR");

    const Bridge = await ethers.getContractFactory("Bridge");
    const bridge = await Bridge.deploy(eSTRAddress);
    await bridge.waitForDeployment();
    const bridgeAddress = bridge.target.toString();

    saveDeploymentAddress(netname, "Bridge", bridgeAddress);
    console.log(`\nBridge contract deployed at ${bridgeAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
