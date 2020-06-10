import React from 'react';
import {apiCall, formatDate} from './lib/util';
import './ItemViewer.css';
import Hotkeys from 'react-hot-keys';

class ItemViewer extends React.Component {
	constructor(props) {
	  super(props);
	  this.state = {
		item: null
	  };
	  this.fetch = this.fetch.bind(this);
	  this.handleStar = this.handleStar.bind(this);
	}
	onKeyDown(keyName, e, handle) {
		switch(keyName) {
			case "f":
				this.handleStar();
				break;
			case "v":
				window.open(this.state.item.url, '_blank');
				break;
			case "c":
				window.open(this.state.item.comments_url || this.state.item.url, '_blank')
				break;
			default: 
		}
	}
	componentDidMount() {
	  this.fetch();
	}
	componentDidUpdate(prevProps) {
	  if (prevProps.currentItem !== this.props.currentItem) {
		this.fetch();
	  }
	}
	fetch() {
	  if (!this.props.currentItem) {
		this.setState({item: null})
		return;
	  }
	  apiCall('entries/' + this.props.currentItem, this.props.errorHandler)
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
		<Hotkeys 
		 keyName="f,v,c" 
		 onKeyDown={this.onKeyDown.bind(this)}>
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
		</Hotkeys>
		);
	}
  }

  export default ItemViewer;