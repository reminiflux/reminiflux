import React from 'react'
import ReactDOM from 'react-dom'
import Reminiflux from './Reminiflux'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
	<React.StrictMode>
		<Reminiflux />
	</React.StrictMode>,
	document.getElementById('root')
)

serviceWorker.register()
