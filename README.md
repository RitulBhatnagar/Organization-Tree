# Organization_Tree API Documentation

This NodeController API allows for creating and managing an organization hierarchy, including organizations, locations, employees, and departments. It provides various operations to manage the organization tree structure.

## API Endpoints

### 1. Create Organization

- **Endpoint:** `POST /node/organization`
- **Description:** Creates a new organization.
- **Request Body:**
  - `name` (string, required): The name of the organization.
  - `color` (string, required): The color assigned to the organization.
- **Responses:**
  - `201 Created`: Returns the created organization node.
  - `400 Bad Request`: If name or color is missing or invalid.
  - `500 Internal Server Error`: If there is a server-side issue.

#### Example Request:

```json
{
  "nodeid": "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6",
  "nodename": "Bank",
  "nodetype": "organization",
  "organization": {
    "orgName": "Bank",
    "orgId": "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
  },
  "nodeColour": "white",
  "deletedAt": null,
  "parentId": null,
  "createdAt": "2024-09-25T07:47:14.596Z",
  "updatedAt": "2024-09-25T07:47:14.596Z"
}
```

---

### 2. Create Location

- **Endpoint:** `POST /node/location`
- **Description:** Creates a new location under a parent node.
- **Request Body:**
  - `name` (string, required): The name of the location.
  - `parentId` (string, required): The parent node ID where the location will be created.
  - `orgId` (string, required): The organization ID the location belongs to.
- **Responses:**
  - `201 Created`: Returns the created location node.
  - `400 Bad Request`: If name, parentId, or orgId is missing or invalid.
  - `500 Internal Server Error`: If there is a server-side issue.

#### Example Request:

```json
{
  "nodeid": "c61672d2-6674-43d2-a4bc-dd11f640999c",
  "nodename": "Delhi",
  "nodetype": "locations",
  "organization": {
    "orgId": "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6",
    "orgName": "Bank"
  },
  "nodeColour": "#F6AF8E",
  "parentId": "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6",
  "deletedAt": null,
  "createdAt": "2024-09-25T07:48:02.001Z",
  "updatedAt": "2024-09-25T07:48:02.001Z"
}
```

### 3. Create Employee

- **Endpoint:** `POST /node/employee`
- **Description:** Creates a new employee under a parent node.
- **Request Body:**
  - `name` (string, required): The name of the employee.
  - `color` (string, required): The color assigned to the employee.
  - `parentId` (string, required): The parent node ID where the employee will be created.
  - `orgId` (string, required): The organization ID the employee belongs to.
- **Responses:**
  - `201 Created`: Returns the created employee node.
  - `400 Bad Request`: If name, parentId, or orgId is missing or invalid.
  - `500 Internal Server Error`: If there is a server-side issue.

#### Example Request:

```json
{
  "nodeid": "75b31663-80a8-4358-b0e4-101714106fc8",
  "nodename": "Akshay",
  "nodetype": "employees",
  "organization": {
    "orgId": "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6",
    "orgName": "Bank"
  },
  "nodeColour": "#F6AF8E",
  "parentId": "1768a018-d345-459a-9edb-1bf0bc3d372a",
  "deletedAt": null,
  "createdAt": "2024-09-25T07:50:29.452Z",
  "updatedAt": "2024-09-25T07:50:29.452Z"
}
```

### 4. Create Department

- **Endpoint:** `POST /node/department`
- **Description:** Creates a new department under a parent node.
- **Request Body:**
  - `name` (string, required): The name of the department.
  - `color` (string, required): The color assigned to the department.
  - `parentId` (string, required): The parent node ID where the department will be created.
  - `orgId` (string, required): The organization ID the department belongs to.
- **Responses:**
  - `201 Created`: Returns the created department node.
  - `400 Bad Request`: If name, parentId, or orgId is missing or invalid.
  - `500 Internal Server Error`: If there is a server-side issue.

#### Example Request:

