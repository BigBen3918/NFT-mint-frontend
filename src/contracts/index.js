import { ethers } from "ethers";

import Contrats from "./contracts/3.json";

const supportChainId = 4002;

const RPCS = {
    1: "http://13.59.118.124/eth",
    250: "https://rpc.ftm.tools/",
    4002: "https://rpc.testnet.fantom.network",
    26: "https://mainnet-rpc.icicbchain.org",
    417: "https://testnet-rpc.icicbchain.org",
    1337: "http://localhost:7545",
    31337: "http://localhost:8545/"
}

const providers = {
    1: new ethers.providers.JsonRpcProvider(RPCS[1]),
    250: new ethers.providers.JsonRpcProvider(RPCS[250]),
    4002: new ethers.providers.JsonRpcProvider(RPCS[4002]),
    26: new ethers.providers.JsonRpcProvider(RPCS[26]),
    417: new ethers.providers.JsonRpcProvider(RPCS[417]),
    1337: new ethers.providers.JsonRpcProvider(RPCS[1337]),
    31337: new ethers.providers.JsonRpcProvider(RPCS[31337])
}

const provider = providers[supportChainId];
const nftContract = new ethers.Contract(Contrats.nft.address, Contrats.nft.abi, provider);

export {
    nftContract, provider
}