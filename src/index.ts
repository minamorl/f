import {Micox, Portal, html} from "micox"
import { Router } from "micox/dist/router";
import { defaultPage } from "./pages/default"
import { createPage } from "./pages/create"

export const portal = new Portal()
export const router = new Router()
router.route("/", defaultPage, {
  fallback: true
})
router.route("/note/create", createPage)
router.route("/note/show/{id}", (props) => {
  return html.div("data:" + JSON.stringify(props.data))
})
document.addEventListener("DOMContentLoaded", function(event) {
  const container = document.querySelector("#app")
  
  new Micox(portal, container!).contains(router)
})