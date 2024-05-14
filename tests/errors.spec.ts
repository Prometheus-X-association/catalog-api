import { expect } from "chai";
import request from "supertest";
import { config } from "dotenv";
import { startServer } from "../src/server";
import { IncomingMessage, Server, ServerResponse } from "http";
import { Application } from "express";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
  setBilateralAvailability,
  setContractAvailability,
  setupMocks,
} from "./fixtures/fixture.contract";

import {
  testErrorProvider1,
  testErrorProvider2,
  testErrorOrchest1,
  testErrorOrchest2,
  testErrorOrchest3,
  testErrorConsumer,
} from "./fixtures/testAccount";
import {
  sampleDataResource,
  sampleUpdatedDataResource,
  sampleSoftwareResource,
  sampleUpdatedSoftwareResource,
  sampleProviderServiceOffering,
  sampleConsumerServiceOffering,
  sampleBilateralNegotiation,
  sampleAuthorizeNegotiation,
  sampleNegotiatePolicies,
  sampleSignNegotiation,
  sampleEcosystem1,
  sampleInvitation,
  sampleUpdatedEcosystem,
  sampleOfferings,
  sampleJoinRequest,
  sampleSignEcosystem,
} from "./fixtures/sampleData";
import { stub } from "sinon";
import * as loadMongoose from "../src/config/database";
import { closeMongoMemory, openMongoMemory } from "./utils.ts/mongoMemory";

config();

export let app: Application;
export let server: Server<typeof IncomingMessage, typeof ServerResponse>;

let provider1Id = "";
let provider2Id = "";
let orchest1Id = "";
let orchest2Id = "";
let orchest3Id = "";
let consumerId = "";
let dataResource1Id = "";
let dataResource2Id = "";
let softwareResource1Id: "";
let orchest1Jwt = "";
let orchest2Jwt = "";
let orchest3Jwt = "";
let provider1Jwt = "";
let provider2Jwt = "";
let consumerJwt = "";
let providerServiceOffering1Id = "";
let providerServiceOffering2Id = "";
let consumerServiceOffering1Id = "";
let consumerServiceOffering2Id = "";
let negotiation1Id = "";
let negotiation2Id = "";
let negotiation1bId = "";
let requestId1 = "";
let ecosystem1Id= "";
let ecosystem2Id = "";
let ecosystem3Id = "";
const mock = new MockAdapter(axios);
const nonExistentDataResourcesId = "000000000000000000000000";
const nonExistentSoftwareResourcesId = "000000000000000000000000";
const nonExistentnegotiation1Id = "000000000000000000000000";
const nonExistentServiceOfferingId = "000000000000000000000000";
const nonExistentRequestId = "6633bf5cebbb53c52859179b";
const nonExistentEcosystemId = "6633bf5cebbb53c52859179b";

