export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: 'eth_accounts',
            });
            let chainId = await window.ethereum.request({ method: 'eth_chainId' });
            chainId = parseInt(chainId, 16);

            if (addressArray.length > 0) {
                const balance = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [addressArray[0], "latest"],
                });
                return {
                    balance,
                    address: addressArray[0],
                    chainId,
                    success: true,
                };
                // eslint-disable-next-line no-else-return
            } else {
                return {
                    address: null,
                    success: false,
                    status: '🦊 Connect to Metamask using the top right button.',
                };
            }
        } catch (err) {
            return {
                address: null,
                success: false,
                status: err.message,
            };
        }
    } else {
        return {
            address: null,
            success: false,
            status:
                'You must install Metamask, a virtual Ethereum wallet, in your browser.',
        };
    }
};
export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
            let chainId = await window.ethereum.request({ method: 'eth_chainId' });
            chainId = parseInt(chainId, 16);
            if (addressArray.length > 0) {
                const balance = await window.ethereum.request({
                    jsonrpc: '2.0',
                    method: 'eth_getBalance',
                    params: [addressArray[0], 'latest'],
                });
                return {
                    balance,
                    address: addressArray[0],
                    chainId,
                    success: true,
                };
                // eslint-disable-next-line no-else-return
            } else {
                return {
                    address: null,
                    success: false,
                    status: '🦊 Connect to Metamask using the top right button.',
                };
            }
        } catch (err) {
            return {
                address: '',
                success: false,
                status: err.message,
            };
        }
    } else {
        return {
            address: '',
            success: false,
            status:
                'You must install Metamask, a virtual Ethereum wallet, in your browser.',
        };
    }
};
