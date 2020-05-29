import React from 'react';
import {apiCall, relaTimestamp} from './lib/util';
import './ItemBrowser.css';
import SplitPane from 'react-split-pane';

class ItemBrowser extends React.Component {
	constructor(props) {
	  super(props);
	  this.state = {
		items: [],
		filter: localStorage.getItem('filter') || 'u',
		sort: localStorage.getItem('sort') || 'n'
	  };
	  this.fetch = this.fetch.bind(this);
	  this.toggleReadStatus = this.toggleReadStatus.bind(this);
	  this.toggleFilter = this.toggleFilter.bind(this);
	  this.toggleSort = this.toggleSort.bind(this);
	  this.markAllRead = this.markAllRead.bind(this);
	}
	componentDidMount() {
	  this.fetch();
	}
	componentDidUpdate(prevProps, prevState) {
	  if (prevProps.feed !== this.props.feed || 
		  prevState.sort !== this.state.sort ||
		  prevState.filter !== this.state.filter) {
		this.fetch();
	  }
	  if (prevProps.item !== this.props.item && 
		  this.props.item) {
		  this.toggleReadStatus(this.props.item, true);
	  }
	}
	fetch() {
	  if (!this.props.feed) {
		return;
	  }
	  apiCall('feeds/' + this.props.feed.id + '/entries?' +
			  'limit=' + (parseInt(localStorage.getItem('fetch_limit')) || 100) +
	          '&order=published_at&direction=' + (this.state.sort === 'n' ? 'desc' : 'asc') + 
	          (this.state.filter === 'u' ? '&status=unread' : ''), this.props.errorHandler)
	  .then(i => this.setState({items: i ? i.entries : []}),
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
			this.props.updateUnread(this.props.feed);
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
			.then(() => { this.props.updateUnread(this.props.feed); this.fetch(); },
			e => {});
		}
	}

	feedlink(f, i) {
		if (!f || !i) { 
			return ; 
		}
		return (
		<div className="controltitle">
			<span className="controltitletitle">{f.title}</span>&nbsp;
			<a href={f.site_url} target="_blank"  rel="noopener noreferrer">&#8599;</a>&nbsp;
			<span className="controltitlecounter"> {i.length} items</span>
		</div>
		);
	}

	render() {
	  const items = this.state.items;
	  
	  
	  return (
		<SplitPane split="horizontal" minSize="26px" defaultSize="26px" allowResize={false} pane2Style={{ 'background': '#f5f5f5'}} >
        <div className="itemlistcontrol">
			{ this.feedlink(this.props.feed, items) }
			
			<div className="controlcontrols">
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
			{items.map(item => (
			  <tr
			  className={`itemlistitem 
			  ${item.id === this.props.item ? "selected" : ""}
			  ${item.status === 'unread' ? 'unread' : 'read'}
			  `} 
			  key={item.id}>
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