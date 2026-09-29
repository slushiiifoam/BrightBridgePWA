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
The body for the document that needs to be deleted
"""
class Delete_Body(BaseModel):
    resource_id : str

"""
The body for the document that needs to be upserted
"""
class Upsert_Body(BaseModel):
    resource_id : str
    title : str
    author : str
    description : str

router = APIRouter(prefix='/resources')

def get_resource_service(request: Request):
    return request.app.state.request_service

def get_user(request: Request):
    return request.app.state.user

"""
Endpoint for checking hte health of the router
"""
@limiter.limit("10/minute")
@router.get("/", staus_code=status.HTTP_200_OK)
def health():
    return {"detail":"resources router is healthy"}


"""
Endpoint for retirieving resources for the router
"""
@limiter.limit("10/minute")
@router.get("/retrieve", status_code=status.HTTP_200_OK)
def retrieve_resrouces(request : Request, 
                       body : Select_Body,
                       resource_service : Annotated[Resource_Service, Depends(get_resource_service)]):
    
    resources = resource_service.get_resources(body.model_dumps())
    return resources

"""
Endpoint for upserting data into the resource
"""
@limiter.limit("10/minute")
@router.get("/upsert", status_code=status.HTTP_200_OK)
def upsert_resources(request : Request,
                     doc_info : Upsert_Body,
                     user : Annotated[str, Depends(get_resource_service)],
                     resource_service : Annotated[Resource_Service, Depends(get_resource_service)]):

    status = resource_service.upsert_resource(user, doc_info.model_dump())
    return {"status" : status}

"""
Endpoint for deleting data from the resource
"""
@limiter.limit("10/minute")
@router.delete("/delete", status_code=status.HTTP_200_OK)
def delete_resources(request : Request,
                     doc_info : Delete_Body,
                     user : Annotated[str, Depends(get_resource_service)],
                     resource_service : Annotated[Resource_Service, Depends(get_resource_service)]):

    status = resource_service.remove_resource(user, doc_info.resource_id)
    return {"status" : status}