// Copyright 2016-2017 Rigo Investment Sarl.

const PING = 'PING';
const PONG = 'PONG';

const pingReducer = (state = { isPinging: false }, action) => {
  console.log(action)
  switch (action.type) {
    // case PING:
    // return {
    //   ...state, isPinging: true 
    // };

    case PONG:
    return {
      ...state, isPinging: false
    };

    default:
      return state;
  }
};


export default pingReducer