import React from 'react';
import {apiCall, relaTimestamp} from './lib/util';
import './ItemBrowser.css';
import SplitPane from 'react-split-pane';
import Hotkeys from 'react-hot-keys';

class ItemBrowser extends React.Component {
	constructor(props) {
	  super(props);
	  this.state = {
		items:  [],
		filter: localStorage.getItem('filter') || 'u',
		sort:   localStorage.getItem('sort') || 'n'
	  };
	  this.fetch            = this.fetch.bind(this);
	  this.getFeeds         = this.getFeeds.bind(this);
	  this.fetchFeed        = this.fetchFeed.bind(this);
	  this.toggleReadStatus = this.toggleReadStatus.bind(this);
	  this.toggleFilter     = this.toggleFilter.bind(this);
	  this.toggleSort       = this.toggleSort.bind(this);
	  this.markAllRead      = this.markAllRead.bind(this);
	  this.handleClick      = this.handleClick.bind(this);
	  this.prevItem         = this.prevItem.bind(this);
	  this.nextItem         = this.nextItem.bind(this);
	  this.firstItem        = this.firstItem.bind(this);
	  this.lastItem         = this.lastItem.bind(this);
	  this.currentRef       = React.createRef();
	}
	scrollToCurrent() {
		if (this.currentRef.current) { this.currentRef.current.scrollIntoView({block: 'center'}); }
	}
	onKeyDown(keyName, e, handle) {
		switch(keyName) {
			case "p":
			case "k":
			case "left": 
				this.prevItem();
				this.scrollToCurrent();
				break;
			case "n":
			case "j":
			case "right": 
			case "space":
				this.nextItem();
				this.scrollToCurrent();
				e.preventDefault();
				break;
			case "home":
				this.firstItem();
				this.scrollToCurrent();
				break;
			case "end":
				this.lastItem();
				this.scrollToCurrent();
				break;
			case "u":
				this.toggleFilter();
				break;
			case "s":
				this.toggleSort();
				break;
			case "m":
				if (this.props.currentItem) {
					this.toggleReadStatus(this.props.currentItem);
				}
				break;
			case "shift+a":
				this.markAllRead();
				break;
			default: 
		}
	}
	componentDidMount() {
	  this.fetch();
	}
	componentDidUpdate(prevProps, prevState) {
	  if (prevProps.currentFeed !== this.props.currentFeed || 
		  prevProps.currentCategory !== this.props.currentCategory || 
	      ((prevState.sort !== this.state.sort) && this.state.items.length > 100) ||
		  prevState.filter !== this.state.filter) {
		this.fetch();
	  }
	  if (prevProps.currentItem !== this.props.currentItem && 
		  this.props.currentItem) {
		  this.toggleReadStatus(this.props.currentItem, true);
	  }
	}

	getFeeds() {
		var fs = [];
		if (this.props.currentFeed) {
			fs = [this.props.currentFeed];
		} else if (this.props.currentCategory) {
			fs = Object.values(this.props.feeds)
			.filter(f => f.category.id === this.props.currentCategory.id)
		}
		return fs;
  
	}
	fetch() {
	  this.setState({items: []});
	  this.getFeeds().forEach(f => {
		  if (f.unreads > 0 || this.state.filter === 'a') {
			  this.fetchFeed(f)
		  }
		});
	}

	fetchFeed(f) {
		apiCall('feeds/' + f.id + '/entries?' +
		'limit=' + (parseInt(localStorage.getItem('fetch_limit')) || 100) +
		'&order=published_at&direction=' + (this.state.sort === 'n' ? 'desc' : 'asc') + 
		(this.state.filter === 'u' ? '&status=unread' : ''), this.props.errorHandler)
		.then(i => {
			const currentFeeds = this.getFeeds().map(f => f.id);
			const newItems = i ? 
			i.entries.filter(item => (currentFeeds.indexOf(item.feed.id) >= 0)) :
			[];
			this.setState({items: this.state.items.concat(newItems)});
		},
		e => {})
	}

	handleClick(item) {
		this.props.onItemChange(item);
	}

	toggleReadStatus(item, read) {
		const i = this.state.items;
		const index = i.findIndex(x => x.id === item)
		if (read === undefined) {
			read = i[index].status === 'unread';
		}
		const newStatus = read ? 'read' : 'unread';
		apiCall('entries', this.props.errorHandler, { 'entry_ids' : [item], 'status' : newStatus})
		.then(() => {
			i[index].status = newStatus;
			this.setState({items: i});
			this.props.updateUnread(i[index].feed);
		},
		e => {});
	}

