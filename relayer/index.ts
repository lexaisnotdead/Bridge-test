import { ethers } from "ethers";
import sqlite3 from "sqlite3";
import { open } from 'sqlite';
import * as dotenv from "dotenv";
import { loadDeploymentAddress } from "../scripts/utils/utils";
import { Minter, Minter__factory, Bridge__factory, Bridge } from "../typechain-types";
import { BridgeDepositEvent } from "../typechain-types/contracts/ethereum/Bridge";

dotenv.config();

const BLOCK_LOOKBACK = 50; // Adjust as needed
const POLL_INTERVAL_MS = 15000

async function getLastBlock(db: any): Promise<number> {
    const result = await db.get('SELECT last_block FROM processed_blocks WHERE id = 1');
    return result ? result.last_block : 0;
}
  
async function setLastBlock(db: any, blockNumber: number): Promise<void> {
    await db.run('INSERT OR REPLACE INTO processed_blocks (id, last_block) VALUES (1, ?)', [blockNumber]);
}

async function processEvent(db: any, event: BridgeDepositEvent.Log, polyMinter: Minter): Promise<void> {
    const { nonce, recipient, amount } = event.args;
  
    // Check if nonce is already processed
    const existing = await db.get('SELECT nonce FROM processed_nonces WHERE nonce = ?', [nonce]);
    if (existing) {
        console.log(`Nonce ${nonce} already processed, skipping`);
        return;
    }
  
    // Check if nonce is used on Polygon
    const isUsed = await polyMinter.usedNonces(nonce);
    if (isUsed) {
        console.log(`Nonce ${nonce} already used on Polygon, skipping`);
        await db.run('INSERT INTO processed_nonces (nonce) VALUES (?)', [nonce]);
        return;
    }
  
    try {
        const tx = await polyMinter.mint(recipient, amount, nonce);
        await tx.wait();
        console.log(`Minted ${amount} pSTR to ${recipient} on Polygon. Tx: ${tx.hash}`);
        await db.run('INSERT INTO processed_nonces (nonce) VALUES (?)', [nonce]);
    } catch (error) {
        console.error(`Error minting for nonce ${nonce}:`, error);
        // Re-check if nonce is now used
        const isUsedNow = await polyMinter.usedNonces(nonce);
        if (isUsedNow) {
            console.log(`Nonce ${nonce} was used after error, adding to db`);
            await db.run('INSERT INTO processed_nonces (nonce) VALUES (?)', [nonce]);
        }
    }
}  

async function main() {
    // Initialize database
    const db = await open({
        filename: process.env.DATABASE_PATH || "./relayer/db/relayer.db",
        driver: sqlite3.Database,
    });

    // Initialize providers
    const ethProvider = new ethers.JsonRpcProvider(
        process.env.ETHEREUM_RPC
    );
    const polyProvider = new ethers.JsonRpcProvider(
        process.env.POLYGON_RPC
    );

    // Load addresses
    const bridgeAddress = loadDeploymentAddress("ethereum", "Bridge");
    const minterAddress = loadDeploymentAddress("polygon", "Minter");

    // Initialize contracts
    const ethBridge: Bridge = Bridge__factory.connect(bridgeAddress, ethProvider);

    const relayerKey = process.env.RELAYER_PK;
    if (!relayerKey) throw new Error("Missing RELAYER_PK");
    const relayerSigner = new ethers.Wallet(relayerKey, polyProvider);

    const polyMinter: Minter = Minter__factory.connect(minterAddress, relayerSigner)

    // Create tables if not exists
    await db.exec(`
        CREATE TABLE IF NOT EXISTS processed_blocks (
            id INTEGER PRIMARY KEY,
            last_block INTEGER
        );
        CREATE TABLE IF NOT EXISTS processed_nonces (
            nonce TEXT PRIMARY KEY
        );
    `);

    let lastBlock = await getLastBlock(db);
    if (!lastBlock) {
        lastBlock = await ethProvider.getBlockNumber() - BLOCK_LOOKBACK;
        await setLastBlock(db, lastBlock);
        console.log(`Starting from block ${lastBlock}`);
    }

    while (true) {
        const currentBlock = await ethProvider.getBlockNumber();
        if (currentBlock > lastBlock) {
            console.log(`Processing blocks from ${lastBlock + 1} to ${currentBlock}`);
            const events = await ethBridge.queryFilter(ethBridge.filters.BridgeDeposit, lastBlock + 1, currentBlock);
            
            for (const event of events) {
                await processEvent(db, event, polyMinter);
            }

            await setLastBlock(db, currentBlock);
            lastBlock = currentBlock;
        }
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS)); // Poll every 15 seconds
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});