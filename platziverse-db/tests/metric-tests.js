'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const metricFixtures = require('./fixtures/metric')
const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () {}
}

let AgentStub = {
  hasMany: sinon.spy()
}

let sandbox = null
let MetricStub = null
let db = null
let type = "cpu"
let uuid = 'yyy-yyy-yyy'
let agentId = 1
let metricTypes = metricFixtures.byAgentUuid(uuid)
let metricTypesUuid = metricFixtures.byTypeAgentUuid(type, uuid)

let uuidArgs = {
  attributes: ['type'],
  group: ['type'],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

let typeUuidArgs = {
  attributes: ['id', 'type', 'value', 'createdAt'],
  where: {
    type
  },
  limit: 20,
  order: [['createdAt', 'DESC']],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

let oneAgentArgs = {
  where: {
    uuid
  }
}

let agentArgs = {
  where: { uuid }
}

let newMetric = {
  type: 'cpu',
  value: '80%',
  createdAt: new Date(),
  updatedAt: new Date()
}

let newMetricWithAgentId = {
  agentId: agentId,
  type: 'cpu',
  value: '80%',
  createdAt: new Date(),
  updatedAt: new Date()
}



test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
    MetricStub = {
      belongsTo: sandbox.spy()
    }
  
  // Model findAll Stub
  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs().returns(Promise.resolve(metricFixtures.all))
  MetricStub.findAll.withArgs(uuidArgs).returns(Promise.resolve(metricFixtures.byAgentUuid(uuid)))
  MetricStub.findAll.withArgs(typeUuidArgs).returns(Promise.resolve(metricFixtures.byTypeAgentUuid(type, uuid)))
  
  // Model findOne stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(agentArgs)
    .returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  
  // Model create stub
  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric)
    .returns(Promise.resolve( {
      toJSON () { return Object.assign(newMetric, {agentId: agentId}) }  
  }))

  // Model findByAgentUuid Stub
  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(metricFixtures.byAgentUuid(uuid)))
  
  //Model findByTypeAgentUuid Stub
  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(type, uuid).returns(Promise.resolve(metricFixtures.byTypeAgentUuid(type, uuid)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exist')
})

test.serial('Metric#findByUuid', async t => {
  let metric = await db.Metric.findByAgentUuid(uuid)
  
  t.true(MetricStub.findAll.called, 'findAll should by called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(uuidArgs), 'findAll should be called with specified args')
  
  t.deepEqual( metric, metricTypes, 'Should be the same')
})
    
test.serial('Metric#findByTypeAgentUuid', async t => {
  let metric = await db.Metric.findByTypeAgentUuid(type, uuid) 
  
  t.true(MetricStub.findAll.called, 'findAll should by called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(typeUuidArgs), 'findAll should be called with specified args')
  
  t.deepEqual( metric, metricTypesUuid, 'Should be the same')
})

test.serial('Metric#create', async t => {
  let metric = await db.Metric.create(uuid, newMetric)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith( oneAgentArgs ), "findOne should be called with uuidArgs")

  t.true(MetricStub.create.called, 'create should by called on Metric model')
  t.true(MetricStub.create.calledOnce, "create should by called once")
  t.true(MetricStub.create.calledWith(newMetric), 'create should be called with specified args')

  t.deepEqual(metric, newMetricWithAgentId, 'metric should be the same')
})
