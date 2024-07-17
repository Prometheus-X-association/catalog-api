import { expect } from "chai";
import request from "supertest";
import { config } from "dotenv";
import { startServer } from "../src/server";
import { Application } from "express";
import { IncomingMessage, Server, ServerResponse } from "http";
import { testProvider1 } from "./fixtures/testAccount";
import {
  sampleDataResource,
  sampleRepresentation, sampleSoftwareResource, sampleUpdatedDataResource,
  sampleUpdatedRepresentation
} from "./fixtures/sampleData";
import { stub } from "sinon";
import * as loadMongoose from "../src/config/database";
import { closeMongoMemory, openMongoMemory } from "./utils.ts/mongoMemory";
config();

let app: Application;
let server: Server<typeof IncomingMessage, typeof ServerResponse>;
let softwareResourceId = "";
let dataResourcesId: "";
let representationsId: "";
let jwt = "";

describe("Representation Routes Tests", () => {
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

  it("should create software resource", async () => {
    const softwareResourceData = sampleSoftwareResource;
    const response = await request(app)
      .post("/v1/softwareresources")
      .set("Authorization", `Bearer ${jwt}`)
      .send(softwareResourceData)
      .expect(201);
    softwareResourceId = response.body._id;
    expect(response.body).to.be.an("object");

    //assertions
  });

  it("should create representation for Data Resource", async () => {
    const representationData = sampleRepresentation(dataResourcesId);
    const response = await request(app)
      .post("/v1/representations")
      .set("Authorization", `Bearer ${jwt}`)
      .send(representationData)
      .expect(201);

    representationsId = response.body._id;

    expect(response.body).to.be.an("object");
    //assertions
  });

  it("should create representation for Software Resource", async () => {
    const representationData = sampleRepresentation(softwareResourceId);
    const response = await request(app)
      .post("/v1/representations")
      .set("Authorization", `Bearer ${jwt}`)
      .send(representationData)
      .expect(201);
    expect(response.body).to.be.an("object");
    //assertions
  });

  it("should get data resource by ID-protected and representation is populated", async () => {
    const response = await request(app)
      .get(`/v1/dataResources/${dataResourcesId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .expect(200);

    expect(response.body).to.be.an("object");
    expect(response.body.representation).to.be.an("object");
  });

  it("should get software resource by ID-protected and representation is populated", async () => {
    const response = await request(app)
      .get(`/v1/softwareresources/${softwareResourceId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .expect(200);
    expect(response.body).to.be.an("object");
    expect(response.body.representation).to.be.an("object");
  });

  it("should update representation", async () => {
    const updatedRepresentationData = sampleUpdatedRepresentation(dataResourcesId);

    const response = await request(app)
      .put(`/v1/representations/${representationsId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send(updatedRepresentationData)
      .expect(200);
    //assertions
  });

  it("should get representation by ID-protected", async () => {
    const response = await request(app)
      .get(`/v1/representations/${representationsId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .expect(200);
    //assertions
    //expect response id = dataresourceid
  });

  it("should delete representation by id", async () => {
    const response = await request(app)
      .delete(`/v1/representations/${representationsId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .expect(204);
    //assertions
    //expect
    //error test get data resources deleted
  });
});
