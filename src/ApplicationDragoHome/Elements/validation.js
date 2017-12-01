// Copyright 2016-2017 Gabriele Rigo

import BigNumber from 'bignumber.js'

export const ERRORS = {
  invalidAccount: 'Please select an account to transact with',
  invalidRecipient: 'Please select an account to send to',
  invalidAddress: 'The address is not in the correct format',
  invalidAmount: 'Please enter a positive number > 0',
  invalidTotal: 'The amount is greater than the availale balance',
  invalidName: 'Please enter a valid name',
  invalidSymbol: 'Please enter a valid symbol',
  invalidSymbolLeng: 'Symbol has to be 3 chars long',
  invalidSymbolReg: 'Only alphanumeric symbols allowed'
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
  return null
}

export function validateNewName(name) {
  // Checking if html in name 
  var tmp = document.createElement("DIV")
  tmp.innerHTML = name
  console.log(tmp.textContent)
  if (!name) {
    return ERRORS.invalidName
  }
  if (name !== tmp.textContent) {
    return ERRORS.invalidName
  }
  return null
}

export function validateNewSymbol (symbol) {
  var reg = /[^A-Za-z0-9 ]/
  console.log(symbol.length)
  if (!symbol) {
    return ERRORS.invalidSymbol
  }
  if (symbol.length !== 3) {
    return ERRORS.invalidSymbolLeng
  }
  if (reg.test(symbol)) {
    return ERRORS.invalidSymbolReg
  }
  return null
}
