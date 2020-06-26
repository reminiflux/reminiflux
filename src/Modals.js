import React, { useState } from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';
import preval from 'preval.macro';
import dayjs from 'dayjs';
import { linkNewTab } from './lib/util';

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
	['w', 'Send original link to Wallabag (if configured)'],
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
		background-color: ${props => props.theme.body};
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
		background-color: ${props => props.theme.modalbg};
	}	
	`;

const ModalTitle = styled.h2`
	text-align: center;
	`;

	const KeyTable = styled.table`
	text-align: center;
	padding: 5px;
	`;

const ModalInput = styled.input`
	width: 350px
	`;

export function KeyHelpModal(props) {
	useHotkeys('esc, enter', () => { props.onClose() })

	return (
		<StyledModal isOpen={true} ariaHideApp={false}>
			<ModalTitle>Keyboard shortcuts</ModalTitle>
			<KeyTable>
			  <thead>
				  <tr>
					  <th>Key</th>
					  <th>Command</th>
				  </tr>
			  </thead>
			  <tbody>
			  	{ keyMap.map((r,i) => <tr key={i}>{ r.map((c,j) => <td key={j}>{c}</td>) }</tr>) }
			  </tbody>
		  	</KeyTable>
		  	<button onClick={props.onClose}>OK</button>
		</StyledModal>
	)
}

export function SettingsModal(props) {
	const [host, setHost] = useState(localStorage.getItem('miniflux_server'));
	const [apikey, setApikey] = useState(localStorage.getItem('miniflux_api_key'));
	const [limit, setLimit] = useState(localStorage.getItem('fetch_limit') || 100);
	const [wallabag, setWallabag] = useState(localStorage.getItem('wallabag') || "");
	const [iconCache, resetIconCache] = useState(localStorage.getItem('favicons') || "")

	useHotkeys('esc', () => { props.onClose() }, { filter: () => { return true }})
	useHotkeys('enter', () => { saveSettings() }, { filter: () => { return true }}, [host, apikey, limit, wallabag])

	const clearCache = () => {
		localStorage.removeItem('favicons');
		resetIconCache("");
	}

	const saveSettings = () => {
		localStorage.setItem('miniflux_server', host);
	    localStorage.setItem('miniflux_api_key', apikey);
		localStorage.setItem('fetch_limit', parseInt(limit) || 100);
		localStorage.setItem('wallabag', wallabag || '');
		localStorage.setItem('theme', props.theme);
		props.onSubmit();
		props.onClose();
	}

	return (
		<StyledModal isOpen={true} ariaHideApp={false}>
			<ModalTitle>Reminiflux</ModalTitle>
			<p>
				{ linkNewTab('Homepage', 'https://github.com/reminiflux/reminiflux') }
				<br/>
				Build date: { dayjs(preval`module.exports = new Date()`).format('YYYY-MM-DD HH:mm:ss (Z)') }</p>
			<h3>Settings</h3>
			<p>
			<b>Host</b> (without /v1, e.g. <i>https://miniflux.mydomain.tld</i>):
			<br/>
			<ModalInput value={host} onChange={(e) => setHost(e.target.value)} />
		  </p>
		  <p>
			<b>API key</b> (generated in Miniflux):
			<br />
			<ModalInput value={apikey} onChange={(e) => setApikey(e.target.value)} />
		  </p>
		  <p>
			<b>Maximum number of items to fetch</b>:
			<br />
			<ModalInput value={limit} onChange={(e) => setLimit(e.target.value)} />
		  </p>
		  <p>
			<b>Wallabag URL for integration</b> (optional, without /bookmarklet):
			<br />
			<ModalInput value={wallabag} onChange={(e) => setWallabag(e.target.value)} />
		  </p>
		  <p>
			  <b>Theme</b>:
			  <br />
			  <select value={props.theme} onChange={(e) => props.themeSetter(e.target.value)}>
				  <option value='light'>light</option>
				  <option value='dark'>dark</option>
			  </select>
		  </p>
		  <p>
			<b>Icon cache size</b>:
			{ Math.round(iconCache.length / 1024) }k
			<br />
			<button onClick={clearCache}>Clear cache</button>
		   </p>
			<button onClick={saveSettings}>OK</button>
			<button onClick={props.onClose}>Cancel</button>
		</StyledModal>
	)
}
