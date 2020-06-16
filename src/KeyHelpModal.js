import React from 'react';
import Modal from 'react-modal';
import './Modals.css';

class KeyHelpModal extends React.Component {
	constructor(props) {
	  super(props);
      this.state = {
		  isOpen: false
	  }
	  this.closeHelp = this.closeHelp.bind(this);
	}
	
	componentDidMount() {
		this.setState({isOpen: true});
	}

	closeHelp() {
	  this.setState({isOpen: false});
	  this.props.onClose();
	}
  
	render() {
		return (
		  <Modal isOpen={this.state.isOpen} ariaHideApp={false} className="modal" overlayClassName="overlay">
		  <h3>Keyboard shortcuts</h3>
		  <table className="keyhelp">
			  <thead>
				  <tr>
					  <th>Key</th>
					  <th>Command</th>
				  </tr>
			  </thead>
			  <tbody>
				  <tr><td>Up</td><td>Open previous feed</td></tr>
				  <tr><td>Down</td><td>Open next feed</td></tr>
				  <tr><td>Left/p/k</td><td>Open previous item</td></tr>
				  <tr><td>Right/n/j/Space</td><td>Open next item</td></tr>
				  <tr><td>Home</td><td>Open first item</td></tr>
				  <tr><td>End</td><td>Open last item</td></tr>
				  <tr><td>PageUp</td><td>Scroll item content up</td></tr>
				  <tr><td>PageDown</td><td>Scroll item content down</td></tr>
				  <tr><td>m</td><td>Mark item as read/unread</td></tr>
				  <tr><td>A</td><td>Mark all items as read</td></tr>
				  <tr><td>u</td><td>Toggle showing unread/all items</td></tr>
				  <tr><td>s</td><td>Toggle item sort order (newest/oldest first)</td></tr>
				  <tr><td>f</td><td>Star/unstar item</td></tr>
				  <tr><td>v</td><td>Open original link in new tab</td></tr>
				  <tr><td>c</td><td>Open comments link in new tab</td></tr>
				  <tr><td>h</td><td>Show keyboard shortcuts</td></tr>
				  <tr><td>Escape/Enter</td><td>Close modal window</td></tr>
			  </tbody>
		  </table>
		  <p/>
		  <button onClick={this.closeHelp}>OK</button>
		</Modal>
		);
	  }
	}

export default KeyHelpModal;