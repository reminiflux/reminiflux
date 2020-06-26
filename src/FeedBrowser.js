import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';

const FeedList = styled.div`
	padding: 5px
	`;

const UnreadBubble = styled.div`
	margin-left: 10px;
	border-radius: 4px;
	font-weight: bold;
	text-align: center;
	font-size: 10px;
	color: white;
	min-width: 20px;
	display: inline-block;
	padding: 1px;
	`;

const FeedRow = styled.div`
	margin-left: ${props => (props.isFeed ? '20px' : '0px')};
	font-weight: ${props => (props.isFeed ? 'inherit' : 'bold')};
	background-color: ${props => (props.selected ? props.theme.selectbg : 'inherit') };
	color: ${props => (props.error ? props.theme.errorentry : (props.unread ? 'inherit' : props.theme.readentry))};
	padding: 2px;
	&:hover {
		background-color: ${props => props.theme.hoverbg};
		cursor: pointer
	}
	${UnreadBubble}{
		background-color: ${props => (props.isFeed ? props.theme.feedbubble : props.theme.categorybubble )};
	}
	`;

const Favico = styled.img`
	width: 16px;
	height: 16px;
	vertical-align: middle;
	margin-right: 5px;
	`;

const FloatingButton = styled.button`
	float: right;
	margin-top: 0px;
	margin-right: 5px;
	font-size: 12px;
	width: 30px;
	height: 30px;
	`;

function FeedBrowser(props) {

	const [hideRead, setHideRead] = useState(false);
	const toggleHideRead = () => setHideRead(!hideRead);
	const [feeds, setFeeds] = useState([]);
	const selectedFeed = useRef();

	const afterChange = (e) => {
		if (selectedFeed.current) { 
			selectedFeed.current.scrollIntoView({block: 'center'});
		}
		e.preventDefault();
	}

	useHotkeys('up', (e) => {
		props.onFeedChange(feeds[
			feeds.indexOf(props.currentFeed) - 1 >= 0 ?
			feeds.indexOf(props.currentFeed) - 1 :
			0]);
		afterChange(e);
		}, [props, feeds]);

	useHotkeys('down', (e) => {
		props.onFeedChange(feeds[
			feeds.indexOf(props.currentFeed) + 1 < feeds.length ?
			feeds.indexOf(props.currentFeed) + 1 :
			feeds.length - 1]);
		afterChange(e);
		}, [props, feeds]);

	useHotkeys('shift+u', () => toggleHideRead(), [hideRead]);

	useEffect(() => setFeeds(props.feeds.filter(f => !hideRead || f.unreads > 0)), [props.feeds, hideRead]);
	
	return (
		<FeedList>
			<FloatingButton onClick={(v) => { toggleHideRead(); v.target.blur(); }} title="Toggle showing all/unread feeds">
				{hideRead ? '⚪' : '⚫' }
			</FloatingButton>
			{ feeds
			  .map(item => (
				<FeedRow
				  key = { item.fetch_url || item.id }
				  ref = { item === props.currentFeed ? selectedFeed : null }
				  isFeed = { item.is_feed }
				  selected = { item === props.currentFeed }
				  unread = { item.unreads }
				  error = { item.parsing_error_count }
				  title = { item.parsing_error_message }
				  onClick= { () => props.onFeedChange(item) }>
					{ item.is_feed && <Favico src={item.icon_data} /> }
					{ item.title }
					{ item.unreads > 0 && <UnreadBubble> {item.unreads} </UnreadBubble> }
				</FeedRow>
			))}
		</FeedList>
	)
}

export default FeedBrowser;
