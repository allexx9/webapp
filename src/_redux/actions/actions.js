// Copyright 2016-2017 Rigo Investment Sarl.

import {
  ATTACH_INTERFACE,
  UPDATE_INTERFACE,
} from '../_utils/const'

class actions {

  attachInterfaceAction = () => {
    return {
      type: ATTACH_INTERFACE,
      payload: new Promise(resolve => {
        this.attachInterface().then(result =>{
          resolve(result);
    })
    })
    }
  };

  updateInterfaceAction = (endpoint) => {
    return {
      type: UPDATE_INTERFACE,
      payload: endpoint
    }
  };

}

var Actions = new actions();
export { Actions };