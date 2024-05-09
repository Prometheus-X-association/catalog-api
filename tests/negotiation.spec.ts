import { expect } from "chai";
import request from "supertest";
import { config } from "dotenv";
config();
import { startServer } from "../src/server";
import { IncomingMessage, Server, ServerResponse } from "http";
import { Application } from "express";
import { mockBilateralContract } from "./fixtures/fixture.contract";
import { testProvider4, testConsumer3 } from "./fixtures/testAccount";
import {
  sampleDataResource,
  sampleSoftwareResource,
  sampleProviderServiceOffering,
  sampleConsumerServiceOffering,
  sampleBilateralNegotiation,
  sampleAuthorizeNegotiation,
  sampleNegotiatePolicies,
  sampleSignNegotiation,
} from "./fixtures/sampleData";
import { stub } from "sinon";
import * as loadMongoose from "../src/config/database";
import { closeMongoMemory, openMongoMemory } from "./utils.ts/mongoMemory";

export let app: Application;
export let server: Server<typeof IncomingMessage, typeof ServerResponse>;

let providerId = "";
let consumerId = "";
let dataResourceId = "";
let softwareResourceId = "";
let consumerJwt = "";
let providerJwt = "";
let consumerServiceOfferingId = "";
let providerServiceOfferingId = "";
let negotiationId = "";

describe("Bilateral Negotiation Routes Tests", () => {
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
    mockBilateralContract();

    //create provider
    const providerData = testProvider4;
    const providerResponse = await request(app)
      .post("/v1/auth/signup")
      .send(providerData);
    providerId = providerResponse.body.participant._id;
    //create consumer
    const consumerData = testConsumer3;
    const consumerResponse = await request(app)
      .post("/v1/auth/signup")
      .send(consumerData);
    consumerId = consumerResponse.body.participant._id;
    //login provider
    const providerAuthResponse = await request(app)
      .post("/v1/auth/login")
      .send({
        email: testProvider4.email,
        password: testProvider4.password,
      });
    providerJwt = providerAuthResponse.body.token;
    //login consumer
    const consumerAuthResponse = await request(app)
      .post("/v1/auth/login")
      .send({
        email: testConsumer3.email,
        password: testConsumer3.password,
      });
    consumerJwt = consumerAuthResponse.body.token;

    //create data resouurce
    const dataResourceData = sampleDataResource;
    const dataResponse = await request(app)
      .post("/v1/dataResources")
      .set("Authorization", `Bearer ${providerJwt}`)
      .send(dataResourceData);
    dataResourceId = dataResponse.body._id;
    //create software resource
    const softawreResourceData = sampleSoftwareResource;
    const serviceResponse = await request(app)
      .post("/v1/softwareresources")
      .set("Authorization", `Bearer ${consumerJwt}`)
      .send(softawreResourceData);
    softwareResourceId = serviceResponse.body.id;

    //create Service Offerings
    //DP
    const resProvider = await request(app)
      .post("/v1/serviceofferings")
      .set("Authorization", `Bearer ${providerJwt}`)
      .send({ ...sampleProviderServiceOffering, providedBy: providerId });
    providerServiceOfferingId = resProvider.body._id;
    //SP
    const resConsumer = await request(app)
      .post("/v1/serviceofferings")
      .set("Authorization", `Bearer ${consumerJwt}`)
      .send({ ...sampleConsumerServiceOffering, providedBy: consumerId });
    consumerServiceOfferingId = resConsumer.body._id;
  });

  after(async () => {
    // Close the server after all tests are completed
    loadMongooseStub.restore();
    closeMongoMemory();
    server.close();
  });

  it("should Create a service offering access request", async () => {
    const negotiationData = sampleBilateralNegotiation;
    const response = await request(app)
      .post("/v1/negotiation")
      .set("Authorization", `Bearer ${providerJwt}`)
      .send({
        ...negotiationData,
        provider: providerId,
        consumer: consumerId,
        providerServiceOffering: providerServiceOfferingId,
        consumerServiceOffering: consumerServiceOfferingId,
      })
      .expect(200);

    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("signatures");
    expect(response.body.signatures.consumer).to.be.null;
    expect(response.body.signatures.provider).to.be.null;
    expect(response.body).to.have.property("negotiationStatus", "Requested");
    negotiationId = response.body._id;
  });

  it("should authorize negotiation", async () => {
    const response = await request(app)
      .put(`/v1/negotiation/${negotiationId}`)
      .set("Authorization", `Bearer ${providerJwt}`)
      .send(sampleAuthorizeNegotiation)
      .expect(200);
    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("negotiationStatus", "Authorized");
    expect(response.body)
      .to.have.property("latestNegotiator")
      .and.to.equal(response.body.provider);
    expect(response.body.providerPolicies).to.be.an("array").and.to.not.be
      .empty;
    expect(response.body.providerPolicies[0]).to.deep.include({
      ruleId: "rule-access-5",
      values: {
        dateBegin: "2024-01-01",
        dateEnd: "2026-01-01",
      },
    });
  });

  it("should accept negotiation", async () => {
    const response = await request(app)
      .put(`/v1/negotiation/${negotiationId}/accept`)
      .set("Authorization", `Bearer ${consumerJwt}`)
      .expect(200);
    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property(
      "negotiationStatus",
      "SignatureReady"
    );
  });
  it("should sign exchange configuration by data provider", async () => {
    const response = await request(app)
      .put(`/v1/negotiation/${negotiationId}/sign`)
      .set("Authorization", `Bearer ${providerJwt}`)
      .send(sampleSignNegotiation)
      .expect(200);
  });
  it("should sign exchange configuration by service provider", async () => {
    const response = await request(app)
      .put(`/v1/negotiation/${negotiationId}/sign`)
      .set("Authorization", `Bearer ${consumerJwt}`)
      .send(sampleSignNegotiation)
      .expect(200);
  });

  it("should get all exchange configurations for a participant", async () => {
    const response = await request(app)
      .get("/v1/negotiation/")
      .set("Authorization", `Bearer ${providerJwt}`)
      .expect(200);
    expect(response.body).to.be.an("array").that.is.not.empty;
  });

  it("should get exchange configuration by ID as data provider", async () => {
    const response = await request(app)
      .get(`/v1/negotiation/${negotiationId}`)
      .set("Authorization", `Bearer ${providerJwt}`)
      .expect(200);
  });
  it("should get exchange configuration by ID as service provider", async () => {
    const response = await request(app)
      .get(`/v1/negotiation/${negotiationId}`)
      .set("Authorization", `Bearer ${consumerJwt}`)
      .expect(200);
  });
  it("should negotiate exchange configuration policies", async () => {
    const response = await request(app)
      .put(`/v1/negotiation/${negotiationId}/negotiate`)
      .set("Authorization", `Bearer ${consumerJwt}`)
      .send(sampleNegotiatePolicies)
      .expect(200);
    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("negotiationStatus", "Negotiation");
    expect(response.body)
      .to.have.property("latestNegotiator")
      .and.to.equal(response.body.consumer);
    expect(response.body).to.have.property("providerPolicies");
    expect(response.body.providerPolicies).to.be.an("array").and.to.not.be
      .empty;
    expect(response.body.providerPolicies[0]).to.deep.include({
      ruleId: "rule-access-5",
      values: {
        dateBegin: "2022-02-02",
        dateEnd: "2023-03-03",
      },
    });
  });
});
