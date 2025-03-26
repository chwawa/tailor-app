from io import BytesIO
from unittest.mock import patch


def create_test_file(filename='test.jpg', content=b'Test content'):
    return (BytesIO(content), filename)

@patch('routes.file_routes.blob_storage.upload_file')
@patch('routes.file_routes.cohere.ClientV2.embed')
@patch('routes.file_routes.insert_document')
def test_upload_file_success(mock_insert_document, mock_embed, mock_upload_file, client):
    mock_upload_file.return_value = {
        "blob_name": "test_blob",
        "blob_url": "http://example.com/test_blob",
        "size": 1234,
        "container": "test_container"
    }
    mock_embed.return_value.embeddings.float = [[0.1, 0.2, 0.3]]
    mock_insert_document.return_value = "document_id_123"
    
    file, filename = create_test_file()
    data = {
        'file': (file, filename),
        'description': 'Test file description',
        'user_id': 'user_123'
    }
    
    response = client.post('/api/files/upload', data=data, content_type='multipart/form-data')
    
    assert response.status_code == 200
    response_json = response.get_json()
    assert response_json['success'] == True
    assert response_json['message'] == 'File uploaded successfully'
    assert 'file_data' in response_json
    assert response_json['file_data']['document_id'] == 'document_id_123'


@patch('routes.file_routes.find_documents')
def test_get_user_files_success(mock_find_documents, client):
    mock_find_documents.return_value = [
        {"_id": "1", "filename": "test1.jpg", "description": "Test file 1"},
        {"_id": "2", "filename": "test2.jpg", "description": "Test file 2"}
    ]
    
    response = client.get('/api/files/user/user_123')
    
    assert response.status_code == 200
    response_json = response.get_json()
    assert response_json['success'] == True
    assert response_json['count'] == 2
    assert len(response_json['files']) == 2
    assert response_json['files'][0]['_id'] == '1'
    assert response_json['files'][1]['filename'] == 'test2.jpg'


@patch('routes.file_routes.find_documents')
@patch("routes.file_routes.blob_storage.delete_blob")
@patch("routes.file_routes.delete_document")
def test_delete_file_success(mock_delete_document, mock_delete_blob, mock_find_documents, client):
    mock_find_documents.return_value = [
        {"_id": "123", "filename": "test.jpg", "blob_name": "blob123", "container": "container1"}
    ]
    mock_delete_blob.return_value = True  

    response = client.delete("/api/files/1/123")

    assert response.status_code == 200

    response_json = response.get_json()
    assert response_json['success'] == True
    assert response_json['message'] == "File deleted successfully"

    mock_find_documents.assert_called_once_with("1", "files", {"_id": "123"})
    mock_delete_blob.assert_called_once_with("blob123", "container1")
    mock_delete_document.assert_called_once_with("1", "files", "123")


@patch("routes.file_routes.find_documents")
@patch("routes.file_routes.blob_storage.update_blob")
@patch("routes.file_routes.update_document")
@patch("routes.file_routes.co.embed")
def test_update_file_success(mock_embed, mock_update_document, mock_update_blob, mock_find_documents, client):
    mock_find_documents.return_value = [
        {"_id": "123", "filename": "test.jpg", "blob_name": "blob123", "container": "container1", "description": "Old description"}
    ]
    mock_update_blob.return_value = True  
    mock_embed.return_value.embeddings.float = [[0.1, 0.2, 0.3]]
    mock_update_document.return_value = {"_id": "123", "filename": "test.jpg", "description": "New description"}

    response = client.patch("/api/files/1/123", data={"description": "New description"})

    assert response.status_code == 200

    response_json = response.get_json()
    assert response_json['success'] == True
    assert response_json['message'] == "File updated successfully"

    mock_find_documents.assert_called_once_with("1", "files", {"_id": "123"})
    mock_update_blob.assert_called_once_with("blob123", {"_id": "123", "filename": "test.jpg", "blob_name": "blob123", "container": "container1", "description": "New description", "embedding": [0.1, 0.2, 0.3]}, "container1")
    mock_update_document.assert_called_once_with("1", "files", "123", {"_id": "123", "filename": "test.jpg", "blob_name": "blob123", "container": "container1", "description": "New description", "embedding": [0.1, 0.2, 0.3]})
    mock_embed.assert_called_once_with(texts=["New description"], model="embed-english-v3.0", input_type="search_document", embedding_types=["float"])
