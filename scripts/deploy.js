
const fs = require('fs');

async function main() {
	const StoreFront = await ethers.getContractFactory("StoreFront2");

	const storeFront = await StoreFront.deploy()

	// var tokens = ["0x9c2582bf7648dc75825a26758206b6610d7c989c6ac940285503d77e5ad27bdc"];
	// var tx = await storeFront.buy(tokens,0);
	// await tx.wait();

	
	const contract = storeFront.address
	fs.writeFileSync(__dirname + '/../src/config/v1.json', JSON.stringify({ contract }, null, '\t'))
}

main().then(() => {
}).catch((error) => {
	console.error(error);
	// process.exit(1);
});
