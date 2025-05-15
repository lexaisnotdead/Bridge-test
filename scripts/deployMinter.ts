import hre, { ethers } from "hardhat";
import { saveDeploymentAddress, loadDeploymentAddress } from "./utils/utils";
import { PSTR__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const [signer] = await ethers.getSigners();
    const netname = hre.network.name;

    console.log(`\nDeploying Minter on ${netname}`);
    console.log("\nDeployer address:", signer.address);
    console.log("\nDeployer balance:", await ethers.provider.getBalance(signer.address));

    const pSTRAddress = loadDeploymentAddress(netname, "pSTR");

    const Minter = await ethers.getContractFactory("Minter");
    const minter = await Minter.deploy(pSTRAddress);
    await minter.waitForDeployment();
    const minterAddress = minter.target.toString();

    saveDeploymentAddress(netname, "Minter", minterAddress);
    console.log(`\nMinter contract deployed at ${minterAddress}`);
    console.log("\n===================================")

    console.log("\nGranting the MINTER role to the Minter contract");
    const pSTR = PSTR__factory.connect(pSTRAddress, signer);
    let tx = await pSTR.grantRole(await pSTR.MINTER_ROLE(), minterAddress);
    await tx.wait();

    console.log("\nMINTER role successfully granted. Tx hash:", tx.hash);
    console.log("\n===================================")

    console.log("\nGranting the RELAYER role to the Relayer");
    tx = await minter.grantRole(await minter.RELAYER_ROLE(), process.env.RELAYER_ADDRESS || "");
    await tx.wait();

    console.log("\nRELAYER role successfully granted. Tx hash:", tx.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
