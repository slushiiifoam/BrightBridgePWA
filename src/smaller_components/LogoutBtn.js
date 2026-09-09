import React from 'react'


function LogoutBtn(){

    const logout = () => {window.netlifyIdentity.logout()};

    return<><button id="logout-btn" type="button" onClick={logout}>Log Out</button></>
}

export default LogoutBtn