import PropTypes from 'prop-types'
import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static propTypes = {
    children: PropTypes.array.isRequired
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true })
    // You can also log the error to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      console.warn('Component error')
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}
