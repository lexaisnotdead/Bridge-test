import hre, { ethers } from "hardhat";
import { saveDeploymentAddress } from "./utils/utils";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const [signer] = await ethers.getSigners();
    const netname = hre.network.name;

    console.log(`\nDeploying eSTR on ${netname}`);
    console.log("\nDeployer address:", signer.address);
    console.log("\nDeployer balance:", await ethers.provider.getBalance(signer.address));

    const ESTR = await ethers.getContractFactory("eSTR");
    const eSTR = await ESTR.deploy();
    await eSTR.waitForDeployment();
    const eSTRAddress = eSTR.target.toString();

    saveDeploymentAddress(netname, "eSTR", eSTRAddress);
    console.log(`eSTR contract deployed at ${eSTRAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
