export const sampleDataResource = {
  aggregationOf: ["Resource 1", "Resource 2"],
  name: "Sample Data Resource",
  description: "This is a sample data resource description.",
  copyrightOwnedBy: ["Owner 1", "Owner 2"],
  license: ["License 1"],
  policy: [{ key1: "value1" }],
  exposedThrough: ["Endpoint 1", "Endpoint 2"],
  obsoleteDateTime: "2022-12-31",
  expirationDateTime: "2023-12-31",
  containsPII: true,
  category: "5f8ed518651f1648e0d8162d",
};

export const sampleUpdatedDataResource = {
  aggregationOf: ["Resource 1", "Resource 2", "Resource 3"],
  name: "Sample Updated Data Resource",
  description: "This is an updated data resource description.",
  copyrightOwnedBy: ["Owner 1", "Owner 2"],
  license: ["License 1"],
  policy: [{ key1: "value1" }],
  exposedThrough: ["Endpoint 1", "Endpoint 2"],
  obsoleteDateTime: "2022-12-31",
  expirationDateTime: "2024-12-31",
  containsPII: true,
  category: "5f8ed518651f1648e0d8162d",
};

export const sampleEcosystem = {
  orchestrator: "Sample Orchestrator",
  name: "Sample Ecosystem",
  description: "This is a sample ecosystem description.",
  country_or_region: "Sample Region",
  target_audience: "Sample Audience",
  main_functionalities_needed: ["Functionality 1", "Functionality 2"],
  logo: "sample_logo.jpg",
  useCases: [],
  searchedData: ["Data 1", "Data 2"],
  searchedServices: ["Service 1"],
  provides: ["Data", "Users"],
  contract: "Sample Contract",
  location: "Sample Location",
  businessLogic: {
    businessModel: ["Model 1", "Model 2"],
    roles: [
      {
        businessModels: ["Model 3"],
        benefits: ["Benefit 1"],
        costs: ["Cost 1"],
        payingParties: ["Paying Party 1"],
        role: "Role 5",
      },
    ],
  },
  rolesAndObligations: [
    {
      role: "Role 6",
      ruleId: "rule-access-5",
      "values": {
        "dateBegin": "2024-01-01",
        "dateEnd": "2026-01-01"
      }
    },
  ],
};



export const sampleEcosystem1 = {
  name: "Sample Ecosystem1",
  description: "This is a sample ecosystem1 description.",  
  provides: ["Data", "Users"],
  searchedData: ["Data 1", "Data 2"],
  searchedServices: ["Service 1"],
  useCases: [],
  businessLogic: {
    businessModel: ["Model 1", "Model 2"],
    roles: [
      {
        businessModels: ["Model 3"],
        benefits: ["Benefit 1"],
        costs: ["Cost 1"],
        payingParties: ["Paying Party 1"],
        role: "Role 5",
      },
    ],
  },
  rolesAndObligations: [
    {
      role: "Orchestrator",
      ruleId: "rule-access-5",
      "values": {
        "dateBegin": "2024-01-01",
        "dateEnd": "2026-01-01"
      }
    }
  ],
};
export const sampleUpdatedEcosystem = {
  name: "Updated Ecosystem",
  description: "This is an updated sample ecosystem description.",  
  provides: ["Data", "Users"],
  searchedData: ["Data 1",],
  searchedServices: ["Service 1"],
  useCases: [],
  businessLogic: {
    businessModel: ["Model 1",],
    roles: [
      {
        businessModels: ["Model 3"],
        benefits: ["Benefit 1"],
        costs: ["Cost 1"],
        payingParties: ["Paying Party 1"],
        role: "Role 5",
      },
    ],
  },
  rolesAndObligations: [
    {
      role: "Orchestrator",
      ruleId: "rule-access-5",
      "values": {
        "dateBegin": "2024-01-01",
        "dateEnd": "2026-02-02"
      }
    },
  ],
};

export const sampleInvitation = {
  roles: [
    "data provider"
  ],
  participantId: ""
};

export const sampleOfferings = {
  "offerings": [
    {
      "serviceOffering": "",
      "values": {
        "key1": "value1",
        "key2": "value2"
      },
      "policy": [
        {
          "ruleId": "rule-access-5",
          "values": {
            "dateBegin": "2024-01-01",
            "dateEnd": "2026-01-01"
          }
        }
      ]
    }
  ]
};

export const sampleJoinRequest = {
  "roles": [
    "service provider"
  ],
  "offerings": [
    {
      "serviceOffering": "",
      "policy": [
        {
          "ruleId": "rule-access-5",
          "values": {
            "dateBegin": "2024-01-01",
            "dateEnd": "2026-01-01"
          }
        }
      ]
    }
  ]
};

export const sampleServiceOffering = {
  name: "<string>",
  providedBy: "<string>",
  aggregationOf: ["<string>", "<string>"],
  dependsOn: ["<string>", "<string>"],
  termsAndConditions: "",
  dataProtectionRegime: ["<string>", "<string>"],
  dataAccountExport: [
    {
      requestType: "webform",
      accessType: "digital",
      formatType: "<string>",
    },
    {
      requestType: "API",
      accessType: "physical",
      formatType: "<string>",
    },
  ],
  policy: [],
  location: "",
  description: "",
  keywords: ["<string>", "<string>"],
  dataResources: [],
  softwareResources: [],
  compliantServiceOfferingVC: "",
  serviceOfferingVC: "",
};


