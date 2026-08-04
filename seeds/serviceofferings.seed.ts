import { ServiceOffering } from "../src/models/ServiceOffering";
import { IServiceOffering } from "../src/types/serviceoffering";

export async function seedServiceOfferings() {
  try {
    // ServiceOfferings examples seeding.
    const serviceOfferings: IServiceOffering[] = [];
    for (let i = 0; i < 5; i++) {
      const serviceOffering: IServiceOffering = {
        name: `Service Offering ${i} Name`,
        providedBy: `Provider ${i}`,
        aggregationOf: [`Service Component ${i}`],
        dependsOn: [`Dependency ${i}`],
        policy: [
          {
            permission: [],
            prohibition: [],
          },
        ],
        termsAndConditions: `Terms and Conditions for Service Offering ${i}`,
        dataProtectionRegime: [`GDPR2016`],
        dataAccountExport: [
          { requestType: "API", accessType: "digital", formatType: "" },
        ],
        location: `Location ${i}`,
        schema_version: `1.0.${i}`,
        jsonld: `{}`,
        createdAt: new Date(),
        updatedAt: undefined,
        description: `Description of Service Offering ${i}`,
        keywords: [`keyword${i}`, `service`, `offering`],
        archived: false,
        visible: true,
        serviceOfferingVC: `https://api.example.com/service-offering-vc${i}`,
        dataResources: [],
        softwareResources: [],
        currency: `USD`,
        billingPeriod: `monthly`,
        setupFee: 10,
        costPerAPICall: 0.01,
        category: [],
        pricing: 100,
        pricingModel: [],
        pricingDescription: "",
        maximumPerformance: "",
        maximumConsumption: "",
        userInteraction: false,
      };
      serviceOfferings.push(serviceOffering);
    }
    await ServiceOffering.deleteMany({});
    await ServiceOffering.insertMany(serviceOfferings);
  } catch (error: any) {
    throw new Error(`Seed error for data: ${error.message}`);
  }
}
