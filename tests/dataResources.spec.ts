import { expect } from "chai";
import request from "supertest";
import { config } from "dotenv";
import { startServer } from "../src/server";
import { Application } from "express";
import { IncomingMessage, Server, ServerResponse } from "http";
import { testProvider1 } from "./fixtures/testAccount";
import {
  sampleDataResource,
  sampleUpdatedDataResource,
} from "./fixtures/sampleData";
import { stub } from "sinon";
import * as loadMongoose from "../src/config/database";
import { closeMongoMemory, openMongoMemory } from "./utils.ts/mongoMemory";
config();

let app: Application;
let server: Server<typeof IncomingMessage, typeof ServerResponse>;
let providerId = "";
let dataResourcesId: "";
let jwt = "";

describe("Data Resources Routes Tests", function() {
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
    jwt = response.body.token;
  });

  it("should create data resource", async () => {
    const dataResourceData = sampleDataResource;
    const response = await request(app)
      .post("/v1/dataResources")
      .set("Authorization", `Bearer ${jwt}`)
      .send(dataResourceData)
      .expect(201);
    dataResourcesId = response.body._id;
    expect(response.body).to.be.an("object");
    //assertions
  });

  it("should update data resource", async () => {
    const updatedDataResourceData = sampleUpdatedDataResource;

    const response = await request(app)
      .put(`/v1/dataResources/${dataResourcesId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send(updatedDataResourceData)
      .expect(200);
    //assertions
  });

  it("should get data resource by ID-public", async () => {
    const response = await request(app)
      .get(`/v1/dataResources/${dataResourcesId}`)
      .expect(200);
    //expect response id = dataresourceid
  });

  it("should get data resource by ID-protected", async () => {
    const response = await request(app)
      .get(`/v1/dataResources/${dataResourcesId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .expect(200);
    //expect response id = dataresourceid
  });

  it("should get Participant Data Resources", async () => {
    const response = await request(app)
      .get("/v1/dataResources/me")
      .set("Authorization", `Bearer ${jwt}`)
      .expect(200);
      expect(response.body).to.not.be.empty;
    //assertions
  });

  it("Should get DCAT Data Resources", async () => {
    const res = await request(app).get("/v1/dataResources/dcat").expect(200);
  });

  it("Should get DCAT Data Resource by id", async () => {
    const res = await request(app)
      .get(`/v1/dataResources/dcat/${dataResourcesId}`)
      .expect(200);
  });

  it("should get all dataResources", async () => {
    const response = await request(app).get("/v1/dataResources").expect(200);
    expect(response.body).to.not.be.empty;
  });

  it("should delete DataResource by id", async () => {
    const response = await request(app)
      .delete(`/v1/dataResources/${dataResourcesId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .expect(204);
  });
});
