import requests

response = requests.post("http://localhost:8000/auth/getJWTTokens", json={"email" : "ijiang2@asu.edu"})

print(response.cookies.get_dict())

response.cookies.pop('access_token', None)

test_cookies = response.cookies.get_dict()

response = requests.get('http://localhost:8000/auth/refresponseh', cookies=test_cookies)

print(response.json())
print(response.cookies.get_dict())