import React from 'react';
import './App.css';
import SplitPane from 'react-split-pane';
import {apiCall} from './lib/util';
import FeedBrowser from './FeedBrowser';
import ItemBrowser from './ItemBrowser';
import ItemViewer from './ItemViewer';
import {KeyHelpModal, SettingsModal} from './Modals';
import Hotkeys from 'react-hot-keys';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentFeed:     null,
      currentItem:     null,
      feeds:           Array.isArray(JSON.parse(localStorage.getItem('feeds'))) ? JSON.parse(localStorage.getItem('feeds')) : [],
      settingsIsOpen:  !(localStorage.getItem('miniflux_server') && localStorage.getItem('miniflux_api_key')),
      keyHelpIsOpen:   false,
      error:           null
    }
    this.changeFeed       = this.changeFeed.bind(this);
    this.changeItem       = this.changeItem.bind(this);
    this.updateFeeds      = this.updateFeeds.bind(this);
    this.updateUnread     = this.updateUnread.bind(this);
    this.updateUnreadById = this.updateUnreadById.bind(this);
    this.updateIcon       = this.updateIcon.bind(this);
    
    this.refresh          = this.refresh.bind(this);
    this.openSettings     = this.openSettings.bind(this);
    this.closeSettings    = this.closeSettings.bind(this);
    this.errorHandler     = this.errorHandler.bind(this);
    this.clearError       = this.clearError.bind(this);
    this.openKeyHelp      = this.openKeyHelp.bind(this);
    this.closeKeyHelp     = this.closeKeyHelp.bind(this);
  }

  onKeyDown(keyName, e, handle) {
		switch(keyName) {
      case "h":
        this.openKeyHelp();
        break;
			default: 
		}
	}

  componentDidMount() {
    this.updateFeeds();
  }

  updateFeeds() {
    apiCall('feeds', this.errorHandler)
    .then(
      f => {
        let categories = [];
        f.forEach(x => {
          if (categories.map(c => c.id).indexOf(x.category.id) < 0) {
            categories.push(x.category);
          }
        })
        
        const feedTree = 
        [ { 'id': -1, 'title' : 'All', 'fetch_url' : 'entries', 'unreads' : 0 },
          { 'id': -2, 'title' : 'Starred', 'fetch_url' : 'entries?starred=true', 'unreads' : 0 } ]
        
        categories
        .sort((a,b) => a.title.localeCompare(b.title))
        .forEach(c => {
            feedTree.push(c);
            feedTree.push(...f
            .filter(f => f.category.id === c.id)
            .sort((a,b) => a.title.localeCompare(b.title))
            .map(f => Object.assign(f, { 'fetch_url' : 'feeds/' + f.id + '/entries', 'is_feed' : true })))
          });
        this.setState({ feeds: feedTree });
        localStorage.setItem('feeds', JSON.stringify(feedTree));
        return feedTree;
      },
      e => {})
    .then(
      f => { if (f) {
        f
        .forEach(feed => { 
          this.updateUnread(feed);
          this.updateIcon(feed);
        })
      }}
    )
  }

  updateUnread(f) {
    
    if (!f.fetch_url) {
      return
    }

    apiCall(f.fetch_url + (f.fetch_url.includes('?') ? '&' : '?') + 'status=unread&limit=1', this.errorHandler)
    .then(r => {
        this.setState(state => {
          const feeds = state.feeds;
          feeds[feeds.indexOf(f)]['unreads'] = r.total;
          return {feeds: feeds}
        });
        return this.state.feeds;
     })
    .then(feeds => {
      document.title = feeds
      .filter(f => f.id > 0 && f.category)
      .reduce((a, b) => { return a + (b['unreads'] || 0)}, 0) + " | reminiflux"; 
      return this.state.feeds;
    })
    .then(feeds => {
      this.setState(state => {
        const feeds = state.feeds;
        feeds
        .filter(f => f.fetch_url === undefined)
        .filter((f,index,self) => self.indexOf(f) === index)
        .forEach(c => {
          feeds[feeds.indexOf(c)]['unreads'] = feeds
            .filter(x => x.category)
            .filter(x => x.category.id === c.id)
            .reduce((a, b) => {return a + (b['unreads'] || 0)}, 0)
        });
        return {feeds: feeds}
      })
    },
    
    e => {})
  }

  updateUnreadById(f) {
    this.state.feeds
    .filter(x => x.id < 0 || x.id === f)
    .forEach(x => this.updateUnread(x));
  }

  updateIcon(f) {
    const defaulticon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgODAgODAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDgwIDgwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8ZyBpZD0iX3gzN183X0Vzc2VudGlhbF9JY29uc18xOV8iPg0KCTxwYXRoIGlkPSJEb2N1bWVudCIgZD0iTTY5LjIsMjIuNEw0Ny40LDAuNkM0NywwLjIsNDYuNSwwLDQ2LDBIMTRjLTIuMiwwLTQsMS44LTQsNHY3MmMwLDIuMiwxLjgsNCw0LDRoNTJjMi4yLDAsNC0xLjgsNC00VjIzLjcNCgkJQzY5LjksMjMuMSw2OS42LDIyLjgsNjkuMiwyMi40eiBNNDgsNi44TDYzLjIsMjJINDhWNi44eiBNNjYsNzZIMTRWNGgzMHYyMGMwLDEuMSwwLjksMiwyLDJoMjBWNzZ6Ii8+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==';

    function setIcon(c, icon) {
      c.setState(state => {
        const feeds = state.feeds;
        feeds[feeds.indexOf(f)]['icon_data'] = icon;
        return {feeds: feeds}
      })
    }

    setIcon(this, defaulticon);

    const cache = JSON.parse(localStorage.getItem('favicons')) || {};
    if (f.icon) {
      if (f.id in cache) {
        setIcon(this, cache[f.id]);
      } else {
        apiCall('feeds/' + f.id + '/icon', this.errorHandler)
		    .then(icon => {
          setIcon(this, 'data:' + icon.data);
          const cache = JSON.parse(localStorage.getItem('favicons')) || {};
          cache[f.id] = 'data:' + icon.data;
          localStorage.setItem('favicons', JSON.stringify(cache));
        },
        e => {})
      }
    }
  }

  refresh() {
    apiCall('feeds/refresh', this.props.errorHandler, {})
		.then(() => { 
			this.updateFeeds();
			setTimeout(function() { this.updateFeeds(); }.bind(this), 5000)
		},
    e => {});
  }

  changeFeed(f) {
    this.setState({currentFeed: f, currentItem: null});
    this.updateUnread(f);
  }

  changeItem(i) {
    this.setState({currentItem: i});
  }

  openSettings() {
    this.setState({settingsIsOpen: true });
  }

  closeSettings() {
    this.setState({settingsIsOpen: false });
    this.updateFeeds();
  }

  openKeyHelp() {
    this.setState({keyHelpIsOpen: true});
  }

  closeKeyHelp() {
    this.setState({keyHelpIsOpen : false})
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

    if (this.state.keyHelpIsOpen) {
      return <KeyHelpModal onClose={this.closeKeyHelp} />;
    }

    const currentFeed = this.state.currentFeed;
    const currentItem = this.state.currentItem;
    const errorStatus = this.state.error ? 
      <div className="error">
        API error: {String(this.state.error)}
        <div className="errorclose">
        <button onClick={this.clearError}>X</button>
        </div>
      </div> 
      : "";

    return (
      <Hotkeys 
      keyName="h" 
      onKeyDown={this.onKeyDown.bind(this)}>
      <div>
      {errorStatus}
      <SplitPane split="vertical" minSize={300} 
        defaultSize={parseInt(localStorage.getItem('v_split')) || "35%"}
        onChange={size => localStorage.setItem('v_split', size)}>
        <div>
        <button className="settings" onClick={this.openSettings} title='Settings'>&#9881;</button>
        <button className="refresh" onClick={this.refresh} title='Refresh feeds and counts'>&#8635;</button>
        <FeedBrowser 
          currentFeed={currentFeed}
          feeds={this.state.feeds}
          onFeedChange={this.changeFeed}
          errorHandler={this.errorHandler} />
        </div>
        <SplitPane split="horizontal" minSize="10%"
              defaultSize={parseInt(localStorage.getItem('h_split')) || "40%"}
              onChange={size => localStorage.setItem('h_split', size)}>
          <ItemBrowser
            ref={this.itembrowserref}
            currentFeed={currentFeed}
            currentItem={currentItem} 
            feeds={this.state.feeds}
            onItemChange={this.changeItem}
            updateUnread={this.updateUnreadById}
            errorHandler={this.errorHandler} />
          <ItemViewer
            currentItem={currentItem}
            errorHandler={this.errorHandler} />
        </SplitPane>
      </SplitPane>
      </div>
      </Hotkeys>
    );
  }
}

export default App;