```json
{
  "nodeid": "1768a018-d345-459a-9edb-1bf0bc3d372a",
  "nodename": "Audit",
  "nodetype": "departments",
  "organization": {
    "orgId": "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6",
    "orgName": "Bank"
  },
  "nodeColour": "#F6AF8E",
  "parentId": "c61672d2-6674-43d2-a4bc-dd11f640999c",
  "deletedAt": null,
  "createdAt": "2024-09-25T07:49:31.604Z",
  "updatedAt": "2024-09-25T07:49:31.604Z"
}
```

### 5. Get Organization Tree

- **Endpoint:** `GET /node/tree/:id`
- **Description:** Retrieves the entire organization tree structure by ID.
- **Path Parameter:**
  - `id` (string, required): The organization ID to retrieve the tree.
- **Responses:**
  - `200 OK`: Returns the organization tree.
  - `400 Bad Request`: If id is missing.
  - `500 Internal Server Error`: If there is a server-side issue.

#### Example Response (Success):

```json
{
  "createdAt": "2024-09-25T07:47:14.596Z",
  "updatedAt": "2024-09-25T07:47:14.596Z",
  "deletedAt": null,
  "nodeid": "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6",
  "nodename": "Bank",
  "nodetype": "organization",
  "nodeColour": "white",
  "parentId": null,
  "children": [
    {
      "createdAt": "2024-09-25T07:48:02.001Z",
      "updatedAt": "2024-09-25T07:48:02.001Z",
      "deletedAt": null,
      "nodeid": "c61672d2-6674-43d2-a4bc-dd11f640999c",
      "nodename": "Delhi",
      "nodetype": "locations",
      "nodeColour": "#F6AF8E",
      "parentId": "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6",
      "children": [
        {
          "createdAt": "2024-09-25T07:49:31.604Z",
          "updatedAt": "2024-09-25T07:49:31.604Z",
          "deletedAt": null,
          "nodeid": "1768a018-d345-459a-9edb-1bf0bc3d372a",
          "nodename": "Audit",
          "nodetype": "departments",
          "nodeColour": "#F6AF8E",
          "parentId": "c61672d2-6674-43d2-a4bc-dd11f640999c",
          "children": [
            {
              "createdAt": "2024-09-25T07:50:29.452Z",
              "updatedAt": "2024-09-25T07:50:29.452Z",
              "deletedAt": null,
              "nodeid": "75b31663-80a8-4358-b0e4-101714106fc8",
              "nodename": "Akshay",
              "nodetype": "employees",
              "nodeColour": "#F6AF8E",
              "parentId": "1768a018-d345-459a-9edb-1bf0bc3d372a",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

### 5. Delete Node

- **Endpoint:** `DELETE /node/:id`
- **Description:** Deletes a node and optionally all its children.
- **Path Parameter:**
  - `id` (string, required): The node ID to be deleted.
- **Query Parameters:**
  - `deleteAllChildren` (boolean, required): If `true`, deletes all child nodes under the specified node.
- **Responses:**
  - `200 OK`: Returns success or failure of node deletion.
  - `400 Bad Request`: If `id` or `deleteAllChildren` is missing.
  - `500 Internal Server Error`: If there is a server-side issue.

#### Example Request:

```bash
DELETE /node/1234?deleteAllChildren=true
```

### 6. Update Node

- **Endpoint:** `PATCH /node/:id`
- **Description:** Updates the properties of an existing node.
- **Path Parameter:**
  - `id` (string, required): The ID of the node to be updated.
- **Request Body:**
  - `name` (string, required): The new name for the node.
  - `color` (string, required): The new color for the node.
  - `parentId` (string, required): The new parent node ID for the node.
- **Query Parameters:**
  - `shiftAllNodes` (boolean, optional): If `true`, shifts all child nodes under the new parent node.
- **Responses:**
  - `200 OK`: Returns the updated node.
  - `400 Bad Request`: If name, color, or parentId is missing or invalid.
  - `500 Internal Server Error`: If there is a server-side issue.

#### Example Request:

```json
PATCH /node/1234
{
  "name": "Updated Node Name",
  "color": "#3498DB",
  "parentId": "5678"
}
```
