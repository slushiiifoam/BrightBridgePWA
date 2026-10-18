import requests
from pydantic import BaseModel

class TestCase(BaseModel):
    url : str
    payload : dict | None
    protocol : str


tested_endpoints = [
    TestCase(protocol='get', url='http://localhost:8000/resources', payload=None, message="Testing /resources/"),
    TestCase(protocol='post', url='http://localhost:8000/resources/upsert', payload={"id" : None, "title" : "testing", "link" : "http://localhost", "description" : "testing description"}),
    TestCase(protocol='get', url='http://localhost:8000/resources/retrieve', payload={"limit" : 50, "query" : None}),
    TestCase(protocol='delete', url='http://localhost:8000/resources/delete/1', payload={"id" : 1})
]


for test in tested_endpoints:
    test_dict = test.model_dump()

    if test_dict['protocol'] == 'get':
        response = requests.get(test_dict['url'], json=test_dict['payload'])
    elif test_dict['protocol'] == 'post':
        response = requests.post(test_dict['url'], json=test_dict['payload'])
    else:
        response = requests.delete(test_dict['url'])

    print(f"Testing {test_dict['url']}")
    print(response.json())
    print('-'*30 + '\n')

