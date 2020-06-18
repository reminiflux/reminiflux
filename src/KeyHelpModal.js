import React from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';

const keyMap = [
	['Up', 'Open previous feed'],
	['Down', 'Open next feed'],
	['U', 'Toggle showing unread/all feeds'],
	['Left/p/k', 'Open previous item'],
	['Right/n/j/Space', 'Open next item'],
	['Home', 'Open first item'],
	['End', 'Open last item'],
	['PageUp', 'Scroll item content up'],
	['PageDown', 'Scroll item content down'],
	['m', 'Mark item as read/unread'],
	['A', 'Mark all items as read'],
	['u', 'Toggle showing unread/all items'],
	['s', 'Toggle item sort order (newest/oldest first)'],
	['f', 'Star/unstar item'],
	['v', 'Open original link in new tab'],
	['c', 'Open comments link in new tab'],
	['h', 'Show keyboard shortcuts'],
	['Escape/Enter', 'Close modal window']
]

const ReactModalAdapter = ({ className, modalClassName, ...props }) => {
	return (
	  <Modal
		className={modalClassName}
		portalClassName={className}
		{...props} />
	)
}

const StyledModal = styled(ReactModalAdapter).attrs({
	overlayClassName: 'Overlay',
	modalClassName: 'Modal'
  })`
	.Modal {
		position: absolute;
		top: 50%;
		left: 50%;
		right: auto;
		bottom: auto;
		background-color: white;
		padding: 10px;
		margin-right: -50%;
		transform: translate(-50%, -50%);
		}
	.Overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: darkgray;
	}	
	`;

const ModalHead = styled.h3`
	text-align: center;
	`;

const KeyTable = styled.table`
	text-align: center;
	padding: 5px;
	`;

function KeyHelpModal(props) {
	return (
		<StyledModal isOpen={true} ariaHideApp={false}>
			<ModalHead>Keyboard shortcuts</ModalHead>
			<KeyTable>
			  <thead>
				  <tr>
					  <th>Key</th>
					  <th>Command</th>
				  </tr>
			  </thead>
			  <tbody>
			  	{ keyMap.map(r => <tr> { r.map(c => <td> {c} </td>) } </tr>) }
			  </tbody>
		  	</KeyTable>
		  	<button onClick={props.onClose}>OK</button>
		</StyledModal>
	)
}

export default KeyHelpModal;