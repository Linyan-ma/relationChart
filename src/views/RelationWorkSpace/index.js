import React from 'react'
import CssModules from 'react-css-modules'

import realationStyle from '@scss/relationWorkSpace.scss'

// https://www.imooc.com/article/25369  demo
class RelationWorkspace extends React.PureComponent {
    render() {
        return <><p styleName="first-page">first page</p></>
    }
}

export default CssModules(RelationWorkspace, realationStyle)