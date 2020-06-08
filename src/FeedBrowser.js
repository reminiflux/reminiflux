import React from 'react';
import './FeedBrowser.css';

class FeedBrowser extends React.Component {
	constructor(props) {
	  super(props);
	  this.handleCategoryClick = this.handleCategoryClick.bind(this);
	  this.handleFeedClick = this.handleFeedClick.bind(this);
	  this.unreadbubble = this.unreadbubble.bind(this);
	}

	handleFeedClick(x) {
	  this.props.onFeedChange(x);
	}
	handleCategoryClick(x) {
	  this.props.onCategoryChange(x);
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
	);
	}
}

export default FeedBrowser;
