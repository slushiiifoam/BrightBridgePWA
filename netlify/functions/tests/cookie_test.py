import requests

"""
Getting the jwt tokens as cookies to start 
"""

response = requests.post("http://localhost:8000/auth/getJWTTokens", json={"email" : "ijiang2@asu.edu"})

print(response.cookies.get_dict())

test_cookies = response.cookies.get_dict()

"""
Checks whether the protection function will let the user through 
"""

response = requests.get('http://localhost:8000/test', cookies=test_cookies)

print(response.json())
print(response.cookies.get_dict())


response.cookies.pop('access_token', None)

test_cookies = response.cookies.get_dict()


"""
Pops off the access token to check whether the jwt token will be refreshed 
"""

response = requests.get('http://localhost:8000/test', cookies=test_cookies)

print(response.json())
print(response.cookies.get_dict())

response.cookies.pop('access_token', None)
response.cookies.pop('refresponseh_token', None)


"""
Pops off all tokens to see if the request will be denied 
"""

response = requests.get('http://localhost:8000/test', cookies=test_cookies)

print(response.json())
print(response.cookies.get_dict())