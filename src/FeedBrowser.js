import React from 'react';
import './FeedBrowser.css';
import Hotkeys from 'react-hot-keys';

class FeedBrowser extends React.Component {
	constructor(props) {
	  super(props);
	  this.handleCategoryClick = this.handleCategoryClick.bind(this);
	  this.handleFeedClick     = this.handleFeedClick.bind(this);
	  this.unreadbubble        = this.unreadbubble.bind(this);
	  this.prevFeed            = this.prevFeed.bind(this);
	  this.nextFeed            = this.nextFeed.bind(this);
	  this.currentRef          = React.createRef();
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

	handleFeedClick(x) {
	  this.props.onFeedChange(x);
	}

	handleCategoryClick(x) {
	  this.props.onCategoryChange(x);
	}
  
	prevFeed() {
		const i = this.props.currentFeed ? 
			(Object.values(this.props.feeds).findIndex(x => x.id === this.props.currentFeed.id) - 1) : 
			0;
		if (i >= 0) {
			this.props.onFeedChange(Object.values(this.props.feeds)[i]);
		}
	}

	nextFeed() {
		const i = this.props.currentFeed ? 
			(Object.values(this.props.feeds).findIndex(x => x.id === this.props.currentFeed.id) + 1) : 
			0;
		if (i >= 0 && i < Object.values(this.props.feeds).length) {
			this.props.onFeedChange(Object.values(this.props.feeds)[i]);
		}
	}

	unreadbubble(i) {
	  if (!i.unreads) { return }
	  return <span className="unreadcount">{i.unreads}</span>;
	}
  
	render() {
	  if (!this.props.feeds )  {
		  return <div>...</div>;
	  }
	  return (
		<Hotkeys 
        keyName="up,down" 
        onKeyDown={this.onKeyDown.bind(this)}>
		<div className="feedlist">

			{Object.values(this.props.categories)
			.sort((a,b) => a.title.localeCompare(b.title))
			.map(category => (
				<div key={category.id}>
				    <div className={`categoryrow
						 ${category.id === (this.props.currentCategory ? this.props.currentCategory.id : null) ? "selected" : ""}
						 `}
						 onClick={() => this.handleCategoryClick(category)}>
				      <div className="category">
					    {category.title}
					    {this.unreadbubble(category)}
				      </div>
				    </div>

				    {Object.values(this.props.feeds)
				    .filter(f => (f.category.id === category.id))
				    .sort((a,b) => a.title.localeCompare(b.title))
				    .map(f => (
					<div className={`feedrow
						 ${f.id === (this.props.currentFeed ? this.props.currentFeed.id : null) ? "selected" : ""}
						 `} 
						 ref={f.id === (this.props.currentFeed ? this.props.currentFeed.id : null) ? this.currentRef : undefined}
						 onClick={() => this.handleFeedClick(f)} key={f.id}>
					  <img className="favico" src={f.icon_data} alt="" />
					  <div className={`feed 
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
		</Hotkeys>
	);
	}
}

export default FeedBrowser;
