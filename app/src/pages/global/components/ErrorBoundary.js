import React from 'react';
import {VARIANT, setMsg} from '../index';
import { Messages } from './Messages';

class ErrorBoundary extends React.Component {
    constructor(props) {
		super(props);
		this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      	// Update state so the next render will show the fallback UI.
     	return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
		// You can also log the error to an error reporting service
		console.error(error, errorInfo);
    }
  
    render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return setMsg(Messages.CUSTOM('Something went wrong! Please refresh the page.', VARIANT.ERROR))
		}
		return this.props.children; 
    }
}

const onclose = () =>{
//maybe report issue to backend for bug logs...
  	window.location.reload()
}

export default ErrorBoundary;