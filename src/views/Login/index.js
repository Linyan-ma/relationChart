import React from 'react'
import CssModules from 'react-css-modules'
import loginStyle from '@scss/login.scss'
class Login extends React.PureComponent{
    render(){
        return <><p styleName="login">login page</p></>
    }
}

export default CssModules(Login, loginStyle)