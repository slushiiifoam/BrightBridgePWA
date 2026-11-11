//this is the class that manages all of the tokens
//parses the user token
const parseUserToken = () => {
    const savedUser = localStorage.getItem('brightbridge.user');
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch (e) {
                console.log('No user exsits');
                localStorage.removeItem('brightbridge.user');
            }
        }
        return null;
};

//parses and returns the jwt token
const parseJWT = (token) => {
    // 1. Split the token by the dots and grab the middle part (index 1)
    const base64Url = token.split('.')[1];
    
    // 2. Replace URL-safe characters back to standard Base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // 3. Decode the Base64 string into a JSON string, then parse it into an object
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

//helper method that getives the jwt access token
const getJWTToken = () => {
    const userObj = parseUserToken();
    if (!userObj) throw new Error('invalid user token');

    const jwt = userObj.token?.access_token;
    if (!jwt) throw new Error('invalid jwt token');

    return parseJWT(jwt);
};

export {getJWTToken, parseJWT,parseUserToken}