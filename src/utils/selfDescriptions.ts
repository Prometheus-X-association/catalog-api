import { IEcosystem } from "../types/ecosystem";
import { IParticipant } from "../types/participant";
import { IServiceOffering } from "../types/serviceoffering";
import { ISoftwareResource } from "../types/softwareresource";

/**
 * Generates a JSON-LD for the ecosystem based on the schema
 */
export const ecosystemToSelfDescription = (
  e: IEcosystem & {
    rolesAndResponsibilities: { stakeholders: IParticipant };

    dataValue: {
      dataValueSolution: { provider: IParticipant; offering: IParticipant };
      dataNetworkSolutions: {
        pays: IParticipant[];
      }[];
    };
  }
) => {
  const jsonLd = {
    "@context": {
      schema: "https://schema.org/",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      did: "https://www.w3.org/ns/did#",
      gaia: "https://gaia-x.eu/ontology#",
    },
    "@type": "ecosystem",
    name: e.name,
    rolesAndResponsibilities: {
      stakeholders: {
        organisation: {
          "@type": "schema:Organization",
          "@id": e.rolesAndResponsibilities.stakeholders.did,
          "schema:name": e.rolesAndResponsibilities.stakeholders.legalName,
          "did:identifier": e.rolesAndResponsibilities.stakeholders.did,
        },
      },
    },
    businessLogic: {
      businessModel: e.businessLogic.businessModel,
    },
    dataValue: {
      dataValueSolution: {
        provider: {
          "@type": "schema:Organization",
          "@id": e.dataValue.dataValueSolution.provider?.did,
          "schema:name": e.dataValue.dataValueSolution.provider?.legalName,
          "did:identifier": e.dataValue.dataValueSolution.provider?.did,
        },
        offering: {
          "@type": "schema:Organization",
          "@id": e.dataValue.dataValueSolution.offering?.did,
          "schema:name": e.dataValue.dataValueSolution.offering?.legalName,
          "did:identifier": e.dataValue.dataValueSolution.offering?.did,
        },
      },
      dataNetworkSolutions: e.dataValue.dataNetworkSolutions.map((dn) => {
        return {
          "@context": {
            typeEnum: ["buy", "rent", "build"],
          },
          pays: dn.pays.map((payer) => {
            return {
              "@type": "schema:Organization",
              "@id": payer?.did,
              "schema:name": payer?.legalName,
              "did:identifier": payer?.did,
            };
          }),
        };
      }),
    },
  };

  return JSON.stringify(jsonLd, null, 2);
};

/**
 * Generates a JSON-LD for the participant based on the schema
 */
export const participantToSelfDescription = (p: IParticipant) => {
  const jsonLd = {
    "@context": {
      sh: "http://www.w3.org/ns/shacl#",
      schema: "http://www.w3.org/2001/XMLSchema#",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      "gax-core": "http://w3id.org/gaia-x/core#",
      "gax-participant": "http://w3id.org/gaia-x/participant#",
      dcat: "http://www.w3.org/ns/dcat#",
      dcterms: "http://purl.org/dc/terms/",
      did: "https://www.w3.org/TR/did-core/#",
    },
    "@id": p.did,
    "@type": "Participant",
    "did:identifier": p.did,
    "gax-participant:hasLegallyBindingName": p?.legalName,
    headquartersAddress: {
      "@type": "schema:PostalAddress",
      "schema:countryCode": p.legalPerson.headquartersAddress.countryCode,
    },
    legalAddress: {
      "@type": "schema:PostalAddress",
      "schema:countryCode": p.legalPerson.legalAddress.countryCode,
    },
    "gax-participant:hasBusinessIdentifier": p.legalPerson.registrationNumber,
    "gax-participant:hasMemberParticipant": p.legalPerson.subOrganization.map(
      (member) => {
        return {
          "@id": member,
        };
      }
    ),
    "dcterms:termsAndConditions": {
      "@value": p.termsAndConditions,
    },
    "schema:termsAndConditions": {
      "@value": p.termsAndConditions,
    },
  };

  return JSON.stringify(jsonLd, null, 2);
};

/**
 * Generates a JSON-LD for the Data Offering based on the schema
 * @todo Understand fields hasPart and hasPolicy to better exploit them
 */
export const dataOfferingToSelfDescription = (d: ISoftwareResource) => {
  const jsonLD = {
    "@context": {
      dcat: "http://www.w3.org/ns/dcat#",
      dcterms: "http://purl.org/dc/terms/",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      foaf: "http://xmlns.com/foaf/0.1/",
      odrl: "https://www.w3.org/TR/odrl-model/",
      "gax-core": "https://example.com/gax-core#",
    },
    "@id": "dap:d33937",
    "@type": "dcat:Dataset",
    "dcterms:description": {
      "@value": d.description,
      "@language": "en",
    },
    "dcterms:providedBy": d.providedBy,
    "dcterms:issued": {
      "@value": d.createdAt,
      "@type": "xsd:date",
    },
    "dcterms:license": {
      "@id": d.license,
    },
    "dcterms:dataProtectionRegime": d.exposedThrough.map((exposedThrough) => ({
      "@id": exposedThrough,
    })),
    "dcterms:category": {
      "@id": d.category,
    },
    "schema:locationAddress": d.locationAddress.map((locationAddress) => ({
      "@type": "locationAddress",
      "dcterms:requestType": locationAddress.countryCode,
    })),
    "dcterms:users_clients": {
      "@id": d.users_clients,
    },
    "dcterms:demo_link": {
      "@id": d.demo_link,
    },
    "dcterms:relevant_project_link": {
      "@id": d.relevant_project_link,
    },
  };

  return JSON.stringify(jsonLD, null, 2);
};

/**
 * Generates the JSON-LD Self description for the service offering
 * @todo look more into hasPart field and distribution field
 */
export const serviceToSelfDescription = (s: IServiceOffering) => {
  const jsonLD = {
    "@context": {
      cc: "http://creativecommons.org/ns#",
      schema: "http://schema.org/",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      "gax-core": "http://w3id.org/gaia-x/core#",
      dcterms: "http://purl.org/dc/terms/",
      ids: "https://w3id.org/idsa/core/",
      dcat: "http://www.w3.org/ns/dcat#",
      did: "https://www.w3.org/TR/did-core/#",
    },
    "@id": "did:web:http://example.com/registry/service",
    "@type": "ServiceOffering",
    "dcterms:title": {
      "@value": s.name,
      "@type": "xsd:string",
    },
    "schema:providedBy": {
      "@value": s.providedBy,
      "@type": "xsd:string",
    },
    "dcterms:description": {
      "@value": s.description,
      "@type": "xsd:string",
    },
    "dcat:dependsOn": s.dependsOn.map((dependsOn) => ({
      "@id": dependsOn,
    })),
    "dcat:aggregationOf": s.aggregationOf.map((aggregationOf) => ({
      "@id": aggregationOf,
    })),
    "dcat:policy": s.policy.map((policy) => ({
      "@id": policy,
    })),
    "dcat:dataProtectionRegime": s.dataProtectionRegime.map(
      (dataProtectionRegime) => ({
        "@id": dataProtectionRegime,
      })
    ),
    "schema:dataAccountExport": s.dataAccountExport.map(
      (dataAccountExport) => ({
        "@type": "dataAccountExport",
        "dcat:requestType": dataAccountExport.requestType,
        "dcat:accessType": dataAccountExport.accessType,
        "dcat:formatType": dataAccountExport.formatType,
      })
    ),
  };

  return JSON.stringify(jsonLD, null, 2);
};
