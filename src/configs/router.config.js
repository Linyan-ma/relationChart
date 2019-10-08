import React from 'react'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter,Switch} from 'react-router-dom'

import RelationWorkSpace from '@views/RelationWorkSpace/index.js'
export default () => (
    <Router basename='/home'>
        <div style={{ position: 'relative', height: '100%' }}>
        <Switch>   
        <Route path='/' exact render={() => <RelationWorkSpace />} />
        <Route path='/relationworkspace' exact component={RelationWorkSpace} />
        </Switch>
      </div>
    </Router>
  )