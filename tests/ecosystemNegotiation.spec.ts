import { expect } from "chai";
import request from "supertest";
import { config } from "dotenv";
import { startServer } from "../src/server";
import { IncomingMessage, Server, ServerResponse } from "http";
import { Application } from "express";
import { mockContract } from "./fixtures/fixture.contract";

import {
  testProvider2,
  testProvider3,
  testOrchestrator,
  testConsumer1,
  testConsumer2,
} from "./fixtures/testAccount";
import {
  sampleDataResource,
  sampleSoftwareResource,
  sampleProviderServiceOffering,
  sampleConsumerServiceOffering,
  sampleEcosystem,
  sampleInvitation,
  sampleUpdatedEcosystem,
  sampleOfferings,
  sampleJoinRequest,
} from "./fixtures/sampleData";
import { stub } from "sinon";
import * as loadMongoose from "../src/config/database";
import { closeMongoMemory, openMongoMemory } from "./utils.ts/mongoMemory";

config();

export let app: Application;
export let server: Server<typeof IncomingMessage, typeof ServerResponse>;

let provider1Id = "";
let provider2Id = "";
let orchestId = "";
let consumer1Id = "";
let consumer2Id = "";
let dataResource1Id = "";
let dataResource2Id = "";
let softwareResource1Id: "";
let softwareResource2Id: "";
let orchestJwt = "";
let provider1Jwt = "";
let provider2Jwt = "";
let consumer1Jwt = "";
let consumer2Jwt = "";
let providerServiceOffering1Id = "";
let providerServiceOffering2Id = "";
let consumerServiceOffering1Id = "";
let consumerServiceOffering2Id = "";
let requestId1: "";
let requestId2: "";
let ecosystemId = "";

