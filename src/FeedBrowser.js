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
	background-color: ${props => (props.selected ? 'lightslategrey' : 'inherit') };
	color: ${props => (props.error ? 'red' : (props.unread ? 'black' : 'lightgray'))};
	padding: 2px;
	&:hover {
		background-color: grey;
		cursor: pointer
	}
	${UnreadBubble}{
		background-color: ${props => (props.isFeed ? '#2a89bc' : '#454545' )};
	}
	`;

const Favico = styled.img`
	width: 16px;
	height: 16px;
	vertical-align: middle;
	margin-right: 5px;
	`;

function FeedBrowser(props) {

	const [showAll, setShowAll] = useState(true);
	const toggleShowAll = () => setShowAll(!showAll);
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

	useHotkeys('shift+u', () => toggleShowAll(), [showAll]);

	useEffect(() => setFeeds(props.feeds.filter(f => showAll || f.unreads > 0)), [props.feeds, showAll]);
	
	return (
		<FeedList>
			<button onClick={toggleShowAll}>Unread/All</button>
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
