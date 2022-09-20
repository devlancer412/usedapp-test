import './App.css';
import {
  useEtherBalance,
  useCall,
  useEthers,
  useTokenBalance,
  useContractFunction,
} from '@usedapp/core';
import { formatEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { utils } from 'ethers';
import { tokenAddress } from './constants';

import { PegPalladium } from './gen/types';
import PegPallamdiumAbi from './gen/PegPalladium.json';
import { useState } from 'react';

const wethInterface = new utils.Interface(PegPallamdiumAbi.abi);
const contract = new Contract(
  tokenAddress as string,
  wethInterface
) as PegPalladium;

function App() {
  const { account, activateBrowserWallet } = useEthers();
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
  const isAdmin = useCall(
    account && {
      contract,
      method: 'isAdmin',
      args: [account as string],
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
  const adminFunc = useContractFunction(contract, 'setAdmin', {
    transactionName: 'Wrap',
  });
  // state
  const [mintAmount, setMintAmount] = useState<number>(0);
  const [burnAmount, setBurnAmount] = useState<number>(0);
  const [address, setAddress] = useState<string>('');

  const setWhiteList = async () => {
    try {
      await whitelistFunc.send(address);
    } catch (err) {
      console.log(err);
    }
  };

  const setAdmin = async () => {
    try {
      await adminFunc.send(address);
    } catch (err) {
      console.log(err);
    }
  };

  const mintToken = async () => {
    try {
      await mintFunc.send({
        value: utils.parseEther(mintAmount.toString()),
      });
    } catch (err) {
      console.log(err);
    }
  };

  const burnToken = async () => {
    try {
      await burnFunc.send(utils.parseEther(burnAmount.toString()));
    } catch (err) {
      console.log(err);
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
                  <button
                    className='bg-indigo-500 text-white active:bg-indigo-600 text-base font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                    type='button'
                    onClick={() => activateBrowserWallet()}
                  >
                    Connect wallet
                  </button>
                ) : (
                  <button
                    className='bg-indigo-500 text-white active:bg-indigo-600 text-base font-bold px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                    type='button'
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
                      {formatEther(tokenBalance as BigNumber)}
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
                  {isAdmin?.value?.at(0) ? (
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
                          <button
                            type='button'
                            className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px]'
                            onClick={setAdmin}
                          >
                            Set Admin
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <></>
                  )}
                </tbody>
              </table>
            </div>
            {isWhitelist?.value?.at(0) ? (
              <div className='w-full grid grid-cols-2 gap-4 mt-5'>
                <div className='bg-[#243034] flex flex-col items-center p-10 rounded-lg'>
                  <h1 className='text-white text-[20px] leading-[30px] font-bold mb-5'>
                    Mint
                  </h1>
                  <input
                    type='number'
                    min={0}
                    max={parseFloat(formatEther(ethBalance))}
                    step={0.1}
                    value={mintAmount}
                    onChange={(e) => setMintAmount(parseFloat(e.target.value))}
                    className='text-center mb-5 w-40'
                  />
                  <button
                    type='button'
                    className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px]'
                    onClick={mintToken}
                  >
                    Mint Token
                  </button>
                </div>
                <div className='bg-[#243034] flex flex-col items-center p-10 rounded-lg'>
                  <h1 className='text-white text-[20px] leading-[30px] font-bold mb-5'>
                    Burn
                  </h1>
                  <input
                    type='number'
                    min={0}
                    max={parseFloat(formatEther(tokenBalance))}
                    step={0.1}
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(parseFloat(e.target.value))}
                    className='text-center mb-5 w-40'
                  />
                  <button
                    type='button'
                    className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px]'
                    onClick={burnToken}
                  >
                    Burn Token
                  </button>
                </div>
              </div>
            ) : (
              <div className='w-full'>Your wallet is not whitelisted</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;
