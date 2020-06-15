import React from 'react';
import './FeedBrowser.css';
import Hotkeys from 'react-hot-keys';

class FeedBrowser extends React.Component {
	constructor(props) {
	  super(props);

	  this.unreadbubble = this.unreadbubble.bind(this);
	  this.prevFeed     = this.prevFeed.bind(this);
	  this.nextFeed     = this.nextFeed.bind(this);
	  this.currentRef   = React.createRef();
	}
	scrollToCurrent() {
		if (this.currentRef.current) { this.currentRef.current.scrollIntoView({block: 'center'}); }
	}
	onKeyDown(keyName, e, handle) {
		switch(keyName) {
			case "up":
				this.prevFeed();
				this.scrollToCurrent();
				e.preventDefault();
				break
			case "down":
				this.nextFeed();
				this.scrollToCurrent();
				e.preventDefault();
				break
			default: 
		}
	}

	prevFeed() {
		this.props.onFeedChange(this.props.feeds[
			this.props.feeds.indexOf(this.props.currentFeed) - 1 >= 0 ?
			this.props.feeds.indexOf(this.props.currentFeed) - 1 :
			0]);
	}

	nextFeed() {
		this.props.onFeedChange(this.props.feeds[
			this.props.feeds.indexOf(this.props.currentFeed) + 1 < this.props.feeds.length ?
			this.props.feeds.indexOf(this.props.currentFeed) + 1 :
			this.props.feeds.length - 1]);
	}

	unreadbubble(i) {
	  if (!i.unreads) { return }
	  return <span className="unreadcount">{i.unreads}</span>;
	}
  
	render() {

	  return (
		<Hotkeys 
        keyName="up,down" 
        onKeyDown={this.onKeyDown.bind(this)}>
		<div className="feedlist">

			{this.props.feeds
			.map(item => {
				if (!item.category) {
					return (
					  <div key={"c" + item.id}>
						<div className={`categoryrow
						  ${item === this.props.currentFeed ? "selected" : ""}
						  `}
						ref={item === this.props.currentFeed ? this.currentRef : undefined}
						onClick={() => this.props.onFeedChange(item)}>
					 		<div className="category">
					   			{item.title}
					   			{this.unreadbubble(item)}
					 		</div>
				   		</div>	   
					  </div>
					)
				} else {
					return (
					  <div key={item.id}>
						<div className={`feedrow
						  ${item === this.props.currentFeed ? "selected" : ""}
						  `} 
						ref={item === this.props.currentFeed ? this.currentRef : undefined}
						onClick={() => this.props.onFeedChange(item)}>
					 		<img className="favico" src={item.icon_data} alt="" />
					 		<div className={`feed 
								 ${item.parsing_error_count > 0 ? "errorfeed" : ""}
						  		`}
						  		title={item.parsing_error_message} >
					   			{item.title}
					   			{this.unreadbubble(item)}
					 		</div>
						</div>
					  </div>   
	   				)
				}
			})}
		</div>
		</Hotkeys>
	);
	}
}

export default FeedBrowser;
