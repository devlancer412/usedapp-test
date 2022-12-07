import './App.css';
import {
  useEtherBalance,
  useCall,
  useEthers,
  useTokenBalance,
  useContractFunction,
} from '@usedapp/core';
import { formatEther, parseEther, parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { ethers, utils } from 'ethers';
import { tokenAddress } from './constants';

import { TestToken } from './gen/types';
import PegPallamdiumAbi from './gen/TestToken.json';
import { useEffect, useState } from 'react';
import { isAddress } from 'ethers/lib/utils';

const wethInterface = new utils.Interface(PegPallamdiumAbi.abi);
const contract = new Contract(
  tokenAddress as string,
  wethInterface
) as TestToken;

function App() {
  const { account, activateBrowserWallet } = useEthers();
  // call
  const ethBalance = useEtherBalance(account) || BigNumber.from(0);
  const tokenBalance =
    useTokenBalance(tokenAddress, account) || BigNumber.from(0);
  const tax = useCall({ contract, method: 'tax', args: [] });
  const taxReceiver = useCall({ contract, method: 'taxReceiver', args: [] });
  const owner = useCall(
    account && {
      contract,
      method: 'owner',
      args: [],
    }
  );
  // send
  const approveFunc = useContractFunction(contract, 'approveToken', {
    transactionName: 'Wrap',
  });
  const airdropFunc = useContractFunction(contract, 'airdrop', {
    transactionName: 'Wrap',
  });
  const setTaxFunc = useContractFunction(contract, 'setTax', {
    transactionName: 'Wrap',
  });
  const setTaxReceiverFunc = useContractFunction(contract, 'setTaxReceiver', {
    transactionName: 'Wrap',
  });
  // state
  const [approveAmount, setApproveAmount] = useState<number>(0);
  const [airdropAmount, setAirdropAmount] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [address, setAddress] = useState<string>('');
  const [addresses, setAddresses] = useState<string>('');
  const [taxReceiverAddress, setTaxReceiverAddress] = useState<string>('');

  const setTax = async () => {
    const tx = await setTaxFunc.send(exchangeRate);
  };

  const setTaxReceiver = async () => {
    if (!isAddress(taxReceiverAddress)) {
      setTaxReceiverAddress('Invalid Address');
      return;
    }

    const tx = await setTaxReceiverFunc.send(taxReceiverAddress);
  };

  const approve = async () => {
    console.log(address);
    if (!tax || !tax?.value || !isAddress(address)) {
      return;
    }

    const tx = await approveFunc.send(address, parseEther('' + approveAmount), {
      value: (tax?.value[0] as BigNumber).mul(1e10),
    });
  };

  const airdrop = async () => {
    const addressList = addresses
      .split(',')
      .filter((address) => isAddress(address));

    if (!addressList.length || !airdropAmount) {
      return;
    }

    await airdropFunc.send(parseEther('' + airdropAmount), addressList);
  };

  return (
    <section className='py-1 bg-blueGray-50'>
      <div className='w-full xl:w-1/2 px-4 mx-auto mt-24'>
        <div className='relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white '>
          <div className='rounded-t mb-0 px-4 py-3 border-0'>
            <div className='flex flex-wrap items-center'>
              <div className='relative w-full px-4 max-w-full flex-grow flex-1'>
                <h3 className='font-semibold text-lg text-blueGray-700'>
                  Token Test
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
                    <th className='px-6 align-middle text-base whitespace-nowrap p-4 text-left'>
                      Eth Balance
                    </th>
                    <td className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 '>
                      {formatEther(ethBalance as BigNumber)}
                    </td>
                  </tr>

                  <tr>
                    <th className='px-6 align-middle text-base whitespace-nowrap p-4 text-left'>
                      Token Balance
                    </th>
                    <td className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 '>
                      {formatEther(tokenBalance)}
                    </td>
                  </tr>
                  <tr>
                    <th className='px-6 align-middle text-base whitespace-nowrap p-4 text-left'>
                      Tax(Gwei)
                    </th>
                    <td className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 '>
                      {tax?.value === undefined
                        ? 0
                        : (tax?.value[0] as BigNumber).toNumber()}
                    </td>
                  </tr>
                  <tr>
                    <th className='px-6 align-middle text-base whitespace-nowrap p-4 text-left'>
                      Tax Receiver
                    </th>
                    <td className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 '>
                      {taxReceiver?.value === undefined
                        ? ''
                        : taxReceiver?.value}
                    </td>
                  </tr>
                  {account === owner?.value?.at(0) ? (
                    <>
                      <tr>
                        <th className='px-6 align-middle text-base whitespace-nowrap p-4 text-left'>
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
                              onClick={() => setTax()}
                            >
                              Set Tax
                            </button>
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <th className='px-6 align-middle text-base whitespace-nowrap p-4 text-left'>
                          <input
                            value={taxReceiverAddress}
                            type='string'
                            placeholder='Please insert receiver address here'
                            onChange={(e) =>
                              setTaxReceiverAddress(e.target.value)
                            }
                            className='w-full'
                          />
                        </th>
                        <td className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 '>
                          <div className='grid grid-cols-2 gap-2'>
                            <button
                              type='button'
                              className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px]'
                              onClick={() => setTaxReceiver()}
                            >
                              Set Tax Receiver
                            </button>
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <th className='px-6 align-middle text-base whitespace-nowrap p-4 text-left'>
                          <input
                            value={addresses}
                            type='string'
                            placeholder="Please insert addresses with ','"
                            onChange={(e) => setAddresses(e.target.value)}
                            className='w-3/4'
                          />
                          <input
                            value={airdropAmount ?? 0}
                            type='number'
                            placeholder='Please insert airdrop amount'
                            onChange={(e) =>
                              setAirdropAmount(
                                parseFloat(e.target.value ?? '0')
                              )
                            }
                            className='w-1/4'
                          />
                        </th>
                        <td className='border-t-0 px-6 align-middle border-l-0 border-r-0 text-base whitespace-nowrap p-4 '>
                          <div className='grid grid-cols-2 gap-2'>
                            <button
                              type='button'
                              className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px]'
                              onClick={() => airdrop()}
                            >
                              Airdrop
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
            <div className='w-full grid grid-cols-1 gap-4 mt-5'>
              <div className='bg-[#243034] flex flex-col items-center p-10 rounded-lg'>
                <h1 className='text-white text-[20px] leading-[30px] font-bold mb-5'>
                  Approve
                </h1>
                <input
                  type='address'
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className='text-center mb-5 w-full'
                />
                <input
                  type='number'
                  min={0}
                  max={parseFloat(formatEther(tokenBalance))}
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(parseFloat(e.target.value))}
                  className='text-center mb-5 w-40'
                />
                {account ? (
                  <button
                    type='button'
                    className='rounded-[5px] py-2 px-10 text-black bg-[#10E98C] text-[15px] leading-[22px]'
                    onClick={approve}
                  >
                    Approve
                  </button>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;
