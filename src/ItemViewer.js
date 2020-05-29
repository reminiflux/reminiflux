import React from 'react';
import {apiCall, formatDate} from './lib/util';
import './ItemViewer.css';

class ItemViewer extends React.Component {
	constructor(props) {
	  super(props);
	  this.state = {
		item: null
	  };
	  this.fetch = this.fetch.bind(this);
	  this.handleStar = this.handleStar.bind(this);
	}
	componentDidMount() {
	  this.fetch();
	}
	componentDidUpdate(prev) {
	  if (prev.item !== this.props.item) {
		this.fetch();
	  }
	}
	fetch() {
	  if (!this.props.item) {
		this.setState({item: null})
		return;
	  }
	  apiCall('entries/' + this.props.item, this.props.errorHandler)
	  .then(i => this.setState({item: i},
		e => {}));
	}
	handleStar() {
		apiCall('entries/' + this.state.item.id + '/bookmark', this.props.errorHandler, {})
		.then(() => setTimeout(function() { this.fetch(); }.bind(this), 100),
		e => {});
	}
	render() {
	  const item = this.state.item;
	  if (!item) {
		return <div />;
	  }
	  const content = {__html: item.content };
	  return (
		  <div>
		<div className="itemheader">
			<table className="itemheader">
				<tbody>
					<tr>
						<td className="title">
							<a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
							&nbsp;
							<a href={item.comments_url ? item.comments_url : item.url} title="Comments" style={{'textDecoration': 'none'}} target="_blank"  rel="noopener noreferrer">
								<span role="img" aria-label="comments">&#128172;</span>
							</a>
						</td>
						<td rowSpan="2" className="star">
							<div className="star" onClick={this.handleStar} title="Toggle star">
					    	{item.starred ? String.fromCharCode(9733) : String.fromCharCode(9734) }
		  					</div>
						</td>
					</tr>
					<tr>
						<td className="controls">
							{ item.author ? item.author : item.feed.title }, { formatDate(item.published_at) }
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div className="itemcontent" dangerouslySetInnerHTML={content} />
		</div>
		);
	}
  }

  export default ItemViewer;