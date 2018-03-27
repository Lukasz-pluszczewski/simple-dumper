import { Router as router } from 'express';
import { name, version, author } from '../../package.json';
import getRequestData from '../helpers/getRequestData';
import resourceCrud from '../services/resourceCrud';

export default () => {
  const api = router();

  api.get('/requests', (req, res) => {
    res.json(resourceCrud.get('requests'));
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
  api.use('*', (req, res) => {
    const requestData = getRequestData(req);
    resourceCrud.create('requests', requestData);
    res.json(requestData);
  });

  // api data
  api.get('/health', (req, res) => {
    res.json({
      status: 'Healthy',
      name,
      appVersion: version,
      apiVersion: 1,
      apiVersions: [
        'V0',
        'v1',
      ],
      author,
    });
  });

  return api;
};
