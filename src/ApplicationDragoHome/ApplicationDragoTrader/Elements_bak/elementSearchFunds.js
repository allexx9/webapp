import Autosuggest from 'react-autosuggest'
import Immutable from 'immutable'
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types';

import { generateRandomList } from './utils'

// Imagine you have a list of funds that you'd like to autosuggest.
// const funds = [
//   {
//     name: 'C',
//     year: 1972
//   },
//   {
//     name: 'Elm',
//     year: 2012
//   },
// ]

var funds = null

// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = (value, list) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;
  const funds = list.toJS()
  console.log(funds)
  return inputLength === 0 ? [] : funds.filter(fund =>
    fund.params.name.value.toLowerCase().slice(0, inputLength) === inputValue
  )
}

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.params.name.value;

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => (
  <div style={{position: 'absolute'}}>
    {suggestion.params.name.value}
  </div>

)

// Using material-ui to render input field
const renderInputComponent = inputProps => (
  <TextField
      hintText=""
      floatingLabelText="Search pools"
      style={{
        width:'100%',
        fontSize:'16px'
      }}
      {...inputProps} />
  );

class SearchFunds extends Component {

  state = {
    value: '',
    suggestions: []
  }

  static PropTypes = {
    fundsList: PropTypes.object.isRequired,
  };

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    const { fundsList } = this.props
    this.setState({
      suggestions: getSuggestions(value, fundsList)
    }, console.log(this.state.suggestions));
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state
    const { fundsList } = this.props


    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: '',
      value,
      onChange: this.onChange
    };
    this.funds = fundsList.toJS()
    console.log(fundsList)
    console.log(this.funds)
    // Finally, render it!
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        shouldRenderSuggestions={false}
        inputProps={inputProps}
        renderInputComponent={renderInputComponent}
      />
    );
  }
}

export default SearchFunds