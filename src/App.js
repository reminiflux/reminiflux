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
      currentFeed:     null,
      currentCategory: null,
      currentItem:     null,
      feeds:           JSON.parse(localStorage.getItem('feeds')) || {},
      categories:      JSON.parse(localStorage.getItem('categories')) || {},
      settingsIsOpen:  !(localStorage.getItem('miniflux_server') && localStorage.getItem('miniflux_api_key')),
      error:           null
    }
    this.changeFeed     = this.changeFeed.bind(this);
    this.changeCategory = this.changeCategory.bind(this);
    this.changeItem     = this.changeItem.bind(this);
    this.updateFeeds    = this.updateFeeds.bind(this);
    this.updateUnread   = this.updateUnread.bind(this);
    this.updateIcon     = this.updateIcon.bind(this);
    this.refresh        = this.refresh.bind(this);
    this.openSettings   = this.openSettings.bind(this);
    this.closeSettings  = this.closeSettings.bind(this);
    this.errorHandler   = this.errorHandler.bind(this);
    this.clearError     = this.clearError.bind(this);
  }
  
  componentDidMount() {
    this.updateFeeds();
  }

  updateFeeds() {
    apiCall('feeds', this.errorHandler)
    .then(
      f => {
        this.setState({
          feeds: f.reduce((m, o) => {m[o.id] = o; return m}, {}), 
          categories: f.reduce((m, o) => {m[o.category.id] = o.category; return m}, {}), },
          () => {
            localStorage.setItem('feeds', JSON.stringify(this.state.feeds));
            localStorage.setItem('categories', JSON.stringify(this.state.categories));
          });
        return f;
      },
      e => {})
    .then(
      f => { if (f) {
        f.forEach(feed => { 
          this.updateUnread(feed);
          this.updateIcon(feed);
        })
      }}
    )
  }

  updateUnread(f) {
    apiCall('feeds/' + f.id + '/entries?status=unread&limit=1', this.errorHandler)
    .then(r => {
        this.setState(state => {
          const feeds = state.feeds;
          feeds[f.id]['unreads'] = r.total;
          return {feeds: feeds}
        });
        return this.state.feeds;
      })
    .then(feeds => {
      document.title = Object.values(feeds)
      .reduce((a, b) => { return a + (b['unreads'] || 0)}, 0) + " | reminiflux"; 
      return feeds;
    })
    .then(feeds => {
      this.setState(state => {
        const categories = state.categories;
        Object.values(categories).forEach(c => {
          categories[c.id]['unreads'] = Object.values(feeds)
            .filter(x => x.category.id === c.id)
            .reduce((a, b) => {return a + (b['unreads'] || 0)}, 0)
        });
        return {categories: categories}
      })
    },
    e => {})
  }

  updateIcon(f) {

    const defaulticon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgODAgODAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDgwIDgwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8ZyBpZD0iX3gzN183X0Vzc2VudGlhbF9JY29uc18xOV8iPg0KCTxwYXRoIGlkPSJEb2N1bWVudCIgZD0iTTY5LjIsMjIuNEw0Ny40LDAuNkM0NywwLjIsNDYuNSwwLDQ2LDBIMTRjLTIuMiwwLTQsMS44LTQsNHY3MmMwLDIuMiwxLjgsNCw0LDRoNTJjMi4yLDAsNC0xLjgsNC00VjIzLjcNCgkJQzY5LjksMjMuMSw2OS42LDIyLjgsNjkuMiwyMi40eiBNNDgsNi44TDYzLjIsMjJINDhWNi44eiBNNjYsNzZIMTRWNGgzMHYyMGMwLDEuMSwwLjksMiwyLDJoMjBWNzZ6Ii8+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==';

    function setIcon(c, icon) {
      c.setState(state => {
        const feeds = state.feeds;
        feeds[f.id]['icon_data'] = icon;
        return {feeds: feeds}
      })
    }

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
    } else {
      setIcon(this, defaulticon);
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
    this.setState({currentFeed: f, currentCategory: null, currentItem: null});
    this.updateUnread(f);
  }

  changeCategory(c) {
    this.setState({currentFeed: null, currentCategory: c, currentItem: null});
  }

  changeItem(i) {
    this.setState({currentItem: i});
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
    const currentCategory = this.state.currentCategory;
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
          currentCategory={currentCategory}
          feeds={this.state.feeds} categories={this.state.categories}
          onFeedChange={this.changeFeed}
          onCategoryChange={this.changeCategory}
          errorHandler={this.errorHandler} />
        
        </div>
        <SplitPane split="horizontal" minSize="10%"
              defaultSize={parseInt(localStorage.getItem('h_split')) || "40%"}
              onChange={size => localStorage.setItem('h_split', size)}>
          <ItemBrowser
            currentFeed={currentFeed}
            currentCategory={currentCategory}
            currentItem={currentItem} 
            feeds={this.state.feeds}
            onItemChange={this.changeItem}
            updateUnread={this.updateUnread}
            errorHandler={this.errorHandler} />
          <ItemViewer
            currentItem={currentItem}
            errorHandler={this.errorHandler} />
        </SplitPane>
      </SplitPane>
      </div>
    );
  }
}

export default App;



