import React, {useState, useEffect} from 'react';
import SplitPane from 'react-split-pane';
import FeedBrowser from './FeedBrowser';
import ItemBrowser from './ItemBrowser';
import ItemViewer from './ItemViewer';
import {KeyHelpModal, SettingsModal} from './Modals';
import styled from 'styled-components';
import {useHotkeys} from 'react-hotkeys-hook';
import {apiCall} from './lib/util';
import {GlobalStyles} from "./globalStyles";
import {ThemeProvider} from "styled-components";
import {lightTheme, darkTheme} from "./themes"

import './Reminiflux.css';

const ErrorDiv = styled.div`
	padding: 10px;
	background-color: lightcoral;
	text-align: center;
	position: absolute;
	width: 100%;
	z-index: 100;
	font-weight: bold; }
	`;

const ErrorClose = styled.div`
	float: right;
	margin-right: 20px
	`;

const FloatingButton = styled.button`
	float: right;
	margin-top: 5px;
	margin-right: 5px;
	font-size: 16px;
	width: 30px;
	height: 30px;
	`;

const DEFAULT_ICON = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgODAgODAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDgwIDgwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8ZyBpZD0iX3gzN183X0Vzc2VudGlhbF9JY29uc18xOV8iPg0KCTxwYXRoIGlkPSJEb2N1bWVudCIgZD0iTTY5LjIsMjIuNEw0Ny40LDAuNkM0NywwLjIsNDYuNSwwLDQ2LDBIMTRjLTIuMiwwLTQsMS44LTQsNHY3MmMwLDIuMiwxLjgsNCw0LDRoNTJjMi4yLDAsNC0xLjgsNC00VjIzLjcNCgkJQzY5LjksMjMuMSw2OS42LDIyLjgsNjkuMiwyMi40eiBNNDgsNi44TDYzLjIsMjJINDhWNi44eiBNNjYsNzZIMTRWNGgzMHYyMGMwLDEuMSwwLjksMiwyLDJoMjBWNzZ6Ii8+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==';

const sum = (arr) => {
	return arr.reduce((a, b) => { return a + (b['unreads'] || 0)}, 0)
}

