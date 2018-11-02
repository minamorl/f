import {Micox, Portal, html} from "micox"
import {IDestructedURL} from "micox/dist/router"
import {router} from ".."
import { asAST, Parser, ExportType } from "markdown-next"
const asBetterAST: ExportType<any> = {
    mapper: (tag, args) => children => ({
        tag,
        args: args ? args : null,
        children
    }),
    join: (x: any) => x, // identical
    postprocess: (obj: Array<any>) => {
        return obj.filter(x => (x !== ''))
    }
}
const parser = new Parser({
    export: asBetterAST
})

interface IVertex {
    visited: boolean
    content: any
}
const parseAST = (str: string) => {
    const parsed: IVertex = {
        content: parser.parse(str),
        visited: false,
    }
    const dfs = (vertex: IVertex): any => {
        const queue = []
        vertex.visited = true
        if (!Array.isArray(vertex.content)) {
            if (typeof vertex.content === "string") {   
                return vertex.content
            }
            // queue.push(vertex.content.children)
            if (Array.isArray(vertex.content.children)) {
                for (const child of vertex.content.children) {
                    queue.push(new Micox().contains(dfs({content: child, visited: false})).as(vertex.content.tag))
                }
            }
            // } else if ("tag" in vertex.content) {
            //     queue.push(new Micox().contains(dfs({content: vertex.content.children, visited: false})).as(vertex.content.tag))
            // } 
            return queue
        }
        for (const x of vertex.content) {
            console.log(x)

            if (typeof x === "string") {   
                return x
            }
            if (Array.isArray(x.children)) {
                for (const child of x.children) {
                    queue.push(new Micox().contains(dfs({content: child, visited: false})).as(x.tag))
                }
            } else if ("tag" in x) {
                queue.push(new Micox().contains(dfs({content: x.children, visited: false})).as(x.tag))
            } 
        }

        return queue
    }
    const proceed = dfs(parsed)
    return proceed
}

export const createPage = (props: IDestructedURL) => (portal: Portal) => {
    const preview = html.div().class("preview")
    return html.div([
        html.h1("Create new document"),
        html.textarea().attrs({ placeholder: "Insert here" }).events({
            keyup: ev => {
                const parsed = parseAST(ev.target.value)
                portal.transfer("preview", parsed)
            }
        }),
        preview.contains(portal.get("preview")),
        html.button("Save")
    ])
}