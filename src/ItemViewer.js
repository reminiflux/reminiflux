import React, { useState, useEffect, useRef } from 'react'
import { apiCall, formatDate, linkNewTab } from './lib/util'
import styled from 'styled-components'
import { useHotkeys } from 'react-hotkeys-hook'

const ItemHeader = styled.div`
	padding: 2px;
	background-color: ${(props) => props.theme.itemheaderbg};
	border-bottom: 1px solid lightgrey;
	margin-left: 2px;
	margin-right: 2px;
`

const ItemHeaderContent = styled.div`
	display: inline-block;
`

const ItemContent = styled.div`
	padding: 5px;
`

const StarButton = styled.div`
	display: inline-block;
	float: right;
	font-size: 20px;
	&:hover {
		cursor: pointer;
	}
`

const WallabagButton = styled.div`
	display: inline-block;
	float: right;
	&:hover {
		cursor: pointer;
	}
	img {
		width: 27px;
		height: 27px;
	}
`

function wallabag(url) {
	const w = localStorage.getItem('wallabag')
	if (!w) return
	window.open(
		w.replace(/\/$/, '') + '/bookmarklet?url=' + encodeURIComponent(url),
		'_blank'
	)
}

function ItemViewer(props) {
	const [item, setItem] = useState()
	const topRef = useRef()

	useHotkeys('f', () => toggleStar(), [item])
	useHotkeys('v', () => item && window.open(item.url, '_blank'), [item])
	useHotkeys(
		'c',
		() => item && window.open(item.comments_url || item.url, '_blank'),
		[item]
	)
	useHotkeys('w', () => item && wallabag(item.url), [item])
	useHotkeys('pagedown', (e) => {
		e.preventDefault()
		const el = document.getElementsByClassName('Pane horizontal Pane2')[1]
		el.scrollTop += el.clientHeight
	})
	useHotkeys('pageup', (e) => {
		e.preventDefault()
		const el = document.getElementsByClassName('Pane horizontal Pane2')[1]
		el.scrollTop -= el.clientHeight
	})

	useEffect(() => {
		setItem(props.currentItem)
		if (topRef.current) topRef.current.scrollIntoView()
	}, [props.currentItem])

	const toggleStar = async () => {
		if (item) {
			await apiCall(
				'entries/' + item.id + '/bookmark',
				props.errorHandler,
				{}
			)
			// update in item, which is a reference to an element in props.items, so that the change
			// persists in the overall item list as long as it is not refetched
			item.starred = !item.starred
			// update also item to trigger rerender
			setItem({ ...item, starred: item.starred })
		}
	}

	return !item ? null : (
		<div ref={topRef}>
			<ItemHeader>
				<ItemHeaderContent>
					{linkNewTab(item.title, item.url)}
					&nbsp;
					{linkNewTab(
						<span role='img' aria-label='comments'>
							&#128172;
						</span>,
						item.comments_url || item.url,
						true
					)}
					<br />
					{item.author || item.feed.title},{' '}
					{formatDate(item.published_at)}
				</ItemHeaderContent>
				<StarButton title='Toggle star' onClick={toggleStar}>
					{String.fromCharCode(item.starred ? 9733 : 9734)}
				</StarButton>
				{localStorage.getItem('wallabag') && (
					<WallabagButton onClick={() => wallabag(item.url)}>
						<img
							alt='Wallabag'
							title='Send to Wallabag'
							src='/wallabag.svg'
						/>
					</WallabagButton>
				)}
			</ItemHeader>
			<ItemContent
				id='itemcontent'
				dangerouslySetInnerHTML={{ __html: item.content }}
			/>
		</div>
	)
}

export default ItemViewer
