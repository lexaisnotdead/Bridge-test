import fs from "fs";

function saveDeploymentAddress(
    network: string,
    contractName: string,
    address: string,
) {
    const folderPath = `./addresses/${network}`;
    const filePath = `./addresses/${network}/${contractName}.json`;

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(
            filePath,
            JSON.stringify({ address: address }, null, 4)
        );
    } else {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        data.address = address;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    }

    console.log(`\nData successfully saved to ${filePath}`);
    console.log("\n===================================")
}

function loadDeploymentAddress(network: string, contractName: string, silent: boolean = false) {
    const filePath = `./addresses/${network}/${contractName}.json`;
    return JSON.parse(fs.readFileSync(filePath, "utf8")).address;
}

export { 
    saveDeploymentAddress,
    loadDeploymentAddress
};
