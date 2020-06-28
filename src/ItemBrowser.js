import React, { useState, useEffect, useRef } from 'react'
import { apiCall, relaTimestamp, linkNewTab } from './lib/util'
import SplitPane from 'react-split-pane'
import styled from 'styled-components'
import { useHotkeys } from 'react-hotkeys-hook'

const Favico = styled.img`
	width: 16px;
	height: 16px;
	vertical-align: middle;
`

const StatusDot = styled.div`
	height: 10px;
	width: 10px;
	border: 1px solid #bbb;
	background-color: ${(props) =>
		props.read ? props.theme.body : props.theme.unreaddot};
	border-radius: 50%;
	display: inline-block;
`

const ItemListTable = styled.table`
	border: none;
	border-collapse: collapse;
	width: 100%;
	table-layout: fixed;
`

const ItemListRow = styled.tr`
	color: ${(props) => (props.read ? props.theme.readentry : 'inherit')};
	background-color: ${(props) =>
		props.selected ? props.theme.selectbg : 'inherit'};
	&:hover {
		background-color: ${(props) => props.theme.hoverbg};
		cursor: pointer;
	}
`

const ItemListCell = styled.td`
	white-space: nowrap;
	overflow: hidden;
	width: ${(props) => props.width || '100%'};
	text-align: ${(props) => props.align || 'left'};
`

const ContentPreview = styled.span`
	font-size: 80%;
	color: ${(props) => props.theme.preview};
	margin-left: 10px;
`

const extractContent = (s) => {
	var span = document.createElement('span')
	span.innerHTML = s.slice(0, 500)
	span.querySelectorAll('*').forEach((c) =>
		c.textContent ? (c.textContent += ' ') : (c.innerText += ' ')
	)
	return [span.textContent || span.innerText].toString().replace(/ +/g, ' ')
}

const FeedItem = React.forwardRef((props, ref) => (
	<ItemListRow
		read={props.item.status !== 'unread'}
		ref={ref}
		selected={props.selected}>
		<ItemListCell width='20px'>
			<Favico
				src={props.feed.icon_data}
				alt={props.feed.title}
				title={props.feed.title}
			/>
		</ItemListCell>
		<ItemListCell onClick={props.markRead} width='20px'>
			<StatusDot read={props.item.status !== 'unread'} />
		</ItemListCell>
		<ItemListCell onClick={props.onItemChange}>
			{props.item.title}
			<ContentPreview>
				{extractContent(props.item.content)}
			</ContentPreview>
		</ItemListCell>
		<ItemListCell
			width='40px'
			align='right'
			onClick={props.onItemChange}
			title={props.item.published_at}>
			{relaTimestamp(props.item.published_at)}
		</ItemListCell>
	</ItemListRow>
))

function FeedItemList(props) {
	const selectedItem = useRef()

	const itemChange = (item) => {
		if (item) {
			props.onItemChange(item)
			if (item.status === 'unread') props.markRead([item])
		}
	}
	const kbItemChange = (item, e) => {
		itemChange(item)
		if (selectedItem.current)
			selectedItem.current.scrollIntoView({ block: 'center' })
		e.preventDefault()
	}
	useHotkeys(
		'left,p,k',
		(e) => {
			kbItemChange(
				props.items[
					props.currentIndex - 1 >= 0 ? props.currentIndex - 1 : 0
				],
				e
			)
		},
		[props]
	)
	useHotkeys(
		'right,n,j,space',
		(e) => {
			kbItemChange(
				props.items[
					props.currentIndex + 1 < props.items.length
						? props.currentIndex + 1
						: props.currentIndex < 0
						? 0
						: props.items.length - 1
				],
				e
			)
		},
		[props]
	)
	useHotkeys(
		'home',
		(e) => {
			kbItemChange(props.items[0], e)
		},
		[props]
	)
	useHotkeys(
		'end',
		(e) => {
			kbItemChange(props.items[props.items.length - 1], e)
		},
		[props]
	)
	useHotkeys(
		'm',
		(e) => {
			if (props.currentIndex >= 0)
				props.markRead(
					[props.items[props.currentIndex]],
					props.items[props.currentIndex].status === 'unread'
				)
		},
		[props]
	)

	return (
		<ItemListTable>
			<tbody>
				{props.items.map((item) => (
					<FeedItem
						key={item.id}
						ref={props.currentItem === item ? selectedItem : null}
						item={item}
						selected={props.currentItem === item}
						feed={props.feeds.find(
							(f) => f.id === item.feed.id && f.category
						)}
						onItemChange={() => itemChange(item)}
						markRead={() =>
							props.markRead([item], item.status === 'unread')
						}
						errorHandler={props.errorHandler}
					/>
				))}
			</tbody>
		</ItemListTable>
	)
}

const Header = styled.div`
	padding: 2px;
	width: 100%;
	background: ${(props) => props.theme.listheaderbg};
	border-bottom: 1px solid lightgray;
`
const HeaderText = styled.div`
	display: inline-block;
	position: relative;
	top: 50%;
	transform: translateY(-50%);
`
const HeaderTitle = styled.span`
	font-weight: bold;
	font-size: 120%;
`
const HeaderCount = styled.span`
	font-size: 90%;
`
const HeaderControls = styled.div`
	float: right;
`
const ControlButton = styled.button`
	height: 20px;
	font-size: 90%;
	width: 40px;
	margin-right: 5px;
`

