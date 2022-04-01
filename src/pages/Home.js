import React from 'react'
import './home.scss'
import { NF, call, copyToClipboard } from '../util'
import { ethers } from "ethers";
import slide1 from '../assets/img/slide1.webp';
import slide2 from '../assets/img/slide2.webp';
import slide3 from '../assets/img/slide3.webp';
import slide4 from '../assets/img/slide4.webp';
import slide5 from '../assets/img/slide5.webp';
import slide6 from '../assets/img/slide6.webp';
import gifius from '../assets/img/gifius.webp';
import copy from '../assets/img/copy.png';
import { NotificationManager } from "react-notifications";

import { useWallet } from "use-wallet";
import { useBlockchainContext } from "../context";
import Config from '../config/v1.json'
import abi from '../config/abi.json'
const Home = () => {
    const [state] = useBlockchainContext();
    const [status, setStatus] = React.useState({
        time: 0,
        signer: '',
        provider: '',
        contract: '',
        count: 1,
        isLoading: false,
        balance: 0,
        totalSales: 0,
        totalSupply: 0,
        price: 0,
        perMax: 0,
        amount: 0,
        link: ''
    })
    const updateStatus = (params) => setStatus({ ...status, ...params })
    const wallet = useWallet();

    const mint_nft = async () => {
        try {
            if (wallet.status !== "connected") {
                wallet.connect()
            } else {
                if (status.perMax < status.balance + status.count) {
                    NotificationManager.error(`Max balance : ${status.perMax} `)
                    return;
                }
                const response = await call("/get-buy-params", { count: status.count });
                if (response.err === 0) {
                    const { tokens, price, signature } = response.msg
                    const provider = new ethers.providers.Web3Provider(wallet.ethereum);
                    const signer = await provider.getSigner()
                    const contract = new ethers.Contract(Config.contract, abi, provider);
                    updateStatus({ provider, signer, contract })
                    const BigNumber = ethers.BigNumber
                    const value = BigNumber.from(tokens.length).mul(BigNumber.from(price)).toHexString()
                    const tx = await contract.connect(signer).buy(tokens, price, signature, { value })
                    NotificationManager.success("Please wait few second for confirm transaction");
                    for (var i = 0; i < tokens.length; i++) {
                        NotificationManager.success(tokens[i]);
                        updateStatus({ link: tokens[i] })
                        
                    }
                    await tx.wait();
                }
                else {
                    // throw new Error("response error");
                    NotificationManager.success(response.msg);
                    return;
                }
            }
            checkWalletStatus()
        } catch (error) {
            NotificationManager.success("mint error");
            console.log("mint_nft error")
        }
    }

    const count_minus = async () => {
        var count = status.count;
        if (count > 0) {
            updateStatus({ count: count - 1 })
        }
    }
    const count_plus = async () => {
        var count = status.count;
        if (count < 20) {
            updateStatus({ count: count + 1 })
        }
    }
    const checkWalletStatus = () => {
        if (wallet.status === "connected") {
            // NotificationManager.success("Connected wallet");
        } else {
            NotificationManager.warning("Please install metamask or connect wallet.")
        }
    }
    const getPrice = async () => {
        const response = await call('/get-price');
        updateStatus({ price: response.price })
    }
    React.useEffect(() => {
        getPrice();
        wallet.connect()
    }, [])
    React.useEffect(() => {
        if (wallet.status === "connected") {
            checkBalance()
        }
    }, [wallet.status])

    React.useEffect(() => {
        const timer = setTimeout(checkBalance, 5000)
        return () => clearTimeout(timer)
    })

    const checkBalance = async () => {
        try {
            if (wallet.status === "connected") {
                updateStatus({ time: +new Date() })
                const provider = new ethers.providers.Web3Provider(wallet.ethereum);
                const signer = await provider.getSigner()
                const contract = new ethers.Contract(Config.contract, abi, provider);

                const balance = await contract.connect(signer).balanceOf(wallet.account);
                const _totalSupply = await contract.totalSupply();
                const _totalSales = await contract.totalSales();
                const _maxPerWallet = await contract.maxPerWallet();
                updateStatus({ totalSupply: Number(_totalSupply), perMax: Number(_maxPerWallet), balance: Number(balance), totalSales: Number(_totalSales) })
            }
        } catch (err) {
            NotificationManager.error("Check balance error");
            console.log("Check balance error", err);
        }
    }

    return (
        <>
            <div className='home-back'>
                <div className='slide-panel'>
                    <img src={slide1} ></img>
                    <img src={slide2} ></img>
                    <img src={slide3} ></img>
                    <img src={slide4} ></img>
                    <img src={slide5} ></img>
                    <img src={slide6} ></img>
                    <img src={slide1} ></img>
                    <img src={slide2} ></img>
                    <img src={slide3} ></img>
                    <img src={slide4} ></img>
                    <img src={slide5} ></img>
                    <img src={slide6} ></img>
                </div>
                <div className='mint-panel'>

                    <div className='mint-container' >
                        <div className='dash-pan'>
                            <div className='row center'>
                                <b>Special Price for Discord Members</b>
                            </div>
                            <div className='row center'>
                                <b>March 10 - 2AM EST</b>
                            </div>
                            <div className='row mt1'>
                                <div className='col-3'>
                                    <p className='text-center m0 p0'>Supply</p>
                                    <b className='text-center m0 p0'>{status.totalSupply}</b>
                                </div>
                                <div className='col-3'>
                                    <p className='text-center m0 p0'>Price</p>
                                    <b className='text-center m0 p0'>{status.price} ETH</b>
                                </div>
                                <div className='col-3'>
                                    <p className='text-center m0 p0'>Max Per Wallet</p>
                                    <b className='text-center m0 p0'>{status.perMax} </b>
                                </div>

                                <div className='col-3'>
                                    <p className='m0 p0'>Balance</p>
                                    <b className='m0 p0'>{status.balance}</b>
                                </div>
                            </div>
                        </div>
                        <div className='mint-card'>
                            <h1 style={{ lineHeight: '10px' }}>BOUND SALE</h1>
                            {wallet.account !== null && (
                                <div className='row center mt2'>
                                    <label style={{ width: '90%', wordBreak: 'break-all' }}>{wallet.account}</label>
                                    <span className='btn-copy' onClick={() => { copyToClipboard(wallet.account) }}><img src={copy} style={{ width: '30px', height: '30px' }} /></span>
                                </div>
                            )}
                            {state.link !== null && state.link ?
                                <div className='row center mt2'>
                                    <a href={`https://testnets.opensea.io/assets/${Config.contract.toLowerCase()}/${state.link}`} style={{ color: 'white', textDecoration: 'underline' }} target="_blank">View on Opensea</a>
                                </div> : <></>
                            }
                            <div className='price-pan'>
                                <img src={gifius} />
                                <div><h3 className='text-center' style={{ fontSize: '35px', lineHeight: 0 }}>{status.price}</h3></div>
                                <div>
                                    <span className='block' style={{ fontSize: '14px', margin: '6px' }}>Price Per NFT</span>
                                    <b>{state.price} ETH Each</b>
                                </div>
                            </div>
                            <div className='price-setting-pan'>
                                <div>
                                    <span className='setting-btn' onClick={() => { count_minus() }}>-</span>
                                    <b style={{ fontSize: '1.2rem' }}>{status.count}</b>
                                    <span className='setting-btn' onClick={() => { count_plus() }}>+</span>
                                </div>
                                <button className='mint-btn' onClick={() => { updateStatus({ count: status.perMax }) }}>SET MAX</button>
                            </div>
                            <div className='total-pan'>
                                <label>Total</label>
                                <label>{NF(status.price * status.count, 3)} ETH</label>
                            </div>
                            <div className='row center'>
                                <button className='mint-btn' style={{ height: '35px' }} disabled={status.isLoading} onClick={() => { mint_nft() }}>
                                    {/* {status.isLoading ? <span class="spinner-grow"></span> : <></>} */}
                                    <b>{wallet.status === "connected" ? 'Mint NFT' : 'Connect Wallet'}</b>
                                </button>
                            </div>
                            {/* <div className='row center mt2'>
                                <label>{status.mint1}/{status.mint2}</label>
                            </div> */}

                        </div>
                    </div>
                </div>
            </div>

        </>
    )
};

export default Home;    