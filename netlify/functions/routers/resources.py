from fastapi import APIRouter, Depends, status, Request, Cookie
from typing import Annotated
from pydantic import BaseModel

from infrastructure.ratelimiter import limiter

from services.resources import Resource_Service

"""
The body for document select 
"""
class Select_Body(BaseModel):
    limit : int = 50
    query : str | None = None

"""
The body for the document that needs to be upserted
"""
class Upsert_Body(BaseModel):
    id : int | None = None
    title : str
    link : str
    description : str

router = APIRouter(prefix='/resources')

def get_resource_service(request: Request):
    return request.app.state.resource_service

def get_user(request: Request):
    return request.app.state.user

"""
Endpoint for checking hte health of the router
"""
@limiter.limit("10/minute")
@router.get("/", status_code=status.HTTP_200_OK)
def health(request : Request):
    return {"detail":"resources router is healthy"}


"""
Endpoint for retirieving resources for the router
"""
@limiter.limit("10/minute")
@router.get("/retrieve", status_code=status.HTTP_200_OK)
def retrieve_resrouces(request : Request, 
                       body : Select_Body,
                       resource_service : Annotated[Resource_Service, Depends(get_resource_service)]):
    
    resources = resource_service.get_resources(body.model_dump())
    return resources

"""
Endpoint for upserting data into the resource
"""
@limiter.limit("10/minute")
@router.post("/upsert", status_code=status.HTTP_200_OK)
def upsert_resources(request : Request,
                     doc_info : Upsert_Body,
                     user : Annotated[str, Depends(get_resource_service)],
                     resource_service : Annotated[Resource_Service, Depends(get_resource_service)]):

    doc_info_dict = doc_info.model_dump()

    if doc_info_dict['id'] == None:
        doc_info_dict.pop('id')

    status = resource_service.upsert_resource(user, doc_info_dict)
    return {"status" : status}

"""
Endpoint for deleting data from the resource
"""
@limiter.limit("10/minute")
@router.delete("/delete/{resource_id}", status_code=status.HTTP_200_OK)
def delete_resources(request : Request,
                     resource_id : int,
                     user : Annotated[str, Depends(get_resource_service)],
                     resource_service : Annotated[Resource_Service, Depends(get_resource_service)]):

    status = resource_service.remove_resource(user, resource_id)
    return {"status" : status}