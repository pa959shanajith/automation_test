import React from 'react';
import {PopupMsg} from '../index';

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
			return <PopupMsg content='Something went wrong! Please refresh the page.' title='ERROR' submitText='OK' close={onclose} submit={onclose}/>
		}
		return this.props.children; 
    }
}

const onclose = () =>{
//maybe report issue to backend for bug logs...
  	window.location.reload()
}

export default ErrorBoundary;