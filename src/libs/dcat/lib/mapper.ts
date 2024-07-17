/* eslint-disable @typescript-eslint/no-explicit-any */
import { dcat } from "./models";
import { foaf } from "./models/foaf";
import { skos } from "./models/skos";
import {
  DataResource,
  ResourceTypes,
  ServiceOffering,
  SoftwareResource,
} from "../types";

import { vcard } from "./models/vcard";
import { Types } from "mongoose";
export const mapDataResource = (
  resource: DataResource & { _id: string }
): dcat.Dataset => {
  const dataset = new dcat.Dataset();
  dataset["@id"] = resource._id;
  dataset["@type"] = "DataResource";
  dataset.title = resource.name;
  dataset.description = resource.description;
  dataset.license = resource.license;
  dataset.hasPolicy = resource.policy;
  dataset.creator = new foaf.Agent();
  dataset.creator.account = resource.producedBy;
  dataset.version = resource.schema_version;
  dataset.releaseDate = resource.createdAt;
  dataset.update = resource.updatedAt;
  dataset.spatial = resource.country_or_region;
  dataset.rights = resource.copyrightOwnedBy;
  dataset.theme = new skos.Concept();
  dataset.theme.definition = resource.category;
  dataset.theme.inScheme = new skos.ConceptScheme();
  dataset.theme.inScheme.themes = (resource.subCategories || []).map(
    (subCategory) => {
      const concept = new skos.Concept();
      concept.definition = subCategory;
      return concept;
    }
  );
  dataset.distribution = new dcat.Distribution();
  dataset.distribution.downloadURL = "";
  dataset.distribution.mediaType = "";
  dataset.distribution.accessURL = resource.exposedThrough;
  dataset.distribution["@id"] = resource.representation?.toString();
  return dataset;
};

export const mapSoftwareResource = (
  resource: SoftwareResource & { _id: string }
): dcat.DataService => {
  const dataService = new dcat.DataService();
  dataService["@id"] = resource._id;
  dataService["@type"] = "SoftwareResource";
  dataService.title = resource.name;
  dataService.description = resource.description;
  dataService.releaseDate = resource.createdAt;
  dataService.update = resource.updatedAt;
  dataService.license = resource.license;
  dataService.version = resource.schema_version;
  dataService.hasPolicy = resource.policy;
  dataService.publisher = new foaf.Agent();
  dataService.publisher.account = resource.providedBy;
  dataService.theme = new skos.Concept();
  dataService.theme.definition = resource.category;
  dataService.rights = resource.copyrightOwnedBy;
  dataService.hasPart = (resource.aggregationOf || []).map((resourceId) => {
    const dataset = new dcat.Dataset();
    dataset["@id"] = resourceId;
    return dataset;
  });
  const countryCodes = resource.locationAddress.map((element) => {
    return element.countryCode;
  });
  dataService.language = countryCodes.join(";");
  dataService.endpointURL = resource.exposedThrough;

  if (
    resource.representation
  ) {
    const dataset = new dcat.Dataset();
    dataset.distribution = new dcat.Distribution();
    dataset.distribution["@id"] = resource.representation?.toString();
    dataService.servesDataset.push(dataset);
  }
  dataService.endpointDescription = resource.demo_link;
  return dataService;
};
export const mapServiceOffering = (
  resource: ServiceOffering & { _id: string }
): dcat.Catalog => {
  const catalog = new dcat.Catalog();
  catalog["@id"] = resource._id;
  catalog["@type"] = "ServiceOffering";
  catalog.title = resource.name;
  catalog.description = resource.description;
  catalog.hasPolicy = resource.policy;
  catalog.releaseDate = resource.createdAt;
  catalog.update = resource.updatedAt;
  catalog.version = resource.schema_version;
  catalog.hasPolicy = resource.policy;
  catalog.keyword = resource.keywords.join(";");
  catalog.dataset = (resource.dataResources || []).map((dataResource) => {
    const dataset = new dcat.Dataset();
    dataset["@type"] = "dataResource";
    dataset["@id"] = dataResource;
    return dataset;
  });

  catalog.service = (resource.softwareResources || []).map(
    (softwareResources) => {
      const dataset = new dcat.Dataset();
      dataset["@type"] = "softwareResources";
      dataset["@id"] = softwareResources;
      return dataset;
    }
  );
  catalog.publisher = new foaf.Agent();
  catalog.publisher.account = resource.providedBy;
  catalog.spatial = resource.location;
  catalog.relation = resource.aggregationOf;
  catalog.contactPoint = new vcard.Kind();
  catalog.contactPoint.url = resource.dependsOn;
  catalog.conformsTo = resource.termsAndConditions;
  return catalog;
};

export const mapCatalog = (
  resources: any[],
  input: { title: string; description: string },
  type: ResourceTypes
): dcat.Catalog => {
  const catalog: dcat.Catalog = new dcat.Catalog();
  catalog.title = input.title;
  catalog.description = input.description;
  if (type === ResourceTypes.DataResource) {
    catalog.dataset = resources.map((resource) => mapDataResource(resource));
  } else if (type === ResourceTypes.SoftwareResource) {
    catalog.service = resources.map((resource) =>
      mapSoftwareResource(resource)
    );
  } else if (type === ResourceTypes.ServiceOffering) {
    catalog.catalog = resources.map((resource) => mapServiceOffering(resource));
  }
  return catalog;
};
