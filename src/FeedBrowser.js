import React from 'react';
import {apiCall} from './lib/util';
import './FeedBrowser.css';

class FeedBrowser extends React.Component {
	constructor(props) {
	  super(props);
	  this.state = {
		categories: [],
		feeds: [],
		icons: JSON.parse(localStorage.getItem('favicons')) || {}
	  };
	  this.fetch = this.fetch.bind(this);
	  this.refetch = this.refetch.bind(this);
	  this.unreadbubble = this.unreadbubble.bind(this);
	}
	componentDidMount() {
	  this.fetch();
	}

	fetch() {
  
	  Promise.all([
		apiCall('categories', this.props.errorHandler),
		apiCall('feeds', this.props.errorHandler)
	  ]).then(
		([c, f]) => { return Promise.all([c, f]) }
	  ).then(
		([c, f]) => { this.setState({categories: c, feeds: f }); return f }
	  ).then(
		(feeds)  => { feeds.forEach(f => { this.props.updateUnread(f); });
					  feeds.forEach(f => { if (f.icon && !(f.id in this.state.icons)) { this.fetchIcon(f.id); } }); },
		e => {}
	  )
	}
  
	fetchIcon(feedid) {
		apiCall('feeds/' + feedid + '/icon', this.props.errorHandler)
		.then(i => {
			const icons = this.state.icons;
			icons[feedid] = i;
			this.setState({icons: icons});
			localStorage.setItem('favicons', JSON.stringify(this.state.icons));
		},
		e => {})
	}
  
	refetch() {
		apiCall('feeds/refresh', this.props.errorHandler, {})
		.then(() => { 
			this.fetch();
			setTimeout(function() { this.fetch(); }.bind(this), 5000)
		},
		e => {});
	}

	handleClick(x) {
	  this.props.onFeedChange(x);
	}

	unreadbubble(f) {
		if (!(f.id in this.props.unreads) || this.props.unreads[f.id] === 0) {
			return;
		}
		return <span className="unreadcount">{this.props.unreads[f.id]}</span>;
	}
  
	render() {
	  const { categories, feeds, icons } = this.state;
	  const defaulticon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgODAgODAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDgwIDgwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8ZyBpZD0iX3gzN183X0Vzc2VudGlhbF9JY29uc18xOV8iPg0KCTxwYXRoIGlkPSJEb2N1bWVudCIgZD0iTTY5LjIsMjIuNEw0Ny40LDAuNkM0NywwLjIsNDYuNSwwLDQ2LDBIMTRjLTIuMiwwLTQsMS44LTQsNHY3MmMwLDIuMiwxLjgsNCw0LDRoNTJjMi4yLDAsNC0xLjgsNC00VjIzLjcNCgkJQzY5LjksMjMuMSw2OS42LDIyLjgsNjkuMiwyMi40eiBNNDgsNi44TDYzLjIsMjJINDhWNi44eiBNNjYsNzZIMTRWNGgzMHYyMGMwLDEuMSwwLjksMiwyLDJoMjBWNzZ6Ii8+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==';
	  
	  if (!categories || !feeds )  {
		  return <div>...</div>;
	  }
	  return (
		<div className="feedlist">
			<button className="refresh" onClick={this.refetch} title='Refresh feeds and counts'>&#8635;</button>
			{categories.map(item => (
				<div key={item.id}>
				  <div className="category">{item.title}</div> 
				  {feeds
				  .filter(f => (f.category.id === item.id))
				  .sort((a,b) => a.title.localeCompare(b.title))
				  .map(f => (
					<div className={`feedrow
					${f.id === (this.props.feed ? this.props.feed.id : null) ? "selected" : ""}
					`} onClick={() => this.handleClick(f)} key={f.id}>
					<img className="favico" src={f.id in icons ? 'data:' + icons[f.id]['data'] : defaulticon} alt="" />
					<div 
					  className={`feed 
								 ${this.props.unreads[f.id] > 0 ? "unread" : "read"}
								 ${f.parsing_error_count > 0 ? "errorfeed" : ""}
								 `}
					  title={f.parsing_error_message} >
					  {f.title}
					  {this.unreadbubble(f)}
					</div>
					</div>
					))}
				</div>	
			
			))}
		  </div>
		);
  
	  }
	}

export default FeedBrowser;