	toggleFilter(v) {
		const filter = v ? v.target.value : (this.state.filter === 'u' ? 'a' : 'u')
		this.setState({filter: filter});
		localStorage.setItem('filter', filter);
		if (v) { v.target.blur(); }
	}

	toggleSort(v) {
		const sort = v ? v.target.value : (this.state.sort === 'n' ? 'o' : 'n')
		this.setState({sort: sort})
		localStorage.setItem('sort', sort);
		if (v) { v.target.blur(); }
	}

	prevItem() {
		const i = this.props.currentItem ? 
			(this.state.items.findIndex(x => x.id === this.props.currentItem) - 1) : 
			0;
		if (this.state.items.length > 0 && i >= 0) {
			this.props.onItemChange(this.state.items[i].id);
		}
	}

	nextItem() {
		const i = this.props.currentItem ? 
			(this.state.items.findIndex(x => x.id === this.props.currentItem) + 1) : 
			0;
		if (this.state.items.length > 0 && i >= 0 && i < this.state.items.length) {
			this.props.onItemChange(this.state.items[i].id);
		}
	}

	firstItem() {
		if (this.state.items.length > 0) {
			this.props.onItemChange(this.state.items[0].id);
		}
	}

	lastItem() {
		if (this.state.items.length > 0) {
			this.props.onItemChange(this.state.items[this.state.items.length - 1].id);
		}
	}
 
	markAllRead() {
		if (this.state.items.length > 0) {
			apiCall('entries', this.props.errorHandler, { 'entry_ids' : this.state.items.map(x => x.id), 'status' : 'read'})
			.then(() => { 
				this.getFeeds().forEach(f => this.props.updateUnread(f));
				this.fetch(); },
			e => {});
		}
	}

	feedlink(f, i) {
		if (!f || !i) { 
			return ; 
		}
		const link = f.site_url ? 
			<a href={f.site_url} target="_blank"  rel="noopener noreferrer">&#8599;</a> : 
			"";
		return (
		<div className="itemlisttitle">
			<span className="titlename">{f.title}</span>&nbsp;
			{link}
			&nbsp;
			<span className="titlecounter"> {i.length} items</span>
		</div>
		);
	}

	render() {
	  const items = this.state.items;
	  
	  
	  return (
		<Hotkeys 
          keyName="p,k,left,n,j,right,m,shift+a,home,end,u,s,space" 
          onKeyDown={this.onKeyDown.bind(this)}>
		<SplitPane split="horizontal" minSize="26px" defaultSize="26px" allowResize={false} pane2Style={{ 'background': '#f5f5f5'}} >
        
		<div className="itemlistcontrol">

			{ this.feedlink(this.props.currentFeed || this.props.currentCategory, items) }
			
			<div className="itemlistcontrolbuttons">
			  <button onClick={this.markAllRead}> &#10003; Mark all as read</button>
			  <select onChange={this.toggleFilter} value={this.state.filter}>
				  <option value='u'>Show unread only</option>
				  <option value='a'>Show all</option>
			  </select>
			  <select onChange={this.toggleSort} value={this.state.sort}>
				  <option value='n'>Newest first</option>
				  <option value='o'>Oldest first</option>
			  </select>
			</div>
		</div>

		<div className="itemlist">
		<table className="itemlist">
			<tbody>
			{items
			.sort((a,b) => this.state.sort === 'o' ? 
			   a.published_at.localeCompare(b.published_at) :
			   b.published_at.localeCompare(a.published_at))
			.map(item => (
			  <tr
			  className={`itemlistitem 
			  ${item.id === this.props.currentItem ? "selected" : ""}
			  ${item.status === 'unread' ? 'unread' : 'read'}
			  `} 
			  ref={item.id === this.props.currentItem ? this.currentRef : undefined} 
			  key={item.id}>
			  <td className="favico">
			  <img className="minifavico" src={this.props.feeds[item.feed.id].icon_data} alt="" />
			  </td>
			  <td className="readstatus">
				  <div className={item.status === 'unread' ? 'unreaddot' : 'readdot'} 
				       title="Toggle read"
				       onClick={() => this.toggleReadStatus(item.id, item.status === 'unread' ? true : false)} />
			  </td>
			  <td className="title" onClick={() => this.handleClick(item.id)}>{item.title}</td>
			  <td className="timestamp" 
			    title={item.published_at}
			    onClick={() => this.handleClick(item.id)}>{relaTimestamp(item.published_at)}</td>
			  </tr>
			))}
			</tbody>
		</table>
		</div>
		</SplitPane>
		</Hotkeys>
		);
	}
  }
  
  export default ItemBrowser;