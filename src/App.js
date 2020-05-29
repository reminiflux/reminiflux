import React from 'react';
import './App.css';
import SplitPane from 'react-split-pane';
import {apiCall} from './lib/util';
import FeedBrowser from './FeedBrowser';
import ItemBrowser from './ItemBrowser';
import ItemViewer from './ItemViewer';
import SettingsModal from './SettingsModal';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentFeed: null,
      currentItem: null,
      unreads: {},
      settingsIsOpen: !(localStorage.getItem('miniflux_server') && localStorage.getItem('miniflux_api_key')),
      error: null
    }
    this.changeFeed   = this.changeFeed.bind(this);
    this.changeItem   = this.changeItem.bind(this);
    this.updateUnread = this.updateUnread.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.closeSettings = this.closeSettings.bind(this);
    this.errorHandler = this.errorHandler.bind(this);
    this.clearError   = this.clearError.bind(this);
  }
  
  changeFeed(f) {
    this.setState({currentFeed: f, currentItem: null});
    this.updateUnread(f);
  }

  changeItem(i) {
    this.setState({currentItem: i});
  }

  updateUnread(f) {
    apiCall('feeds/' + f.id + '/entries?status=unread&limit=1', this.errorHandler)
      .then(r => {
        if (r) {
          const unreads = this.state.unreads;
          unreads[f.id] = r.total;
          this.setState({unreads: unreads});
          document.title = Object.values(this.state.unreads).reduce((a, b) => a+b) + " | reminiflux";
        }
      },
      e => {})
  }

  openSettings() {
    this.setState({settingsIsOpen: true });
  }

  closeSettings() {
    this.setState({settingsIsOpen: false });
  }

  errorHandler(e) {
    this.setState({error: e})
  }

  clearError() {
    this.setState({error: null})
  }

  render() {

    if (this.state.settingsIsOpen) {
      return <SettingsModal onClose={this.closeSettings} />;
    }

    const currentFeed = this.state.currentFeed;
    const currentItem = this.state.currentItem;
    const unreads     = this.state.unreads;
    const errorStatus = this.state.error ? 
      <div className="error">
        API error: {String(this.state.error)}
        <div className="errorclose">
        <button onClick={this.clearError}>X</button>
        </div>
      </div> 
      : "";

    return (
      <div>
      {errorStatus}
      <SplitPane split="vertical" minSize={300} 
        defaultSize={parseInt(localStorage.getItem('v_split')) || "35%"}
        onChange={size => localStorage.setItem('v_split', size)}>
        <div>
        <button className="settings" onClick={this.openSettings} title='Settings'>&#9881;</button>
        <FeedBrowser feed={currentFeed} unreads={unreads} 
          onFeedChange={this.changeFeed}
          updateUnread={this.updateUnread}
          errorHandler={this.errorHandler} />
        
        </div>
        <SplitPane split="horizontal" minSize="10%"
              defaultSize={parseInt(localStorage.getItem('h_split')) || "40%"}
              onChange={size => localStorage.setItem('h_split', size)}>
          <ItemBrowser feed={currentFeed} item={currentItem} 
            onItemChange={this.changeItem}
            updateUnread={this.updateUnread}
            errorHandler={this.errorHandler} />
          <ItemViewer item={currentItem}
            errorHandler={this.errorHandler} />
        </SplitPane>
      </SplitPane>
      </div>
    );
  }
}

export default App;