function Reminiflux() {
	const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

	const [error, setError] = useState();
	const [currentFeed, setCurrentFeed] = useState();
	const [currentItem, setCurrentItem] = useState();
	const [feeds, setFeeds] = useState([]);

	const [helpOpen, setHelpOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

	const [updateFeedsTrigger, setUpdateFeedsTrigger] = useState(true);
	const [updateUnreadTrigger, setUpdateUnreadTrigger] = useState([]);

	const [, updateState] = React.useState();
	const forceUpdate = React.useCallback(() => updateState({}), []);
	
	const cache = JSON.parse(localStorage.getItem('favicons')) || {};

	useEffect(() => { 
		const fetchFeeds = async () => {
			const f = await apiCall('feeds', setError);
			let categories = [];
			f.forEach(x => { if (!categories.find(c => c.id === x.category.id)) categories.push(x.category); });
			
			const feedTree = 
				[ { 'id': -1, 'title' : 'All', 'fetch_url' : 'entries', 'unreads' : 0 },
				  { 'id': -2, 'title' : 'Starred', 'fetch_url' : 'entries?starred=true', 'unreads' : 0 } ]
					
			categories
			.sort((a,b) => a.title.localeCompare(b.title))
			.forEach(c => {
				feedTree.push(c);
				feedTree.push(...f
					.filter(f => f.category.id === c.id)
					.sort((a,b) => a.title.localeCompare(b.title))
					.map(f => Object.assign(f, 
						{ 'fetch_url' : 'feeds/' + f.id + '/entries', 
						  'is_feed' : true })))
			 });
			
			feedTree.forEach(async f => {
				f.icon_data = DEFAULT_ICON;
				if (f.icon && f.id in cache) {
					f.icon_data = cache[f.id];
				} else if (f.icon) {
					const icon = await apiCall('feeds/' + f.id + '/icon', setError)
					f.icon_data = 'data:' + icon.data;
					localStorage.setItem(
						'favicons',
						JSON.stringify({...JSON.parse(localStorage.getItem('favicons')), [f.id] : f.icon_data }));
					forceUpdate();
				}
			})
			setFeeds(feedTree);
			setUpdateUnreadTrigger(feedTree);
		}
		if (updateFeedsTrigger) fetchFeeds();
		setUpdateFeedsTrigger(false);
		
	 }, [updateFeedsTrigger, cache, forceUpdate]);

	useEffect(() => { 
		const updateUnread = async (f, state) => {
			if (parseInt(f)) {
				state = feeds;
				f = feeds.find(x => x.id === f && x.fetch_url)
			}
			if (!f.fetch_url) return;
 
			const unread = await apiCall(f.fetch_url + 
				(f.fetch_url.includes('?') ? '&' : '?') + 
				'status=unread&limit=1', setError)
			f['unreads'] = unread.total;
			
			document.title = sum(state.filter(f => f.id > 0 && f.is_feed)) + " | reminiflux"; 
	
			state
			.filter(f => !f.fetch_url)
			.forEach(c => {
			  c['unreads'] = sum(state.filter(x => x.category && x.category.id === c.id))
			});
	
			forceUpdate();
		}
		
		if (updateUnreadTrigger.length > 0) {
			updateUnreadTrigger
			.forEach(u => updateUnread(u, updateUnreadTrigger));
			setUpdateUnreadTrigger([]);
		}
	}, [feeds, forceUpdate, updateUnreadTrigger]);

	useHotkeys('h', () => { setHelpOpen(true); })

	return (
		<ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
			<GlobalStyles />
			{ helpOpen ?
			  <KeyHelpModal onClose={() => setHelpOpen(false)} /> :
			  settingsOpen ?
			  <SettingsModal
				  theme={theme}
				  themeSetter={setTheme}
				  onClose={() => setSettingsOpen(false)}
				  onSubmit={() => setUpdateFeedsTrigger(true)} /> :

			  <div>
				{ error && 
					<ErrorDiv>
			  			API error: {String(error)}
			  			<ErrorClose>
			  				<button onClick={() => setError(null)}>X</button>
			  			</ErrorClose>
					</ErrorDiv> 
				}

				<SplitPane split="vertical" minSize={250} 
					defaultSize={parseInt(localStorage.getItem('v_split')) || "35%"}
					onChange={size => localStorage.setItem('v_split', size)}>
					<div>
			  			<FloatingButton onClick={() => setSettingsOpen(true)} title='Settings'>
							  &#9881;
						</FloatingButton>
			  			<FloatingButton onClick={async () => {
							  await apiCall('feeds/refresh', setError, {});
							  setUpdateFeedsTrigger(true)
						  }} title='Refresh feeds and counts'>
							  &#8635;
						</FloatingButton>
			  
			  			<FeedBrowser 
							currentFeed={currentFeed}
							feeds={feeds}
							onFeedChange={setCurrentFeed}
							errorHandler={setError} />
			  		</div>

			  		<SplitPane split="horizontal" minSize="10%"
						defaultSize={parseInt(localStorage.getItem('h_split')) || "40%"}
						onChange={size => localStorage.setItem('h_split', size)}>
					
						<ItemBrowser
				  			currentFeed={currentFeed}
				  			currentItem={currentItem} 
				  			feeds={feeds}
				  			onItemChange={setCurrentItem}
				  			updateUnread={setUpdateUnreadTrigger}
				  			errorHandler={setError} />

						<ItemViewer
					  		currentItem={currentItem}
					  		errorHandler={setError} />

				  	</SplitPane>
				</SplitPane>
			  </div>
			}
		</ThemeProvider>
	  );
}

export default Reminiflux;