export const sampleProviderServiceOffering = {
  name: "<string>",
  providedBy: "<string>",
  aggregationOf: ["<string>", "<string>"],
  dependsOn: ["<string>", "<string>"],
  termsAndConditions: "",
  dataProtectionRegime: ["<string>", "<string>"],
  dataAccountExport: [
    {
      requestType: "webform",
      accessType: "digital",
      formatType: "<string>",
    },
    {
      requestType: "API",
      accessType: "physical",
      formatType: "<string>",
    },
  ],
  policy: [],
  location: "",
  description: "",
  keywords: ["<string>", "<string>"],
  dataResources: [],
  softwareResources: [],
  compliantServiceOfferingVC: "",
  serviceOfferingVC: "",
};
export const sampleConsumerServiceOffering = {
  name: "<string>",
  providedBy: "<string>",
  aggregationOf: ["<string>", "<string>"],
  dependsOn: ["<string>", "<string>"],
  termsAndConditions: "",
  dataProtectionRegime: ["<string>", "<string>"],
  dataAccountExport: [
    {
      requestType: "webform",
      accessType: "digital",
      formatType: "<string>",
    },
    {
      requestType: "API",
      accessType: "physical",
      formatType: "<string>",
    },
  ],
  policy: [],
  location: "",
  description: "",
  keywords: ["<string>", "<string>"],
  dataResources: [],
  softwareResources: [],
  compliantServiceOfferingVC: "",
  serviceOfferingVC: "",
};

export const sampleUpdatedProviderServiceOffering = {
  name: "<string>",
  providedBy: "<string>",
  aggregationOf: ["<string>", "<string>"],
  dependsOn: ["<string>", "<string>"],
  termsAndConditions: "",
  dataProtectionRegime: ["<string>", "<string>"],
  dataAccountExport: [
    {
      requestType: "webform",
      accessType: "digital",
      formatType: "<string>",
    },
    {
      requestType: "API",
      accessType: "physical",
      formatType: "<string>",
    },
  ],
  policy: [],
  location: "",
  description: "",
  keywords: ["<string>", "<string>"],
  dataResources: [],
  softwareResources: [],
  compliantServiceOfferingVC: "",
  serviceOfferingVC: "",
};
export const sampleUpdatedConsumerServiceOffering = {
  name: "<string>",
  providedBy: "<string>",
  aggregationOf: ["<string>", "<string>"],
  dependsOn: ["<string>", "<string>"],
  termsAndConditions: "",
  dataProtectionRegime: ["<string>", "<string>"],
  dataAccountExport: [
    {
      requestType: "webform",
      accessType: "digital",
      formatType: "<string>",
    },
    {
      requestType: "API",
      accessType: "physical",
      formatType: "<string>",
    },
  ],
  policy: [],
  location: "",
  description: "",
  keywords: ["<string>", "<string>"],
  dataResources: [],
  softwareResources: [],
  compliantServiceOfferingVC: "",
  serviceOfferingVC: "",
};


export const sampleBilateralNegotiation = {
  
  provider:"",
  consumer:"",
  providerServiceOffering:"",
  consumerServiceOffering:"",
};

export const sampleAuthorizeNegotiation = {
  policy: [
    {
      ruleId: "rule-access-5",
      values: {
        dateBegin: "2024-01-01",
        dateEnd: "2026-01-01",
      },
    },
  ],
};

export const sampleNegotiatePolicies = {
  policy: [
    {
      ruleId: "rule-access-5",
      values: {
        dateBegin: "2022-02-02",
        dateEnd: "2023-03-03",
      },
    },
  ],
};

export const sampleSignNegotiation = {
  signature: "hasSigned",
}
export const sampleSignEcosystem = {
  signature: "hasSigned",
}

export const sampleSoftwareResource = {
  aggregationOf: ["Resource 1", "Resource 2"],
  name: "Sample software Resource",
  description: "This is a sample software resource description.",
  copyrightOwnedBy: ["Owner 1", "Owner 2"],
  license: ["License 1"],
  policy: [{ key1: "value1" }],
  users_clients: 22,
  demo_link: "",
  relevant_project_link: "",
  category: "5f8ed518651f1648e0d8162d",
  locationAddress: [],
};
export const sampleUpdatedSoftwareResource = {
  aggregationOf: ["Resource 1"],
  name: "Updated software Resource",
  description: "This is an updated sample software resource description.",
  copyrightOwnedBy: ["Owner 1", "Owner 2"],
  license: ["License 2"],
  policy: [{ key1: "value1" }],
  users_clients: 23,
  category: "5f8ed518651f1648e0d8162d",
  locationAddress:[]
};

export const sampleRepresentation = (resourceID: string) => {
  return {
    resourceID: resourceID,
    url: "http://test.api.com/{userId}",
    credential: "5f8ed518651f1648e0d8162d"
  }
};

export const sampleUpdatedRepresentation = (resourceID: string) => {
  return {
    resourceID: resourceID,
    url: "http://test.api.com/test/{userId}",
    credential: "5f8ed518651f1648e0d8162b"
  }
};