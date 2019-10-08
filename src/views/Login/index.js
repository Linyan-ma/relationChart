import React from 'react'
import CssModules from 'react-css-modules'
import loginStyle from '@scss/login.scss'
class Login extends React.PureComponent{
    render(){
        return <><p styleName="login">login <span styleName="page">page</span></p></>
    }
}

export default CssModules(Login, loginStyle)