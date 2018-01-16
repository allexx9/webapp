// Copyright 2016-2017 Rigo Investment Sarl.

import BigNumber from 'bignumber.js';

export const ERRORS = {
  invalidAccount: 'Please select an account to transact with',
  invalidRecipient: 'Please select an account to send to',
  invalidAddress: 'The address is not in the correct format',
  invalidAmount: 'Please enter a positive number > 0',
  invalidTotal: 'The amount is greater than the availale balance'
};

export function validatePositiveNumber (value) {
  let bn = null;

  try {
    bn = new BigNumber(value);
  } catch (e) {
  }

  if (!bn || !bn.gt(0)) {
    return ERRORS.invalidAmount;
  }

  return null;
}

export function validateAccount (account, api) {
  if (!account || !account.address) {
    return ERRORS.invalidAccount;
  }

  if (!api.util.isAddressValid(account.address)) {
    return ERRORS.invalidAddress;
  }



  return null;
}
