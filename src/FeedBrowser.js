import React, { useState, useEffect, useRef, useReducer } from 'react'
import styled from 'styled-components'
import { useHotkeys } from 'react-hotkeys-hook'

const FeedList = styled.div`
	padding: 5px;
`

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
`

const FeedRow = styled.div`
	margin-left: ${(props) => (props.isFeed ? '20px' : '0px')};
	font-weight: ${(props) => (props.isFeed ? 'inherit' : 'bold')};
	background-color: ${(props) =>
		props.selected ? props.theme.selectbg : 'inherit'};
	color: ${(props) =>
		props.error
			? props.theme.errorentry
			: props.unread
			? 'inherit'
			: props.theme.readentry};
	padding: 2px;
	&:hover {
		background-color: ${(props) => props.theme.hoverbg};
		cursor: pointer;
	}
	${UnreadBubble} {
		background-color: ${(props) =>
			props.isFeed ? props.theme.feedbubble : props.theme.categorybubble};
	}
`

const Favico = styled.img`
	width: 16px;
	height: 16px;
	vertical-align: middle;
	margin-right: 5px;
`

const FloatingButton = styled.button`
	float: right;
	margin-top: 0px;
	margin-right: 5px;
	font-size: 12px;
	width: 30px;
	height: 30px;
`

const Collapse = styled.div`
	display: inline-block;
	float: left;
	margin-right: 2px;
	&:hover {
		cursor: pointer;
	}
`

const collapseReducer = (state, action) => {
	let newstate
	switch (action.type) {
		case 'collapse':
			newstate = [...state, action.category]
			break
		case 'expand':
			newstate = state.filter((i) => i !== action.category)
			break
		default:
			return state
	}
	localStorage.setItem('collapsed', JSON.stringify(newstate))
	return newstate
}

function FeedBrowser(props) {
	const [hideRead, setHideRead] = useState(false)
	const [collapsed, dispatch] = useReducer(
		collapseReducer,
		JSON.parse(localStorage.getItem('collapsed')) || []
	)
	const toggleHideRead = () => setHideRead(!hideRead)
	const [feeds, setFeeds] = useState([])
	const selectedFeed = useRef()

	const afterChange = (e) => {
		if (selectedFeed.current) {
			selectedFeed.current.scrollIntoView({ block: 'center' })
		}
		e.preventDefault()
	}

	useHotkeys(
		'up',
		(e) => {
			props.onFeedChange(
				feeds[
					feeds.indexOf(props.currentFeed) - 1 >= 0
						? feeds.indexOf(props.currentFeed) - 1
						: 0
				]
			)
			afterChange(e)
		},
		[props, feeds]
	)

	useHotkeys(
		'down',
		(e) => {
			props.onFeedChange(
				feeds[
					feeds.indexOf(props.currentFeed) + 1 < feeds.length
						? feeds.indexOf(props.currentFeed) + 1
						: feeds.length - 1
				]
			)
			afterChange(e)
		},
		[props, feeds]
	)

	useHotkeys('shift+u', () => toggleHideRead(), [hideRead])

	useHotkeys(
		'x',
		() => {
			if (!props.currentFeed) return
			const cat = props.currentFeed.is_feed
				? props.currentFeed.category.id
				: props.currentFeed.id
			if (cat < 0) return
			dispatch({
				type: collapsed.includes(cat) ? 'expand' : 'collapse',
				category: cat,
			})
		},
		[props.currentFeed, collapsed]
	)

	useEffect(
		() =>
			setFeeds(
				props.feeds.filter(
					(f) =>
						(!hideRead || f.unreads > 0) &&
						(!f.is_feed ||
							(f.is_feed && !collapsed.includes(f.category.id)))
				)
			),
		[props.feeds, hideRead, collapsed]
	)

	return (
		<FeedList>
			<FloatingButton
				onClick={(v) => {
					toggleHideRead()
					v.target.blur()
				}}
				title='Toggle showing all/unread feeds'>
				{hideRead ? '⚪' : '⚫'}
			</FloatingButton>
			{feeds.map((item) => (
				<div key={item.fetch_url || item.id}>
					{!item.fetch_url &&
						(collapsed.includes(item.id) ? (
							<Collapse
								onClick={() =>
									dispatch({
										type: 'expand',
										category: item.id,
									})
								}>
								⯈
							</Collapse>
						) : (
							<Collapse
								onClick={() =>
									dispatch({
										type: 'collapse',
										category: item.id,
									})
								}>
								⯆
							</Collapse>
						))}
					<FeedRow
						ref={item === props.currentFeed ? selectedFeed : null}
						isFeed={item.is_feed}
						selected={item === props.currentFeed}
						unread={item.unreads}
						error={item.parsing_error_count}
						title={item.parsing_error_message}
						onClick={() => props.onFeedChange(item)}>
						{item.is_feed && <Favico src={item.icon_data} />}
						{item.title}
						{item.unreads > 0 && (
							<UnreadBubble> {item.unreads} </UnreadBubble>
						)}
					</FeedRow>
				</div>
			))}
		</FeedList>
	)
}

export default FeedBrowser
