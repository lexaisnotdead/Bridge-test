import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();


const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.28",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                    viaIR: true,
                },
            },
        ],
    },

    networks: {
        hardhat: {
            // @ts-ignore
            urlParsed: "http://localhost:8545",
            chainId: 31337,
            accounts: {
                count: 20
            }
        },
        localhost: {
            // @ts-ignore
            urlParsed: "http://localhost:8545",
            chainId: 31337
        },

        ethereum: {
            url: process.env.ETHEREUM_RPC || "",
            accounts: [process.env.OWNER_PK || ""],
            chainId: 17000
        },

        polygon: {
            url: process.env.POLYGON_RPC || "",
            accounts: [process.env.OWNER_PK || ""],
            chainId: 80002
        }
    },

    etherscan: {
        apiKey: {
            holesky: process.env.ETHERSCAN_API || "",
            polygonAmoy: process.env.POLYGON_API || ""
        },
    }
};

export default config;