function FeedItemHeader(props) {
	const markAllRead = () => {
		props.markRead(props.items)
	}
	const markReadUntil = () => {
		if (props.currentIndex >= 0)
			props.markRead(props.items.slice(0, props.currentIndex + 1))
	}
	const markReadAfter = () => {
		if (props.currentIndex >= 0)
			props.markRead(props.items.slice(props.currentIndex))
	}
	useHotkeys('shift+A', () => markAllRead(), [props.items])
	useHotkeys('u', () => props.setShowRead(!props.showRead), [props.showRead])
	useHotkeys('s', () => props.setSortOldFirst(!props.sortOldFirst), [
		props.sortOldFirst,
	])

	return (
		<Header>
			{props.currentFeed && (
				<HeaderText>
					<HeaderTitle>
						{props.currentFeed.title}
						&nbsp;
						{props.currentFeed.site_url &&
							linkNewTab(
								<span>&#8599;</span>,
								props.currentFeed.site_url,
								true
							)}
					</HeaderTitle>
					&nbsp;
					<HeaderCount>({props.items.length} items)</HeaderCount>
				</HeaderText>
			)}

			<HeaderControls>
				<ControlButton onClick={markAllRead} title='Mark all as read'>
					{' '}
					&#10003;{' '}
				</ControlButton>
				<ControlButton
					onClick={markReadUntil}
					title='Mark all until selection as read'>
					{' '}
					&#11123;{' '}
				</ControlButton>
				<ControlButton
					onClick={markReadAfter}
					title='Mark all after selection as read'>
					{' '}
					&#11121;{' '}
				</ControlButton>
				<select
					value={props.showRead ? 'a' : 'u'}
					onChange={(v) => {
						props.setShowRead(v.target.value === 'a')
						v.target.blur()
					}}>
					<option value='u'>Show unread only</option>
					<option value='a'>Show all</option>
				</select>
				<select
					value={props.sortOldFirst ? 'o' : 'n'}
					onChange={(v) => {
						props.setSortOldFirst(v.target.value === 'o')
						v.target.blur()
					}}>
					<option value='n'>Newest first</option>
					<option value='o'>Oldest first</option>
				</select>
			</HeaderControls>
		</Header>
	)
}

function ItemBrowser(props) {
	const [items, setItems] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [sortOldFirst, setSortOldFirst] = useState(
		localStorage.getItem('sort') === 'o'
	)
	const [showRead, setShowRead] = useState(
		localStorage.getItem('filter') === 'a'
	)

	useEffect(() => {
		const fetchItems = async () => {
			if (props.currentFeed) {
				setIsLoading(true)
				const urls = props.currentFeed.fetch_url
					? [props.currentFeed.fetch_url]
					: props.feeds
							.filter((f) => f.category)
							.filter(
								(f) => f.category.id === props.currentFeed.id
							)
							.map((f) => f.fetch_url)
				const result = await Promise.all(
					urls.map((u) =>
						apiCall(
							u +
								(u.includes('?') ? '&' : '?') +
								'limit=' +
								(parseInt(
									localStorage.getItem('fetch_limit')
								) || 100) +
								'&order=published_at&direction=' +
								(sortOldFirst ? 'asc' : 'desc') +
								(showRead ? '' : '&status=unread'),
							props.errorHandler
						)
					)
				)
				const items = []
				result.forEach((i) => items.push(...i.entries))
				setItems(
					items.sort((a, b) =>
						sortOldFirst
							? a.published_at.localeCompare(b.published_at)
							: b.published_at.localeCompare(a.published_at)
					)
				)
				setIsLoading(false)
			} else {
				setItems([])
			}
		}
		fetchItems()
	}, [
		sortOldFirst,
		showRead,
		props.currentFeed,
		props.feeds,
		props.errorHandler,
	])

	const markRead = async (i, read) => {
		if (i.length > 0) {
			await apiCall('entries', props.errorHandler, {
				entry_ids: i.map((x) => x.id),
				status: read || read === undefined ? 'read' : 'unread',
			})
			props.updateUnread(
				i
					.map((x) => x.feed.id)
					.filter((f, index, self) => self.indexOf(f) === index)
			)

			const currItems = items
			i.forEach(
				(item) =>
					(currItems[currItems.indexOf(item)].status =
						read || read === undefined ? 'read' : 'unread')
			)
			setItems(currItems)
		}
	}
	return (
		<SplitPane
			split='horizontal'
			minSize='26px'
			defaultSize='26px'
			allowResize={false}>
			<FeedItemHeader
				items={items}
				currentFeed={props.currentFeed}
				currentIndex={
					props.currentItem ? items.indexOf(props.currentItem) : -1
				}
				sortOldFirst={sortOldFirst}
				setSortOldFirst={(b) => {
					setSortOldFirst(b)
					localStorage.setItem('sort', b ? 'o' : 'n')
				}}
				showRead={showRead}
				setShowRead={(b) => {
					setShowRead(b)
					localStorage.setItem('filter', b ? 'a' : 'u')
				}}
				markRead={markRead}
				errorHandler={props.errorHandler}
			/>

			{isLoading ? (
				'...'
			) : (
				<FeedItemList
					items={items}
					feeds={props.feeds}
					currentItem={props.currentItem}
					currentIndex={
						props.currentItem
							? items.indexOf(props.currentItem)
							: -1
					}
					onItemChange={props.onItemChange}
					markRead={markRead}
					errorHandler={props.errorHandler}
				/>
			)}
		</SplitPane>
	)
}

export default ItemBrowser
