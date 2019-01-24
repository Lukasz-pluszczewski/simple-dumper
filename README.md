# Request dumper
> Node app that saves all incoming requests and allows you to search through history

## Endpoints
#### GET /requests
Returns the array of saved requests (with simplified data)

Params:
- full - if set to 'true' returns all saved fields
- body, query, headers, baseUrl, method, date: regexes to return only entries containing particular string

Examples:

`/requests?full=true&baseUrl=^test&method=POST` - will return full information about requests whose baseUrl starts with 'test' and method was POST

`/requests?body=test` - will return requests that contain string 'test' in body (in key or in value)

#### GET /count
Identical to /requests but returns number of entries

Accepts the same params

#### DELETE /requests
Clears the database

#### GET /requests/:id
Gets full information about request by it's id

#### DELETE /requests/:id
Deletes one entry

## Docker
`docker run -d sigmification/simple-dumper`