import './App.css';
import {
  useEtherBalance,
  useCall,
  useEthers,
  useTokenBalance,
  useContractFunction,
} from '@usedapp/core';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { formatEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { ethers, utils } from 'ethers';
import { tokenAddress } from './constants';

import { PeggedPalladium } from './gen/types';
import PegPallamdiumAbi from './gen/PeggedPalladium.json';
import { useEffect, useState } from 'react';

const wethInterface = new utils.Interface(PegPallamdiumAbi.abi);
const contract = new Contract(
  tokenAddress as string,
  wethInterface
) as PeggedPalladium;

function App() {
  const { active, account, activateBrowserWallet, activate, deactivate } =
    useEthers();
  // call
  const ethBalance = useEtherBalance(account) || BigNumber.from(0);
  const tokenBalance =
    useTokenBalance(tokenAddress, account) || BigNumber.from(0);
  const rate = useCall({ contract, method: 'rate', args: [] });
  const isWhitelist = useCall(
    account && {
      contract,
      method: 'isWhitelist',
      args: [account as string],
    }
  );
  const owner = useCall(
    account && {
      contract,
      method: 'owner',
      args: [],
    }
  );
  // send
  const mintFunc = useContractFunction(contract, 'mint', {
    transactionName: 'Wrap',
  });
  const burnFunc = useContractFunction(contract, 'burn', {
    transactionName: 'Wrap',
  });
  const whitelistFunc = useContractFunction(contract, 'setWhiteList', {
    transactionName: 'Wrap',
  });

  const getToken = useContractFunction(contract, 'getToken', {
    transactionName: 'Wrap',
  });
  const getEth = useContractFunction(contract, 'getEth', {
    transactionName: 'Wrap',
  });
  const setRate = useContractFunction(contract, 'setRate', {
    transactionName: 'Wrap',
  });
  // state
  const [mintAmount, setMintAmount] = useState<number>(0);
  const [burnAmount, setBurnAmount] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [address, setAddress] = useState<string>('');

  const setWhiteList = async () => {
    try {
      await whitelistFunc.send(address, true);
    } catch (err) {
      console.log(err);
    }
  };

  const mintToken = async () => {
    try {
      await mintFunc.send(mintAmount.toString());
    } catch (err) {
      console.log(err);
    }
  };

  const burnToken = async () => {
    try {
      await burnFunc.send(burnAmount);
    } catch (err) {
      console.log(err);
    }
  };

  const swapEthToToken = async () => {
    try {
      await getToken.send({
        value: ethers.utils.parseEther(mintAmount.toString()),
      });
    } catch (err) {
      console.log(err);
    }
  };

  const swapTokenToEth = async () => {
    try {
      await getEth.send(burnAmount);
    } catch (err) {
      console.log(err);
    }
  };

  const setSwapRate = async () => {
    try {
      await setRate.send(ethers.utils.parseEther(exchangeRate.toString()));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (rate?.value?.at(0)) {
      setExchangeRate(parseFloat(formatEther(rate?.value?.at(0) as BigNumber)));
    }
  }, [rate]);

  const onWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        infuraId: 'd8df2cb7844e4a54ab0a782f608749dd',
      });
      await provider.enable();
      await activate(provider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className='py-1 bg-blueGray-50'>
      <div className='w-full xl:w-1/2 px-4 mx-auto mt-24'>
        <div className='relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white '>
          <div className='rounded-t mb-0 px-4 py-3 border-0'>
            <div className='flex flex-wrap items-center'>
              <div className='relative w-full px-4 max-w-full flex-grow flex-1'>
                <h3 className='font-semibold text-lg text-blueGray-700'>
                  Pegged Palladium Token Test
                </h3>
              </div>
              <div className='relative w-full px-4 max-w-full flex-grow flex-1 text-right'>
                {!account ? (
                  <>
                    <button
                      className='bg-indigo-500 text-white active:bg-indigo-600 text-base font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                      type='button'
                      onClick={() => activateBrowserWallet()}
                    >
                      Browser Wallet
                    </button>
                    <button
                      className='bg-indigo-500 text-white active:bg-indigo-600 text-base font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                      type='button'
                      onClick={() => onWalletConnect()}
                    >
                      Wallet Connect
                    </button>
                  </>
                ) : (
                  <button
                    className='bg-indigo-500 text-white active:bg-indigo-600 text-base font-bold px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                    type='button'
                    onClick={() => deactivate()}
                  >
                    {account?.substring(0, 5) +
                      '...' +
                      account?.substring(account.length - 5, account.length)}
                  </button>
                )}
              </div>
            </div>
            <div className='block w-full overflow-x-auto mt-4'>
              <table className='items-center w-full border-collapse text-blueGray-700'>
                <tbody>
                  <tr>
                    <th className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 text-left'>
                      Eth Balance
                    </th>
                    <td className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 '>
                      {formatEther(ethBalance as BigNumber)}
                    </td>
                  </tr>

                  <tr>
                    <th className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 text-left'>
                      Token Balance
                    </th>
                    <td className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 '>
                      {tokenBalance.toString()}
                    </td>
                  </tr>
                  <tr>
                    <th className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 text-left'>
                      Swap Rate
                    </th>
                    <td className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 '>
                      {rate?.value === undefined
                        ? 0
                        : formatEther(rate?.value[0] as BigNumber)}
                    </td>
                  </tr>
                  {account && account === owner?.value?.at(0) ? (
                    <>
                      <tr>
                        <th className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 text-left'>
                          <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className='w-full'
                          />
                        </th>
                        <td className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 '>
                          <div className='grid grid-cols-2 gap-2'>
                            <button
                              type='button'
                              className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px]'
                              onClick={setWhiteList}
                            >
                              Set Whitelist
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 text-left'>
                          <input
                            value={exchangeRate}
                            type='number'
                            onChange={(e) =>
                              setExchangeRate(parseFloat(e.target.value))
                            }
                            className='w-full'
                          />
                        </th>
                        <td className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 '>
                          <div className='grid grid-cols-2 gap-2'>
                            <button
                              type='button'
                              className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px]'
                              onClick={setSwapRate}
                            >
                              Set Rate
                            </button>
                          </div>
                        </td>
                      </tr>
                    </>
                  ) : (
                    <></>
                  )}
                </tbody>
              </table>
            </div>
            {account ? (
              <div className='w-full grid grid-cols-2 gap-4 mt-5'>
                <div className='bg-[#243034] flex flex-col items-center p-10 rounded-lg'>
                  <h1 className='text-white text-[20px] leading-[30px] font-bold mb-5'>
                    To Token
                  </h1>
                  <input
                    type='number'
                    min={0}
                    max={parseFloat(formatEther(ethBalance))}
                    value={mintAmount}
                    onChange={(e) => setMintAmount(parseFloat(e.target.value))}
                    className='text-center mb-5 w-40'
                  />
                  {account === owner?.value?.at(0) ? (
                    <button
                      type='button'
                      className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px]'
                      onClick={mintToken}
                    >
                      Mint Token
                    </button>
                  ) : (
                    <></>
                  )}
                  {isWhitelist?.value?.at(0) ? (
                    <button
                      type='button'
                      className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px] mt-2'
                      onClick={swapEthToToken}
                    >
                      Get Token
                    </button>
                  ) : (
                    <></>
                  )}
                </div>
                <div className='bg-[#243034] flex flex-col items-center p-10 rounded-lg'>
                  <h1 className='text-white text-[20px] leading-[30px] font-bold mb-5'>
                    From Token
                  </h1>
                  <input
                    type='number'
                    min={0}
                    max={tokenBalance.toNumber()}
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(parseFloat(e.target.value))}
                    className='text-center mb-5 w-40'
                  />
                  {account === owner?.value?.at(0) ? (
                    <button
                      type='button'
                      className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px]'
                      onClick={burnToken}
                    >
                      Burn Token
                    </button>
                  ) : (
                    <></>
                  )}
                  {isWhitelist?.value?.at(0) ? (
                    <button
                      type='button'
                      className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px] mt-2'
                      onClick={swapTokenToEth}
                    >
                      Swap Token
                    </button>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}
            {account && !isWhitelist?.value?.at(0) ? (
              <div className='w-full'>Your wallet is not whitelisted</div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;
