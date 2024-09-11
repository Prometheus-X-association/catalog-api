import { expect } from "chai";
import request from "supertest";
import { config } from "dotenv";
import { startServer } from "../src/server";
import { Application } from "express";
import { IncomingMessage, Server, ServerResponse } from "http";
import { testProvider1 } from "./fixtures/testAccount";
import { stub } from "sinon";
import * as loadMongoose from "../src/config/database";
import { closeMongoMemory, openMongoMemory } from "./utils.ts/mongoMemory";
import jwt from "jsonwebtoken";
import { makeId } from "../src/utils/idGenerator";
import { Participant } from "../src/models";
config();

let app: Application;
let server: Server<typeof IncomingMessage, typeof ServerResponse>;
let providerId = "";
let jwtToken = "";
let serviceKey = "";
let secretKey = "";
let appKey = makeId();
let connectorJWT= "";

describe("Participants Routes Tests", () => {
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
  });

  after(async () => {
    // Close the server after all tests are completed
    loadMongooseStub.restore();
    await closeMongoMemory();
    server.close();
  });

  it("sign up and login participant", async () => {
    // Create provider
    const providerData = testProvider1;
    const providerResponse = await request(app)
      .post("/v1/auth/signup")
      .send(providerData);
    providerId = providerResponse.body.participant._id;

    // Login provider
    const response = await request(app)
      .post("/v1/auth/login")
      .send({
        email: testProvider1.email,
        password: testProvider1.password,
      })
      .expect(200);
    jwtToken = response.body.token;

    // Verify API Key are generated
    expect(providerResponse.body).to.be.an("object");
    expect(providerResponse.body).to.have.property("participant");
    expect(providerResponse.body.participant).to.have.property("serviceKey");
    expect(providerResponse.body.participant).to.have.property("serviceSecretKey");

    serviceKey = providerResponse.body.participant.serviceKey
    secretKey = providerResponse.body.participant.serviceSecretKey
  });

  it("should get participant Self Description", async () => {
    const response = await request(app)
      .get(`/v1/catalog/participants/${providerId}`)
      .expect(200);

    //Verify API Key are not displayed on public routes
    expect(response.body).to.be.an("object");
    expect(response.body).to.not.have.property("serviceKey");
    expect(response.body).to.not.have.property("serviceSecretKey");
  });

  it("should get a list of participant Self Description", async () => {
    const response = await request(app)
      .get(`/v1/catalog/participants`)
      .expect(200);

    //Verify API Key are not displayed on public routes
    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("data");
    expect(response.body.data).to.be.an("object");
    expect(response.body.data).to.have.property("result");
    expect(response.body.data.result).to.be.an("array");
    expect(response.body.data.result[0]).to.be.an("object");
    expect(response.body.data.result[0]).to.not.have.property("serviceSecretKey");
    expect(response.body.data.result[0]).to.not.have.property("serviceKey");
  });

  it("should check Data Space Connector return false", async () => {
    connectorJWT = jwt.sign(
      {
        serviceKey: serviceKey,
        iat: new Date().getTime(),
      },
      secretKey,
      { expiresIn: 5 * 60000 }
    );
    // check Data space connector
    const response = await request(app)
      .post("/v1/participants/check")
      .set("Authorization", `Bearer ${connectorJWT}`)
      .send({
        appKey,
        endpoint: "https://test.psc.com/"
      })
      .expect(200);

    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("dataspaceConnectorRegistered").to.be.false;
  });

  it("should post Data Space Connector", async () => {
    // check Data space connector
    const response = await request(app)
      .post("/v1/participants/")
      .set("Authorization", `Bearer ${connectorJWT}`)
      .send({
        appKey,
        endpoint: "https://test.psc.com/"
      })
      .expect(200);

    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("serviceOfferings");
    expect(response.body).to.have.property("softwareResources");
    expect(response.body).to.have.property("dataResources");
    expect(response.body).to.have.property("participant");
  });

  it("should check Data Space Connector return true", async () => {
    // check Data space connector
    const response = await request(app)
      .post("/v1/participants/check")
      .set("Authorization", `Bearer ${connectorJWT}`)
      .send({
        appKey,
        endpoint: "https://test.psc.com/"
      })
      .expect(200);

    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("dataspaceConnectorRegistered").to.be.true;
  });

  it("should not generateAPIKey", async () => {
    // check Data space connector
    const response = await request(app)
      .post("/v1/participants/generate-api-key")
      .set("Authorization", `Bearer ${connectorJWT}`)
      .expect(400);

    expect(response.body).to.be.an("object");
  });

  it("should generate API Key", async () => {
    // delete API Key
    const participant = await Participant.findById(providerId)
    participant.serviceKey = "";
    participant.serviceSecretKey = "";
    await participant.save();

    // Generate API Key
    const response = await request(app)
      .post("/v1/participants/generate-api-key")
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(201);

    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("serviceSecretKey").to.be.not.eq(secretKey);
    expect(response.body).to.have.property("serviceKey").to.be.not.eq(serviceKey);
  });

  it("should get API Key", async () => {
    // check Data space connector
    const response = await request(app)
      .get("/v1/participants/api-key")
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("serviceKey").to.be.not.empty;
    expect(response.body).to.have.property("serviceSecretKey").to.be.not.empty;
  });
});
