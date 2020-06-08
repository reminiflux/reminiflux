import React from 'react';
import {apiCall, relaTimestamp} from './lib/util';
import './ItemBrowser.css';
import SplitPane from 'react-split-pane';

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
		.then(i => this.setState({items: this.state.items.concat(i ? i.entries : [])}),
		e => {});
	}

	handleClick(item) {
		this.props.onItemChange(item);
	}

	toggleReadStatus(item, read) {
		const i = this.state.items;
		const index = i.findIndex(x => x.id === item)
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
		this.setState({filter: v.target.value});
		localStorage.setItem('filter', v.target.value);
	}

	toggleSort(v) {
		this.setState({sort: v.target.value})
		localStorage.setItem('sort', v.target.value);
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
			  key={item.id}>
			  <td className="favico">
			  <img className="minifavico" src={this.props.feeds[item.feed.id].icon_data} alt="" />
			  </td>
			  <td className="readstatus">
				  <div className={item.status === 'unread' ? 'unreaddot' : 'readdot'} 
				       title="Toggle read"
				       onClick={() => this.toggleReadStatus(item.id, item.status === 'unread' ? true : false)} />
			  </td>
			  <td className="title"     onClick={() => this.handleClick(item.id)}>{item.title}</td>
			  <td className="timestamp" 
			    title={item.published_at}
			    onClick={() => this.handleClick(item.id)}>{relaTimestamp(item.published_at)}</td>
			  </tr>
			))}
			</tbody>
		</table>
		</div>
		</SplitPane>
		);
	}
  }
  
  export default ItemBrowser;