describe("Ecosystem routes tests", () => {
  let loadMongooseStub;
  before(async () => {
    loadMongooseStub = stub(loadMongoose, "loadMongoose").callsFake(
      async () => {
        await openMongoMemory();
      }
    );
    // Start the server and obtain the app and server instances
    const serverInstance = await startServer(3001);
    await serverInstance.promise;
    app = serverInstance.app;
    server = serverInstance.server;
    mockContract();

    // Create provider1
    const provider1Data = testProvider2;
    const provider1Response = await request(app)
      .post(`${process.env.API_PREFIX}/auth/signup`)
      .send(provider1Data);
    provider1Id = provider1Response.body.participant._id;

    // Create provider2
    const provider2Data = testProvider3;
    const provider2Response = await request(app)
      .post(`${process.env.API_PREFIX}/auth/signup`)
      .send(provider2Data);
    provider2Id = provider2Response.body.participant._id;

    // Create consumer 1
    const consumer1Data = testConsumer1;
    const consumer1Response = await request(app)
      .post(`${process.env.API_PREFIX}/auth/signup`)
      .send(consumer1Data);
    consumer1Id = consumer1Response.body.participant._id;
    // Create consumer 2
    const consumer2Data = testConsumer2;
    const consumer2Response = await request(app)
      .post(`${process.env.API_PREFIX}/auth/signup`)
      .send(consumer2Data);
    consumer2Id = consumer2Response.body.participant._id;

    // Create orchestrator
    const orchestData = testOrchestrator;
    const orchestResponse = await request(app)
      .post(`${process.env.API_PREFIX}/auth/signup`)
      .send(orchestData);
    orchestId = orchestResponse.body.participant._id;

    // Login provider1
    const provider1AuthResponse = await request(app)
      .post(`${process.env.API_PREFIX}/auth/login`)
      .send({
        email: testProvider2.email,
        password: testProvider2.password,
      });
    provider1Jwt = provider1AuthResponse.body.token;
    // Login provider2
    const provider2AuthResponse = await request(app)
      .post(`${process.env.API_PREFIX}/auth/login`)
      .send({
        email: testProvider3.email,
        password: testProvider3.password,
      });
    provider2Jwt = provider2AuthResponse.body.token;

    // Login orchestrator
    const orchestAuthResponse = await request(app).post(`${process.env.API_PREFIX}/auth/login`).send({
      email: testOrchestrator.email,
      password: testOrchestrator.password,
    });
    orchestJwt = orchestAuthResponse.body.token;

    // Login consumer 1
    const consumer1AuthResponse = await request(app)
      .post(`${process.env.API_PREFIX}/auth/login`)
      .send({
        email: testConsumer1.email,
        password: testConsumer1.password,
      });
    consumer1Jwt = consumer1AuthResponse.body.token;
    // Login consumer 2
    const consumer2AuthResponse = await request(app)
      .post(`${process.env.API_PREFIX}/auth/login`)
      .send({
        email: testConsumer2.email,
        password: testConsumer2.password,
      });
    consumer2Jwt = consumer2AuthResponse.body.token;

    // Create data resource 1
    const dataResource1Data = sampleDataResource;
    const dataResponse1 = await request(app)
      .post(`${process.env.API_PREFIX}/dataResources`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send(dataResource1Data);
    dataResource1Id = dataResponse1.body._id;
    // Create service offerings 1
    const resProvider1 = await request(app)
      .post(`${process.env.API_PREFIX}/serviceofferings`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send({ ...sampleProviderServiceOffering, providedBy: provider1Id });
    providerServiceOffering1Id = resProvider1.body._id;
    // Create data resource 2
    const dataResource2Data = sampleDataResource;
    const dataResponse2 = await request(app)
      .post(`${process.env.API_PREFIX}/dataResources`)
      .set("Authorization", `Bearer ${provider2Jwt}`)
      .send(dataResource2Data);
    dataResource2Id = dataResponse2.body._id;
    // Create service offerings 2
    const resProvider2 = await request(app)
      .post(`${process.env.API_PREFIX}/serviceofferings`)
      .set("Authorization", `Bearer ${provider2Jwt}`)
      .send({ ...sampleProviderServiceOffering, providedBy: provider2Id });
    providerServiceOffering2Id = resProvider2.body._id;

    //create software resource 1
    const softwareResource1Data = sampleSoftwareResource;
    const softwareResponse1 = await request(app)
      .post(`${process.env.API_PREFIX}/softwareresources`)
      .set("Authorization", `Bearer ${consumer1Jwt}`)
      .send(softwareResource1Data);
    softwareResource1Id = softwareResponse1.body.id;
    // Create service offerings 1
    const resConsumer1 = await request(app)
      .post(`${process.env.API_PREFIX}/serviceofferings`)
      .set("Authorization", `Bearer ${consumer1Jwt}`)
      .send({ ...sampleConsumerServiceOffering, providedBy: consumer1Id });
    consumerServiceOffering1Id = resConsumer1.body._id;

    //create software resource 2
    const softwareResource2Data = sampleSoftwareResource;
    const softwareResponse2 = await request(app)
      .post(`${process.env.API_PREFIX}/softwareresources`)
      .set("Authorization", `Bearer ${consumer2Jwt}`)
      .send(softwareResource2Data);
    softwareResource2Id = softwareResponse2.body.id;
    // Create service offerings 2
    const resConsumer2 = await request(app)
      .post(`${process.env.API_PREFIX}/serviceofferings`)
      .set("Authorization", `Bearer ${consumer2Jwt}`)
      .send({ ...sampleConsumerServiceOffering, providedBy: consumer2Id });
    consumerServiceOffering2Id = resConsumer2.body._id;
  });

  after(() => {
    // Close the server after all tests are completed
    loadMongooseStub.restore();
    closeMongoMemory();
    server.close();
  });

  it("should create a new ecosystem", async () => {
    const response = await request(app)
      .post(`${process.env.API_PREFIX}/ecosystems`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send(sampleEcosystem)
      .expect(201);
    ecosystemId = response.body._id;
  });

  it("should getMyEcosystems", async () => {
    const response = await request(app)
      .get(`${process.env.API_PREFIX}/ecosystems/me`)
      .set("Authorization", `Bearer ${orchestJwt}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array").and.to.not.be.empty;
  });

  it("should update an ecosystem", async () => {
    const response = await request(app)
      .put(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send(sampleUpdatedEcosystem)
      .expect(200);
  });

  it("should getMyEcosystems", async () => {
    const response = await request(app)
      .get(`${process.env.API_PREFIX}/ecosystems/me`)
      .set("Authorization", `Bearer ${orchestJwt}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array").and.to.not.be.empty;
  });
  it("should create ecosystem contract", async () => {
    const response = await request(app)
      .post(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/contract`)
      .set("Authorization", `Bearer ${orchestJwt}`);
    expect(response.status).to.equal(200);
  });
  it("should get the ecosystem contract", async () => {
    const response = await request(app)
      .get(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/contract`)
      .set("Authorization", `Bearer ${orchestJwt}`);
    expect(response.status).to.equal(200);
  });

  it("should apply Orchestrator Signature", async () => {
    const response = await request(app)
      .post(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/signature/orchestrator`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send({
        signature: "hasSigned",
      })
      .expect(200);
  });

  it("should create invitation to join ecosystem for a data provider", async () => {
    const response = await request(app)
      .post(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/invites`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send({ ...sampleInvitation, participantId: provider1Id })
      .expect(200);

    // expect(response.body.participant).to.equal(provider1Id);
    // expect(response.body.status).to.equal("Requested");
    // expect(response.body.latestNegotiator).to.equal(orchestId);
  });
  it("should create invitation to join ecosystem for a service provider", async () => {
    const response = await request(app)
      .post(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/invites`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send({ ...sampleInvitation, participantId: consumer1Id })
      .expect(200);

    // expect(response.body.participant).to.equal(consumer1Id);
    // expect(response.body.status).to.equal("Requested");
    // expect(response.body.latestNegotiator).to.equal(orchestId);
  });
  it("should get All Invitations for a participant", async () => {
    const response = await request(app)
      .get(`${process.env.API_PREFIX}/ecosystems/me/invites`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .expect(200);
    expect(response.body).to.be.an("array").and.to.not.be.empty;
  });
  it("should get all pending invitations for an orchestrator of ecosystem", async () => {
    const response = await request(app)
      .get(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/invites`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(200);
    expect(response.body).to.be.an("array").and.to.not.be.empty;
  });

  it("should accept invitation to join ecosystem", async () => {
    const response = await request(app)
      .post(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/invites/accept`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .expect(200);
  });
  it("should deny invitation to join ecosystem", async () => {
    const response = await request(app)
      .post(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/invites/deny`)
      .set("Authorization", `Bearer ${consumer1Jwt}`)
      .expect(200);
  });

  it("should configure Participant Ecosystem Offerings", async () => {
    const modifiedSampleOfferings = { ...sampleOfferings };
    modifiedSampleOfferings.offerings[0].serviceOffering =
      providerServiceOffering1Id;
    const response = await request(app)
      .put(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/offerings`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send(modifiedSampleOfferings)
      .expect(200);
  });

  it("should apply Participant Signature", async () => {
    const response = await request(app)
      .post(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/signature/participant`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send({
        signature: "hasSigned",
      })
      .expect(200);
  });

  it("should create join request by a data provider", async () => {
    const modifiedSampleJoinRequest = { ...sampleJoinRequest };
    modifiedSampleJoinRequest.offerings[0].serviceOffering =
      providerServiceOffering2Id;
    const response = await request(app)
      .post(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/requests`)
      .set("Authorization", `Bearer ${provider2Jwt}`)
      .send(modifiedSampleJoinRequest)
      .expect(201);
  });
  it("should create join request by a service provider", async () => {
    const modifiedSampleJoinRequest = { ...sampleJoinRequest };
    modifiedSampleJoinRequest.offerings[0].serviceOffering =
      consumerServiceOffering2Id;
    const response = await request(app)
      .post(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/requests`)
      .set("Authorization", `Bearer ${consumer2Jwt}`)
      .send(modifiedSampleJoinRequest)
      .expect(201);
  });
  it("should get join requests", async () => {
    const response = await request(app)
      .get(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/requests`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(200);
    const matchingResponse1 = response.body.find(
      (item) => item.participant === provider2Id
    );
    const matchingResponse2 = response.body.find(
      (item) => item.participant === consumer2Id
    );
    if (matchingResponse1) {
      requestId1 = matchingResponse1._id;
    }
    if (matchingResponse2) {
      requestId2 = matchingResponse2._id;
    }
  });
  it("should authorize join request", async () => {
    const response = await request(app)
      .put(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/requests/${requestId1}/authorize`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(200);
  });
  it("should reject join request", async () => {
    const response = await request(app)
      .put(`${process.env.API_PREFIX}/ecosystems/${ecosystemId}/requests/${requestId1}/reject`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(200);
  });

  it("should delete the ecosystem by Id", async () => {
    const response = await request(app)
      .delete(`${process.env.API_PREFIX}/ecosystems/` + ecosystemId)
      .set("Authorization", `Bearer ${orchestJwt}`);

    expect(response.status).to.equal(200);
  });
});
