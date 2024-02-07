import AdminJS from "adminjs"
import { AdminJSOptions } from "adminjs"
import AdminJSExpress from "@adminjs/express"
import { Database, Resource, getModelByName } from "@adminjs/prisma"
import express, { Request, Response } from "express"

import prisma from "@/lib/prisma"

AdminJS.registerAdapter({ Database, Resource })

const options: AdminJSOptions = {
  rootPath: "/admin/",
  branding: {
    companyName: "Tecníco Admin",
    withMadeWithLove: false,
  },
  locale: {
    // TODO: https://docs.adminjs.co/tutorials/internationalization-i18n
    language: "en", // default language
    availableLanguages: ["en"],
    localeDetection: true,
  },
  resources: [
    {
      resource: { model: getModelByName("Study"), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName("Theme"), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName("Scenario"), client: prisma },
      options: {},
    },
  ],
}

const adminJs = new AdminJS(options)
const app = express()

app.use(adminJs.options.rootPath, AdminJSExpress.buildRouter(adminJs))

// adminJs.watch()

const handler = (req: Request, res: Response) => {
  app(req, res, err => {
    console.log("express handling")

    if (!res.headersSent) {
      console.warn("no headers sent")
    }

    if (err) {
      console.error(err)
      res.status(err.status || 500).end(err.message)
    } else {
      res.end()
    }
  })
}

export default handler

export const config = {
  api: {
    // Defaults to true. Setting this to false disables body parsing and allows you to consume the request body as stream or raw-body.
    bodyParser: false,

    // Determines how much data should be sent from the response body. It is automatically enabled and defaults to 4mb.
    responseLimit: false,

    // Disables warnings for unresolved requests if the route is being handled by an external resolver like Express.js or Connect. Defaults to false.
    externalResolver: true,
  },
}
