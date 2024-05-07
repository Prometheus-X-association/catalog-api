import { expect } from "chai";
import request from "supertest";
import { config } from "dotenv";
import { startServer } from "../src/server";
import { IncomingMessage, Server, ServerResponse } from "http";
import { Application } from "express";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { mockContract } from "./fixtures/fixture.contract";

import {
  testProvider2,
  testProvider3,
  testOrchestrator,
  testConsumer1,
} from "./fixtures/testAccount";
import {
  sampleDataResource,
  sampleUpdatedDataResource,
  sampleSoftwareResource,
  sampleUpdatedSoftwareResource,
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
let consumerId = "";
let dataResource1Id = "";
let dataResource2Id = "";
let softwareResource1Id: "";
let orchestJwt = "";
let provider1Jwt = "";
let provider2Jwt = "";
let consumerJwt = "";
let alreadyParticipantJwt = "";
let providerServiceOffering1Id = "";
let providerServiceOffering2Id = "";
let consumerServiceOffering1Id = "";
let requestId1: "";
let ecosystemId = "";
let ecosystem2Id = "";
let ecosystem3Id = "";
const mock = new MockAdapter(axios);
const nonExistingEcosystemId = "000000000000000000000000";
const nonExistingRequestId = "000000000000000000000000";
const nonExistingDataResourcesId = "000000000000000000000000";
const nonExistingSoftwareResourcesId = "000000000000000000000000";
const nonExistingServiceOfferingId = "000000000000000000000000";



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
      .post("/v1/auth/signup")
      .send(provider1Data);
    provider1Id = provider1Response.body.participant._id;


    // Create consumer 1
    const consumer1Data = testConsumer1;
    const consumer1Response = await request(app)
      .post("/v1/auth/signup")
      .send(consumer1Data);
      consumerId = consumer1Response.body.participant._id;


    // Create orchestrator
    const orchestData = testOrchestrator;
    const orchestResponse = await request(app)
      .post("/v1/auth/signup")
      .send(orchestData);
    orchestId = orchestResponse.body.participant._id;

    // Login orchestrator
    const orchestAuthResponse = await request(app).post("/v1/auth/login").send({
      email: testOrchestrator.email,
      password: testOrchestrator.password,
    });
    orchestJwt = orchestAuthResponse.body.token;

    // Login consumer 1
    const consumer1AuthResponse = await request(app)
      .post("/v1/auth/login")
      .send({
        email: testConsumer1.email,
        password: testConsumer1.password,
      });
      alreadyParticipantJwt = consumer1AuthResponse.body.token;

    // Login provider1
    const provider1AuthResponse = await request(app)
      .post("/v1/auth/login")
      .send({
        email: testProvider2.email,
        password: testProvider2.password,
      });
    provider1Jwt = provider1AuthResponse.body.token;

    // Login provider2
    const provider2AuthResponse = await request(app)
    .post("/v1/auth/login")
    .send({
      email: testProvider3.email,
      password: testProvider3.password,
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
    //create ecosystem 1 : no invitation needed
      const ecosystem1response = await request(app)
      .post("/v1/ecosystems")
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send(sampleEcosystem)
    ecosystemId = ecosystem1response.body._id;

    //create ecosystem 2 : participant invited and contract signed
      const ecosystem2response = await request(app)
      .post("/v1/ecosystems")
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send(sampleEcosystem)
    ecosystem2Id = ecosystem2response.body._id;
    //orchest sign
    request(app)
    .post(`/v1/ecosystems/${ecosystem2Id}/signature/orchestrator`)
    .set("Authorization", `Bearer ${orchestJwt}`)
    .send({
      signature: "hasSigned",
    })
    //invite consumer to join ecosystem 2
    request(app)
    .post(`/v1/ecosystems/${ecosystem2Id}/invites`)
    .set("Authorization", `Bearer ${orchestJwt}`)
    .send({ ...sampleInvitation, participantId: consumerId })
    //consumer accept invitation
    request(app)
    .post(`/v1/ecosystems/${ecosystem2Id}/invites/accept`)
    .set("Authorization", `Bearer ${consumerJwt}`)
    //consumer configure offerings
    const modifiedSampleOfferings = { ...sampleOfferings };
    modifiedSampleOfferings.offerings[0].serviceOffering =
      consumerServiceOffering1Id;
       request(app)
      .put(`/v1/ecosystems/${ecosystem2Id}/offerings`)
      .set("Authorization", `Bearer ${consumerJwt}`)
      .send(modifiedSampleOfferings)
    //consumer sign
    request(app)
    .post(`/v1/ecosystems/${ecosystem2Id}/signature/participant`)
    .set("Authorization", `Bearer ${consumerJwt}`)
    .send({
      signature: "hasSigned",
    })
    //create ecosystem 3 : just invite participant
    const ecosystem3response = await request(app)
    .post("/v1/ecosystems")
    .set("Authorization", `Bearer ${orchestJwt}`)
    .send(sampleEcosystem)
  ecosystem3Id = ecosystem3response.body._id;

    //invite provider to join ecosystem 3
    request(app)
    .post(`/v1/ecosystems/${ecosystem3Id}/invites`)
    .set("Authorization", `Bearer ${orchestJwt}`)
    .send({ ...sampleInvitation, participantId: provider2Id })
  });

  after(() => {
    // Close the server after all tests are completed
    loadMongooseStub.restore();
    closeMongoMemory();
    server.close();
  });

//Error Management for data resources Tests
describe("Error Management for data resources Tests", () => {

  it("should not get a not existant data resource", async () => {
    const response = await request(app)
      .get(`/v1/dataResources/${nonExistingDataResourcesId}`)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The data resource could not be found"); 
  });

  it("should not get DCAT for a not existant data resource", async () => {
    const response = await request(app)
    .get(`/v1/dataResources/dcat/${nonExistingDataResourcesId}`)
    .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The data resource could not be found"); 
  });

  it("should not update a not existant data resource", async () => {
    const updatedDataResourceData = sampleUpdatedDataResource;
    const response = await request(app)
      .put(`/v1/dataResources/${nonExistingDataResourcesId}`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send(updatedDataResourceData)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The data resource could not be found"); 
  });

  it("should not delete a not existant DataResource", async () => {
    const response = await request(app)
      .delete(`/v1/dataResources/${nonExistingDataResourcesId}`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The data resource could not be found"); 
  });
});

//Error Management for software resources Tests
describe("Error Management for software resources Tests", () => {
  it("should not get a not existant software resource", async () => {
    const response = await request(app)
      .get(`/v1/softwareresources/${nonExistingSoftwareResourcesId}`)
      .set("Authorization", `Bearer ${consumerJwt}`)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The data resource could not be found"); 
  });

  it("should not get DCAT for a not existant software resource", async () => {
    const response = await request(app)
    .get(`/v1/softwareresources/dcat/${nonExistingSoftwareResourcesId}`)
    .set("Authorization", `Bearer ${consumerJwt}`)
    .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The data resource could not be found"); 
  });

  it("should not update a not existant software resource", async () => {
    const updatedSoftwareResourceData = sampleUpdatedSoftwareResource;
    const response = await request(app)
      .put(`/v1/softwareresources/${nonExistingSoftwareResourcesId}`)
      .set("Authorization", `Bearer ${consumerJwt}`)
      .send(updatedSoftwareResourceData)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The data resource could not be found"); 
  });

  it("should not delete a not existant software Resource", async () => {
    const response = await request(app)
      .delete(`/v1/softwareresources/${nonExistingSoftwareResourcesId}`)
      .set("Authorization", `Bearer ${consumerJwt}`)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The data resource could not be found"); 
  });
});

//Error Management for service offerings Tests
describe("Error Management for service offerings Tests", () => {

  it("Should not update not existing service offerings", async () => {
    const response = await request(app)
      .put(`/v1/serviceofferings/${nonExistingServiceOfferingId}`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send(sampleProviderServiceOffering)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The service offering could not be found");
  });

  it("Should not get the service offering by non existing id", async () => {
    const response = await request(app)
      .get("/v1/serviceofferings/" + nonExistingServiceOfferingId)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The service offering could not be found");
  });

  it("Should not get DCAT ServiceOffering by non existing id", async () => {
    const response = await request(app)
      .get(`/v1/serviceofferings/dcat/${nonExistingServiceOfferingId}`)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The service offering could not be found");
  });

  it("Should not delete non existing service offering", async () => {
    const response = await request(app)
      .delete("/v1/serviceofferings/" + nonExistingServiceOfferingId)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Resource not found");  
      expect(response.body.message).to.equal("The service offering could not be found");
  });
});
//Error Management for Ecosystem Routes Tests
describe("Error Management for Ecosystem Routes Tests", () => {
  it("should not create a new ecosystem when contract generation fails", async () => {
    const errorMessage = "Third party API failure";
    mock.onPost("http://localhost:8888/contracts").reply(424, { error: errorMessage });
    const response = await request(app)
      .post("/v1/ecosystems")
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send(sampleEcosystem)
      .expect(424);
      expect(response.body.errorMsg).to.equal(errorMessage);
      expect(response.body.message).to.equal("Failed to generate ecosystem contract");
  });


  it("should not get a non existing ecosystem", async () => {
    const response = await request(app)
      .get(`/v1/ecosystems/${nonExistingEcosystemId}`)
      .expect(404);
      expect(response.body.message).to.equal("Ecosystem not found");
  });

  it("should not update a non existing ecosystem", async () => {
    const response = await request(app)
      .put(`/v1/ecosystems/${nonExistingEcosystemId}`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send(sampleUpdatedEcosystem)
      .expect(404);
      expect(response.body.message).to.equal("Ecosystem not found");
  });
//modifier titre
  it("should not get an ecosystem contract not yet generated", async () => {
    const response = await request(app)
      .get(`/v1/ecosystems/${ecosystemId}/contract`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(404)
      expect(response.body.message).to.equal("Contract not found");  });

  it("should not get contract for a non existant ecosystem", async () => {
    const response = await request(app)
      .get(`/v1/ecosystems/${nonExistingEcosystemId}/contract`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(404)
      expect(response.body.message).to.equal("Ecosystem not found");  
    });

  it("should not create contract for a non existant ecosystem", async () => {
    const response = await request(app)
      .post(`/v1/ecosystems/${nonExistingEcosystemId}/contract`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(404)
      expect(response.body.errorMsg).to.equal("Not found");  
      expect(response.body.message).to.equal("Ecosystem not found");  
    });

    //modifier titre 
  it("should not create ecosystem contract when it fail to generate contract", async () => {
    const errorMessage = "Failed to generate ecosystem contract";
    mock.onPost("http://localhost:8888/contracts").reply(424, { error: errorMessage });
    const response = await request(app)
      .post(`/v1/ecosystems/${ecosystemId}/contract`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(424)
      expect(response.body.message).to.equal(errorMessage);  
    });


  it("should not apply Orchestrator Signature for a non existant exosystem", async () => {
    const response = await request(app)
      .post(`/v1/ecosystems/${nonExistingEcosystemId}/signature/orchestrator`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send({
        signature: "hasSigned",
      })
      .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");  
      expect(response.body.message).to.equal("Ecosystem not found");  
  });

  it("should not apply Orchestrator Signature before creating ecosystem contract", async () => {
    const response = await request(app)
      .post(`/v1/ecosystems/${ecosystemId}/signature/orchestrator`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send({
        signature: "hasSigned",
      })
      .expect(400);
      expect(response.body.errorMsg).to.equal("Contract does not exist");  
      expect(response.body.message).to.equal("The ecosystem contract was not properly generated");  

  });

  it("should not apply Orchestrator Signature when it fail to generate contact", async () => {
    const errorMessage = "Third party API failure";
    mock.onPost("http://localhost:8888/contracts").reply(424, { error: errorMessage });
    const response = await request(app)
      .post(`/v1/ecosystems/${ecosystemId}/signature/orchestrator`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send({
        signature: "hasSigned",
      })
      .expect(424);
      expect(response.body.errorMsg).to.equal(errorMessage);
      expect(response.body.message).to.equal("Failed to sign ecosystem contract");  
  });

  it("should not create invitation to join a non existing ecosystem ", async () => {
    const response = await request(app)
      .post(`/v1/ecosystems/${nonExistingEcosystemId}/invites`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .send({ ...sampleInvitation, participantId: provider1Id })
      .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");  
      expect(response.body.message).to.equal("Ecosystem not found"); 
  });

  it("should not get Invitations for a participant if token is invalid", async () => {
    const invalidJwt = "invalidJwt"
    const response = await request(app)
      .get("/v1/ecosystems/me/invites")
      .set("Authorization", `Bearer ${invalidJwt}`)
      .expect(401);
      expect(response.body.message).to.equal("Authorization header missing or invalid")
  });

  it("should not get pending Invitations of not existing ecosystem", async () => {
    const response = await request(app)
      .get(`/v1/ecosystems/${nonExistingEcosystemId}/invites`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(404);
      expect(response.body.errorMsg).to.equal("resource not found");  

      expect(response.body.message).to.equal("Authorization header missing or invalid")
  });


  it("should not accept invitation to join an non existing ecosystem", async () => {
    const response = await request(app)
      .post(`/v1/ecosystems/${nonExistingEcosystemId}/invites/accept`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");  
      expect(response.body.message).to.equal("Ecosystem not found"); 
  });
  //modifier titre
  it("should not accept invitation", async () => {
    const response = await request(app)
      .post(`/v1/ecosystems/${ecosystem3Id}/invites/accept`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(400);
      expect(response.body.errorMsg).to.equal("ecosystem invitation accept error");  
      expect(response.body.message).to.equal("An error occured when trying to accept the invitation"); 
  });

  it("should not deny invitation to join a not existing ecosystem", async () => {
    const response = await request(app)
      .post(`/v1/ecosystems/${nonExistingEcosystemId}/invites/deny`)
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
      .put(`/v1/ecosystems/${nonExistingEcosystemId}/offerings`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send(modifiedSampleOfferings)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");  
      expect(response.body.message).to.equal("Ecosystem not found"); 
  });

  it("should not apply Participant Signature for a not existant exosystem", async () => {
    const response = await request(app)
      .post(`/v1/ecosystems/${nonExistingEcosystemId}/signature/participant`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send({
        signature: "hasSigned",
      })
      .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");  
      expect(response.body.message).to.equal("Ecosystem not found");  
  });

  it("should not apply Participant Signature before creating ecosystem contract", async () => {
    const response = await request(app)
      .post(`/v1/ecosystems/${ecosystem3Id}/signature/participant`)
      .set("Authorization", `Bearer ${provider2Jwt}`)
      .send({
        signature: "hasSigned",
      })
      .expect(400);
      expect(response.body.errorMsg).to.equal("Contract does not exist");  
      expect(response.body.message).to.equal("The ecosystem contract was not properly generated");  

  });

  it("should not apply Participant Signature when it fail to generate contact", async () => {
    const errorMessage = "Third party API failure";
    mock.onPost("http://localhost:8888/contracts").reply(424, { error: errorMessage });
    const response = await request(app)
      .post(`/v1/ecosystems/${ecosystemId}/signature/participant`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send({
        signature: "hasSigned",
      })
      .expect(424);
      expect(response.body.errorMsg).to.equal(errorMessage);
      expect(response.body.message).to.equal("Failed to sign ecosystem contract");  
  });


  it("should not apply Signature for a participant not invited or asked to join ecosystem ", async () => {
    const response = await request(app)
      .post(`/v1/ecosystems/${ecosystemId}/signature/participant`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send({
        signature: "hasSigned",
      })
      .expect(400);
      expect(response.body.errorMsg).to.equal("unauthorized participant in ecosystem");  
      expect(response.body.message).to.equal("The participant does not have an authorized join request or invitation");  

  });


  it("should not create join request by participant already participant in the ecosystem", async () => {
    const alreadyParticipantJwt = consumerJwt
    const modifiedSampleJoinRequest = { ...sampleJoinRequest };
    modifiedSampleJoinRequest.offerings[0].serviceOffering =
      consumerServiceOffering1Id;
    const response = await request(app)
      .post(`/v1/ecosystems/${ecosystem2Id}/requests`)
      .set("Authorization", `Bearer ${alreadyParticipantJwt}`)
      .send(modifiedSampleJoinRequest)
      .expect(400);
      expect(response.body.errorMsg).to.equal("existing participant");  
      expect(response.body.message).to.equal("Service is already a participant in this ecosystem");  
  });
  it("should not create join request for an not exsiting ecosystem", async () => {
    const modifiedSampleJoinRequest = { ...sampleJoinRequest };
    modifiedSampleJoinRequest.offerings[0].serviceOffering =
      providerServiceOffering1Id;
    const response = await request(app)
      .post(`/v1/ecosystems/${nonExistingEcosystemId}/requests`)
      .set("Authorization", `Bearer ${provider1Jwt}`)
      .send(modifiedSampleJoinRequest)
      .expect(404);
      expect(response.body.errorMsg).to.equal("Not found");  
      expect(response.body.message).to.equal("Ecosystem not found"); 
  });
  it("should not get join requests for a not existing ecosystem", async () => {
    const response = await request(app)
      .get(`/v1/ecosystems/${ecosystemId}/requests`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(404);
      expect(response.body.message).to.equal("Ecosystem not found");     
  });

  it("should not authorize not existing join request", async () => {
    const response = await request(app)
      .put(`/v1/ecosystems/${ecosystemId}/requests/${nonExistingRequestId}/authorize`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(400);
  });

  it("should not authorize join request to a not existing ecosystem", async () => {
    const response = await request(app)
      .put(`/v1/ecosystems/${nonExistingEcosystemId}/requests/${requestId1}/authorize`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(404);
      expect(response.body.message).to.equal("Ecosystem not found or unauthorized");  
  });
  it("should not reject not existing join request", async () => {
    const response = await request(app)
      .put(`/v1/ecosystems/${ecosystemId}/requests/${nonExistingRequestId}/reject`)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(400);
  });

  it("should not delete an non existing ecosystem", async () => {
    const response = await request(app)
      .delete("/v1/ecosystems/" + nonExistingEcosystemId)
      .set("Authorization", `Bearer ${orchestJwt}`)
      .expect(404)
      expect(response.body.message).to.equal("Ecosystem not found");  
  });
});
