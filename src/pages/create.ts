import {Micox, Portal, html} from "micox"
import {IDestructedURL} from "micox/dist/router"
import {router} from ".."
import { asAST, Parser, ExportType } from "markdown-next"
function flatten(arr: any) {
  return arr.reduce(function (flat: any, toFlatten: any) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}
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
        const queue: Array<Micox | string> = []
        vertex.visited = true
        if (!vertex.content) {
            return
        }        
        if (!Array.isArray(vertex.content)) {
            if (typeof vertex.content === "string") {
                return vertex.content
            }
            if (Array.isArray(vertex.content.children)) {
                for (const child of vertex.content.children) {
                    queue.push(new Micox().contains(dfs({content: child, visited: false})).as(child.tag || vertex.content.tag).attrs(vertex.content.args))
                }
            } else if (vertex.content) {
                queue.push(new Micox().contains(dfs({content: vertex.content.children, visited: false})).as(vertex.content.tag).attrs(vertex.content.args))
            }
            return queue
        }
        for (const x of vertex.content) {
            if (typeof x === "string") {
                queue.push(x)
            } else if (Array.isArray(x.children) && x.children.length) {
                queue.push(new Micox().contains(dfs({content: x.children, visited: false})).as(x.tag).attrs(x.args))
            } else if (Array.isArray(x.children)) {
                for (const child of x.children) {
                    if (child.args === null && child.children === null) {
                        queue.push(new Micox().contains().as(child.tag)) // br tag
                    } else {
                        queue.push(new Micox().contains(dfs({content: child.children, visited: false})).as(child.tag).attrs(child.content.args))
                    }
                }
            } else if (Array.isArray(x)) {
                const flatten_x = (Array.isArray(x)) ? flatten(x) : x  
                for (const y of flatten_x) {
                    if (y.args === null ) {
                        queue.push(new Micox().contains(dfs({content: y.children, visited: false})).as(y.tag))
                        continue
                    }
                    queue.push(dfs({content: y, visited: false}))
                }
            } else if ("tag" in x) {
                queue.push(new Micox().contains(dfs({content: x.children, visited: false})).as(x.tag).attrs(x.args))
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
        html.textarea("abc\ndef\nghj").attrs({ placeholder: "Insert here" }).events({
            keyup: ev => {
                const parsed = parseAST(ev.target.value)
                portal.transfer("preview", parsed)
            }
        }),
        preview.contains(portal.get("preview")),
        html.button("Save")
    ])
}
