import hre, { ethers } from "hardhat";
import { saveDeploymentAddress } from "./utils/utils";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const [signer] = await ethers.getSigners();
    const netname = hre.network.name;

    console.log(`\nDeploying pSTR on ${netname}`);
    console.log("\nDeployer address:", signer.address);
    console.log("\nDeployer balance:", await ethers.provider.getBalance(signer.address));

    const PSTR = await ethers.getContractFactory("pSTR");
    const pSTR = await PSTR.deploy();
    await pSTR.waitForDeployment();
    const pSTRAddress = pSTR.target.toString();

    saveDeploymentAddress(netname, "pSTR", pSTRAddress);
    console.log(`pSTR contract deployed at ${pSTRAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
