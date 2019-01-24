import { Router as router } from 'express';
import _ from 'lodash';
import { name, version, author } from '../../package.json';
import { extractRequest, simplifyRequest } from '../helpers/getRequestData';
import resourceCrud from '../services/resourceCrud';

const matchObject = (object, filter) => {
  return _.some(object, (value, key) => {
    return filter.test(key) || (_.isPlainObject(value) ? matchObject(value, filter) : filter.test(value));
  });
};

const filterWrapper = (filterValue, field) => el => {
  const filter = new RegExp(filterValue);
  if (_.isObject(el[field])) {
    return matchObject(el[field], filter);
  }
  if (_.isArray(el[field])) {
    return _.some(el[field], value => filter.test(value));
  }
  return filter.test(el[field]);
};

const applyFilters = filters => (req, wrapper) => {
  filters.forEach(field => {
    const filterValue = req.query[field];
    if (filterValue) {
      wrapper = wrapper.filter(filterWrapper(filterValue, field));
    }
  });
  return wrapper;
};

const filterMiddleware = (req, count = false) => wrapper => {
  if (req.query.full !== 'true') {
    wrapper = wrapper.map(simplifyRequest);
  }
  wrapper = applyFilters([
    'date',
    'method',
    'baseUrl',
    'query',
    'body',
    'headers',
  ])(req, wrapper);

  if (req.query.id) {
    wrapper = wrapper.find({ id: req.query.id });
  }
  if (count) {
    return wrapper.size();
  }
  return wrapper.reverse();
};

export default () => {
  const api = router();

  api.get('/requests', (req, res) => {
    res.json(resourceCrud.get('requests', filterMiddleware(req)));
  });
  api.get('/count', (req, res) => {
    res.json(resourceCrud.get('requests', filterMiddleware(req, true)));
  });
  api.delete('/requests', (req, res) => {
    resourceCrud.clear('requests');
    res.json({ message: 'ok' });
  });
  api.get('/requests/:id', (req, res) => {
    res.json(resourceCrud.getById('requests', req.params.id));
  });
  api.delete('/requests/:id', (req, res) => {
    resourceCrud.delete('requests', req.params.id);
    res.json({ message: 'ok' });
  });

  api.get('/help', (req, res) => {
    res.send(`<article>
    <h1><a href="https://github.com/Lukasz-pluszczewski/simple-dumper">Request dumper</a></h1>
      <blockquote>
        <p>> Node app that saves all incoming requests and allows you to search through history</p>
      </blockquote>
      <h2>Endpoints</h2>
      <h4>GET /requests</h4>
      <p>Returns the array of saved requests (with simplified data)</p>
      <p>Params:</p>
      <ul>
        <li>full - if set to 'true' returns all saved fields</li>
        <li>body, query, headers, baseUrl, method, date: regexes to return only entries containing particular string</li>
      </ul>
      <p>Examples:</p>
      <p>
        <code>/requests?full=true&amp;baseUrl=^test&amp;method=POST</code> - will return full information about requests whose baseUrl starts with 'test' and method was POST
      </p>
      <p>
        <code>/requests?body=test</code> - will return requests that contain string 'test' in body (in key or in value)
      </p>
      <h4>GET /count</h4>
      <p>Identical to /requests but returns number of entries</p>
      <p>Accepts the same params</p>
      <h4>DELETE /requests</h4>
      <p>Clears the database</p>
      <h4>GET /requests/:id</h4>
      <p>Gets full information about request by it's id</p>
      <h4>DELETE /requests/:id</h4>
      <p>Deletes one entry</p>
      <h2>Docker</h2>
      <p><code>docker run -d sigmification/simple-dumper</code></p>
</article>`);
  });
  api.use('*', (req, res) => {
    const requestData = {
      ...extractRequest(req),
      date: (new Date()).toISOString(),
    };
    resourceCrud.create('requests', requestData);
    res.json(requestData);
  });

  return api;
};
