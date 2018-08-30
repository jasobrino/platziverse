'use strict'

const agentFixtures = require('./agent')

const metric = {
  id: 1,
  agentId: 1,
  type: 'cpu',
  value: '80%',
  createdAt: new Date(),
  updatedAt: new Date(),
  agent: agentFixtures.byId(1)
}

const metrics = [
  metric,
  extend(metric, { id: 2, type: 'temp', value: '23.60' }),
  extend(metric, { id: 3, type: 'temp', value: '14.45' }),
  extend(metric, { id: 4, value: 'id_4 para tipo test' }),
  extend(metric, { id: 5, value: 'id_5 valor tipo test' })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: metric,
  all: metrics,
  byAgentUuid: uuid => metrics.filter(a => a.agent['uuid'] === uuid)
        .map(b => b.type).filter((v, i, a) => a.indexOf(v) === i),
  byTypeAgentUuid: (type, uuid) => metrics.filter(a => a.type === type && a.agent['uuid'] === uuid)
        .map(b => {
          const m = {
            id: b.id,
            type: b.type,
            value: b.value,
            createdAt: b.createdAt
          }
          return m
        })
        .sort((a, b) => { 
          return new Date(b.date) - new Date(a.date) 
        })
}