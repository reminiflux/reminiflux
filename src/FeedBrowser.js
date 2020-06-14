import React from 'react';
import './FeedBrowser.css';
import Hotkeys from 'react-hot-keys';

class FeedBrowser extends React.Component {
	constructor(props) {
	  super(props);
	  this.state = {
		tree: []
	  }
	  this.handleCategoryClick = this.handleCategoryClick.bind(this);
	  this.handleFeedClick     = this.handleFeedClick.bind(this);
	  this.unreadbubble        = this.unreadbubble.bind(this);
	  this.prevFeed            = this.prevFeed.bind(this);
	  this.nextFeed            = this.nextFeed.bind(this);
	  this.compileTree         = this.compileTree.bind(this);
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

	componentDidUpdate(prevProps) {
		if (prevProps.feeds !== this.props.feeds || 
			prevProps.categories !== this.props.categories) {
			this.setState({tree: this.compileTree()});
		}
	}

	compileTree() {
		const tree = [];
		Object.values(this.props.categories)
		.sort((a,b) => a.title.localeCompare(b.title))
		.forEach(c => {
			tree.push(c);
			tree.push(...Object.values(this.props.feeds)
			.filter(f => f.category.id === c.id)
			.sort((a,b) => a.title.localeCompare(b.title)))
		});
		return tree;
	}

	handleFeedClick(x) {
	  this.props.onFeedChange(x);
	}

	handleCategoryClick(x) {
	  this.props.onCategoryChange(x);
	}
  
	prevFeed() {
		if (this.state.tree.length === 0) {
			return
		}

		const i = this.props.currentFeed ? 
		  this.state.tree.indexOf(this.props.currentFeed) :
		  this.state.tree.indexOf(this.props.currentCategory);
		
		const prev = this.state.tree[ (i-1) >= 0 ? (i-1) : 0 ];
		if (prev.category) {
			this.props.onFeedChange(prev);
		} else {
			this.props.onCategoryChange(prev);
		}
		
	}

	nextFeed() {
		if (this.state.tree.length === 0) {
			return
		}

		const i = this.props.currentFeed ? 
		  this.state.tree.indexOf(this.props.currentFeed) :
		  this.state.tree.indexOf(this.props.currentCategory);
		
	    const prev = this.state.tree[ (i+1) < this.state.tree.length ? (i+1) : this.state.tree.length -1 ];
		if (prev.category) {
			this.props.onFeedChange(prev);
		} else {
			this.props.onCategoryChange(prev);
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

			{this.state.tree
			.map(item => {
				if (!item.category) {
					return (
					  <div key={"c" + item.id}>
						<div className={`categoryrow
						  ${item.id === (this.props.currentCategory ? this.props.currentCategory.id : null) ? "selected" : ""}
						  `}
						ref={item.id === (this.props.currentCategory ? this.props.currentCategory.id : null) ? this.currentRef : undefined}
						onClick={() => this.handleCategoryClick(item)}>
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
						  ${item.id === (this.props.currentFeed ? this.props.currentFeed.id : null) ? "selected" : ""}
						  `} 
						ref={item.id === (this.props.currentFeed ? this.props.currentFeed.id : null) ? this.currentRef : undefined}
						onClick={() => this.handleFeedClick(item)}>
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
