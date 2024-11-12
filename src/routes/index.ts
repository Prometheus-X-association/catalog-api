import e, { Application } from "express";

// public routers
import auth from "./public/v1/auth";
import ecosystemsPublicRouter from "./public/v1/ecosystems.public.router";
import catalogPublicRouter from "./public/v1/catalog.public.router";
import dataResourcesPublicRouter from "./public/v1/dataResources.public.router";
import softwareResourcesPublicRouter from "./public/v1/softwareResources.public.router";
import serviceOfferingsPublicRouter from "./public/v1/serviceOfferings.public.router";

//private routers
import dataResourcesPrivateRouter from "./private/v1/dataResources.private.router";
import ecosystemsPrivateRouter from "./private/v1/ecosystems.private.router";
import negotiationPrivateRouter from "./private/v1/negotiation.private.router";
import participantsPrivateRouter from "./private/v1/participants.private.router";
import representationsPrivateRouter from "./private/v1/representations.private.router";
import serviceOfferingsPrivateRouter from "./private/v1/serviceOfferings.private.router";
import softwareResourcesPrivateRouter from "./private/v1/softwareResources.private.router";

type RouterSetup = {
  prefix: string;
  routers: {
    prefix: string;
    router: e.Router;
  }[];
  middleware?: () => unknown;
};

const PublicRoutersV1 = [
  {
    prefix: "/auth",
    router: auth,
  },
  {
    prefix: "/ecosystems",
    router: ecosystemsPublicRouter,
  },
  {
    prefix: "/catalog",
    router: catalogPublicRouter,
  },
  {
    prefix: "/dataresources",
    router: dataResourcesPublicRouter,
  },
  {
    prefix: "/softwareresources",
    router: softwareResourcesPublicRouter,
  },
  {
    prefix: "/serviceofferings",
    router: serviceOfferingsPublicRouter,
  },
];

const PrivateRoutersV1 = [
  {
    prefix: "/dataresources",
    router: dataResourcesPrivateRouter,
  },
  {
    prefix: "/ecosystems",
    router: ecosystemsPrivateRouter,
  },
  {
    prefix: "/negotiation",
    router: negotiationPrivateRouter,
  },
  {
    prefix: "/participants",
    router: participantsPrivateRouter,
  },
  {
    prefix: "/representations",
    router: representationsPrivateRouter,
  },
  {
    prefix: "/serviceofferings",
    router: serviceOfferingsPrivateRouter,
  },
  {
    prefix: "/softwareresources",
    router: softwareResourcesPrivateRouter,
  },
];

const routersToSetup = [{ prefix: "", routers: PrivateRoutersV1}, {prefix: "", routers: PublicRoutersV1}];

export const setupRoutes = (app: Application) => {
  routersToSetup.forEach((config: RouterSetup) => {
    const { prefix, middleware } = config;
    config.routers.forEach((router) => {
      const fullPrefix = prefix + router.prefix;
      // Use middleware, if available, preventing
      // its definition across route configurations.
      const routers = middleware ? [middleware, router.router] : router.router;
      app.use(fullPrefix, routers);
    });
  });
};