describe("Error Management catalog_api Routes Tests", function () {
  this.timeout(10000);
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
    setupMocks();

    // Create provider1
    const provider1Data = testErrorProvider1;
    const provider1Response = await request(app)
      .post("/v1/auth/signup")
      .send(provider1Data);
    provider1Id = provider1Response.body.participant._id;

    // Create provider2
    const provider2Data = testErrorProvider2;
    const provider2Response = await request(app)
      .post("/v1/auth/signup")
      .send(provider2Data);
    provider2Id = provider2Response.body.participant._id;

    // Create consumer 1
    const consumer1Data = testErrorConsumer;
    const consumer1Response = await request(app)
      .post("/v1/auth/signup")
      .send(consumer1Data);
    consumerId = consumer1Response.body.participant._id;

    // Create orchestrator 1
    const orchest1Data = testErrorOrchest1;
    const orchest1Response = await request(app)
      .post("/v1/auth/signup")
      .send(orchest1Data);
    orchest1Id = orchest1Response.body.participant._id;

    // Create orchestrator 2
    const orchest2Data = testErrorOrchest2;
    const orchest2Response = await request(app)
      .post("/v1/auth/signup")
      .send(orchest2Data);
    orchest2Id = orchest2Response.body.participant._id;

    // Create orchestrator 3
    const orchest3Data = testErrorOrchest3;
    const orchest3Response = await request(app)
      .post("/v1/auth/signup")
      .send(orchest3Data);
    orchest3Id = orchest3Response.body.participant._id;

    // Login orchestrator 1
    const orchest1AuthResponse = await request(app).post("/v1/auth/login").send({
      email: testErrorOrchest1.email,
      password: testErrorOrchest1.password,
    });
    orchest1Jwt = orchest1AuthResponse.body.token;

    // Login orchestrator 2
    const orchest2AuthResponse = await request(app).post("/v1/auth/login").send({
      email: testErrorOrchest2.email,
      password: testErrorOrchest2.password,
    });
    orchest2Jwt = orchest2AuthResponse.body.token;

    // Login orchestrator 3
    const orchest3AuthResponse = await request(app).post("/v1/auth/login").send({
      email: testErrorOrchest3.email,
      password: testErrorOrchest3.password,
    });
    orchest3Jwt = orchest3AuthResponse.body.token;

    // Login consumer 1
    const consumer1AuthResponse = await request(app)
      .post("/v1/auth/login")
      .send({
        email: testErrorConsumer.email,
        password: testErrorConsumer.password,
      });
    consumerJwt = consumer1AuthResponse.body.token;

    // Login provider1
    const provider1AuthResponse = await request(app)
      .post("/v1/auth/login")
      .send({
        email: testErrorProvider1.email,
        password: testErrorProvider1.password,
      });
    provider1Jwt = provider1AuthResponse.body.token;

    // Login provider2
    const provider2AuthResponse = await request(app)
      .post("/v1/auth/login")
      .send({
        email: testErrorProvider2.email,
        password: testErrorProvider2.password,
      });
    provider2Jwt = provider2AuthResponse.body.token;

    // Create data resource 1
    const dataResource1Data = sampleDataResource;
    const dataResponse1 = await request(app)
      .post("/v1/dataResources")
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send(dataResource1Data);
    dataResource1Id = dataResponse1.body._id;

    // Create service offerings 1
    const resProvider1 = await request(app)
      .post("/v1/serviceofferings")
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send({ ...sampleProviderServiceOffering, providedBy: provider1Id });
    providerServiceOffering1Id = resProvider1.body._id;

    // Create data resource 2
    const dataResource2Data = sampleDataResource;
    const dataResponse2 = await request(app)
      .post("/v1/dataResources")
      .set("Authorization", `Bearer ${provider2Jwt}`)
      .send(dataResource2Data);
    dataResource2Id = dataResponse2.body._id;

    // Create service offerings 2
    const resProvider2 = await request(app)
      .post("/v1/serviceofferings")
      .set("Authorization", `Bearer ${provider2Jwt}`)
      .send({ ...sampleProviderServiceOffering, providedBy: provider2Id });
    providerServiceOffering2Id = resProvider2.body._id;

    //create software resource 1
    const softwareResource1Data = sampleSoftwareResource;
    const softwareResponse1 = await request(app)
      .post("/v1/softwareresources")
      .set("Authorization", `Bearer ${consumerJwt}`)
      .send(softwareResource1Data);
    softwareResource1Id = softwareResponse1.body.id;

    // Create service offerings 1
    const resConsumer1 = await request(app)
      .post("/v1/serviceofferings")
      .set("Authorization", `Bearer ${consumerJwt}`)
      .send({ ...sampleConsumerServiceOffering, providedBy: consumerId });
    consumerServiceOffering1Id = resConsumer1.body._id;

    // Create service offerings 1
    const resConsumer2 = await request(app)
      .post("/v1/serviceofferings")
      .set("Authorization", `Bearer ${consumerJwt}`)
      .send({ ...sampleConsumerServiceOffering, providedBy: consumerId });
    consumerServiceOffering2Id = resConsumer2.body._id;

    //create bilateral negotiation 1 (authorized & accepted in tests below)
    const negotiationData = sampleBilateralNegotiation;
    const negotiationResponse = await request(app)
      .post("/v1/negotiation")
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send({
        ...negotiationData,
        provider: provider1Id,
        consumer: consumerId,
        providerServiceOffering: providerServiceOffering1Id,
        consumerServiceOffering: consumerServiceOffering1Id,
      });
    negotiation1Id = negotiationResponse.body._id;

    //create bilateral negotiation 1b
    const negotiation1bData = sampleBilateralNegotiation;
    const negotiation1bResponse = await request(app)
      .post("/v1/negotiation")
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send({
        ...negotiation1bData,
        provider: provider1Id,
        consumer: consumerId,
        providerServiceOffering: providerServiceOffering1Id,
        consumerServiceOffering: consumerServiceOffering2Id,
      });
    negotiation1bId = negotiation1bResponse.body._id;
    //create bilateral negotiation 2 (authorized but not accepted in tests below)
    const negotiation2Data = sampleBilateralNegotiation;
    const negotiation2Response = await request(app)
      .post("/v1/negotiation")
      .set("Authorization", `Bearer ${provider2Jwt}`)
      .send({
        ...negotiation2Data,
        provider: provider2Id,
        consumer: consumerId,
        providerServiceOffering: providerServiceOffering2Id,
        consumerServiceOffering: consumerServiceOffering1Id,
      });
    negotiation2Id = negotiation2Response.body._id;

    //authorize negotiation 2
    await request(app)
      .put(`/v1/negotiation/${negotiation2Id}`)
      .set("Authorization", `Bearer ${provider2Jwt}`)
      .send(sampleAuthorizeNegotiation);

    //create ecosystem 1 : no participants invited
    const ecosystem1response = await request(app)
      .post("/v1/ecosystems")
      .set("Authorization", `Bearer ${orchest1Jwt}`)
      .send(sampleEcosystem1);
    ecosystem1Id = ecosystem1response.body._id;

    //create join request to ecosystem 1 
    const modifiedSampleJoinRequest = { ...sampleJoinRequest };
    modifiedSampleJoinRequest.offerings[0].serviceOffering =
      providerServiceOffering1Id;
    await request(app)
      .post(`/v1/ecosystems/${ecosystem1Id}/requests`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send(modifiedSampleJoinRequest)
    // get join request
    const joinRequestResponse = await request(app)
      .get(`/v1/ecosystems/${ecosystem1Id}/requests`)
      .set("Authorization", `Bearer ${orchest1Jwt}`)
    const matchingResponse = joinRequestResponse.body.find(
      (item) => item.participant === provider1Id
    );
      if (matchingResponse) {
        requestId1 = matchingResponse._id;
      }

    //create ecosystem 2 : participant invited and contract signed
    const ecosystem2response = await request(app)
      .post("/v1/ecosystems")
      .set("Authorization", `Bearer ${orchest2Jwt}`)
      .send(sampleEcosystem1);
    ecosystem2Id = ecosystem2response.body._id;
    // orchest create ecosystem contract
    await request(app)
      .post(`/v1/ecosystems/${ecosystem2Id}/contract`)
      .set("Authorization", `Bearer ${orchest2Jwt}`);
    //orchest sign
    await request(app)
      .post(`/v1/ecosystems/${ecosystem2Id}/signature/orchestrator`)
      .set("Authorization", `Bearer ${orchest2Jwt}`)
      .send(sampleSignEcosystem);
    //invite consumer to join ecosystem 2
    await request(app)
      .post(`/v1/ecosystems/${ecosystem2Id}/invites`)
      .set("Authorization", `Bearer ${orchest2Jwt}`)
      .send({ ...sampleInvitation, participantId: consumerId });
    //consumer accept invitation
    await request(app)
      .post(`/v1/ecosystems/${ecosystem2Id}/invites/accept`)
      .set("Authorization", `Bearer ${consumerJwt}`);
    //consumer configure offerings
    const modifiedSampleOfferings = { ...sampleOfferings };
    modifiedSampleOfferings.offerings[0].serviceOffering =
      consumerServiceOffering1Id;
    await request(app)
      .put(`/v1/ecosystems/${ecosystem2Id}/offerings`)
      .set("Authorization", `Bearer ${consumerJwt}`)
      .send(modifiedSampleOfferings);
    //consumer sign
    await request(app)
      .post(`/v1/ecosystems/${ecosystem2Id}/signature/participant`)
      .set("Authorization", `Bearer ${consumerJwt}`)
      .send(sampleSignEcosystem);
    //create ecosystem 3
    const ecosystem3response = await request(app)
      .post("/v1/ecosystems")
      .set("Authorization", `Bearer ${orchest3Jwt}`)
      .send(sampleEcosystem1);
    ecosystem3Id = ecosystem3response.body._id;
    //invite provider to join ecosystem 3
    await request(app)
      .post(`/v1/ecosystems/${ecosystem3Id}/invites`)
      .set("Authorization", `Bearer ${orchest3Jwt}`)
      .send({ ...sampleInvitation, participantId: provider2Id });
    //orchest sign
    await request(app)
      .post(`/v1/ecosystems/${ecosystem3Id}/signature/orchestrator`)
      .set("Authorization", `Bearer ${orchest3Jwt}`)
      .send(sampleSignEcosystem);
    //provider accept invitation
    await request(app)
      .post(`/v1/ecosystems/${ecosystem3Id}/invites/accept`)
      .set("Authorization", `Bearer ${provider2Jwt}`);
    //provider configure offerings
    const modifiedSampleOfferings2 = { ...sampleOfferings };
    modifiedSampleOfferings2.offerings[0].serviceOffering =
      providerServiceOffering2Id;
    await request(app)
      .put(`/v1/ecosystems/${ecosystem3Id}/offerings`)
      .set("Authorization", `Bearer ${provider2Jwt}`)
      .send(modifiedSampleOfferings2);
  });

  after(() => {
    // Close the server after all tests are completed
    loadMongooseStub.restore();
    closeMongoMemory();
    server.close();
  });

  //Error Management for Data Resources Routes Tests
  describe("Error Management for Data Resources Routes Tests", function () {
    it("should not get a non-existent data resource", async () => {
      const response = await request(app)
        .get(`/v1/dataResources/${nonExistentDataResourcesId}`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The data resource could not be found"
      );
    });

    it("should not get DCAT for a non-existent data resource", async () => {
      const response = await request(app)
        .get(`/v1/dataResources/dcat/${nonExistentDataResourcesId}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The data resource could not be found"
      );
    });

    it("should not update a non-existent data resource", async () => {
      const updatedDataResourceData = sampleUpdatedDataResource;
      const response = await request(app)
        .put(`/v1/dataResources/${nonExistentDataResourcesId}`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send(updatedDataResourceData)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The data resource could not be found"
      );
    });

    it("should not delete a non-existent DataResource", async () => {
      const response = await request(app)
        .delete(`/v1/dataResources/${nonExistentDataResourcesId}`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The data resource could not be found"
      );
    });
  });

  //Error Management for Software Resources Routes Tests
  describe("Error Management for Software Resources Routes Tests", () => {
    it("should not get a non-existent software resource", async () => {
      const response = await request(app)
        .get(`/v1/softwareresources/${nonExistentSoftwareResourcesId}`)
        .set("Authorization", `Bearer ${consumerJwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The software resource could not be found"
      );
    });

    it("should not get DCAT for a non-existent software resource", async () => {
      const response = await request(app)
        .get(`/v1/softwareresources/dcat/${nonExistentSoftwareResourcesId}`)
        .set("Authorization", `Bearer ${consumerJwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The software resource could not be found"
      );
    });

    it("should not update a non-existent software resource", async () => {
      const updatedSoftwareResourceData = sampleUpdatedSoftwareResource;
      const response = await request(app)
        .put(`/v1/softwareresources/${nonExistentSoftwareResourcesId}`)
        .set("Authorization", `Bearer ${consumerJwt}`)
        .send(updatedSoftwareResourceData)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The software resource could not be found"
      );
    });

    it("should not delete a non-existent software Resource", async () => {
      const response = await request(app)
        .delete(`/v1/softwareresources/${nonExistentSoftwareResourcesId}`)
        .set("Authorization", `Bearer ${consumerJwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The software resource could not be found"
      );
    });
  });

  //Error Management for Service Offerings Tests
  describe("Error Management for Service Offerings Routes Tests", () => {
    it("Should not update non-existent service offerings", async () => {
      const response = await request(app)
        .put(`/v1/serviceofferings/${nonExistentServiceOfferingId}`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send({ ...sampleProviderServiceOffering, providedBy: provider1Id })

        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The service offering could not be found"
      );
    });

    it("Should not get the service offering by non-existent id", async () => {
      const response = await request(app)
        .get("/v1/serviceofferings/" + nonExistentServiceOfferingId)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The service offering could not be found"
      );
    });

    it("Should not get DCAT ServiceOffering by non-existent id", async () => {
      const response = await request(app)
        .get(`/v1/serviceofferings/dcat/${nonExistentServiceOfferingId}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The service offering could not be found"
      );
    });

    it("Should not delete non-existent service offering", async () => {
      const response = await request(app)
        .delete("/v1/serviceofferings/" + nonExistentServiceOfferingId)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "The service offering could not be found"
      );
    });
  });

  //Error Management for Negotiation Routes Tests
  describe("Error Management for Bilateral Negotiation Routes Tests", () => {
    it("should not get by ID a non-existent exchange configuration ", async () => {
      const response = await request(app)
        .get(`/v1/negotiation/${nonExistentnegotiation1Id}`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "Exchange Configuration not found"
      );
    });
    it("should not Create an already existing access request", async () => {
      const negotiationData = sampleBilateralNegotiation;
      const existingnegotiation1Id = negotiation1Id;
      const response = await request(app)
        .post("/v1/negotiation")
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send({
          ...negotiationData,
          provider: provider1Id,
          consumer: consumerId,
          providerServiceOffering: providerServiceOffering1Id,
          consumerServiceOffering: consumerServiceOffering1Id,
        })
        .expect(409);
      expect(response.body.errorMsg).to.equal("conflicting resource");
      expect(response.body.message).to.equal(
        "An access request for this configuration already exists with id: " +
          existingnegotiation1Id
      );
    });
    it("should not authorize a non-existent negotiation", async () => {
      const response = await request(app)
        .put(`/v1/negotiation/${nonExistentnegotiation1Id}`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send(sampleAuthorizeNegotiation)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "Exchange Configuration could not be found"
      );
    });
    it("should not authorize an already authorized Exchange configuration", async () => {
      //authorize negotiation
      await request(app)
        .put(`/v1/negotiation/${negotiation1bId}`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send(sampleAuthorizeNegotiation);
      //authorize negotiation again
      const alreadyAuthorizedNegotitaionId = negotiation1bId;
      const response = await request(app)
        .put(`/v1/negotiation/${alreadyAuthorizedNegotitaionId}`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send(sampleAuthorizeNegotiation)
        .expect(400);
      expect(response.body.errorMsg).to.equal("Invalid operation");
      expect(response.body.message).to.equal(
        "Exchange configuration has already been authorized"
      );
    });

    it("should not authorize exchange configuration if user is not the owner", async () => {
      const response = await request(app)
        .put(`/v1/negotiation/${negotiation1Id}`)
        .set("Authorization", `Bearer ${provider2Jwt}`)
        .send(sampleAuthorizeNegotiation)
        .expect(400);
      expect(response.body.errorMsg).to.equal("Resource error");
      expect(response.body.message).to.equal(
        "Exchange Configuration could not be authorized"
      );
    });

    it("should not accept a non-existent negotiation", async () => {
      const response = await request(app)
        .put(`/v1/negotiation/${nonExistentnegotiation1Id}/accept`)
        .set("Authorization", `Bearer ${consumerJwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "Exchange Configuration could not be found"
      );
    });

    it("should not accept an already accepted Negotiation", async () => {
      //accept negotiation
      await request(app)
        .put(`/v1/negotiation/${negotiation1Id}/accept`)
        .set("Authorization", `Bearer ${consumerJwt}`)
        .expect(200);
      //accept negotiation again
      const response = await request(app)
        .put(`/v1/negotiation/${negotiation1Id}/accept`)
        .set("Authorization", `Bearer ${consumerJwt}`)
        .expect(400);
      expect(response.body.errorMsg).to.equal("Invalid operation");
      expect(response.body.message).to.equal(
        "Exchange configuration has already been validated and is pending signatures"
      );
    });

    it("should not negotiate policies for non-existent exchange configuration ", async () => {
      const response = await request(app)
        .put(`/v1/negotiation/${nonExistentnegotiation1Id}/negotiate`)
        .set("Authorization", `Bearer ${consumerJwt}`)
        .send(sampleNegotiatePolicies)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "Exchange Configuration could not be found"
      );
    });

    it("should not sign non-existent exchange configuration", async () => {
      const response = await request(app)
        .put(`/v1/negotiation/${nonExistentnegotiation1Id}/sign`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send(sampleSignNegotiation)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");
      expect(response.body.message).to.equal(
        "Exchange Configuration could not be found"
      );
    });

    it("should not sign an exchange configuration not ready for signature", async () => {
      const response = await request(app)
        .put(`/v1/negotiation/${negotiation2Id}/sign`)
        .set("Authorization", `Bearer ${consumerJwt}`)
        .send(sampleSignNegotiation)
        .expect(400);
      expect(response.body.errorMsg).to.equal("Invalid operation");
      expect(response.body.message).to.equal(
        "Exchange configuration is not ready for signature"
      );
    });
  });

  describe("Check errors when bilateral contract component is unavalaible", () => {
    before(() => {
      setBilateralAvailability(false);
    });
    after(() => {
      setBilateralAvailability(true);
    });
    it("should not authorize exchange configuration when contract generation fails", async () => {
      const response = await request(app)
        .put(`/v1/negotiation/${negotiation1Id}`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send(sampleAuthorizeNegotiation)
        .expect(409);
      expect(response.body.errorMsg).to.equal("Failed to generate contract.");
    });

    // next tests
    // it("should fail to inject policies in bilateral contract", async () => {
    //   const response = await request(app)
    //     .put(`/v1/negotiation/${negotiation1Id}/sign`)
    //     .set("Authorization", `Bearer ${provider1Jwt}`)
    //     .send(sampleSignNegotiation);
    //   await request(app)
    //     .put(`/v1/negotiation/${negotiation1Id}/sign`)
    //     .set("Authorization", `Bearer ${consumerJwt}`)
    //     .send(sampleSignNegotiation)
    //     .expect(409);
    //   expect(response.body.error).to.equal(
    //     "Failed to inject policies in bilateral contract"
    //   );
    // });
  });

  //Error Management for Ecosystem Routes Tests
  describe("Error Management for Ecosystem Routes Tests", () => {
    it("should not get a non-existent ecosystem", async () => {
      const response = await request(app)
        .get(`/v1/ecosystems/${nonExistentEcosystemId}`)
        .expect(404);
      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not update a non-existent ecosystem", async () => {
      const response = await request(app)
        .put(`/v1/ecosystems/${nonExistentEcosystemId}`)
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .send(sampleUpdatedEcosystem)
        .expect(404);
      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not get an ecosystem contract not yet created", async () => {
      const response = await request(app)
        .get(`/v1/ecosystems/${ecosystem1Id}/contract`)
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .expect(404);
      expect(response.body.message).to.equal("Contract not found");
    });

    it("should not get contract for a non existant ecosystem", async () => {
      const response = await request(app)
        .get(`/v1/ecosystems/${nonExistentEcosystemId}/contract`)
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .expect(404);
      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not create contract for a non existant ecosystem", async () => {
      const response = await request(app)
        .post(`/v1/ecosystems/${nonExistentEcosystemId}/contract`)
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");
      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not apply Orchestrator Signature for a non existant ecosystem", async () => {
      const response = await request(app)
        .post(`/v1/ecosystems/${nonExistentEcosystemId}/signature/orchestrator`)
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .send(sampleSignEcosystem)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");
      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not apply Orchestrator Signature before creating ecosystem contract", async () => {
      const response = await request(app)
        .post(`/v1/ecosystems/${ecosystem1Id}/signature/orchestrator`)
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .send(sampleSignEcosystem)
        .expect(400);
      expect(response.body.errorMsg).to.equal("Contract does not exist");
      expect(response.body.message).to.equal(
        "The ecosystem contract was not properly generated"
      );
    });

    it("should not create invitation to join a non-existent ecosystem ", async () => {
      const response = await request(app)
        .post(`/v1/ecosystems/${nonExistentEcosystemId}/invites`)
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .send({ ...sampleInvitation, participantId: provider1Id })
        .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");
      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not get Invitations for a participant if token is invalid", async () => {
      const invalidJwt = "invalidJwt";
      const response = await request(app)
        .get("/v1/ecosystems/me/invites")
        .set("Authorization", `Bearer ${invalidJwt}`)
        .expect(401);
      expect(response.body.message).to.equal("Invalid or expired token");
    });

    it("should not get pending Invitations of not existing ecosystem", async () => {
      const response = await request(app)
        .get(`/v1/ecosystems/${nonExistentEcosystemId}/invites`)
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("resource not found");

      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not accept invitation to join an non-existent ecosystem", async () => {
      const response = await request(app)
        .post(`/v1/ecosystems/${nonExistentEcosystemId}/invites/accept`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("resource not found");
      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not accept an invitation from participant not invited to join", async () => {
      const response = await request(app)
        .post(`/v1/ecosystems/${ecosystem1Id}/invites/accept`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .expect(400);
      expect(response.body.errorMsg).to.equal(
        "ecosystem invitation accept error"
      );
      expect(response.body.message).to.equal(
        "An error occured when trying to accept the invitation"
      );
    });

    it("should not deny invitation to join a not existing ecosystem", async () => {
      const response = await request(app)
        .post(`/v1/ecosystems/${nonExistentEcosystemId}/invites/deny`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");
      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not configure Offerings for a not existant ecosystem", async () => {
      const modifiedSampleOfferings = { ...sampleOfferings };
      modifiedSampleOfferings.offerings[0].serviceOffering =
        providerServiceOffering1Id;
      const response = await request(app)
        .put(`/v1/ecosystems/${nonExistentEcosystemId}/offerings`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send(modifiedSampleOfferings)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");
      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not apply Participant Signature for a not existent exosystem", async () => {
      const response = await request(app)
        .post(`/v1/ecosystems/${nonExistentEcosystemId}/signature/participant`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send(sampleSignEcosystem)
        .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");
      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not apply Participant Signature before creating ecosystem contract", async () => {
      const response = await request(app)
        .post(`/v1/ecosystems/${ecosystem3Id}/signature/participant`)
        .set("Authorization", `Bearer ${provider2Jwt}`)
        .send(sampleSignEcosystem)
        .expect(400);
      expect(response.body.errorMsg).to.equal("Contract does not exist");
      expect(response.body.message).to.equal(
        "The ecosystem contract was not properly generated"
      );
    });

    describe("Check errors when ecosystem contract component is unavalaible", () => {
      before(() => {
        setContractAvailability(false);
      });
      after(() => {
        setContractAvailability(true);
      });
      it("should not create a new ecosystem when contract generation fails", async () => {
        const response = await request(app)
          .post("/v1/ecosystems")
          .set("Authorization", `Bearer ${orchest1Jwt}`)
          .send(sampleEcosystem1)
          .expect(424);
        expect(response.body.errorMsg).to.equal("third party api failure");
        expect(response.body.message).to.equal(
          "Failed to generate ecosystem contract"
        );
      });

      it("should not create ecosystem contract when it fail to generate contract", async () => {
        const response = await request(app)
          .post(`/v1/ecosystems/${ecosystem1Id}/contract`)
          .set("Authorization", `Bearer ${orchest1Jwt}`)
          .expect(424);
      });

      it("should not apply Orchestrator Signature when it fail to generate contact", async () => {
        const response = await request(app)
          .post(`/v1/ecosystems/${ecosystem1Id}/signature/orchestrator`)
          .set("Authorization", `Bearer ${orchest1Jwt}`)
          .send(sampleSignEcosystem)
          .expect(424);
        expect(response.body.errorMsg).to.equal("third party api failure");
        expect(response.body.message).to.equal(
            "Failed to sign ecosystem contract"
        );
      });

      it("should not apply Participant Signature when it fail to generate contact", async () => {
        const response = await request(app)
          .post(`/v1/ecosystems/${ecosystem1Id}/signature/participant`)
          .set("Authorization", `Bearer ${provider1Jwt}`)
          .send(sampleSignEcosystem)
          .expect(424);
         expect(response.body.errorMsg).to.equal('third party api failure');
        expect(response.body.message).to.equal(
        "Failed to sign ecosystem contract"
        );
      });
    });

    it("should not apply Signature for a participant not invited or asked to join ecosystem ", async () => {
      const response = await request(app)
        .post(`/v1/ecosystems/${ecosystem1Id}/signature/participant`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send(sampleEcosystem1)
        .expect(400);
      expect(response.body.errorMsg).to.equal(
      "unauthorized participant in ecosystem"
      );
      expect(response.body.message).to.equal(
        "The participant does not have an authorized join request or invitation"
      );
    });

    it("should not create join request by participant already participant in the ecosystem", async () => {
      const alreadyParticipantJwt = consumerJwt;
      const modifiedSampleJoinRequest = { ...sampleJoinRequest };
      modifiedSampleJoinRequest.offerings[0].serviceOffering =
        consumerServiceOffering1Id;
      const response = await request(app)
        .post(`/v1/ecosystems/${ecosystem2Id}/requests`)
        .set("Authorization", `Bearer ${alreadyParticipantJwt}`)
        .send(modifiedSampleJoinRequest)
        .expect(400);
  
      expect(response.body.errorMsg).to.equal("existing participant");
      expect(response.body.message).to.equal(
        "Service is already a participant in this ecosystem"
      );
    });
    it("should not create join request for an not exsiting ecosystem", async () => {
      const modifiedSampleJoinRequest = { ...sampleJoinRequest };
      modifiedSampleJoinRequest.offerings[0].serviceOffering =
        providerServiceOffering1Id;
      const response = await request(app)
        .post(`/v1/ecosystems/${nonExistentEcosystemId}/requests`)
        .set("Authorization", `Bearer ${provider1Jwt}`)
        .send(modifiedSampleJoinRequest)
        .expect(404);
      expect(response.body.message).to.equal("Ecosystem not found");
    });
    it("should not get join requests for a not existing ecosystem", async () => {
      const response = await request(app)
        .get(`/v1/ecosystems/${nonExistentEcosystemId}/requests`)
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .expect(404);
      expect(response.body.message).to.equal("Ecosystem not found");
    });

    it("should not authorize not existing join request", async () => {
      const response = await request(app)
        .put(
          `/v1/ecosystems/${ecosystem1Id}/requests/${nonExistentRequestId}/authorize`
        )
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .expect(400);
    });

    it("should not authorize join request to a not existent ecosystem", async () => {
      const response = await request(app)
        .put(
          `/v1/ecosystems/${nonExistentEcosystemId}/requests/${requestId1}/authorize`
        )
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .expect(404);
      expect(response.body.message).to.equal(
        "Ecosystem not found or unauthorized"
      );
    });
    it("should not reject not existing join request", async () => {
      const response = await request(app)
        .put(
          `/v1/ecosystems/${ecosystem1Id}/requests/${nonExistentRequestId}/reject`
        )
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .expect(400);
    });

    it("should not delete an non-existent ecosystem", async () => {
      const response = await request(app)
        .delete("/v1/ecosystems/" + nonExistentEcosystemId)
        .set("Authorization", `Bearer ${orchest1Jwt}`)
        .expect(404);
      expect(response.body.message).to.equal("Ecosystem not found");
    });
  });
});
