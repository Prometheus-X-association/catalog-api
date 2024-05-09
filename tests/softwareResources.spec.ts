import { expect } from "chai";
import request from "supertest";
import { config } from "dotenv";
import { startServer } from "../src/server";
import { Application } from "express";
import { IncomingMessage, Server, ServerResponse } from "http";
import { testConsumer4 } from "./fixtures/testAccount";
import {
  sampleSoftwareResource,
  sampleUpdatedSoftwareResource,
} from "./fixtures/sampleData";
import { stub } from "sinon";
import * as loadMongoose from "../src/config/database";
import { closeMongoMemory, openMongoMemory } from "./utils.ts/mongoMemory";

config();

export let app: Application;
export let server: Server<typeof IncomingMessage, typeof ServerResponse>;

let consumerId = "";
let softwareResourceId: "";
let jwt = "";

describe("Software Resources Routes Tests", function ()  {
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

    // Create consumer
    const consumerData = testConsumer4;
    const consumerResponse = await request(app)
      .post("/v1/auth/signup")
      .send(consumerData);
    consumerId = consumerResponse.body.participant._id;

    // Login consumer
    const response = await request(app)
      .post("/v1/auth/login")
      .send({
        email: testConsumer4.email,
        password: testConsumer4.password,
      })
      .expect(200);
    jwt = response.body.token;
  });

  after(async () => {
    // Close the server after all tests are completed
    loadMongooseStub.restore();
    closeMongoMemory();
    server.close();
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
    expect(response.body.providedBy).to.equal(consumerId);
  });

  it("should update software resource", async () => {
    const updatedSoftwareResourceData = sampleUpdatedSoftwareResource;
    const response = await request(app)
      .put(`/v1/softwareresources/${softwareResourceId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send(updatedSoftwareResourceData)
      .expect(200);
    //assertions
  });

  it("should get software resource by ID-public", async () => {
    const response = await request(app)
      .get(`/v1/softwareresources/${softwareResourceId}`)
      .expect(200);
      expect(response.body._id).to.equal(softwareResourceId);
  });

  it("should get software resource by ID-protected", async () => {
    const response = await request(app)
      .get(`/v1/softwareresources/${softwareResourceId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .expect(200);
      expect(response.body._id).to.equal(softwareResourceId);
  });

  it("should get Participant softwareResources", async () => {
    const response = await request(app)
      .get("/v1/softwareresources/me")
      .set("Authorization", `Bearer ${jwt}`)
      .expect(200);
      expect(response.body).to.not.be.empty;
    });

  it("should get all softwareResources", async () => {
    const response = await request(app)
      .get("/v1/softwareresources")
      .expect(200);
      expect(response.body).to.not.be.empty;
    });

  it("should delete softwareResource", async () => {
    const response = await request(app)
      .delete(`/v1/softwareresources/${softwareResourceId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .expect(204);
      expect(response.body).to.be.empty;
  });
});
