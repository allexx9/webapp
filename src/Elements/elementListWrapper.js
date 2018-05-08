import Immutable from 'immutable'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Loading from '../_atomic/atoms/loading'

class ElementListWrapper extends Component {

  static propTypes = {
    list: PropTypes.array,
    location: PropTypes.object,
    match: PropTypes.object,
    poolType: PropTypes.string,
    children: PropTypes.object,
    loading: PropTypes.bool
  };

  render() {
    // Exstracting the list form props
    // and checking if the list === null
    const {list, ...rest} = this.props;
    if (Object.keys(list).length === 0 && this.props.loading) {
      return <Loading />
    }
    const immutableList = Immutable.List(list) 
    // Merging the immutable list into the props passed to children
    const newProps = { list: immutableList,  ...rest}
    return (    
      <span>
        {React.cloneElement(this.props.children, newProps)}
      </span>
    )
    
  }
}

export default ElementListWrapper